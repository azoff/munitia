(function(package, $){
    
    var module = package.api = {
        
        execute: function(type, path, data) {
            var url = [package.API_ROOT, path].join('/');
            return $.ajax({ url: url, data: data, type: type });
        },
        
        get: function(key, data) {
            return module.execute('GET', key, data);
        },
        
        set: function(key, data) {
            return module.execute('POST', key, data);
        },
        
    },
    
    tld, domain = document.domain.split('.');
    
    if (domain.length > 2) {
        tld = domain.pop(); domain = domain.pop();
        try { document.domain = [domain, tld].join('.'); }
        catch(e) { package.utils.error(e); }
    }
    
    $.ajaxSetup({
        cache: false,
        dataType: 'json',
        isLocal: package.LOCAL_MODE
    });
    
})(munitia, jQuery);