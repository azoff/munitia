(function(global, namespace, controller, $){
    
    "use strict";
    
    var instances = {};
    
    module = namespace.states = {
        
        noop: function() {
            return $.Deferred().resolve();
        },
        
        getState: function(name) {
            if (name in instances) {
                return instances[name];
            } else {
                var url = '/src/states/state.' + name + '.js';
                return instances[name] = new module.State(url);
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
        $.ajax({ url: url, cache: true, type: 'script' });
    };
    
    module.State.prototype = {
        
        define: function(definition) {
            definition = definition || {};
            definition.init = definition.init ? definition.init : module.noop;
            definition.update = definition.update ? definition.update : module.noop;
            this.definition.resolve(definition);
            return this;
        },

        fill: function(header, template, model) {
            var state = this, jobs = [state];
            if (header) {
                state.header.children('h1').html(header);
            }
            if (template) {
                job.push(controller.render(template, model).then(function(html){
                    state.content.empty().append(html);
                    state.page.trigger('create');
                }));
            }            
            return $.when.apply($, job);
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
                    if (init.then) { init.then(ready.resolve); }
                    else { ready.resolve(); }
                });
            }
            return state._ready.promise();
        },
        
        execute: function(page) {
            var executor = $.Deferred(), state = this;             
            state.ready().then(function(){
                var update = definition.update.call(state);
                if (update.then) { update.then(executor.resolve); }
                else { executor.resolve(); }
            });
            return executor.promise();
        }
        
    };
    
})(window, munitia, munitia.controller, jQuery);