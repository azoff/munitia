/*global require: true, exports: true, console: true, process: true */
var 
utils = require('src/utils'),
mongodb = require('mongodb');

function Database(host, port, database, username, password) {    
	var server = new mongodb.Server(host, port, { auto_reconnect: true }, {});
	this.client = new mongodb.Db(database, server, { w: 0 });
	this.username = username;
	this.password = password;
}

Database.prototype = {
	
	_active: false,
	
	_open: function(callback) {
		var database = this, closer = utils.applier(database, database._close);
		this.client.open(function(error) {
            if (error) {
				throw error;
			} else {
	            process.on('exit', closer);
				database._active = true;
				database.client.authenticate(database.username, database.password, function(err) {
					if (err != null) {
						console.error('ERROR authenticating: ' + err);
						process.exit(2);
					}
				});
				callback.call(database, database);
			}
		});
	},
	
	_collection: function(name, callback) {
		var database = this;
		if (this._active) {
			this.client.collection(name, function(error, collection) {
				if (error) { console.error(error); }
				callback.call(this, collection);
			});
		} else {
			// TODO(tracy): need to also call the callback when an error is encountered.
			console.error("Unable to get collection %s, DB is not connected!", name);
		}
	},
	
	find: function(options, callback) {
		options = utils.extend({
			query: {},
			options: {},
			fields: {},
			collection: ''
		}, options || {});
		this._collection(options.collection, function(collection){
			if (collection) {
				var query = collection.find(options.query, options.fields, options.options);
				query.toArray(function(error, documents){
					documents = documents || [];
					if (error) { console.error(error); }
					callback.call(null, error, documents);
				});
			} else {
				callback.call(null, 'unknown collection', []);
			}
		});
	},

	update: function(options, callback) {
		options = utils.extend({
			critera: {},
			doc: {},
			options: {}
		}, options || {});
		this._collection(options.collection, function(collection) {
		    if (collection) {
				collection.update(options.criteria, options.doc, options.options, function(err, results) {
					if (err) console.error(err);
					callback.call(null, err, results);
				});
			} else {
				callback.call(null, 'unknown collection', []);
			}
		});
	},
		
	insert: function(options, callback) {
		options = utils.extend({
			docs: [],
			collection: ''
		}, options || {});
		this._collection(options.collection, function(collection){
			if (collection) {
				collection.insert(options.docs, {safe: true}, function(error, documents) {
					documents = documents || [];
					if (error) { console.error(error); }
					callback.call(null, error, documents);
				});
			} else {
				callback.call(null, 'unknown collection', []);
			}
		});
	},
	
	remove: function(options, callback) {
		options = utils.extend({
			criteria: {},
			collection: ''
		}, options || {});
		this._collection(options.collection, function(collection) {
			if (collection) {
				console.error(options.criteria);
				collection.remove(options.criteria, function(error, result) {
					result = result || [];
					if (error) { console.error(error); }
					callback.call(null, error, result);
				});
			} else {
				callback.call(null, 'unknown collection', []);
			}
		});
    },
			
	_close: function() {
		this.client.close();
		this._active = false;
	}    

};

exports.connect = function(config, callback) {
	var host = config.get('DOTCLOUD_DATA_MONGODB_HOST'),
        port = parseInt(config.get('DOTCLOUD_DATA_MONGODB_PORT'), 10),
        username = config.get('DOTCLOUD_DATA_MONGODB_LOGIN'),
        password = config.get('DOTCLOUD_DATA_MONGODB_PASSWORD'),
        dbname = config.get('DOTCLOUD_DATA_MONGODB_DATABASE');
	database = new Database(host, port, dbname, username, password);
	database._open(callback);
};
