(function(global, namespace, controller, session, users){
    
    "use strict";
    
    var actions, states, 
    
    module = namespace.game = {
        
        actions: actions = {
            
            // picks the correct start state
            start: function() {
                if (session.hasUser()) {
                    controller.changeState('geolocate');
                } else {
                    controller.changeState('login');
                }
            },
            
            // creates a user with the submitted alias
            // then returns to start
            login: function(event) {
                var alias = $(event.target).find('input'),
                user = users.fromAlias(alias.val()); 
                session.setUser(user);
                actions.start(); // back to start
                return false;
            }
            
        },
        
        states: states = {
            
            // this state asks the user to provide an alias
            login:  function(page) {                     
                // only need to fill the page content once!
                if (!states.login.job) {
                    states.login.job = controller.fill(page, {
                        header: 'Enter Your Alias',
                        content: controller.render('login')
                    }).then(function(page, content){
                        // after we fill the content, bind a submit
                        // listener for the login form
                        content.submit(actions.login);
                    });
                }
                return states.login.job.promise();
            },
            
            // locates the user's position
            geolocate: function(page) {
                // only need to fill the page content once!
                if (!states.login.job) {
                    states.login.job = $.Deferred();
                    controller.fill(page, {
                        header: 'Locating Your Device',
                        //content: controller.render('geolocate'),
                        footer: 'Searching, Please Wait...'
                    }).then(function(page, content){
                    
                    });
                }
            }
            
        }
        
    };
    
})(window, munitia, munitia.controller, munitia.session, munitia.users);