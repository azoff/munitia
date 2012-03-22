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
                            if (alias.length) {                             
                                session.setUser(user);
                                module.start(); // back to start   
                            } else {
                                controller.notify('Please provide a valid alias.');
                            }
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
                    }).then(function(response){
                        if (response && response.data && response.data.length) {
                            // filter stops that have lines
                            model.stops = stops.fromModels(response.data);
                            // add the stops to the page
                            controller.fill(page, {
                                content: controller.render('stops', model)
                            }).then(function(page, content){
                                // set model and join round when a line is selected
                                content.on('click', 'a', function(){
                                    var data = $(this).data();
                                    model.stop = model.stops[data.stop];
                                    model.line = model.stop.lines[data.line];
                                    model.stretchId = model.stop.getStretchId(model.line);
                                    mobile.changePage('round');
                                });

                            }).then(renderer.resolve);
                        } else {
                            controller.notify('Unable to find stops by you.');
                        }
                    });
                    return renderer;
                }                
            },
            
            // Adds the current user to a round, or creates one if the round does not exist
            round: {
                init: function(page) {
                    return controller.fill(page, { 
                        content: controller.render('round') 
                    });
                },
                update: function(page) {
                    var args = {},
                    content = page.find('.round').removeClass('fade in'),
                    // (4) shows the current round to the user
                    show = $.Deferred().then(function(response){
                        if (response.status === 200) {
                            var count = model.round.users.length,
                            noun = count === 1 ? ' Participant' : ' Participants';
                            controller.fill(page, { header: 'Round Joined!' });
                            content.find('h3').html(model.line.prettyName());
                            content.find('h4').html(count + noun);
                            content.addClass('fade in');
                        } else {
                            controller.notify('Unable to add you to round.');
                        }
                    }),
                    // (3) adds the current user to a round
                    adder = $.Deferred().then(function(response){
                        model.round = response.data[0];
                        args.round_id = model.round._id;
                        args.user_id = session.getUser().getId();
                        api.get('add_to_round', args).then(show.resolve);
                    }),
                    // (2) creates a round, if necessary
                    creator = $.Deferred().then(function(response){
                        if (response && response.data && response.data.length) {
                            adder.resolve(response);
                        } else {
                            api.get('create_round', args).success(adder.resolve);
                        }
                    });
                    // (1) finds a round to put the current user in
                    controller.fill(page, { header: 'Joining Round...' });
                    args.stretch_id = model.stretchId;
                    api.get('find_round', args).then(creator.resolve);                    
                    return show.promise();
                }
            }
            
        }
        
    };
    
})(window, munitia, jQuery.mobile, jQuery);