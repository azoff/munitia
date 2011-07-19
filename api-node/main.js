/*global require:true, __filename:true, console:true, process:true */
process.on('uncaughtException', function (error) {
	console.error('UNCAUGHT EXCEPTION DETECTED - %s', error);
});

var 
// imports
path = require('path'),

// setup class path
paths = { root: path.dirname(__filename) };
paths.env = '/home/dotcloud/environment.json';
paths.src = path.join(paths.root, 'src');
require.paths.unshift(paths.src);

require('config').load(paths.env, 'utf-8', function(config){
	require('apiserver').start(config, 8080);
});
