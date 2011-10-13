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
        this.shortName = $.trim(model.shortName);
        this.longName  = $.trim(model.longName);        
    }
    
    Line.prototype = {
        
        prettyName: function() {
            var name = [this.shortName, this.prettyDirection()];
            if (this.longName.length) {
                name.push('(' + this.longName + ')');
            }
            return name.join(' ');
        },
        
        prettyDirection: function() {
            switch(this.direction) {
                case module.DIRECTION_OUTBOUND:
                    return 'outbound';
                case module.DIRECTION_INBOUND:
                default:
                    return 'inbound';
            }
        }
        
    };
    
})(munitia, jQuery);