(function(win, nav, $, math){
    var geolocation = nav.geolocation = {};
    function getCurrentPosition(callback) {
        $.getScript('//www.google.com/jsapi?' + math.rand(), function() {
            callback({
                coords: win.google.loader.ClientLocation
            }); win.google = null;
        });
    }
    function watchPosition(callback) {
        return setInterval(function(){
            getCurrentPosition(callback);
        }, 10000);
    }
    function clearWatch(watchId) {
        win.clearInterval(watchId);
    }
    geolocation.clearWatch = clearWatch;
    geolocation.watchPosition = watchPosition;
    geolocation.getCurrentPosition = getCurrentPosition;
})(window, navigator, jQuery, Math);