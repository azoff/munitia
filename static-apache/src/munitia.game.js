(function(global, namespace, mobile, $){

	"use strict";

	var session = namespace.session;
	var states = namespace.states;

	var module = namespace.game = {

		model: {},

		// picks the correct start state
		start: function() {
			var hash = module.model.lastHash || $.trim(global.location.hash);
			// if session is found...
			if (session.hasUser()) {
				// let the user choose his start state, unless
				// that start state is empty or the login state
				if (hash.length === 0 || /login$/.test(hash)) {
					hash = 'geolocate';
				}
				mobile.changePage(hash);

			// always force login if no session is found
			} else {
				module.model.lastHash = hash;
				mobile.changePage('login');
			}
		},

		// handles state change processing
		changeState: function(state, page) {
			function transition() {
				module.lastState = states.getState(state);
				return module.lastState.execute(page);
			}
			if (module.lastState) {
				return module.lastState.leave().then(transition);
			} else {
				return transition();
			}
		}

	};

})(window, munitia, jQuery.mobile, jQuery);