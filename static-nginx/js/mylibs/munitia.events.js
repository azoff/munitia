(function(namespace, $){
    
    var emitter = $({}),
    
    module = namespace.events = {
        
        one: function(event, data, handler) {
            namespace.utils.log('ONE', event, data, handler);
            if (!handler) { handler = data; }
            if (event && $.isFunction(handler)) {                
                emitter.one(event, data, handler);
            }            
        },
        
        bind: function(event, data, handler) {
            namespace.utils.log('BIND', event, data, handler);
            if (!handler) { handler = data; }
            if (event && $.isFunction(handler)) {                
                emitter.bind(event, data, handler);
            }            
        },
        
        unbind: function(event, handler) {
            namespace.utils.log('UNBIND', event, handler);
            emitter.unbind(event, handler);
        },
        
        trigger: function(event, data) {
            namespace.utils.log('TRIGGER', event, data);
            emitter.trigger(event, data);
        }
        
    }
    
})(munitia, jQuery);