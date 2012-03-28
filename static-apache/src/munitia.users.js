(function(global, namespace){
    
    "use strict";
    
    function User(options) {
        this.options = options;
    }
    
    User.prototype = {
        
        getId: function() {
            return this.options.id;
        },

        getAlias: function() {
            return this.options.alias;
        }
        
    };
    
    var module = namespace.users = {
        
        User: User,
        
        generateSessionId: function(alias) {
            return Math.floor(Math.random()*alias.length) + 1 + (new Date()).getTime();
        },
        
        fromAlias: function(alias) {
            return alias ? new User({
                alias: alias,
                id: module.generateSessionId(alias)
            }) : null;
        }
        
    };
    
})(window, munitia);