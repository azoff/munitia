/*global yepnope*/
(function(global, console, slice, loader, $){
    
    "use strict";
    
    var module = global.munitia = {
    
        config: function(domain) {
            var job = $.Deferred();
            yepnope({
                load: '/conf/'+domain+'.js',
                complete: job.resolve
            });
            return job.promise();
        },
        
        settings: {
            apiRoot: ''
        },
        
        log: function() {
            var args = slice.call(arguments);
            if (munitia.config.logging && console) {
                console.log.apply(console, args);
            }
        },
        
        error: function() {
            var args = slice.call(arguments);
            if (munitia.config.logging && console) {
                console.error.apply(console, args);
            }
        }
        
    };
    
    // jqmData is acting weird, this is a hack to override its
    // behavior to the much more predictable $.fn.data. No idea
    // how much of a consequence this will have, but it - at the
    // very least - allows the app to run. This only started 
    // failing recently, so it might be user error.
    $.fn.jqmData = $.fn.data;
    
})(window, window.console, Array.prototype.slice, yepnope, jQuery);