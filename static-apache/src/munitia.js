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
    
})(window, yepnope, jQuery);