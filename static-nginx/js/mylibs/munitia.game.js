(function(namespace, $){ var 
    
    stage, stops,
    
    controller = namespace.controller,
    
    module = namespace.game = {

        start: function(user, _stage) {
            stage = _stage;
            user.geolocate(module.loadStops);
        },    
        
        end: function() {
            
        },
        
        loadStops: function(location) { var
            coords = location.coords, fn = module.renderLines,
            args = { lt: coords.latitude, lg: coords.longitude };
            namespace.api.get('find_stops_near', args).success(fn).error(fn);
        },
        
        selectStop: function(event) { var 
            element = $(event.target),
            stopIndex = parseInt(element.data('stop'), 10),
            lineIndex = parseInt(element.data('line'), 10),
            stop = stops[stopIndex],
            line = stop.lines[lineIndex];
            console.log(stop, line);
        },        
        
        renderLines: function(model) { 
            stops = namespace.stops.fromModels(model, namespace.stops.hasLineFilter);
            model = { stops: stops };
            var view = stops.length ? 'stops' : 'no-stops';
            controller.render(view, model, function(html){
                stage.html(html).delegate('.line', 'click', module.selectStop);
            });
        }
        
    };
    
})(munitia, jQuery);