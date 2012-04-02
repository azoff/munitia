// shows the applicable lines for the current position
(function(model, api, stops, session, states, mobile, $){
    
    "use strict";
    
    var state;
    
    function selectLine(event) {
        var data = $(event.target).data();
        model.stop = model.stops[data.stop];
        model.line = model.stop.lines[data.line];
        model.stretchId = model.stop.getStretchId(model.line);
        mobile.changePage('round');
    }
    
    function init() { 
        state.setHeader('Select A Line');
        state.content.on('click', 'a', selectLine);
    }
    
    function renderStops(response) {
        if (response && response.data && response.data.length) {
            // filter stops that have lines
            model.stops = stops.fromModels(response.data);
            // add the stops to the page
            state.setContent('stops', model).then(state.renderer.resolve);
        } else {
            state.renderer.reject('Unable to find stops by you.');
        }
    }
    
    // get stops around user's current position
    function loadStops(position) {
        api.get('find_stops_near', {
            lt: position.coords.latitude, 
            lg: position.coords.longitude
        }).then(renderStops).fail(function(){
            state.notify('Unable to connect to the game server.');
            state.renderer.resolve();
        });
    }
    
    function update() { 
        state.renderer = $.Deferred();
        session.getPosition().then(loadStops);
        return state.renderer;
    }
    
    state = states.defineState('lines', {
        init: init, update: update
    });
    
})(munitia.game.model, munitia.api, munitia.stops, munitia.session, munitia.states, jQuery.mobile, jQuery);