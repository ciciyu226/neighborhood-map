'use strict';
/* google map api */
var map;
var j = 0;
var geocoder;
var markers = [];
var id = "JA1JE1NA11LXQTLLHAOEE4UDLVJF24C10ZROEBUAOGHIXRCH";
var secret = "J21KG3AIBBI4E4XG4V04LKUTM4PTG32N34XC40ADSYPZUF0E";
/* Function that initialize the map with existing locations in database*/
function initMap () {
    geocoder = new google.maps.Geocoder;

    map = new google.maps.Map(document.getElementById('map'), {
          center: {lat: -34.397, lng: 150.644},
          zoom: 12
    });
    /* error handling*/
    var mapRequestTimeout = setTimeout(function(){
    $('#map').text("Failed to load google map.");
    }, 8000);

    clearTimeout(mapRequestTimeout);
    var i;
    for(i = 0; i < locationModel.length; i++){
        $.getJSON('http://maps.googleapis.com/maps/api/geocode/json?address='
          +locationModel[i]+'&sensor=false', (function(j) {
              return function (data, status) {
                if(status == 'success'){
                    var result = data.results[0];
                    var p = result.geometry.location;
                    var latlng = new google.maps.LatLng(p.lat, p.lng);
                    map.setCenter(latlng);
                    /* create info window for current business */
                    var infowindow = new google.maps.InfoWindow();
                    /* create marker for current business */
                    var marker = new google.maps.Marker({
                      position: latlng,
                      map: map,
                      title: locationModel[j]
                    });
                    markers.push(marker);
                    //marker.setMap(map);
                    /* window pops up when user click marker */

                    marker.addListener('click', function(){
                        infowindow.open(map, marker);
                    });
                    // window pops up when user click list item

                   // console.log(j);
                    get4SquareInfo(p, callback, infowindow);

                } else {
                    alert('Geocode was not successful for the following reason: ' + status);
                }
        }})(i));
    }


};


  // Sets the map on all markers in the array.


  // Removes the markers from the map, but keeps them in the array.
  function clearMarkers() {
    setMapOnAll(null);
  }

  // Shows any markers currently in the array.
  function showMarkers() {
    setMapOnAll(map);
  }

  // Deletes all markers in the array by removing references to them.
  function deleteMarkers() {
    clearMarkers();
    locationMarker = [];
  }



function getVenue(venue) {
    if(typeof venue === 'undefined') {
        venue = "";
    }
    return venue;
}
function callback(data, infowindow) {
    infowindow.setContent(data);
}

function get4SquareInfo(p, callback, infowindow) {
    /* CORS */
    var fourSquareURL = 'https://api.foursquare.com/v2/venues/search?ll=' + p.lat +
    ',' + p.lng + '&client_id=' + id + '&client_secret=' + secret + '&v=20170826';
    $.ajax({
        url: fourSquareURL,
        method: 'GET',
        success: function(data) {
            console.log(data);
            var venues = data.response.venues[0];
            var name = venues.name;
            var category = venues.categories[0].name;
            var phone = venues.contact.formattedPhone;
            phone = getVenue(phone);
            var url = venues.url;
            url = getVenue(url);
            var address = venues.location.formattedAddress;

            var hereNow = venues.hereNow.summary;

            var toAppend = "<div id='infowindow'><div id='name'><h5><b>" + name + "</b></h5></div>"
                         + "<div id='category'><h6>" + category + "</h6></div>"
                         + "<div id='content'><h6>" + phone + "</h6>"
                         + "<h6>" + address + "</h6>"
                         + "<a href=" + url+ "><h6>" + url + "</h6></a>"
                         + "<h6>" + hereNow + "</h6></div></div>";
            callback(toAppend,infowindow);
        },
        error: function(status) {
            alert(status);
            console.log("There was something going wrong while trying to retrieve data from foursquare.");
        }

    });
};

/*Function that takes an address and add a marker to the map based on the address*/
function codeAddress(address) {
    geocoder.geocode( { 'address': address}, function(results, status) {
      if (status == 'OK') {
        map.setCenter(results[0].geometry.location);
        var marker = new google.maps.Marker({
            map: map,
            position: results[0].geometry.location
        });
      } else {
        alert('Geocode was not successful for the following reason: ' + status);
      }
    });

}
/**** Feature: Info window *****/
/* TODO: 1. business info window pop up for each location in list √
            when user presses marker and name in the list */
      /* 2. store window in localstorage (optional)*/



/* Use of Yelp API to get business information */
/* TODO: 1. use search API to get info and business id ($.getJSON())
         2. use reviews api with the id to get customer reviews for the current business */

/**** Sites planning Feature: User interation that user adds their own location to localstorage ****/
/* TODO: 1. add add button by the rightside of search bar
         2. add stringified user input location to localstorage
         3. remove location from localstorage if user presses remove button*/

/**** filter feature : filter based on catagory ****/
/**** autocomplete search feature  *****/

/* viewmodel for knockoutjs*/
var ViewModel = function() {
    var self = this;
    self.locations = ko.observableArray(locationModel);

    self.removePlace = function(place) {
        self.locations.remove(place);
        for(var i = 0; i< markers.length; i++) {
            console.log(markers[i].title);
            console.log(place);
            if(markers[i].title == place) {
                markers[i].setMap(null);
                markers.splice(i, 1);

            }
        }
        for(var i = 0; i< markers.length; i++) {
            markers[i].setMap(map);
        }
    }


}

ko.applyBindings(new ViewModel());