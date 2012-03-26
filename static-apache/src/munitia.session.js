(function(global, geo, namespace, users, storage, json, $){
    
    "use strict";
    
    var 
    USER_STORAGE_KEY = 'munitia.user',
    TRACKING_INTERVAL = 1000,
    
    _user = null, _position = null,
    
    module = namespace.session = {
        
        hasUser: function() {
            module.loadUser();
            return _user !== null;
        },
        
        getUser: function() {   
            module.loadUser();         
            return _user;
        },
        
        setUser: function(user) {
            _user = user;
            module.saveUser();
        },
        
        loadUser: function() {
            if (!_user) {
                var record = storage.getItem(USER_STORAGE_KEY);
                if (record) {
                    _user = new users.User(json.parse(record));
                }
            }
        },
        
        saveUser: function() {
            if (_user) {
                storage.setItem(USER_STORAGE_KEY, json.stringify(_user.options));
            }
        },
        
        getPosition: function() {
            if (!_position) {
                _position = $.Deferred();
                geo.getCurrentPosition(function(position){
                    _position.resolve(position);
                });
            }
            return _position.promise();
        },
        
        // async loop to keep track of position in a performant manner
        // use getPosition to actually use the value
        trackPosition: function() {
            _position = null;
            module.getPosition().then(function(){
                global.setTimeout(module.trackPosition, TRACKING_INTERVAL);
            });
        }
        
    };
    
})(window, navigator.geolocation, munitia, munitia.users, localStorage, JSON, jQuery);