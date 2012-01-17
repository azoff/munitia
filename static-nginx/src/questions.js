var map;
function initializeQuestionsMap(done) {
    navigator.geolocation.getCurrentPosition(function(geo) {
       var latlng = new google.maps.LatLng(geo.coords.latitude, geo.coords.longitude);
       var myOptions = {
          zoom: 17,
          center: latlng,
          mapTypeId: google.maps.MapTypeId.ROADMAP
       };
       map = new google.maps.Map(document.getElementById("map_canvas"),
          myOptions);

       google.maps.event.addListener(map, 'click', function(event) {
                                placeMarker(event.latLng);
       });

       var bounds = new google.maps.LatLngBounds();
       var tl_coords = bounds.getNorthEast();
       var br_coords = bounds.getSouthWest();
       var findArgs = { lt: geo.coords.latitude, lg: geo.coords.longitude };
       munitia.api.get('find_questions_near', findArgs).success(function(response){ 
	       var data = response.data;
	       var i = 0;
	       while (i < data.length) {
		   var question = data[i];
		   i++;
		   bindQuestion(question);
	       }
               done.resolve();
	       munitia.controller.hideLoader();
	   });
    });
}

function bindQuestion(question) {
    var questionStr = question.question;
    var answers = question.answers;
    var correct = answers.correct;
    var wrong0 = answers.wrong0;
    var wrong1 = answers.wrong1;
    var wrong2 = answers.wrong2;
    var wrong3 = answers.wrong3;
    var latlng = new google.maps.LatLng(question.loc[1], question.loc[0]);
    var img_url = '';
    if (question.hasOwnProperty('img_url')) {
        img_url = question.img_url;
    }
    var marker = new google.maps.Marker({position: latlng, map: map});
	        
    var infowindow = new google.maps.InfoWindow({
        content: questionStr + '<br><img src="' + img_url + '">' + '<br>' + '<ul><li>' + correct + '<br><li>' + wrong0 + '<br><li>' + wrong1 + '<br><li>' + wrong2 + '<br>',
        size: new google.maps.Size(50, 50)
    });
    console.error("question " + questionStr);
    console.error("infowindow " + JSON.stringify(infowindow));
    google.maps.event.addListener(marker, 'click', function() {
        // console.error("clicked infowindow " + JSON.stringify(infowindow));
        infowindow.open(map, marker);
    });
}

function placeMarker(location) {
  var marker = new google.maps.Marker({
    position: location,
    map: map
  });
  map.setCenter(location);

  var infowindow = new google.maps.InfoWindow(
      { content: "<form name='add_question' method='get' action='http://localhost:8080/create_question'>Question<br><input type='text' name='question' width='35'><br>Correct answer<br><input type='text' name='correct' width='35'><br>Wrong answer<br><input type='text' name='wrong0' width='35'><br>Wrong answer<br><input type='text' name='wrong1' width='35'><br>Wrong answer<br><input type='text' name='wrong2' width='35'><br><input type='submit' name='Save' value='Save'><input type='hidden' name='lt' value='" + marker.getPosition().lat() + "'> <input type='hidden' name='lg' value='" + marker.getPosition().lng() + "'></form>",
        size: new google.maps.Size(50, 50)
      });
    google.maps.event.addListener(marker, 'click', function() {
    infowindow.open(map, marker);
  });
}
