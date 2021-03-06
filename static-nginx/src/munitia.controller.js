(function(global, decode, namespace, doc, mobile, $){ var 
    frame = $(global),
    root = $(doc),    
    body = $(doc.body),
    defaultPage = null,
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

    hookExecutor = function(page, args) {
        return function(hook){
            return hook(page, args);
        };
    },
    beforePageChange = function(event, data) {
        var url = data.toPage;
        if ($.type(url) === 'string') {
            url = mobile.path.parseUrl(url);
            getPageFromUrl(url, function(page, selector, args) {
                utils.log(selector, args);
                var hooks = module.getStateHooks(selector, args.state),
                refresh = function(){ 
                    page.find('.nav[href=' + selector + ']').addClass('ui-btn-active');
                    data.options.dataUrl = (url.hrefNoHash || '/') + selector;                
                    mobile.changePage(page.page(), data.options);
                    setTimeout($.proxy(frame, 'resize'), 500);
                };
                if (hooks.length) {
                    hooks = $.map(hooks, hookExecutor(page, args));
                    $.when.apply($, hooks).then(refresh);
                } else { 
                    refresh();
                }
            });
            event.preventDefault();
        }
    },
    getPageFromUrl = function(url, callback) { var 
        parts = url.hash.split('?'), 
        selector = parts[0] || '#lines',
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
            callback(page.appendTo(body), selector, args);
        };
        if (!page.size()) {
            // NOTE(tracy): What is this doing?  If there is no page, i.e. jQuery couldn't find
            // #whatever, then call module.render('page', id="whatever", processPage) and then the processPage callback will be
            // called at some point in the future in order to eventually call the passed in callback.
            // Does this force all unknown #whatever's to just end up showing page.tmpl?  Shouldn't there be some kind of
            // error / 404 response?
            module.render('page', { id: id }, processPage);
        } else {
            processPage(page);
        }
    },
    
    module = namespace.controller = {
        
        addStateHook: function(page, state, hook) {
            if ($.isFunction(state)) {
                hook = state; state = 'init';
            }
            var states = $.isArray(state) ? state : [state]; 
            $.each(states, function(hooks, state){
                module.getStateHooks(page, state).push(hook);
            });
        },
        
        getStateHooks: function(page, state) {
            var hooks = utils.ensureObject(pageHooks, page);
            return utils.ensureArray(hooks, state);
        },
        
        showLoader: function(msg) {
            mobile.loadingMessage = msg || 'loading';
            mobile.showPageLoadingMsg();
        },
        
        hideLoader: function() {
            mobile.hidePageLoadingMsg();
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
        
    };
    
    root.bind('pagebeforechange', beforePageChange);
    
})(window, decodeURIComponent, munitia, document, jQuery.mobile, jQuery);