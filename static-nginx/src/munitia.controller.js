(function(global, decode, namespace, doc, mobile, $){ var 
    frame = $(global),
    root = $(doc),    
    body = $(doc.body),
    utils = namespace.utils,
    templateCache = {},
    
    wrapTemplate = function(html) {
        var script = document.createElement('script');
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
        var url = data.toPage, parts, hooks;
        if ($.type(url) === 'string') {                
            url = mobile.path.parseUrl(url);                
            parts = getUrlParts(url);
            data.options.dataUrl = url.href + parts.data.key;
            if (parts.data.state) {
                hooks = module.getStateHooks(parts.data.key, parts.data.state);
            } 
            if (hooks && hooks.length) {
                $.when.apply($, $.map(hooks, function(hook){
                    return hook(parts.page, parts.data);
                })).then(function(){ 
                    parts.page.page(); 
                });
            } else { 
                parts.page.page(); 
            }
            mobile.changePage(parts.page, data);
            frame.trigger('resize');
            event.preventDefault();
        }
    },
    
    getUrlParts = function(url) { var 
        parts = url.hash.split('?'), key = parts[0],
        page = $(key), data = { key: key };
        if (parts.length > 1) {
            parts = parts[1].split('&');
            $.each(parts, function(i, parts){
                parts = parts.split('=');
                data[decode(parts[0])] = decode(parts[1]);
            });
        }
        return { page: page, data: data };
    },
    
    module = namespace.extend('controller', {
        
        addStateHook: function(page, state, hook, async) { 
            var hooks = module.getStateHooks(page, state);
            if (!async) { hook = utils.makeDeferred(hook); }
            hooks.push(hook);
        },
        
        getStateHooks: function(page, state, hooks) {
            page = $(page); var 
            pageHooks = page.data('hooks') || {},
            hooks = utils.ensureArray(pageHooks, state);
            page.data('hooks', pageHooks);
            return hooks;
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