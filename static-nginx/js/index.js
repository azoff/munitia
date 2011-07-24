jQuery(function(){
    
    var
    returningUser = $("#returninguser"), 
    newUser = $("#newuser"), 
    login = $("#login");
    
    function onGetUser(foundUser) {
        if (foundUser) {
            returningUser.removeClass('hidden');
            newUser.addClass('hidden');
        } else {
            returningUser.addClass('hidden');
            newUser.removeClass('hidden');
        }
    }
    
    function onFacebookSession(event, session) {   
        if (session) {
            munitia.users.find({ facebook_id: session.uid }, onGetUser);
        } else {
            oldUser.addClass('hidden');
            newUser.addClass('hidden');
            login.removeClass('hidden');
        }
    }
    
    munitia.facebook.checkSession(onFacebookSession);
    
});