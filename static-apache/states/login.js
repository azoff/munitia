// this state allows the user to provide an alias
(function(game, users, states, session, $){
    
    "use strict";
    
    var state;
    
    // create user or notify on error
    function createUser(event) {
        var user = users.fromAlias(state.alias.val());         
        // create a user and restart game
        if (user) {                       
            session.setUser(user);
            game.start();
        // or notify on error
        } else {
            state.notify('Please provide a valid alias.');
        }
        // don't submit
        return false;
    }
    
    // bind listeners for the login form
    function listen(form) {
        state.alias = form.find('#alias');
        form.submit(createUser);
    }
    
    // build the login form
    function init() {
        state.setHeader('Enter Your Alias');
        return state.setContent('login').then(listen);
    }
    
    state = states.defineState('login', { init: init });
    
})(munitia.game, munitia.users, munitia.states, munitia.session, jQuery);