(function(global, namespace, mobile, $){
    
    "use strict";
    
    var 
    controller = namespace.controller, 
    session = namespace.session, 
    api = namespace.api, 
    users = namespace.users,
    stops = namespace.stops,
    states = namespace.states,
    
    module = namespace.game = {
    
        model: {},
        
        // picks the correct start state
        start: function() {
            var hash = module.model.lastState || $.trim(global.location.hash);
            // if session is found...
            if (session.hasUser()) {                
                // let the user choose his start state, unless
                // that start state is empty or the login state
                if (hash.length === 0 || /login$/.test(hash)) {
                    hash = 'geolocate';
                }
                mobile.changePage(hash);
            
            // always force login if no session is found
            } else {
                module.model.lastState = hash;
                mobile.changePage('login');
            }
        },

        // handles state change processing
        changeState: function(state, page) {            
            return states.getState(state).execute(page);
        }
        
    };
    
})(window, munitia, jQuery.mobile, jQuery);