(function(namespace, utils, $){
    
    var module = namespace.stops = {
    
        Stop: Stop,
    
        fromModels: function(models, filter) {
            var stops = []; 
            filter = $.isFunction(filter) ? filter : $.noop;
            $.each(models, function(i, model){
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
        
        parseNextStops: function(nextStops) {
            var lines = { exists: false };
            $.each(nextStops || [], function(i, nextStop){ var 
                parts = nextStop.split(':'),
                lineId = parts[0], stopId = parts[2],
                direction = parseInt(parts[1], 10),
                line = utils.ensureArray(lines, lineId);
                line[direction] = stopId;
	            lines.exists = true;
            });
            return lines;
        }
        
    };
    
    function Stop(model) {        
        this.id = model.stop_id;
        this.name = model.name;        
        this.lines = namespace.lines.fromUniqueIds(model.lines);
        this.next = module.parseNextStops(model.next_stop);
        if (this.next.exists) {
	        if (model.loc && model.loc.length > 1) {
		        this.longitude = model.loc[0];
		        this.latitude = model.loc[1];
	        } else {
		        utils.error('Missing loc info for stop!', model._id);
	        }
        } else {
	        utils.error('Missing next info for stop!', model._id);
        }
    }
    
    Stop.prototype = {
        
        toString: function() {
            return this.name;
        },
        
        hasLines: function() {
            return this.lines.length > 0;
        },
        
        getNextStopId: function(line) {
            return this.next[line.id][line.direction];
        },
        
        getStretchId: function(line) {
            var nextId = this.getNextStopId(line);
            return [this.id, line.id, nextId].join(':');
        }
        
    };
    
})(munitia, munitia.utils, jQuery);