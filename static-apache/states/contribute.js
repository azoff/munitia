/*
// allows the user to add a question
contribute: {
    anonymous: function() {
        module.start();
    },
    init: function(page) {
        return controller.fill(page, {
            header: 'Submit A Question',
            content: controller.render('contribute')
        }).then(function(page, content){
            var imgresults = page.find('#flickrimgs');
            // load flickr results upon search
            content.find('#flickrsearch').change(function(){
                var value =  $(this).val();
                controller.showSpinner();
                imgresults.removeClass('in').addClass('out').empty();
                session.getPosition().then(function(position){
                    api.get('flickr_search', {
                        lt: position.coords.latitude, 
                        lg: position.coords.longitude,
                        search_term: value, 
                        radius: 5 
                    }).then(function(response){
                        if (response && response.data.photos.total) {
                            controller.render('flickrimgs', response.data.photos).
                                then(function(flickrimgs){
                                imgresults.append(flickrimgs)
                                    .removeClass('out')
                                    .addClass('fade in');
                                page.trigger('create');
                            });
                        } else {
                            controller.notify('No results found for: ' + value);
                        }
                    }).always(function(){
                        controller.hideSpinner();
                    });
                });
            });
            
        });
    },
    update: function(page) {
        page.find('form').get(0).reset();
        page.find('#flickrimgs').empty();
    }
}
*/