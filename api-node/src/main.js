/*global require:true, console:true, process:true */
require('src/config').load('../environment.json', 'utf-8', function(config){
	require('src/database').connect(config, function(database){
		require('src/apiserver').start(config, database);
	});
});