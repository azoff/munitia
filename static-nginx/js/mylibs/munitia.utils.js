(function(package, $, logger){
    
    var module = package.utils = {
    
        log: function() {
            if (logger && package.LOGGING_ENABLED) {
                var args = $.makeArray(arguments);
                logger.log.apply(logger, args);
            }
        },
        
        error: function() {
            if (logger && package.LOGGING_ENABLED) {
                var args = $.makeArray(arguments);
                logger.error.apply(logger, args);
            }
        }
        
    };
    
})(munitia, jQuery, window.console);