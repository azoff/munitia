/*global JSON, jQuery, munitia */
jQuery(function(){
    
    var $ = jQuery,
    returningUser = $("#returning-user"), 
    newUser = $("#new-user"), 
    login = $("#login"),
    stage = $("#stage");
    
    function onGetUser(user) {
        if (user) {
            returningUser.removeClass('hidden');
            newUser.addClass('hidden');
            munitia.game.start(user, stage);            
        } else {
            returningUser.addClass('hidden');
            newUser.removeClass('hidden');
            munitia.game.end();  
        }
    }
    
    function onFacebookSession(event, session) {           
        returningUser.addClass('hidden');
        newUser.addClass('hidden');
        if (session) {
            login.addClass('hidden');
            munitia.users.find({ facebook_id: session.uid }, onGetUser);
        } else {
            login.removeClass('hidden');
        }
    }
    
    munitia.events.bind('facebook:session', onFacebookSession);
    
    munitia.facebook.checkSession();
    
});