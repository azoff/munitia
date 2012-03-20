(function(global, namespace, mobile, $){
    
    "use strict";
    
    var 
    controller = namespace.controller, 
    session = namespace.session, 
    api = namespace.api, 
    users = namespace.users,
    stops = namespace.stops,
    states = namespace.states,
    
    model = {}, 
    instances = {},
    
    module = namespace.game = {
        
        model: { },
        
        // picks the correct start state
        start: function() {
            if (session.hasUser()) {
                mobile.changePage('geolocate');
            } else {
                mobile.changePage('login');
            }
        },
        
        // handles state change processing
        changeState: function(state, page) {            
            if (!(state in instances)) {
                instances[state] = new states.State(module.states[state]);
            }
            return instances[state].execute(page);
        },
        
        states: {
            
            // this state asks the user to provide an alias
            login: {
                init: function(page) {
                    // create the login form
                    return controller.fill(page, {
                        header: 'Enter Your Alias',
                        content: controller.render('login')
                    }).then(function(page, content){
                        // bind a listener for login
                        content.submit(function(){
                            var alias = page.find('input'),
                            user = users.fromAlias(alias.val()); 
                            session.setUser(user);
                            module.start(); // back to start
                            return false; // don't submit
                        });
                    });
                }
            },
            
            // locates the user's position and shows it on a map
            geolocate: {
                init: function(page) {
                    return controller.fill(page, {
                        content: controller.render('geo')
                    });
                },
                update: function(page) {                    
                    controller.fill(page, { header: 'Locating Your Device' });
                    // try to get the user's position
                    return session.getPosition().then(function(position){
                        model.coords = position.coords;                        
                        controller.fill(page, { header: 'Device Found!' });
                        page.find('.geo').removeClass('hidden');
                        var coords = position.coords, img = page.find('img'),
                        src = '//maps.googleapis.com/maps/api/staticmap?';
                        src += 'sensor=true&zoom=13&markers=color:black%7Csize%7Ctiny|'; 
                        src += coords.latitude + ',' + coords.longitude;
                        src += '&size=' + page.width() + 'x320&center=';
                        src += coords.latitude + ',' + coords.longitude;
                        img.attr('src', src);
                    });
                }
            },
            
            // shows the applicable lines for the current position
            lines: {
                init: function(page) {                            
                    return controller.fill(page, { header: 'Select A Line' });
                },
                update: function(page) {            
                    var renderer = $.Deferred();
                    // get stops around user's current position
                    api.get('find_stops_near', {
                        lt: model.coords.latitude, 
                        lg: model.coords.longitude
                    }).success(function(resposne){
                        // filter stops that have lines
                        model.stops = stops.fromModels(resposne.data);
                        // add the stops to the page
                        controller.fill(page, {
                            content: controller.render('stops', model)
                        }).then(function(page, content){
                            // set model and join round when a line is selected
                            content.on('click', 'a', function(){
                                var data = $(this).data();
                                model.stop = model.stops[data.stop];
                                model.line = model.stop.lines[data.line];
                                mobile.changePage('round');
                            });
                            
                        }).then(renderer.resolve);
                    });
                    return renderer;
                }                
            }
            
        }
        
    };
    
})(window, munitia, jQuery.mobile, jQuery);