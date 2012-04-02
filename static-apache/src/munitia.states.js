(function(global, namespace, controller, $){
    
    "use strict";
    
    var instances = {},
    
    module = namespace.states = {
        
        noop: function() {
            return $.Deferred().resolve();
        },
        
        getState: function(name) {
            if (name in instances) {
                return instances[name];
            } else {
                var url = '/states/' + name + '.js';
                return (instances[name] = new module.State(url));
            }
        },
        
        defineState: function(name, definition) {
            if (name in instances) {
                return instances[name].define(definition);
            } else {
                return null;
            }
        }
        
    };

    module.State = function(url) {
        this.definition = $.Deferred();
        this.notifier = $.proxy(this, 'notify');
        $.ajax({ 
            url: url, 
            cache: true, 
            type: 'GET', 
            dataType: 'script' 
        });
    };
    
    module.State.prototype = {
        
        define: function(definition) {
            var state = this;
            definition = definition || {};
            definition.init = definition.init ? definition.init : module.noop;
            definition.update = definition.update ? definition.update : module.noop;
            global.setTimeout(function(){
                state.definition.resolve(definition);
            }, 1);
            return this;
        },

        setHeader: function(html) {
            this.header.children('h1').html(html);
        },
        
        setContent: function(template, model) {
            var state = this;
            return controller.render(template, model).then(function(html){
                state.content.empty().append(html);
                state.page.trigger('create');
            });
        },
        
        notify: function(msg) {
            var state = this;
            controller.render('notif', { msg: msg }).then(function(notif){
                notif.insertAfter(state.header);
                notif.find('a').click($.proxy(notif, 'remove'));
                state.page.trigger('create');
                notif.addClass('fade in');
                controller.scroll();
            });
        },
        
        ready: function(page) {
            var state = this;
            if (!state._ready) {
                state._ready = $.Deferred();
                state.page = page;
                state.header = page.find(':jqmData(role=header)');
                state.content = page.find(':jqmData(role=content)');
                state.footer = page.find(':jqmData(role=footer)');                
                state.definition.then(function(definition){
                    var init = definition.init.call(state);
                    if (init) {
                        if (init.fail) {                        
                            init.fail(state.notifier);
                        } if (init.always) { 
                            init.always(state._ready.resolve); 
                        }
                    } else {
                        state._ready.resolve();
                    }
                });
            }
            return state._ready.promise();
        },
        
        execute: function(page) {
            var executor = $.Deferred(), state = this;             
            state.ready(page).then(function(){
                state.definition.then(function(definition){
                    var update = definition.update.call(state);
                    if (update) {
                        if (update.fail) {                        
                            update.fail(state.notifier);
                        } if (update.always) { 
                            update.always(executor.resolve); 
                        }
                    } else { 
                        executor.resolve(); 
                    }
                });
            });
            return executor.promise();
        }
        
    };
    
})(window, munitia, munitia.controller, jQuery);