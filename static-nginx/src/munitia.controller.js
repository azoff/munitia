(function(global, namespace, doc, mobile, $){ var 
    
    page = $('#game'),
    frame = $(global),    
    body = $(doc.body),
    
    module = namespace.controller = {
        
        _hooks: {},
        
        setChangeHook: function(state, handler) {
            module._hooks[state] = handler;
        },
        
        getChangeHook: function(state) {
            return fetch(module._hooks, state, null);
        },
        
        changeState: function(state, options) {                       
            options = $.extend({ state: state }, options || {});
            mobile.changePage('#state', options);
        },
        
        showLoader: function(msg) {
            mobile.loadingMessage = msg || 'Loading';
            mobile.showPageLoadingMsg()
        },
        
        hideLoader: function() {
            mobile.hidePageLoadingMsg()
        },
        
        executeStateChange: function(state, data) {
            var hook = module.getChangeHook(state);
            if (hook) {
                hook(page, data);
                page.page();
            } else {
                body.attr('class', state);
                frame.trigger('resize');                
            }            
        },
        
        handleStateChange: function(event, data) { var 
            url = data.toPage, options = data.options,
            state = options.state, hook, hash;
            if ($.type(url) === 'string') {                
                if (/#state/.test(url)) {
                    if (!state) {
                        hash = mobile.path.parseUrl(url).hash;
                        state = hash.split('name=').pop();
                        options.state = state;
                        options.dataUrl = url.href;
                    }
                    module.executeStateChange(state, data);
                    event.preventDefault();
                }
            }
        }
        
    };
    
    $(doc).bind('pagebeforechange', module.handleStateChange);
    
})(window, munitia, document, jQuery.mobile, jQuery);