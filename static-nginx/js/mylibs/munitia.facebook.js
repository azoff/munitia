(function(namespace, $, global){
    
    var module = namespace.facebook = {
        
        checkSession: function() {
            if (module._initialized) {
                FB.getLoginStatus(function(response) {
                    namespace.events.trigger('facebook:session', response.session);
                });
            } else {
                namespace.events.one('facebook:init', module.checkSession);
            }
        },
        
        asyncInit: function() {                         
            FB.init({ appId: munitia.FB_APP_ID, xfbml: true });    
            module._initialized = true;
            namespace.events.trigger('facebook:init');
        }
        
    };
    
    global.fbAsyncInit = module.asyncInit;
    
})(munitia, jQuery, window);