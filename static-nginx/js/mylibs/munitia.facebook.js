(function(package, $, global){
    
    var module = package.facebook = {
        
        checkSession: function(callback) {                                        
            package.events.one('facebook:session', callback);
            if (module._initialized) {
                FB.getLoginStatus(function(response) {
                    package.events.trigger('facebook:session', response.session);
                });
            } else {
                package.events.one('facebook:init', module.checkSession);
            }
        },
        
        asyncInit: function() {                         
            FB.init({ appId: munitia.FB_APP_ID, xfbml: true });    
            module._initialized = true;
            package.events.trigger('facebook:init');
        }
        
    };
    
    global.fbAsyncInit = module.asyncInit;
    
})(munitia, jQuery, window);