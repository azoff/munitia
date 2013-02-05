// locates the user's position and shows it on a map
(function(states, session){

	"use strict";

	var state;

	function init() {
		return state.setContent('geo').then(function(geo){
			state.geo = geo;
			state.map = geo.children('img');
		});
	}

	function mapUrl(position) {
		var coords = position.coords,
		url = '//maps.googleapis.com/maps/api/staticmap?';
		url += 'sensor=true&zoom=13&markers=color:black%7Csize%7Ctiny|';
		url += coords.latitude + ',' + coords.longitude;
		url += '&size=' + state.page.width() + 'x320&center=';
		url += coords.latitude + ',' + coords.longitude;
		return url;
	}

	function renderMap(position){
		state.setHeader('Device Found!');
		state.geo.addClass('in');
		state.map.attr('src', mapUrl(position));
	}

	// gets users position and shows it on the map
	function update() {
		state.setHeader('Locating Your Device');
		state.geo.removeClass('in');
		return session.getPosition().then(renderMap);
	}

	state = states.defineState('geolocate', {
		init: init, update: update
	});

})(munitia.states, munitia.session);