(function(namespace, geo, $){
    
    var module = namespace.users = {
    
        User: User,
    
        find: function(criteria, callback) {
            namespace.api.get('user', criteria).success(function(model){
                callback.call(null, new User(model));
            }).error(function(){
                callback.call(null);
            });
        }
        
    };
    
    function User(model) {
        this._model = model;
    }
    
    User.prototype = {
        
        getUserId: function() {
            return this._model.userId;
        },
        
        geolocate: function(callback) {
            geo.getCurrentPosition(callback);
        }
        
    };
    
})(munitia, navigator.geolocation, jQuery);