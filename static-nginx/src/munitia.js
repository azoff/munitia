(function(global, logger, $){ var 
    
     module = global.munitia = {
    
        main: function(domain) {
            $.getScript('/conf/'+domain+'.js', function(){
                $(munitia.session.start);
            });
        },
    
        extend: function(name, submodule) {
            return module[name] = submodule;
        },
    
        utils: {
            
            makeDeferred: function(fn) {
                return function() { var 
                    args = $.makeArray(arguments),
                    response = fn.apply(null, args); 
                    return $.Deferred().resolve(response);
                };
            },
            
            fetch: function(obj, prop, defalt) {
                return obj.hasOwnProperty(prop) ? obj[prop] : (defalt || '');
            },
            
            ensureArray: function(obj, prop) {
                if (!obj.hasOwnProperty(prop)) {
                    obj[prop] = [];
                } else if(!$.isArray(obj[prop])) {
                    obj[prop] = [obj[prop]];
                }    
                return obj[prop];
            },
            
            ensureObject: function(obj, prop) {
                if (!obj.hasOwnProperty(prop)) {
                    obj[prop] = {};
                }
                return obj[prop];
            },
            
            dir: function() {
                if (logger && module.settings.enableLogging) {
                    var args = $.makeArray(arguments);
                    logger.dir.apply(logger, args);
                }
            },
            
            log: function() {
                if (logger && module.settings.enableLogging) {
                    var args = $.makeArray(arguments);
                    logger.log.apply(logger, args);
                }
            },

            error: function() {
                if (logger && module.settings.enableLogging) {
                    var args = $.makeArray(arguments);
                    logger.error.apply(logger, args);
                }
            }
            
        }
        
    };
    
    global.trace = module.utils.log;
    
})(window, window.console, jQuery);