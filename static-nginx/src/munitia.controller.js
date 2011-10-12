(function(global, namespace, doc, mobile, $){ var 
    
    page = $('#game'),
    root = $(doc),    
    body = $(doc.body),
    utils = namespace.utils,
    
    module = namespace.extend('controller', {
        
        _hooks: {},
        
        addChangeHook: function(state, handler, async) { 
            var hooks = module.getChangeHooks(state);
            if (!async) { handler = utils.makeDeferred(handler); }
            hooks.push(handler);
        },
        
        getChangeHooks: function(state) {
            return utils.ensureArray(module._hooks, state);
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
            var hooks = module.getChangeHooks(state);
            if (hooks.length) {
                $.when.apply($, $.map(hooks, function(hook){
                    return hook(page, data);
                })).then(function(){ page.page(); });
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
        
    });
    
    root.bind('pagebeforechange', module.handleStateChange);
    
})(window, munitia, document, jQuery.mobile, jQuery);