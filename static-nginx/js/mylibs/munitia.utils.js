(function(namespace, $, logger){
    
    var module = namespace.utils = {
    
        log: function() {
            if (logger && namespace.LOGGING_ENABLED) {
                var args = $.makeArray(arguments);
                logger.log.apply(logger, args);
            }
        },
        
        error: function() {
            if (logger && namespace.LOGGING_ENABLED) {
                var args = $.makeArray(arguments);
                logger.error.apply(logger, args);
            }
        }
        
    };
    
})(munitia, jQuery, window.console);