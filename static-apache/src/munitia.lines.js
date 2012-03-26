(function(namespace, $){ 
    
    "use strict";    
    
    function Line(model) {
        this.id        = model.id;
        this.direction = parseInt(model.direction, 10);
        this.shortName = $.trim(model.shortName).toUpperCase();
        this.longName  = $.trim(model.longName).toUpperCase();        
    }
    
    var module = namespace.lines = {
    
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
                id: parts[0],
                shortName: parts[1],
                longName: parts[2],
                direction: parts[3]
            });
        },
        
        fromModel: function(model) {
            return new Line(model);
        }
        
    };
    
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
                    return 'INBOUND';
                default:
                    return 'UNKNOWN';
            }
        }
        
    };
    
})(munitia, jQuery);