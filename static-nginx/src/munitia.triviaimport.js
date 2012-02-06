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

        getPlaceDetailsHtml: function(place) {
            var mapImgSrc = 'http://maps.googleapis.com/maps/api/staticmap?center=' + place.geometry.location.lat + ',' + place.geometry.location.lng + 
            '&zoom=16&size=300x150&sensor=false&markers=color:orange%7Clabel:Q%7C' + place.geometry.location.lat + ',' + place.geometry.location.lng;
            var types = '';
            for (var i in place.types) {
                types += place.types[i] + ' ';
            }
            return types + '<br><img src="' + mapImgSrc + '">';
        },

        showPlaces: function(places) {
            $('#google_places_content').empty();
            var html = '<label for="place_selection">Choose Google Place</label><select id="place_selection" name="place_selection" data-native-menu="false" data-overlay-theme="e">\n'
            var firstPlaceHtml = '';
            for (var i = 0, place; place = places[i]; i++) {
                html += '<option value="' + encodeURIComponent(JSON.stringify(place)) + '">' + place.name + '</option>\n';
                if (i == 0) {
                    firstPlaceHtml = module.getPlaceDetailsHtml(place);
                    $('#correct').val(place.name);
                    $('#lt').val(place.geometry.location.lat);
                    $('#lg').val(place.geometry.location.lng);
                }
            }
            html += '</select><center><div id="place_details">' + firstPlaceHtml + '</div></center>';
            $(html).appendTo('#google_places_content');
            $('#triviaimport').trigger('create');
            /*
            $('#newquestion_form').ajaxForm(function() { 
                    alert('Thank you for your question!'); 
                });
            */
            $('#place_selection').change(function() {
                    var place = JSON.parse(decodeURIComponent($(this).val()));
                    var placeDetailHtml = module.getPlaceDetailsHtml(place);
                    var placeDetails = $('#place_details');
                    placeDetails.empty();
                    placeDetails.html(placeDetailHtml);
                    // update the form
                    $('#correct').val(place.name);
                    $('#lt').val(place.geometry.location.lat);
                    $('#lg').val(place.geometry.location.lng);
                });
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
                    $('#search_flickr').val(search_val.val());
                    $('#search_google_places').val(search_val.val());
                    $('#search_wikipedia').val(search_val.val());
                    module.searchFlickr(search_val.val());
                    module.searchGooglePlaces(search_val.val());
                    return false;
                });
            $('#search_flickr_submit').click(function() {
                    var search_val = $('#search_flickr');
                    module.searchFlickr(search_val.val());
                    return false;
                });
            $('#search_google_places_submit').click(function() {
                    var search_val = $('#search_google_places');
                    module.searchGooglePlaces(search_val.val());
                    return false;
                });
        },
    };
})(navigator.geolocation, munitia, jQuery);
