(function(namespace, $){
    
    var cache = {};
    
    function template(view, callback) {
        var path;
        if (view in cache) {
            callback(cache[view]);
        } else {
            path = ['/views/', view, '.tmpl'].join('');
            $.get(path).success(function(tmpl){
                callback(cache[view] = tmpl);
            }).error(function(){
                cache[view] = null;
            });
        }
    }
    
    var module = namespace.controller = {
        
        render: function(view, model, callback) { 
            template(view, function(tmpl) {
                var html = $.tmpl(tmpl, model);
                callback(html);
            });
        }
        
    };
    
})(munitia, jQuery);