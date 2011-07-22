/*global require:true, console:true, process:true */
require.paths.unshift(process.mainModule[0]);

require('mongodb');

if (process.argv.length > 2) {
	require('config').load(process.argv[2], 'utf-8', function(config){
		require('apiserver').start(config, 8080);
	});
} else {
	console.error('usage: %s %s path/to/environment.json', process.argv[0], process.argv[1]);
}