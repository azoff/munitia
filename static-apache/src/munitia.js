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
            if (munitia.conf.logging && console) {
                console.log.apply(console, args);
            }
        },
        
        error: function() {
            var args = slice.call(arguments);
            if (munitia.conf.logging && console) {
                console.error.apply(console, args);
            }
        }
        
    };
    
    // jqmData is acting weird, eventually need to take this out...
    $.fn.jqmData = $.fn.data;
    
})(window, window.console, Array.prototype.slice, yepnope, jQuery);