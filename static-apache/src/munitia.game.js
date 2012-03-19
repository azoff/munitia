(function(global, namespace, controller, session, users, State, mobile){
    
    "use strict";
    
    var model, instances = {},
    
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
                instances[state] = new State(module.states[state]);
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
                            module.start() // back to start
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
            }
            
        }
        
    };
    
})(window, munitia, munitia.controller, munitia.session, munitia.users, munitia.states.State, jQuery.mobile);