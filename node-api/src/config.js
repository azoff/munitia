/*global console:true, require:true, exports:true */
var fs = require('fs');

function Config(){}

Config.prototype = {
	
	_conf: {},
	
	load: function(path, encoding, onload) {
		encoding = encoding || 'utf-8';
		fs.readFile(path, encoding, function(error, conf, server) {
		    if (!error) {
				if (conf) {
					try {
				        conf = JSON.parse(conf);
						this._conf = conf;
						if (onload !== undefined && onload.call) {
							onload.call(this, this);
						}
				    } catch(jsonError) {    
				        error = jsonError;
				    }
				} else {
					error = 'Configuration file is empty!';
				}
			}
			if(error) {    
		        console.error("Unable to load configuration file %s: %s", path, error);
		    }
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