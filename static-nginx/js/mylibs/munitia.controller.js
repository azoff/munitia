(function(namespace, $){
    
    var cache = {};
    
    function template(view, callback) {
        var path;
        if (view in cache) {
            callback(cache[view]);
        } else {
            path = ['/views/', view, '.tmpl'].join('');
            namespace.utils.log('GET', path);
            $.ajax({ url: path, dataType: 'html'}).success(function(tmpl){
                namespace.utils.log(200, tmpl);                 
                callback(cache[view] = $(tmpl));
            }).error(function(xhr, status, error){
                namespace.utils.error(xhr.status, status, error);
                cache[view] = null;
            });
        }
    }
    
    var module = namespace.controller = {
        
        render: function(view, model, callback) { 
            template(view, function(view) {                
                callback(view.tmpl(model));
            });
        }
        
    };
    
})(munitia, jQuery);