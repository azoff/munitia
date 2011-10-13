(function(namespace, $){
    
    var module = namespace.extend('stops', {
    
        Stop: Stop,
    
        fromModels: function(model, filter) {
            var stops = []; 
            filter = $.isFunction(filter) ? filter : $.noop;
            $.each(model, function(i, model){
                var stop = module.fromModel(model)
                if (filter(stop) !== false) {
                    stops.push(stop);
                }
            });
            return stops;
        },
        
        fromModel: function(model) {
            return new Stop(model);
        },
        
        hasLineFilter: function(stop) {
            return stop.hasLines();
        }
        
    });
    
    function Stop(model) {
        this.name = model.name;
        this.lines = namespace.lines.fromUniqueIds(model.lines);
    }
    
    Stop.prototype = {
        
        toString: function() {
            return this.name;
        },
        
        hasLines: function() {
            return this.lines.length > 0;
        }
        
    };
    
})(munitia, jQuery);