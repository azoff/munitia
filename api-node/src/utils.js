/*global exports, require */

var url = require('url');
var querystring = require('querystring');

exports.getJSON = function(href, query, callback) {

	function onError(error) {
		console.error(error);
		callback(error);
	}

	var parts = url.parse(href);
	var scheme  = parts.protocol.replace(/\W+/,'');
	var options = {
		host: parts.host,
		path: parts.pathname + '?' + querystring.stringify(query)
	};

	require(scheme).get(options, function (response) {
		var json = '';
		response.on('data', function (chunk) {
			json += chunk;
		});
		response.on('end', function () {
			try {
				callback(null, JSON.parse(json));
			} catch(error) {
				onError(error);
			}
		});
	}).on('error', onError);

};

exports.applier = function(instance, method) {
	return function(args) {
		args = Array.prototype.slice.call(arguments);
		method.apply(instance, args);
	};
};

function extend(destination, source) {
	for (var property in source) {
		destination[property] = source[property];
	}
	return destination;
}
exports.extend = extend;

exports.extractArgs = function(request, callback) {
	var postdata = '',
	args = url.parse(request.url, true).query;
	if (request.method === 'POST') {
		request.on('data', function(chunk) {
			postdata+= chunk;
		});
		request.on('end', function(){
			callback.call(extend(args, querystring.parse(postdata)));
		});
    } else {
		callback.call(null, args);
	}	
};
