(function(global, namespace, fb, event, $){ var
    
    monitor = $.Deferred(),
    controller = namespace.controller,
    utils = namespace.utils,
    users = namespace.users,
    
    module = namespace.session = {
        
        ready: $.proxy(monitor, 'done'), 
        
        start: function() {
            event.subscribe('auth.statusChange', module.onUpdate);            
            fb.init({ 
                appId: namespace.settings.fbAppId, 
                channelUrl: '/crossdomain.html',
                oauth: true, 
                status: true 
            });
            monitor.resolve();
        },
        
        login: function() {
            if (!module.user) {
                if (window.location.protocol == 'chrome-extension:') {
                    module.user = new users.User({user_id: 1, name: 'tracy', avatar_img: 'https://plus.google.com/104770262832706227353'});
                    $('.logged-in').removeClass('hidden');
                    $('.logged-out').addClass('hidden');
                    controller.changePage('#loginform', { changeHash: false, transition: 'pop'});
                    return;
                }
                controller.showLoader('logging in');
                module.ready(function(){
                    fb.login(controller.hideLoader);
                });                
            } else {
                controller.changePage('#lines', { state: 'logged-in' });
            }
        },
        
        logout: function() {
            module.ready(function(){
                fb.logout(controller.hideLoader);
            });
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
        },
        
        showInviteModal: function(page) {
            var back = page.find('.back');
            if (back.hasClass('hidden')) {
                back.removeClass('hidden').html('Back');
            }
            fb.ui({
                method: 'apprequests',
                message: 'Come play Munitia!'
            }, function(response){
                if (response) {
                    utils.log('Request', response.request, 'sent to', response.to.join(','), '...');
                }
                controller.changePage('#lines');
            });
        }
        
    };
    
    controller.addStateHook('#lines', 'login', module.login);
    controller.addStateHook('#lines', 'logout', module.logout);
    controller.addStateHook('#lines', 'logged-in', module.onLoggedIn);
    controller.addStateHook('#lines', 'logged-out', module.onLoggedOut);
    controller.addStateHook('#invite', module.showInviteModal);
    
})(window, munitia, FB, FB.Event, jQuery);
