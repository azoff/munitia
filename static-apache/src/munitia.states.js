(function(global, namespace){
    
    "use strict";
    
    function State(options) {
        options = options || {};
        this.init = options.init ? options.init : module.noop;
        this.update = options.update ? options.update : module.noop;
    }
    
    State.prototype = {
        
        execute: function(page) {
            var executor = $.Deferred(), state = this;
            if (!state.ready) { 
                // lazy init, only init once
                state.ready = state.init(page);
            }            
            state.ready.then(function(){
                state.update(page).then(executor.resolve);
            });
            return executor.promise();
        }
        
    }
    
    var module = namespace.states = {
        
        State: State,
        
        noop: function() {
            return $.Deferred().resolve();
        }
        
    };
    
})(window, munitia);