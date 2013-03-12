// allows the user to add a question
(function(states, session, api, controller, $){

	"use strict";

	var state;

	function renderResults(results, response) {

		if (!response) {
			return state.notify('Error communicating with the server');
		}

		if (response.error) {
			return state.notify(response.error);
		}

		if (!response.data) {
			return state.notify('No response returned from server');
		}

		controller.render(results.attr('id'), response.data).then(function(html){
			results.append(html).addClass('in');
			state.page.trigger('create');
		});

		return true;

	}

	function enableSearch(input, spinner) {
		input.textinput('enable');
		if (spinner) { controller.hideSpinner(); }
	}

	function disableSearch(input, spinner) {
		input.textinput('disable');
		if (spinner) { controller.showSpinner(); }
	}

	function search(event) {

		var input   = $(event.target);
		var results = input.parent().next('.search-results');
		var query   = $.trim(input.val());

		if (query === input.data('last')) { return; }
		else { input.data('last', query); }

		if (input.data('timeout')) { clearTimeout(input.data('timeout')); }

		if (query.length > 0) {
			input.data('timeout', setTimeout(function(){
				results.removeClass('in').empty();
				disableSearch(input, true);
				session.getPosition().then(function(position){
					api.get(input.attr('id'), {
						lt: position.coords.latitude,
						lg: position.coords.longitude,
						q: query
					}).then(function(response){
						renderResults(results, response);
					}).always(function(){
						enableSearch(input, true);
					});
				});
			}, 2000));
		} else {
			results.removeClass('in').empty();
		}

	}

	function resetForm() {
		state.searchResults.removeClass('in').empty();
		state.form.get(0).reset();
	}

	function checkSubmission(response) {
		if (!response || response.error) {
			var error = response ? response.error : 'Unable to connect to server.';
			state.notify('Unable to add question! ' + error);
		} else {
			state.notify('Question Added!');
			resetForm();
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
				.then(checkSubmission)
				.always(controller.hideSpinner);
		});
		return false;
	}

	function toggleRadios(event) {
		var input = $(event.currentTarget);
		if (input.prop('checked')) {
			input.parent().siblings().slideUp();
		} else {
			input.parent().siblings().slideDown();
		}
	}

	function checkRadios(event) {
		var input = $(event.currentTarget).children('input');
		input.prop('checked', !input.prop('checked'))
			.trigger('change')
			.checkboxradio('refresh');
		return false;
	}

	function setup(form) {
		state.form           = form.submit(createQuestion);
		state.searchResults  = form.find('.search-results')
									.on('change', '[type=radio]', toggleRadios)
									.on('click',  '.ui-radio', checkRadios);
		form.find('.search-input').on('change keyup', search);

	}

	function init() {
		state.setHeader('Submit A Question');
		return state.setContent('contribute').then(setup);
	}

	state = states.defineState('contribute', {
		init: init, update: resetForm
	});

})(munitia.states, munitia.session, munitia.api, munitia.controller, jQuery);