(function(namespace, fb, event, $){ var
    
    controller = namespace.controller,
    users = namespace.users,
    
    module = namespace.extend('session', {
        
        start: function() {
            controller.showLoader();
            event.subscribe('auth.statusChange', module.onUpdate);            
            fb.init({ appId: namespace.settings.fbAppId, oauth: true });
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
            controller.hideLoader();
        },
        
        onLoggedIn: function() {
            $('.logged-in').removeClass('hidden');
            $('.logged-out').addClass('hidden');
        },
        
        onLoggedOut: function() {
            $('.logged-out').removeClass('hidden');
            $('.logged-in').addClass('hidden');
        }
        
    });
    
    controller.addChangeHook('login', module.login);
    controller.addChangeHook('logout', module.logout);
    controller.addChangeHook('logged-in', module.onLoggedIn);
    controller.addChangeHook('logged-out', module.onLoggedOut);
    
})(munitia, FB, FB.Event, jQuery);