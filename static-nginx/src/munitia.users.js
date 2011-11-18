(function(namespace, geo, $){
    
    var module = namespace.users = {
        User: User  
    };
    
    function User(model) {
        this._model = model;
    }
    
    User.prototype = {
        
        _geo: {},
        
        _model: {},
        
        getUserId: function() {
            return this._model.userID;
        },
        
        setGeo: function(geo) {
            return this._geo = geo;
        },
        
        getCoords: function() {
            return this._geo.coords;
        }
        
    };
    
})(munitia, jQuery);