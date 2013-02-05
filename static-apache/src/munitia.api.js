(function(namespace, $){

	"use strict";

	var module = namespace.api = {

		execute: function(type, path, data) {
			return $.ajax({
				url: [namespace.config.apiHost, path].join('/'),
				data: data,
				type: type,
				cache: true,
				crossDomain: true,
				dataType: 'json',
				timeout: 5000
			});
		},

		get: function(key, data) {
			return module.execute('GET', key, data);
		},

		set: function(key, data) {
			return module.execute('POST', key, data);
		}

	};

})(munitia, jQuery);