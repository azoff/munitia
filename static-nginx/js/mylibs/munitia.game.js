(function(namespace, $){ var 
    
    stage, controller = namespace.controller,
    
    module = namespace.game = {

        start: function(user, _stage) {
            stage = _stage;
            user.geolocate(module.loadStops);
        },    
        
        loadStops: function(location) { var
            coords = location.coords, fn = module.renderStops,
            args = { lt: coords.latitude, lg: coords.longitude };
            namespace.api.get('find_stops_near', args).success(fn).error(fn);
        },
        
        renderStops: function(model) {
            var view = $.isArray(model) ? 'stops' : 'no-stops';
            controller.render(view, model, function(html){
                stage.html(html);
            });
        }
        
    };
    
})(munitia, jQuery);