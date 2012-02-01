(function(global, logger, $, math){ var
    
     module = global.munitia = {
    
        main: function(domain) {
            $.getScript('/conf/'+domain+'.js', function(){
	            module.settings.remoteDebugger(global.navigator.userAgent);
                $(munitia.session.start);
            });
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

            randomSort: function() {
                return math.round(math.random()) - 0.5;
            },

            // converts the answer map to a random answer array
            // returns the index of the correct answer
            answersToArray: function(answers, map) {
                $.each(map, function(key, value){
                    if (value) { answers.push(value); }
                });
                answers.sort(module.utils.randomSort);
                return answers.indexOf(map.correct);
            },
            
            ensureObject: function(obj, prop) {
                if (!obj.hasOwnProperty(prop)) {
                    obj[prop] = {};
                }
                return obj[prop];
            },
            
            loggingEnabled: function() {
                return logger && (!module.settings || module.settings.enableLogging);
            },
            
            dir: function() {
                if (module.utils.loggingEnabled()) {
                    var args = $.makeArray(arguments);
                    logger.dir.apply(logger, args);
                }
            },
            
            log: function() {
                if (module.utils.loggingEnabled()) {
                    var args = $.makeArray(arguments);
                    logger.log.apply(logger, args);
                }
            },

            error: function() {
                if (module.utils.loggingEnabled()) {
                    var args = $.makeArray(arguments);
                    logger.error.apply(logger, args);
                }
            }
            
        }
        
    };
    
    global.trace = module.utils.log;
    
})(window, window.console, jQuery, Math);