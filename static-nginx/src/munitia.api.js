/*global jQuery, munitia */
(function(namespace, $){ var 
    
    module = namespace.extend('api', {
        
        execute: function(type, path, data) {
            var url = [namespace.settings.apiRoot, path].join('/');
            return $.ajax({
                url: url, 
                data: data, 
                type: type,
                cache: false,
                crossDomain: true,
                dataType: 'json',
                isLocal: namespace.settings.localMode
            });
        },
        
        get: function(key, data) {
            return module.execute('GET', key, data);
        },
        
        set: function(key, data) {
            return module.execute('POST', key, data);
        }
        
    });
    
})(munitia, jQuery);