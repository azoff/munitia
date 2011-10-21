(function(global, decode, namespace, doc, mobile, $){ var 
    frame = $(global),
    root = $(doc),    
    body = $(doc.body),
    utils = namespace.utils,
    templateCache = {},
    pageHooks = {},
    
    wrapTemplate = function(html) {
        var script = doc.createElement('script');
        script.type = 'text/x-jquery-tmpl'
        script.innerHTML = html;
        return $(script);
    },
    
    loadTemplate = function(view, callback) {
        var path;
        if (view in templateCache) {
            callback(templateCache[view]);
        } else {
            path = ['/templates/', view, '.tmpl'].join('');
            $.ajax({ url: path, dataType: 'html'}).success(function(tmpl){
                templateCache[view] = wrapTemplate(tmpl);
            }).error(function(xhr, status, error){
                templateCache[view] = null;
            }).complete(function(){
                callback(templateCache[view]);
            });
        }
    },
    
    beforePageChange = function(event, data) {
        var url = data.toPage;
        if ($.type(url) === 'string') {                                    
            url = mobile.path.parseUrl(url);            
            getPageFromUrl(url, function(page, selector, args) {
                var hooks = module.getStateHooks(selector, args.state);                
                if (hooks.length) {
                    $.when($.map(hooks, function(hook){
                        return hook(page, args);
                    })).then(function(){ 
                        page.page(); 
                    });
                } else { 
                    page.page(); 
                }
                data.options.dataUrl = '/' + selector;
                utils.log(data.options.dataUrl);
                mobile.changePage(page, data.options);
                frame.trigger('resize');
            });
            event.preventDefault();
        }
    },
    
    getPageFromUrl = function(url, callback) { var 
        parts = url.hash.split('?'), selector = parts[0],
        page = $(selector), args = { state: 'init' },
        id = selector.replace('#',''),
        processPage = function(page) {
            if (parts.length > 1) {
                parts = parts[1].split('&');
                $.each(parts, function(i, parts){
                    parts = parts.split('=');
                    args[decode(parts[0])] = decode(parts[1]);
                });
            }
            callback(page.prependTo(body), selector, args);
        };
        if (!page.size()) {
            module.render('page', { id: id }, processPage);
        } else {
            processPage(page);
        }
    },
    
    module = namespace.extend('controller', {
        
        addStateHook: function(page, state, hook) {
            if ($.isFunction(state)) {
                hook = state; state = 'init';
            }
            hook = utils.makeDeferred(hook);
            module.addAsyncStateHook(page, state, hook);
        },
        
        addAsyncStateHook: function(page, state, hook) {
            if ($.isFunction(state)) {
                hook = state; state = 'init';
            }
            var states = $.isArray(state) ? state : [state]; 
            $.each(states, function(hooks, state){
                module.getStateHooks(page, state).push(hook);
            });
        },
        
        getStateHooks: function(page, state) { var 
            hooks = utils.ensureObject(pageHooks, page),
            stateHooks = utils.ensureArray(hooks, state);
            return stateHooks;
        },
        
        showLoader: function(msg) {
            mobile.loadingMessage = msg || 'loading';
            mobile.showPageLoadingMsg()
        },
        
        hideLoader: function() {
            mobile.hidePageLoadingMsg()
        },
        
        changePage: function(page, data, options) { var 
            params = data ? $.param(data) : {},
            href = [page, '?', params].join('');
            mobile.changePage(href, options);
        },
        
        render: function(view, model, callback) { 
            loadTemplate(view, function(view) {                
                if (view) { callback(view.tmpl(model)); } 
                else { callback(null); }
            });
        }
        
    });
    
    root.bind('pagebeforechange', beforePageChange);
    
})(window, decodeURIComponent, munitia, document, jQuery.mobile, jQuery);