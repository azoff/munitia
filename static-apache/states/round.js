// Adds the current user to a round, or 
// creates one if the round does not exist
(function(model, session, api, states, $){

	"use strict";

	var state;

	function init() {
		return state.setContent('round').then(function(round){
			state.round = round;
			state.line = round.children('h3');
			state.participants = round.children('h4');
		});
	}

	function processRound(response) {
		if (response.status === 200) {
			// TODO: we should fix this
			if (!model.round.users) {
				findRound(); return;
			}
			var count = model.round.users.length;
			var noun = count === 1 ? ' Participant' : ' Participants';
			state.setHeader('Round Joined!');
			state.line.html(model.line.prettyName());
			state.participants.html(count + noun);
			state.round.addClass('in');
			state.processor.resolve();
		} else {
			state.processor.reject('Unable to add you to round.');
		}
	}

	function joinRound(response) {
		model.round = response.data[0];
		state.args.round_id = model.round._id;
		state.args.user_id = session.getUser().getId();
		api.get('add_to_round', state.args).then(processRound);
	}

	function createRound(response) {
		if (response && response.data && response.data.length) {
			joinRound(response);
		} else {
			api.get('create_round', state.args).success(joinRound);
		}
	}

	function findRound() {
		if (!model.stretchId) {
			$.mobile.changePage('geolocate');
			return null;
		}
		state.args = { stretch_id: model.stretchId };
		api.get('find_round', state.args).then(createRound);
		return state.processor.promise();
	}

	function update() {
		state.round.removeClass('in');
		state.setHeader('Joining Round...');
		state.processor = $.Deferred();
		return findRound();
	}

	state = states.defineState('round', {
		init: init, update: update
	});

})(munitia.game.model, munitia.session, munitia.api, munitia.states, jQuery);