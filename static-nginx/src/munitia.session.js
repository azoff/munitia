(function(namespace, fb, event, $){ var
    
    controller = namespace.controller,
    users = namespace.users,
    
    module = namespace.session = {
        
        start: function() {
            event.subscribe('auth.statusChange', module.onUpdate);
            module.login();
        },
        
        login: function() {
            if (!module.user) {
                controller.showLoader('logging in');
                fb.init({ 
                    appId: namespace.settings.fbAppId, 
                    cookie: module.user = true, 
                    xfbml: true, oauth: true
                });
            } else {
                controller.changeState('logged-in');
            }
        },
        
        logout: function() {
            controller.changeState('logged-out');
        },
        
        onUpdate: function(response) {
            var model = response.authResponse;
            if (model) {
                module.user = new users.User(model);
                controller.changeState('logged-in');
            } else {
                module.user = null;
                module.logout();
            }
        }
        
    };
    
    controller.setPostChangeHook('login', module.login);
    controller.setPostChangeHook('logout', module.logout);
    
})(munitia, FB, FB.Event, jQuery);