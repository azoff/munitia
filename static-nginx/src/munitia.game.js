(function(geo, namespace, $){ var 
    api = namespace.api,   
    utils = namespace.utils,   
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
        
        validateStop: function(stop) {
            var valid = stop.hasLines();
            if (!valid) {
                utils.error('Invalid stop; ignoring because it does not have any lines:', stop);
            }
            return valid;
        },
        
        loadStops: function(page) { var
            done = $.Deferred(),
            coords = session.user.getCoords(),
            args = { lt: coords.latitude, lg: coords.longitude };
            controller.showLoader('loading stops');
            namespace.api.get('find_stops_near', args).success(function(model){ 
                module.renderStops(page, model, done); 
            });
            return done.promise();
        },
        
        renderStops: function(page, model, done) { var
            stopObjs = stops.fromModels(model.data, module.validateStop),
            model = { stops: stopObjs };
            controller.render('stops', model, function(html){
                if (html) {
                    page.data('stops', stopObjs);
                    page.find('.header').html('Pick A Line');
                    page.find('.refresh').removeClass('ui-btn-active');
                    page.find('.content').empty().append(html); 
                    html.filter('ul').listview();
                    controller.hideLoader();
                    done.resolve();
                } else { 
                    renderError('Unable to load stops'); 
                }
            });
        },
        
        loadRound: function(page, model) { var 
            args = {}, 
            stop, line,
            stops = $('#lines').data('stops');
            if (stops) {
                stop = stops[parseInt(model.stop, 10)],
                line = stop.lines[parseInt(model.line, 10)];
                args.stretch_id = stop.getStretchId(line);
                args.user_id = session.user.getUserId();
                args.lt = stop.latitude;
                args.lg = stop.longitude;
                controller.showLoader('loading round');
                namespace.api.get('add_to_round', args).success(function(model){ 
                    module.renderRound(page, stop, line, model);
                });
            }
        },

        renderRound: function(page, stop, line, model) {
            page.find('.back').removeClass('hidden').find('.ui-btn-text').html('Lines');
            page.find('.header').html(line.toString());
            page.find('.content').html(stop.toString());
            controller.hideLoader();
        },

        loadQuestions: function(page) { var
            coords = session.user.getCoords(),
            args = { lt: coords.latitude, lg: coords.longitude };
            controller.showLoader('loading questions');
            namespace.api.get('find_questions_near', args).success(function(model){ 
                module.renderQuestions(page, model); 
            });
        },

        renderQuestions: function(page, model) {
            var questionObjs = model.data;
            questionObjs.push({question: "Add question", answers: []});
            model = { questions: questionObjs };
            controller.render('question', model, function(html){
                if (html) {
                    page.data('questions', questionObjs);
                    page.find('.header').html('Questions');
                    page.find('.refresh').removeClass('ui-btn-active');
                    page.find('.content').empty().append(html); 
                    html.filter('ul').listview();
                    controller.hideLoader();
                } else { 
                    renderError('Unable to load questions');
                }
            });
    	}        
    };
    
    controller.addStateHook('#lines', ['logged-in', 'geo-locate'], module.geolocate);
    controller.addStateHook('#lines', 'geo-located', module.loadStops);
    controller.addStateHook('#round', module.loadRound);
    controller.addStateHook('#questions', module.loadQuestions);
    
})(navigator.geolocation, munitia, jQuery);
