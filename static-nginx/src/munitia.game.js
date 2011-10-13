(function(geo, namespace, $){ var 
    api = namespace.api,   
    stops = namespace.stops, 
    session = namespace.session,
    controller = namespace.controller,
    
    module = namespace.game = {
        
        geolocate: function() {
            controller.showLoader('locating device');
            geo.getCurrentPosition(function(geo){
                controller.hideLoader();
                session.user.setGeo(geo);
                controller.changePage('#lines', { state: 'geo-located' });
            });
        },
        
        loadStops: function(page) { var
            notifier = new $.Deferred(),
            coords = session.user.getCoords(),
            content = page.find('#content'),
            args = { lt: coords.latitude, lg: coords.longitude };
            controller.showLoader('loading stops');
            namespace.api.get('find_stops_near', args).success(function(model){ 
                module.renderStops(page, content, model, notifier); 
            }).error(function(error){ 
                module.renderError(content, 'Server Error: ' + error, notifier); 
            });
        },
        
        renderStops: function(page, content, model, notifier) { var
            stopObjs = stops.fromModels(model, stops.hasLineFilter),
            model = { stops: stopObjs };
            controller.render('stops', model, function(html){
                if (html) {
                    page.find('#header').html('Pick A Line')
                    content.empty().append(html); 
                    html.filter('ul').listview();
                    controller.hideLoader();
                    notifier.resolve();
                } else { renderError('Unable to load stops'); }
            });
        },
        
        renderError: function(content, error, notifier) {
            controller.render(view, error, function(html){
                content.empty().append(html);
                controller.hideLoader();
                notifier.resolve();
            });
        }
        
    };
    
    controller.addStateHook('#lines', 'logged-in', module.geolocate);
    controller.addStateHook('#lines', 'geo-located', module.loadStops, true);
    
})(navigator.geolocation, munitia, jQuery);