'use strict';
/* google map api */
var map;
var geocoder;
var j = 0;
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
    for(var i = 0; i < locationModel.length; i++){
        $.getJSON('http://maps.googleapis.com/maps/api/geocode/json?address='
          +locationModel[i].title+'&sensor=false', null, function (data, status) {
            if(status == 'success'){
                var p = data.results[0].geometry.location;
                var latlng = new google.maps.LatLng(p.lat, p.lng);
                map.setCenter(latlng);
                /* create info window for current business */
                var infowindow = new google.maps.InfoWindow({
                    content: "test"  //fill it with yelp info
                });
                /* create marker for current business */
                var marker = new google.maps.Marker({
                    position: latlng,
                    map: map
                });
                /* window pops up when user click marker */
                marker.addListener('click', function(){
                infowindow.open(map, marker);
                });
                console.log(j);
                getYelpInfo(j);
                j++;
            } else {
                alert('Geocode was not successful for the following reason: ' + status);
            }
        });

    }


};

function getYelpInfo(index) {
    /* CORS */
    var yelpURL = 'https://api.yelp.com/v3/businesses/search?term='
      +locationModel[index].title+'&location=92122&callback=yelpCallback';
    $.ajax({
        url: yelpURL,
        dataType: "jsonp",
        success: function(response) {
            console.log(response);
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
    self.favorite = ko.observable(false);
    self.locations = ko.observableArray(locationModel);
    // self.loc = ko.observable("");
    /* function for adding new location */
    self.isFavorite = function(){
        self.favorite(!self.favorite());

    }
}

ko.applyBindings(new ViewModel());