/*global jQuery, munitia */
(function(namespace, $){
    
    var module = namespace.api = {
        
        execute: function(type, path, data) {
            var url = [namespace.API_ROOT, path].join('/');
            namespace.utils.log(type, url, $.param(data));
            return $.ajax({ url: url, data: data, type: type }).complete(function(xhr){
                namespace.utils.log(xhr.status, xhr.responseText);
            });
        },
        
        get: function(key, data) {
            return module.execute('GET', key, data);
        },
        
        set: function(key, data) {
            return module.execute('POST', key, data);
        }
        
    },
    
    tld, domain = document.domain.split('.');
    
    if (domain.length > 2) {
        tld = domain.pop(); domain = domain.pop();
        try { document.domain = [domain, tld].join('.'); }
        catch(e) { namespace.utils.error(e); }
    }
    
    $.ajaxSetup({
        cache: false,
        crossDomain: true,
        dataType: 'json',
        isLocal: namespace.LOCAL_MODE
    });
    
})(munitia, jQuery);