(function(namespace, fb, event, $){ var
    
    controller = namespace.controller,
    users = namespace.users,
    
    module = namespace.session = {
        
        start: function() {
            controller.showLoader();
            event.subscribe('auth.statusChange', module.onUpdate);            
            fb.init({ 
                appId: namespace.settings.fbAppId, 
                oauth: module.user = true
            });
        },
        
        login: function() {
            if (!module.user) {
                controller.showLoader('logging in');
                fb.login();     
            } else {
                controller.changeState('logged-in');
            }
        },
        
        logout: function() {
            fb.logout();
        },
        
        onUpdate: function(response) {
            var model = response.authResponse;
            if (model) {
                module.user = new users.User(model);
                controller.changeState('logged-in');
            } else {
                module.user = null;
                controller.changeState('logged-out');
            }
        }
        
    };
    
    controller.setChangeHook('login', module.login);
    controller.setChangeHook('logout', module.logout);
    
})(munitia, FB, FB.Event, jQuery);