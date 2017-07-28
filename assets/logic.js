// Initialize Firebase
var config = {
  apiKey: "AIzaSyBPKiuOqX5hulMyUdzIzWrf7fzZERFr3kM",
  authDomain: "venuemaster-7f0fe.firebaseapp.com",
  databaseURL: "https://venuemaster-7f0fe.firebaseio.com",
  projectId: "venuemaster-7f0fe",
  storageBucket: "",
  messagingSenderId: "974250603106"
};
firebase.initializeApp(config);

var database = firebase.database();
var geocoder;
var map;

function initMap() {
  geocoder = new google.maps.Geocoder();
  var latlng = new google.maps.LatLng(40.7127837, -74.0059413);
  var mapOptions = {
    zoom: 14,
    center: latlng
  }
  map = new google.maps.Map(document.getElementById('map'), mapOptions);
}

function codeAddress() {
  var address = document.getElementById('address').value;
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