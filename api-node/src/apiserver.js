/*global console:true, require:true, exports:true */
var 
http = require('http'), 
utils = require('utils');

function ApiServer(config) {
	var onrequest = utils.applier(this, this.respond);
	this.config = config;
	this.server = http.createServer(onrequest);
}

ApiServer.prototype = {
	listen: function(port) {
		try {
            this.server.listen(port);
        } catch(error) {
            console.error('Unable to start API server on port %d: %s', port, error);
        }
	},
	respond: function(request, response) {
		response.writeHead(200, {"Content-Type": "text/javascript"});
		response.end("document.write('API - OK');");
	}	
};

exports.start = function(config, port) {
	var server = new ApiServer(config);
	server.listen(port);
	return server;
};