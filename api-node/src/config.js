/*global console:true, require:true, process: true, exports:true */
var fs = require('fs');

function Config(){}

Config.prototype = {
	
	_conf: {},
	
	load: function(path, encoding, onload) {
		var config = this;
		encoding = encoding || 'utf-8';
		fs.readFile(path, encoding, function(error, conf, server) {
		    if (error) { throw error; }
			conf = JSON.parse(conf);
			config._conf = conf;
			onload.call(null, config);
		});
	},
	
	has: function(key) {
		return this._conf.hasOwnProperty(key);
	},
	
	get: function(key, fallback) {
		if (this.has(key)) {
			return this._conf[key];
		} else {
			return fallback;
		}
	}
	
};

exports.load = function(path, encoding, onload) {
	var config = new Config();
	config.load(path, encoding, onload);
	return config;
};