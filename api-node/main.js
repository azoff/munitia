/*global require:true, console:true, process:true */
require.paths.unshift(process.mainModule[0]);

if (process.argv.length > 2) {
	require('config').load(process.argv[2], 'utf-8', function(config){
		require('database').connect(config, function(database){			
			require('apiserver').start(config, database);
		});
	});
} else {
	console.error('usage: %s %s path/to/environment.json', process.argv[0], process.argv[1]);
	process.exit(1);
}