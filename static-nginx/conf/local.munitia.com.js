munitia.settings = {
    localMode: false,
    enableLogging: true,
    apiRoot: 'http://local.api.munitia.com:8080',
    fbAppId: '113903638706159',
	remoteDebugger: function(agent) {
		if (agent.indexOf('iPad') > 0) {
			jQuery.getScript('http://local.munitia.com:8081/target/target-script-min.js#anonymous');
		}
	}
};