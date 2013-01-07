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

	function clearFlickr() {
		state.imgResults.removeClass('in').empty();
	}

	function searchFlickr() {
		if (state.searching) { clearTimeout(state.searching); }
		state.searching = setTimeout(function(){
			controller.showSpinner();
			clearFlickr();
			session.getPosition().then(function(position){
				api.get('flickr_search', {
					lt: position.coords.latitude,
					lg: position.coords.longitude,
					search_term: state.flickrSearch.val(),
					radius: 5
				}).then(renderImages)
				.always(controller.hideSpinner);
			});
		}, 500);
	}

	function resetForm(response) {
		if (!response || response.error) {
			var error = response ? response.error : 'Unable to connect to server.';
			state.notify('Unable to add question! ' + error);
		} else {
			state.notify('Question Added!');
			clearFlickr();
			state.form.get(0).reset();
		}
	}

	function createQuestion() {
		controller.showSpinner();
		session.getPosition().then(function(position){
			var geo = $.param({
				lt: position.coords.latitude,
				lg: position.coords.longitude
			});
			var data = [state.form.serialize(), geo].join('&');
			api.get('create_question', data)
				.then(resetForm)
				.always(controller.hideSpinner);
		});
		return false;
	}

	function setup(form) {
		state.form = form.submit(createQuestion);
		state.imgResults = form.find('#flickrimgs');
		state.flickrSearch = form.find('#flickrsearch');
		state.flickrSearch.keyup(searchFlickr);
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