(function(package, $){
    
    var emitter = $({}),
    
    module = package.events = {
        
        one: function(event, data, handler) {
            if (!handler) { handler = data; }
            if (event && $.isFunction(handler)) {
                emitter.one(event, data, handler);
            }            
        },
        
        bind: function(event, data, handler) {
            if (!handler) { handler = data; }
            if (event && $.isFunction(handler)) {
                emitter.bind(event, data, handler);
            }            
        },
        
        unbind: function(event, handler) {
            emitter.unbind(event, handler);
        },
        
        trigger: function(event, data) {
            emitter.trigger(event, data);
        }
        
    }
    
})(munitia, jQuery);