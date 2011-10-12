(function(global, logger, $){ var 
    
     module = global.munitia = {
    
        utils: {
            
            fetch: function(obj, prop, defalt) {
                return obj.hasOwnProperty(prop) ? obj[prop] : (defalt || '');
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
    global.fetch = module.utils.fetch;
    
})(window, window.console, jQuery);