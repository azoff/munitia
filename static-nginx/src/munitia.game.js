(function(geo, namespace, $){ var 
    api = namespace.api,   
    stops = namespace.stops, 
    session = namespace.session,
    controller = namespace.controller,
    
    module = namespace.game = {
        
        geolocate: function(page) {
            controller.showLoader('locating device');
            geo.getCurrentPosition(function(geo){
                controller.hideLoader();
                session.user.setGeo(geo);
                controller.changePage('#lines', { state: 'geo-located' });
            });
        },
        
        loadStops: function(page) { var
            coords = session.user.getCoords(),
            args = { lt: coords.latitude, lg: coords.longitude };
            controller.showLoader('loading stops');
            namespace.api.get('find_stops_near', args).success(function(model){ 
                module.renderStops(page, model); 
            });
        },
        
        renderStops: function(page, model) { var
            stopObjs = stops.fromModels(model, stops.hasLineFilter),
            model = { stops: stopObjs };
            controller.render('stops', model, function(html){
                if (html) {
                    page.data('stops', stopObjs);
                    page.find('.header').html('Pick A Line');
                    page.find('.refresh').removeClass('ui-btn-active');
                    page.find('.content').empty().append(html); 
                    html.filter('ul').listview();
                    controller.hideLoader();
                } else { renderError('Unable to load stops'); }
            });
        },
        
        loadRound: function(page, model) { var
            stops = $('#lines').data('stops'),
            stop = stops[parseInt(model.stop, 10)],
            line = stop.lines[parseInt(model.line, 10)];   
            page.find('.ui-btn-left:not(.ui-btn)').removeClass('hidden').html('Lines');
            page.find('.header').html(line.toString());
            page.find('.content').html(stop.toString());
        }
        
    };
    
    controller.addStateHook('#lines', ['logged-in', 'geo-locate'], module.geolocate);
    controller.addAsyncStateHook('#lines', 'geo-located', module.loadStops);
    controller.addStateHook('#round', module.loadRound);
    
})(navigator.geolocation, munitia, jQuery);