/*global console:true, process: true, require:true, exports:true */
var ENABLE_ACCESS_LOGGING = true;
var VERSION = "1.0.0";

var url = require('url');
var http = require('http');
var utils = require('src/utils');

function ApiServer(config, database) {
	var onrequest = utils.applier(this, this._delegate);
	this._config = config;
	this._server = http.createServer(onrequest);
	this._database = database;
}

ApiServer.prototype = {
	_listen:function (port) {
		this._server.listen(port);
		console.log("API server listening to port %d...", port);
	},
	_method:function (request) {
		var name = url.parse(request.url).pathname.split('/').pop().toLowerCase();
		if (request.method === 'OPTIONS') {
			name = 'cors';
		} else {
			if (name === '') {
				name = 'health';
			} else if (!(name in this)) {
				name = 'unknown';
			} else if (!this[name].call || this[name].call && name.substr(0, 1) === '_') {
				name = 'unauthorized';
			}
		}
		return utils.applier(this, this[name]);
	},
	_delegate:function (request, response) {
		if (ENABLE_ACCESS_LOGGING) {
			console.log(request.method, request.url);
		}
		var method = this._method(request);
		try {
			utils.extractArgs(request,
				function (args) {
					method.call(null, request, response, args);
				});
		} catch (e) {
			console.error(e);
			this._respond(request, response, {
				error:'Unexpected Server Error',
				status:500
			});
		}
	},
	_respondwrap:function (request, response, data, headers) {
		result_obj = {};
		result_obj.data = data;
		this._respond(request, response, result_obj, headers);
	},
	_respond:function (request, response, data, headers) {
		var body = '',
			status = 200,
			origin = request.headers.origin;
		headers = utils.extend({
				'Content-Type':'application/json'
			},
			headers || {});
		if (origin) {
			headers['Access-Control-Allow-Origin'] = origin;
		}
		if (data) {
			if (data.status) {
				status = data.status;
			}
			else {
				data.status = status;
			}
			try {
				body = JSON.stringify(data);
			}
			catch (e) {
				body = '{"status": 500, "error":"Unexpected Server Error"}';
				status = 500;
				console.error(e);
			}
		}
		response.writeHead(status, headers);
		response.end(body);
		if (ENABLE_ACCESS_LOGGING) {
			console.log(status, body);
		}
	},
	_redirect:function (request, response, url) {
		var body = '',
			status = 302,
			headers = {};
		headers = utils.extend({
				'Location':url
			},
			headers || {});
		if (origin) {
			headers['Access-Control-Allow-Origin'] = origin;
		}
		response.writeHead(status, headers);
		response.end(body);
		if (ENABLE_ACCESS_LOGGING) {
			console.log(status, body);
		}
	},

	_validate_args:function (args, required_args) {
		var missing = [];
		if (!args) {
			return required_args.join(' ');
		}
		required_args.forEach(function(required_arg){
			if (!args.hasOwnProperty(required_arg)) {
				missing.push(required_arg);
			}
		});
		return missing.join('');
	},

	_add_optional_properties:function (source, target, optionalProperties) {
		optionalProperties.forEach(function(optionalProperty){
			if (source.hasOwnProperty(optionalProperty)) {
				target[optionalProperty] = source[optionalProperty];
			}
		});
	},

	user:function (request, response, args) {
		this._respond(request, response, {
			user_id:1
			// TODO: Actually wire this up to a real users model!
		});
	},
	login:function (request, response, args) {
		this._respond(request, response, {
			user_id:1,
			nick:'tracy',
			avatar_img:'https://plus.google.com/104770262832706227353'
		});
	},
	health:function (request, response, args) {
		this._respond(request, response, {
			service:'Munitia API',
			version:VERSION
		});
	},
	unknown:function (request, response, args) {
		this._respond(request, response, {
			error:'Unknown Action',
			status:404
		});
	},
	unauthorized:function (request, response, args) {
		this._respond(request, response, {
			error:'Unauthorized Action',
			status:401
		});
	},
	cors:function (request, response, args) {
		var maxAge = 7200,
			requested = request.headers['Access-Control-Request-Headers'],
			methods = 'GET, POST, OPTIONS',
			headers = {
				'Access-Control-Allow-Methods':methods,
				'Access-Control-Max-Age':maxAge
			};
		if (requested) {
			headers['Access-Control-Allow-Headers'] = requested;
		}
		this._respond(request, response, null, headers);
	},
	finish_round:function (request, response, args) {
		var server = this;
		if (args.round_id === undefined) {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:'round_id is required'
			});
			return;
		}
		if (args.user_id === undefined) {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:'user_id is required'
			});
			return;
		}
		if (args.user_score === undefined) {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:'user_score is required'
			});
			return;
		}
		user_round_score = {
			user_id:args.user_id,
			score:args.user_score
		};
		this._database.update({
				collection:'rounds',
				criteria:{
					_id:server._database.client.bson_serializer.ObjectID.createFromHexString(args.round_id)
				},
				doc:{
					"$set":{
						finished:true
					},
					"$push":{
						user_scores:user_round_score
					},
					"$inc":{
						score:args.user_score
					}
				},
				options:{
					upsert:false
				}
			},
			function (error, docs) {
				if (error != null) {
					server._respond(request, response, {
						error:'Closing round failed.',
						status:500,
						msg:error
					});
				} else {
					server._respond(request, response, docs);
				}
			});
	},
	add_to_round:function (request, response, args) {
		var server = this;
		if (args.round_id === undefined) {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:'round_id is required'
			});
			return;
		}
		if (args.user_id === undefined) {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:'user_id is required'
			});
			return;
		}
		// TODO(tracy): Change this back to 2 mins from 20 mins. NOTE(tracy): currently disabled!
		every_twenty_minutes = Math.floor(new Date().getTime() / 1200000);
		this._database.update({
				collection:'rounds',
				/* NOTE(tracy): remove time quantam'ing for testing purposes!!
				 criteria: { stretch_id: args.stretch_id, loc: { $near : [lg, lt]}, finished: false, quantam: every_twenty_minutes},
				 doc: { "$set": { stretch_id: args.stretch_id, loc: [lg, lt], finished: false, quantam: every_twenty_minutes },
				 "$addToSet": { users: args.user_id} },
				 */
				criteria:{
					_id:server._database.client.bson_serializer.ObjectID.createFromHexString(args.round_id),
					finished:false
				},
				doc:{
					"$addToSet":{
						users:args.user_id
					}
				},
				options:{
					upsert:false
				}
			},
			function (error, docs) {
				if (error != null) {
					server._respond(request, response, {
						error:'Adding to round failed.',
						status:500,
						msg:error
					});
				} else {
					server._respondwrap(request, response, docs);
				}
			});
	},
	create_round:function (request, response, args) {
		var server = this;
		if (args.stretch_id === undefined) {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:'stretch_id is required'
			});
			return;
		}
		//var stretch = {_id: args.stretch_id, start_stop_id: args.start_stop_id, end_stop_id: args.end_stop_id, line_id: args.line_id};
		var round = {
			stretch_id:args.stretch_id,
			finished:false
		};
		server._database.insert({
				collection:'rounds',
				docs:[round]
			},
			function (error, results) {
				if (results.length > 0) {
					server._respondwrap(request, response, results);
				} else {
					// Shouldn't happen!
					console.error('Inserting round failed:', results);
					server._respond(request, response, {
						error:'Inserting round failed.',
						status:500
					});
				}
			});
	},
	find_round:function (request, response, args) {
		var server = this;
		if (args.stretch_id === undefined) {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:'stretch_id is required'
			});
			return;
		}
		console.log('looking for stretch_id ' + args.stretch_id);
		// NOTE(tracy): This is for testing.  Normally we could find multiple active rounds for a given stretch_id, but
		// adding the every_twenty_minutes constraint should only return a recently created round (better for testing).
		var every_twenty_minutes = Math.floor(new Date().getTime() / 1200000);
		this._database.find({
				collection:'rounds',
				query:{
					stretch_id:args.stretch_id,
					finished:false
				}
			},
			function (error, results) {
				console.error('find returned=', results);
				if (results === undefined || results.length === 0) {
					server._respondwrap(request, response, results);
				} else {
					server._respondwrap(request, response, results);
				}
			});
	},
	find_stretch:function (request, response, args) {
		var server = this;
		this._database.find({
				collection:'stretches',
				query:{
					start_stop_id:args.start_stop_id,
					end_stop_id:args.end_stop_id,
					line_id:args.line_id
				}
			},
			function (error, results) {
				server._respondwrap(request, response, results);
			});
	},
	create_stretch:function (request, response, args) {
		var server = this;
		if (args.stretch_id === undefined) {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:'stretch_id is required'
			});
			return;
		}
		var stretch = {
			_id:args.stretch_id,
			start_stop_id:args.start_stop_id,
			end_stop_id:args.end_stop_id,
			line_id:args.line_id
		};
		server._database.insert({
				collection:'stretches',
				docs:[stretch]
			},
			function (error, results) {
				if (results.length > 0) {
					server._respondwrap(request, response, stretch);
				} else {
					// Shouldn't happen!
					console.error('Inserting stretch failed:', stretch);
					server._respond(request, response, {
						error:'Inserting stretch failed.',
						status:500
					});
				}
			});
	},
	add_round_score_to_stretch:function (request, response, args) {
		var server = this;
		if (args.stretch_id === undefined) {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:'stretch_id is required'
			});
			return;
		}
		if (args.round_id === undefined) {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:'round_id is required'
			});
			return;
		}
		if (args.score === undefined) {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:'score is required'
			});
			return;
		}
		var stretch_id = args.stretch_id;
		var new_round_score = {
			round_id:args.round_id,
			score:args.score
		};
		server._database.update({
				collection:'stretches',
				criteria:{
					_id:args.stretch_id
				},
				doc:{
					"$push":{
						rounds:new_round_score
					}
				},
				options:{
					upsert:false
				}
			},
			function (error, docs) {
				console.error('add_round returned ' + error + ' ' + docs);
				server._respondwrap(request, response, docs);
			});
	},
	find_stops_near:function (request, response, args) {
		var server = this;
		if (args.lg === undefined) {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:'lg is required'
			});
			return;
		}
		if (args.lt === undefined) {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:'lt is required'
			});
			return;
		}
		var lg = parseFloat(args.lg, 10);
		var lt = parseFloat(args.lt, 10);
		var limit = 5;
		if ("limit" in args) {
			limit = args.limit;
		}
		this._database.find({
				collection:'stops',
				options:{
					limit:limit
				},
				query:{
					loc:{
						$near:[lg, lt]
					}
				}
			},
			function (error, results) {
				server._respondwrap(request, response, results);
			});
	},
	gps_log:function (request, response, args) {
		var server = this;
		if ((missing_arg = this._validate_args(args, ['lt', 'lg', 'user_id'])) != '') {
			this._respond(request, response, {
				msg:    missing_arg + ' required',
				error: 'Bad Request',
				status: 403
			});
			return;
		}
		var gps_point = {
			t:parseInt("" + (new Date().getTime() / 1000)),
			loc:[parseFloat(args.lg, 10), parseFloat(args.lt)],
			user_id:args.user_id
		};
		this._add_optional_properties(args, gps_point, ['accuracy', 'altitude', 'altitudeAccuracy', 'heading', 'speed', 'name']);
		server._database.insert({
				collection:'gpslog',
				docs:[gps_point]
			},
			function (error, results) {
				console.log('gps_log error ', error);
				console.log('results ', results);
				if (results.length > 0) {
					server._respondwrap(request, response, results);
				} else {
					// Shouldn't happen!
					console.error('Inserting gps_point failed:', gps_point);
					server._respond(request, response, {
						error:'Inserting question failed.',
						status:500
					});
				}
			});
	},
	gps_points:function (request, response, args) {
		var server = this;
		if ((missing_arg = this._validate_args(args, ['name'])) != '') {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:missing_arg + ' required'
			});
			return;
		}
		var names = args.name.split(',');
		this._database.find({
				collection:'gpslog',
				query:{
					name:{
						$in:names
					}
				}
			},
			function (error, results) {
				console.error('error ' + error + ' results ' + results);
				server._respondwrap(request, response, results);
			});
	},
	create_user:function (request, response, args) {
		var server = this;
		if (args.username === undefined) {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:'username is required'
			});
			return;
		}
		if (args.email === undefined) {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:'email is required'
			});
			return;
		}
	},
	create_question:function (request, response, args) {
		var server  = this;
		var missing = this._validate_args(args, ['lt', 'lg', 'question', 'correct', 'wrong0']);
		if (missing.length) {
			return this._respond(request, response, {
				error: 'Bad Request',
				status: 403,
				msg: missing + ' required'
			});
		}
		var answers = {
			correct:args.correct,
			wrong0:args.wrong0
		};
		this._add_optional_properties(args, answers, ['wrong1', 'wrong2']);
		// if we got a google place hit, override the user lat/long
		if (args.place_geo) {
			var loc = args.place_geo.split(',');
			args.lt = loc[0];
			args.lg = loc[1];
		}
		var question_obj = {
			loc: [parseFloat(args.lg), parseFloat(args.lt)],
			question:args.question,
			answers:answers
		};
		this._add_optional_properties(args, question_obj, ['user_id', 'pack_id', 'img_url']);
		server._database.insert({
			collection:'questions',
			docs:[question_obj]
		}, function (error, results) {
			console.log('create error ', error);
			console.log('results ', results);
			if (results.length > 0) {
				server._respondwrap(request, response, results);
			} else {
				// Shouldn't happen!
				console.error('Inserting question failed:', question_obj);
				server._respond(request, response, {
					error:'Inserting question failed.',
					status:500
				});
			}
		});
		return false;
	},
	delete_entry:function (request, response, args) {
		var server = this;
		if (args.collection === undefined) {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:'collection is required'
			});
			return;
		}
		if (args.id === undefined) {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:'id is required'
			});
			return;
		}
		var collection = args.collection;
		var id = server._database.client.bson_serializer.ObjectID.createFromHexString(args.id);
		server._database.remove({
				collection:collection,
				criteria:{
					_id:id
				}
			},
			function (error, result) {
				if (error != null) {
					server._respond(request, response, {
						error:'Deleting entry ' + id + ' from ' + collection + ' failed.',
						status:500,
						msg:error
					});
				} else {
					server._respondwrap(request, response, result);
				}
			});
	},
	delete_question:function (request, response, args) {
		var server = this;
		if (args.id === undefined) {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:'id is required'
			});
			return;
		}
		//server._respond(request, response, );
		server._redirect(request, response, '#renderquestion');
		return;
		/*
		 NOTE(tracy): Disabling this for testing purposes.
		 BSON = require('mongodb').BSONPure;
		 var id = BSON.ObjectID.createFromHexString(args.id);
		 server._database.remove({ collection: 'questions', criteria: {_id: id} }, function(error, result) {
		 if (error != null) {
		 server._respond(request, response, { error: 'Deleting question failed.', status: 500, msg: error });
		 } else {
		 server._respondwrap(request, response, result);
		 }
		 });
		 */
	},
	find_questions_in_bounding_box:function (request, response, args) {
		var server = this;
		if ((missing_arg = this._validate_args(args, ['top_left_lg', 'top_left_lt', 'bottom_right_lg', 'bottom_right_lt'])) != '') {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:missing_arg + ' required'
			});
			return;
		}
		var box = [
			[request.top_left_lg, request.top_left_lt],
			[request.bottom_right_lg, request.bottom_right_lt]
		];
		this._database.find({
				collection:'questions',
				query:{
					loc:{
						"$within":{
							"$box":box
						}
					}
				}
			},
			function (error, results) {
				console.error('find_questions_in_bounding_box results ' + results);
				server._respondwrap(request, response, results);
			});
	},
	find_questions_near:function (request, response, args) {
		var server = this;
		if (args.lg === undefined) {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:'lg is required'
			});
			return;
		}
		if (args.lt === undefined) {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:'lt is required'
			});
			return;
		}
		var lg = parseFloat(args.lg, 10);
		var lt = parseFloat(args.lt, 10);
		var limit = 5;
		if ("limit" in args) {
			limit = args.limit;
		}
		this._database.find({
				collection:'questions',
				query:{
					loc:{
						$near:[lg, lt]
					}
				}
			},
			function (error, results) {
				console.error('error ' + error + ' results ' + results);
				server._respondwrap(request, response, results);
			});
	},
	find_trivia_packs_near:function (request, response, args) {
		var server = this;
		if (args.lg === undefined) {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:'lg is required'
			});
			return;
		}

		if (args.lt === undefined) {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:'lt is required'
			});
			return;
		}

		this._database.find({
				collection:'trivia_packs',
				query:{
					loc:{
						$near:[lg, lt]
					}
				}
			},
			function (error, results) {
				console.error('find_trivia_packs_near results ' + results);
				server._respondwrap(request, response, results);
			});

	},
	find_trivia_packs_by_owner:function (request, response, args) {
		var server = this;
		if (args.user_id === undefined) {
			this._respond(request, response, {
				error:'Bad Request',
				status:403,
				msg:'user_id is required'
			});
			return;
		}

		this._database.find({
				collection:'trivia_packs',
				query:{
					user_id:args.user_id
				}
			},
			function (error, results) {
				console.error('find_trivia_packs_by_user results ' + results);
				server._respondwrap(request, response, results);
			});
	},

	search_google_places: function(request, response, args) {

		var radius    = 10000;
		var server    = this;
		var missing   = this._validate_args(args, ['lt', 'lg', 'q']);

		function onError(error, status, msg) {
			return server._respond(request, response, {
				msg:    msg,
				error:  error,
				status: status
			});
		}

		if (missing.length > 0) {
			return onError(403, 'Bad Request', missing + ' required');
		}

		utils.getJSON('https://maps.googleapis.com/maps/api/place/search/json', {
			keyword:  args.q,
			location: args.lt + "," + args.lg,
			key:      this._config._conf.munitia_google_maps_api_key,
			sensor:   'false',
			radius:   radius,
			sort:     'relevance'
		}, function(error, data) {
			if (error) {
				onError(502, 'Bad Gateway', error)
			} else {
				server._respondwrap(request, response, data);
			}
		});

		return true;

	},

	search_flickr_imgs: function(request, response, args) {

		var radius    = 10000;
		var server    = this;
		var missing   = this._validate_args(args, ['lt', 'lg', 'q']);

		function onError(error, status, msg) {
			return server._respond(request, response, {
				msg:    msg,
				error:  error,
				status: status
			});
		}

		if (missing.length > 0) {
			return onError(403, 'Bad Request', missing + ' required');
		}

		utils.getJSON('http://api.flickr.com/services/rest', {
			method:         'flickr.photos.search',
			api_key:        this._config._conf.munitia_flickr_api_key,
			text:           args.q,
			safe_search:    1,             // 1 is "safe"
			license:        '1,2,3,4,5,6', // creative commons varieties
			content_type:   1,             // 1 is photos only
			sort:           'relevance',
			lat:            args.lt,
			long:           args.lg,
			format:         'json',
			nojsoncallback: 1,
			per_page:       20,
			radius:         radius
		}, function(error, data) {
			if (error) {
				onError(502, 'Bad Gateway', error)
			} else {
				server._respondwrap(request, response, data);
			}
		});

		return true;

	},

	db_test:function (request, response, args) {
		var server = this;
		this._database.find({
			collection: 'test'
		}, function (results) {
			server._respondwrap(request, response, results);
		});
	}
};

exports.start = function (config, database) {
	var server = new ApiServer(config, database);
	server._listen(8080);
};