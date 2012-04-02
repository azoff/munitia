// allows the user to add a question
(function(states, session, api, controller, $){
    
    "use strict";
    
    var state;
    
    function insertImages(html){
        state.imgResults.append(html).addClass('in');
        state.page.trigger('create');
    }
    
    function renderImages(response) {
        if (response && response.data.photos.total) {
            controller.render('flickrimgs', response.data.photos).then(insertImages);
        } else {
            state.notify('No results found for: ' + state.flickrSearch.val());
        }
    }
    
    function searchFlickr() {
        controller.showSpinner();
        state.imgResults.removeClass('in').empty();
        session.getPosition().then(function(position){
            api.get('flickr_search', {
                lt: position.coords.latitude, 
                lg: position.coords.longitude,
                search_term: state.flickrSearch.val(), 
                radius: 5 
            }).then(renderImages)
            .always(controller.hideSpinner);
        });
    }
    
    function setup(form) {
        state.form = form;
        state.imgResults = form.find('#flickrimgs');
        state.flickrSearch = form.find('#flickrsearch');
        state.flickrSearch.change(searchFlickr);
    }
    
    function init() { 
        state.setHeader('Submit A Question');
        return state.setContent('contribute').then(setup);
    }
    
    function update() { 
        state.form.get(0).reset();
        state.imgResults.empty();
    }
    
    state = states.defineState('contribute', {
        init: init, update: update
    });
    
})(munitia.states, munitia.session, munitia.api, munitia.controller, jQuery);