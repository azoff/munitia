(function(global, namespace, fb, event, $){ var
    
    controller = namespace.controller,
    users = namespace.users,
    
    module = namespace.extend('session', {
        
        start: function() {
            event.subscribe('auth.statusChange', module.onUpdate);            
            fb.init({ 
                appId: namespace.settings.fbAppId, 
                channelUrl: '/crossdomain.html',
                oauth: true, 
                status: true 
            });
        },
        
        login: function() {
            if (!module.user) {
                controller.showLoader('logging in');
                fb.login(controller.hideLoader);     
            } else {
                controller.changePage('#lines', { state: 'logged-in' });
            }
        },
        
        logout: function() {
            fb.logout(controller.hideLoader);
        },
        
        onUpdate: function(response) {
            var model = response.authResponse;          
            if (model && !module.user) {
                module.user = new users.User(model);
                controller.changePage('#lines', { state: 'logged-in' });
            } else if (module.user) {
                module.user = null;
                controller.changePage('#lines', { state: 'logged-out' });
            }
        },
        
        onLoggedIn: function() {
            $('.logged-in').removeClass('hidden');
            $('.logged-out').addClass('hidden');
        },
        
        onLoggedOut: function(page) {
            page.find('.content').empty();
            $('.logged-out').removeClass('hidden');
            $('.logged-in').addClass('hidden');
        }
        
    });
    
    controller.addStateHook('#lines', 'login', module.login);
    controller.addStateHook('#lines', 'logout', module.logout);
    controller.addStateHook('#lines', 'logged-in', module.onLoggedIn);
    controller.addStateHook('#lines', 'logged-out', module.onLoggedOut);
    
})(window, munitia, FB, FB.Event, jQuery);