// locates the user's position and shows it on a map
(function(states){
    
    "use strict";
    
    var state;
    
    function init() {
        return this.fill('', 'geo').then(function(state, geo){
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
        src += coords.latitude + ',' + coords.longitude;
    }
    
    function renderMap(position){
        state.fill('Device Found!');        
        state.geo.addClass('in');
        state.map.attr('src', mapUrl(position));
    }
    
    // gets users position and shows it on the map
    function update() {                 
        state.fill('Locating Your Device');
        state.geo.removeClass('in');
        return session.getPosition().then(renderMap);
    }
    
    state = states.defineState('geolocate', {
        init: init, update: update
    });
    
})(munitia.states);