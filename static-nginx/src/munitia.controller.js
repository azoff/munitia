(function(global, namespace, doc, mobile, $){ var 
    
    page = $('#main-page'),
    frame = $(global),    
    body = $(doc.body),
    
    module = namespace.controller = {
        
        _preHooks: {},
        
        _postHooks: {},
        
        setPreChangeHook: function(state, handler) {
            module._preHooks[state] = handler;
        },
            
        setPostChangeHook: function(state, handler) {
            module._postHooks[state] = handler;
        },
        
        getPreChangeHook: function(state) {
            return fetch(module._preHooks, state, $.noop);
        },
        
        getPostChangeHook: function(state) {
            return fetch(module._postHooks, state, $.noop);
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
            module.getPreChangeHook(state).call(page, data);
            body.attr('class', state);
            page.page(); 
            frame.trigger('resize');
            module.getPostChangeHook(state).call(page, data);
            module.hideLoader();
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