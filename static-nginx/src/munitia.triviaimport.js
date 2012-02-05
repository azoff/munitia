/**
 * Trivia Importer
 *
 */
var req;
var placeReq;
var searchTerm = '';

(function(geo, namespace, $){ 
    var 
    api = namespace.api,
    utils = namespace.utils,   
    session = namespace.session,
    controller = namespace.controller,
    
    module = namespace.triviaimport = {

        searchFlickr: function (searchTerm) {
            req = new XMLHttpRequest();
            var coords = munitia.session.user.getCoords();
            var args = { lt: coords.latitude, lg: coords.longitude, search_term: searchTerm, radius: 5 };
            api.get('flickr_search', args).success(function(response){
                    if (response.hasOwnProperty('data') && response.data.photos.photo.length > 0) {
                        module.showPhotos(response.data.photos.photo); 
                    } else {
                        // TODO(tracy): alert user
                        console.log('no flickr photos found');
                    }
            });
        },

        // See: http://www.flickr.com/services/api/misc.urls.html
        constructImageURL: function(photo) {
            return "http://farm" + photo.farm +
            ".static.flickr.com/" + photo.server +
            "/" + photo.id +
            "_" + photo.secret +
            "_t.jpg";
        },

        constructMediumImageURL: function(photo) {
            return "http://farm" + photo.farm +
            ".static.flickr.com/" + photo.server +
            "/" + photo.id +
            "_" + photo.secret +
            "_m.jpg";
        },

        constructLink: function(photo) {
            return "http://flickr.com/photos/" + photo.owner + "/" + 
            photo.id;
        },

        showPhotos: function(photos) {
            $(".flickrphoto").remove();
            var html = '<div data-role="fieldcontain" class="flickrphoto"><fieldset data-role="controlgroup"><legend>Choose a photo:</legend>';
            for (var i = 0, photo; photo = photos[i]; i++) {
                img_src = module.constructMediumImageURL(photo);
                html += '<div data-role="fieldcontainer">';
                html += '<input type="radio" name="img_url" id="radio-choice-' + i +  '" value="' + img_src + '">';
                html += '<label for="radio-choice-' + i + '"/>';
                var link = module.constructMediumImageURL(photo);
                var img_tag = '<img src="' + img_src + '" border="0">';
                html += img_tag;
                html += '</label>';
                html += '</div>';
            }
            html += '</fieldset></div>';
            $('#flickr_photos_content').empty();
            $(html).appendTo('#flickr_photos_content');
            $('#triviaimport').trigger("create");
        },

        searchGooglePlaces: function(searchTerm) {
            placeReq = new XMLHttpRequest();
            var coords = munitia.session.user.getCoords();
            var args = { lt: coords.latitude, lg: coords.longitude, search_term: searchTerm, radius: 5000 };
            api.get('google_places_search', args).success(function(response){
                    if (response.hasOwnProperty('data') && response.data.results.length > 0) {
                        module.showPlaces(response.data.results); 
                    } else {
                        // TODO(tracy): alert user
                        console.log('no google places found');
                    }
            });
        },

        showPlaces: function(places) {
            $(".place").remove();
            for (var i = 0, place; place = places[i]; i++) {
                var placeStr = "<input type='text' name='question' value='What building is this?'/><br/>correct<br/><input type='text' name='correct' value='" + place.name + "'/><br/>wrong<br/><input type='text' name='wrong0'/><br/>wrong<br/><input type='text' name='wrong1'/><br/>wrong<br/><input type='text' name='wrong2'/><br/>latitude<br/><input type='text' name='lt' value='" + place.geometry.location.lat + "'/><br/>longitude<br/><input type='text' name='lg' value='" + place.geometry.location.lng + "'/><br/><input type='submit' name='submit' value='Add question'/>";
                $('#google_places_content').empty();
                $('<div class="place">' + placeStr + '</div>').appendTo('#google_places_content');
                $('#newquestion_form').ajaxForm(function() { 
			alert("Thank you for your question!"); 
                    }); 
            }
            $('#triviaimport').trigger("create");
        },

        calledOnFieldChange: function(formElement) {
            searchTerm = formElement.value;
        },

        handleSearch: function() {
            module.searchFlickr(searchTerm);
            return false;
        },

        enableChromeExtensionLoginForm: function(controller) {
            $('#login_form').submit(function() {
                    var options = {
                        dataType: 'json',
                        success: function(response, statusText, xhr, form)  { 
                            alert(JSON.stringify(response));
                            console.log(statusText);
                            controller.changePage("#triviaimport");
                        }
                    };
                    $(this).ajaxSubmit(options);
                    return false;
                });
        },

        initializeTriviaImport: function() {
            console.error('Initializing Trivia Import');
            $('#searchform').submit(function() {
                    var search_val = $("#searchval");
                    module.searchFlickr(search_val.val());
                    module.searchGooglePlaces(search_val.val());
                    return false;
                });
        },

    };
})(navigator.geolocation, munitia, jQuery);
