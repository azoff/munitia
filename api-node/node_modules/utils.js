/*global exports, require */

var 
url = require('url'),
querystring = require('querystring');

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
