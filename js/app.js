// Hello.
//
// This is JSHint, a tool that helps to detect errors and potential
// problems in your JavaScript code.
//
// To start, simply enter some JavaScript anywhere on this page. Your
// report will appear on the right side.
//
// Additionally, you can toggle specific options in the Configure
// menu.

/* google map api */
var map;
var id = "JA1JE1NA11LXQTLLHAOEE4UDLVJF24C10ZROEBUAOGHIXRCH";
var secret = "J21KG3AIBBI4E4XG4V04LKUTM4PTG32N34XC40ADSYPZUF0E";
/* Function that initialize the map with existing locations in database*/
var initMap = function() {
    map = new google.maps.Map(document.getElementById("map"), {
          center: {lat: 32.76, lng: -117.16},
          zoom: 11
    });
    /* error handling*/
    var mapRequestTimeout = setTimeout(function(){
    $("#map").text("Failed to load google map.");
    }, 8000);

    clearTimeout(mapRequestTimeout);

};
//location constructor
var Location = function(data) {
    var self = this;
    //public fields
    this.name = data.title;
    this.lat = data.lat;
    this.lng = data.lng;

    //create infowindow for current location object
    this.infowindow = new google.maps.InfoWindow();
    //retrieve data from 4square through API, and set content to infowindow
    getAndSet4SquareInfo(this.name, this.lat, this.lng, this.infowindow);
    //create marker for current location object
    this.marker = new google.maps.Marker( {
        position: new google.maps.LatLng(this.lat, this.lng),
        map: map,
        title: this.name
    });
    //animate marker and open infowindow when this marker is clicked
    this.marker.addListener("click", function(){
        //add marker animation
        self.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {self.marker.setAnimation(null);}, 2100);
        self.infowindow.open(map, self.marker);
    });
};


function getVenue(venue) {
    if(typeof venue === "undefined") {
        venue = "";
    }
    return venue;
}


function getAndSet4SquareInfo(searchedName, lat, lng, infowindow) {
    /* CORS */
    var fourSquareURL = "https://api.foursquare.com/v2/venues/search?ll=" + lat +
    "," + lng + "&client_id=" + id + "&client_secret=" + secret + "&v=20170826";
    $.ajax({
        url: fourSquareURL,
        method: "GET",
        success: function(data) {
            var venues = data.response.venues[0];
            var name = venues.name;
            var category = venues.categories[0].name;
            var phone = venues.contact.formattedPhone;
            var url = venues.url;
            var address = venues.location.formattedAddress;
            var hereNow = venues.hereNow.summary;
            name = getVenue(name);
            category= getVenue(category);
            phone = getVenue(phone);
            url = getVenue(url);
            address = getVenue(address);
            hereNow = getVenue(hereNow);
            var toAppend = "<div id='infowindow'><div id='name'><h5><b>" + name + "</b></h5></div>" +
                                     "<div id='content'><h6>(search name: " + searchedName + ")</h6></div>" +
                                     "<div id='category'><h6>" + category + "</h6></div>" +
                           "<div id='content'><h6>" + phone + "</h6>" +
                           "<h6>" + address + "</h6>" +
                           "<a href=" + url+ "><h6>" + url + "</h6></a>" +
                           "<h6>" + hereNow + "</h6></div></div>";
            infowindow.setContent(toAppend);
        },
        error: function() {
            alert("There was something wrong while trying to retrieve data from Foursquare.");
        }

    });
}


/* viewmodel for knockoutjs*/
var ViewModel = function() {
    initMap();
    var self = this;
    self.locations = ko.observableArray([]);
    locationModel.forEach(function(location) {
        self.locations().push(new Location(location));
    });
    this.enteredLoc = ko.observable("");


    this.addLocation = function() {
        //check if the place is already existed. Only add to the list when place is not existed.
        var exist = false;
        for(var i = 0; i< self.locations().length; i++) {
            if(self.locations()[i].name.toLowerCase() == self.enteredLoc().toLowerCase()) {
                $("#hint-msg").text("Location " + self.enteredLoc() + " is already exist");
                $("#hint-msg").css("color","red");
                exist = true;
                break;
            }
        }
        if(!exist && self.enteredLoc() !== ""){
            $.getJSON("http://maps.googleapis.com/maps/api/geocode/json?address=" +
               self.enteredLoc() +"&sensor=false", null)
               .done(function(data) {
                    var location = {
                        title: self.enteredLoc(),
                        lat: data.results[0].geometry.location.lat,
                        lng: data.results[0].geometry.location.lng
                    };
                    locationModel.push(location);
                    self.locations().push(new Location(location));
                    $("#hint-msg").text("Location " + self.enteredLoc() + " is successfully added!");
                    $("#hint-msg").css("color","#66a0ff");
                    map.setCenter(new google.maps.LatLng(location.lat, location.lng));
                })
               .fail(function() {
                    $("#hint-msg").text("Location " + self.enteredLoc() + "is failed to add.");
                    $("#hint-msg").css("color","red");
                    alert("Error getting geocode information.");
                });
        }
    };

    this.removeLocation = function(location) {
        location.marker.setVisible(false);
        self.locations.remove(location);
    };

    this.filteredLocations = ko.computed(function() {
        var filter = self.enteredLoc().toLowerCase();
        if(!filter) {
            self.locations().forEach(function(location) {
                location.marker.setVisible(true);
            });
            return self.locations();
        }else {
            return ko.utils.arrayFilter(self.locations(), function(location) {
                var string = location.name.toLowerCase();
                var index = self.locations().indexOf(location);
                var result = string.indexOf(filter) >= 0;
                if(result) {
                    location.marker.setVisible(true);
                }else {
                    location.marker.setVisible(false);
                }
                return result;
            });
        }
    }, self);

    this.AnimateMarkerAndOpenWindow = function(location) {
        location.marker.setAnimation(google.maps.Animation.BOUNCE);
        setTimeout(function() {location.marker.setAnimation(null);}, 2000);
        location.infowindow.open(map, location.marker);

    };
};

function startApp(){
    ko.applyBindings(new ViewModel());
}

function mapErrorHandler() {
    alert("Google map failed to load, please refresh to try again.");
}
