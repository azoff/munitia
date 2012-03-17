(function(global, doc, namespace, mobile, $){
    
    "use strict";
    
    var templates = {}, pages = {},
    
    module = namespace.controller = {
        
        showSpinner: function() {
            mobile.showPageLoadingMsg();
        },
        
        hideSpinner: function() {
            mobile.hidePageLoadingMsg();
        },
        
        fill: function(page, options) {
            if (options.header) {
                page.find(':jqmData(role=header) h1').html(options.header);
            }
            if (options.content) {
                options.content.then(function(content){
                    page.find(':jqmData(role=content)').empty().append(content);
                    page.trigger('create');
                });
            }  
            return $.when.apply($, [page, options.content]);
        },
        
        page: function(id) {
            if (!(id in pages)) {
                pages[id] = module.render('page', { id: id }).then(function(page){
                    page.appendTo(mobile.pageContainer).page();
                });
            }
            return pages[id];
        },
        
        template: function(basename) {
            if (!(basename in templates)) {
                templates[basename] = $.ajax({ 
                    url: '/templates/'+basename+'.tmpl', 
                    dataType: 'html'
                });
            }
            return templates[basename];
        },
        
        render: function(view, model) { 
            var renderer = $.Deferred();
            module.template(view).then(function(view){
                var node = $.tmpl(view, model);
                renderer.resolve(node);
            });
            return renderer.promise();
        },
        
        changeState: function(state, options) {
            mobile.changePage(state, options);
        },
        
        router: function(state, options) {
            module.showSpinner();
            // load the page
            module.page(state).then(function(page){
                // handle game logic
                namespace.game.states[state](page).then(function(){
                    // show the page (using an object prevents recursion)
                    module.changeState(page, options);
                    module.hideSpinner();
                });
            });
        }
        
    };
    
    $(doc).on('pagebeforechange', function(event, data) {
        if ($.type(data.toPage) === 'string') {
            module.router(data.toPage.split('#').pop(), data.options);
            event.preventDefault();
        }
    });
    
})(window, document, munitia, jQuery.mobile, jQuery);