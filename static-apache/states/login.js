// this state allows the user to provide an alias
(function(game, states, session){
    
    "use strict"
    
    // create user or notify on error
    function onsubmit(event) {
        var user = users.fromAlias(this.alias.val());         
        // create a user and restart game
        if (user) {                       
            session.setUser(user);
            game.start();
        // or notify on error
        } else {
            this.notify('Please provide a valid alias.');
        }
        // don't submit
        return false;
    }
    
    // bind listeners for the login form
    function listen(state, form) {
        state.alias = form.find('#alias');
        form.submit($.proxy(onsubmit, state));
    }
    
    // build the login form
    function init() {
        this.filler = this.fill('Enter Your Alias', 'login');
        return this.filler.then(listen);
    }
    
    states.defineState('login', { init: init });
    
})(munitia.game, munitia.states, munitia.session);