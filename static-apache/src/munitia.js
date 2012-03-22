(function(global, loader, $){
    
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
        }
        
    };
    
    // jqmData is acting weird, eventually need to take this out...
    $.fn.jqmData = $.fn.data;
    
})(window, yepnope, jQuery);