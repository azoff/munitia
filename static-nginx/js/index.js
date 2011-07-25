/*global JSON, jQuery, munitia */
jQuery(function(){
    
    var $ = jQuery,
    log = munitia.utils.log,
    returningUser = $("#returninguser"), 
    newUser = $("#newuser"), 
    login = $("#login");
    
    function onGetUser(foundUser) {
        if (foundUser) {
            log('Existing user found:', foundUser);
            returningUser.removeClass('hidden');
            newUser.addClass('hidden');
        } else {
            log('No existing user found!');
            returningUser.addClass('hidden');
            newUser.removeClass('hidden');
        }
    }
    
    function onFacebookSession(event, session) {           
        if (session) {
            log("Facebook session detected:", session);
            munitia.users.find({ facebook_id: session.uid }, onGetUser);
        } else {
            log("No Facebook session detected!");
            returningUser.addClass('hidden');
            newUser.addClass('hidden');
            login.removeClass('hidden');
        }
    }
    
    log("Checking facebook session...");
    munitia.facebook.checkSession(onFacebookSession);
    
});