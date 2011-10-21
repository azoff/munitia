(function(namespace, $){ 
    
    var module = namespace.extend('lines', {
    
        DIRECTION_OUTBOUND: 1,

        DIRECTION_INBOUND: 0,
    
        Line: Line,
        
        fromUniqueIds: function(ids) {
            var lines = [];
            $.each(ids || [], function(i, id) {
                lines.push(module.fromUniqueId(id));
            });
            return lines;
        },
        
        fromUniqueId: function(id) {
            var parts = id.split(':');
            return module.fromModel({
                routeId: parts[0],
                shortName: parts[1],
                longName: parts[2],
                direction: parts[3]
            });
        },
        
        fromModel: function(model) {
            return new Line(model);
        }
        
    });
    
    function Line(model) {
        this.routeId   = parseInt(model.routeId, 10);
        this.direction = parseInt(model.direction, 10);
        this.shortName = $.trim(model.shortName).toUpperCase();
        this.longName  = $.trim(model.longName).toUpperCase();        
    }
    
    Line.prototype = {
        
        toString: function() {
            return this.prettyName();
        },
        
        prettyName: function() {
            return [this.shortName, this.longName, '-', this.prettyDirection()].join(' ');
        },
        
        prettyDirection: function() {
            switch(this.direction) {
                case module.DIRECTION_OUTBOUND:
                    return 'OUTBOUND';
                case module.DIRECTION_INBOUND:
                default:
                    return 'INBOUND';
            }
        }
        
    };
    
})(munitia, jQuery);