(function(global, namespace, session, $){
    
    "use strict";
    
    var module = namespace.states = {
        
        noop: function() {
            return $.Deferred().resolve();
        }
        
    };

    module.State = function(options) {
        options = options || {};
        this.anonymous = options.anonymous || false;
        this.footer = ('footer' in options) ? options.footer : true;
        this.init = options.init ? options.init : module.noop;
        this.update = options.update ? options.update : module.noop;
    };
    
    module.State.prototype = {
        
        execute: function(page) {
            var executor = $.Deferred(), state = this;
            if (this.anonymous && !session.hasUser()) {
                this.anonymous();
            }
            if (!this.footer) {
                page.find(':jqmData(role=footer)').remove();
            }
            if (!state.ready) { 
                // lazy init, only init once
                state.ready = state.init(page);
                if (!state.ready || !state.ready.then) {
                    state.ready = module.noop();
                }
            }            
            state.ready.then(function(){
                var update = state.update(page);
                if (!update || !update.then) {
                    update = module.noop();
                }
                update.then(executor.resolve);
            });
            return executor.promise();
        }
        
    };
    
})(window, munitia, munitia.session, jQuery);