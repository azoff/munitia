(function(global, namespace){
    
    "use strict";
    
    function State(options) {
        options = options || {};
        this.footer = ('footer' in options) ? options.footer : true;
        this.init = options.init ? options.init : module.noop;
        this.update = options.update ? options.update : module.noop;
    }
    
    State.prototype = {
        
        execute: function(page) {
            var executor = $.Deferred(), state = this;
            if (!this.footer) {
                page.find(':jqmData(role=footer)').remove();
            }
            if (!state.ready) { 
                // lazy init, only init once
                state.ready = state.init(page);
                if (!state.ready.then) {
                    state.ready = module.noop();
                }
            }            
            state.ready.then(function(){
                var update = state.update(page);
                if (!update.then) {
                    update = module.noop();
                }
                update.then(executor.resolve);
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