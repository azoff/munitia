(function(namespace, geo, $){
    
    var module = namespace.users = {
        
        User: User
        
    };
    
    function User(model) {
        this._model = model;
    }
    
    User.prototype = {
        
        getUserId: function() {
            return this._model.userID;
        }
        
    };
    
})(munitia, jQuery);