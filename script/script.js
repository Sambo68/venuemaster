	var venueEvents = {};
	var counter = 0;

	var geocoder;
    var map;
    var mapCreated = false;
	  function initMap(address) {
	  	var Gmap = $("<div id='Gmap' style='width: auto; height: 480px;'>");
		$(".venueMapDiv").append(Gmap);

	    geocoder = new google.maps.Geocoder();
		var GMqueryURL = "https://maps.googleapis.com/maps/api/geocode/json?address="+address+"&key=AIzaSyApGncbSHu8Y4FHV7GkSBWUPkgEnxMJFdQ"

			$.ajax({
		    	url: GMqueryURL,
		        method: "GET"
		    }).done(function(response) {
		       	var latlong = response.results[0].geometry.location.lat + "," + response.results[0].geometry.location.lng;

	    var latlng = new google.maps.LatLng(response.results[0].geometry.location.lat, response.results[0].geometry.location.lng);

	    var mapOptions = {
	      zoom: 14,
	      center: latlng
	    }
        var infowindow = new google.maps.InfoWindow({
          content: address
        });

	    map = new google.maps.Map(document.getElementById('Gmap'), mapOptions);
	    var marker = new google.maps.Marker({
		  map: map,
		  position: latlng,
          title: address
			 });

        marker.addListener('click', function() {
          infowindow.open(map, marker);
          console.log("clicked");
          debugger
        });
        debugger

			});

	  }

	$("#formID").on("submit", function (event) {
		event.preventDefault();
		$(".buttonsDiv").empty();
		$(".eventListDiv").empty();
		venueEvents = {};

		var zipcode = $("#zipCode").val().trim();
		var radius = $("#radius").val().trim();
		var GMqueryURL = "https://maps.googleapis.com/maps/api/geocode/json?address="+zipcode+"&key=AIzaSyApGncbSHu8Y4FHV7GkSBWUPkgEnxMJFdQ"

		$.ajax({
	    	url: GMqueryURL,
	        method: "GET"
	    }).done(function(response) {
	       	var latlong = response.results[0].geometry.location.lat + "," + response.results[0].geometry.location.lng;

	       	console.log(latlong);

	       	var TMqueryURL = "https://app.ticketmaster.com/discovery/v2/events.json?latlong=" + latlong + "&radius="+radius+"&unit=miles&size=200&sort=date,asc&apikey=PnQlM2PZMMguQ58jEoIIRrokmLo4Jdjp";

			$.ajax({
	    		url: TMqueryURL,
	        	method: "GET"
	    	}).done(function(response) {
	       		console.log(response);

	       		if (response._embedded == undefined) {
	       			var jumbotron = $("<div>").addClass("jumbotron text-center ß noEvents");
	       			jumbotron.html("<h1>No Events Found</h1>");
	       			$(".buttonsDiv").append(jumbotron);
	       		}

	       		else {
	       		for (var i = 0; i < response._embedded.events.length; i++) {
	       			var venueName = response._embedded.events[i]._embedded.venues[0].name;

	       			var priceMin;
	       			var priceMax;

	       			if (response._embedded.events[i].priceRanges == undefined) {
	       				priceMin = "N/A";
	       				priceMax = "N/A";
	       			}
	       			else {
	       				priceMin = response._embedded.events[i].priceRanges[0].min;
	       				priceMax = response._embedded.events[i].priceRanges[0].max;
	       			}

	       			var address;

	       			if (response._embedded.events[i]._embedded.venues[0].address == undefined) {
	       				address = "N/A";
	       			}
	       			else {
	       				address = response._embedded.events[i]._embedded.venues[0].address.line1;
	       			}

	       			var eventObject = {
	       				name: response._embedded.events[i].name,
	       				venue: venueName,
	       				priceMin: priceMin,
	       				priceMax: priceMax,
	       				date: response._embedded.events[i].dates.start.localDate,
	       				url: response._embedded.events[i].url,
	       				address: address,
	       				city: response._embedded.events[i]._embedded.venues[0].city.name,
	       				state: response._embedded.events[i]._embedded.venues[0].state.stateCode,
	       				postalCode: response._embedded.events[i]._embedded.venues[0].postalCode
	       			}; 

	       			if (!(venueName in venueEvents)) {
	       				venueEvents[venueName]= [];
	       				venueEvents[venueName].push(eventObject);
	       			}
	       			else {
	       				venueEvents[venueName].push(eventObject);
	       			}
	       		};

	       		console.log (venueEvents);

	       		function renderButtons () {
				$(".buttonsDiv").empty();
				var buttonsPanel = $("<div>").addClass("panel panel-primary");
				var panelHeading = $("<div>").addClass("panel-heading").html("Local Venues");
				buttonsPanel.append(panelHeading);
				var panelBody = $("<div>").addClass("panel-body");
				for (var prop in venueEvents) {
					var button = $("<button>");
					button.text(prop).attr("data-prop", prop).addClass("venueButton");
					$(panelBody).append(button);
				}
				buttonsPanel.append(panelBody);
				$(".buttonsDiv").append(buttonsPanel); 
				};

	       		renderButtons();
	       	}
	       	for (prop in venueEvents) {
	       		console.log(venueEvents.prop);
	       	};
			});
		});

		return false;
	});

	function renderEvents () {
		$(".eventListDiv").empty();
		var eventPanel = $("<div>").addClass("panel panel-primary");
		var panelHeading = $("<div>").addClass("panel-heading").html("Events List");
		eventPanel.append(panelHeading);
		var panelBody = $("<div>").addClass("panel-body");
		var table = $("<table>").addClass("table table-hover");
		var thead = $("<thead>");
		var theadRow = $("<tr>");
		var nameCol = $("<th>").text("Name");
		var venueCol = $("<th>").text("Venue");
		var minCol = $("<th>").text("Price (min)");
		var maxCol = $("<th>").text("Price (max)");
		var dateCol = $("<th>").text("Date");
		var buyCol = $("<th>").text("Buy Tickets");
		var saveCol = $("<th>").text("Save");

		theadRow.append(nameCol).append(venueCol).append(minCol).append(maxCol).append(dateCol).append(buyCol).append(saveCol);
		thead.append(theadRow);
		table.append(thead);

		var tableBody = $("<tbody>").addClass("eventContent");

		$(".eventListDiv").append(eventPanel);

		for (var i = 0; i < venueEvents[$(this).attr("data-prop")].length; i++) {
			var eventRow = $("<tr>");
			eventRow.attr("id", "event"+i);
			eventRow.attr("data-name", venueEvents[$(this).attr("data-prop")][i].name);
			eventRow.attr("data-venue", venueEvents[$(this).attr("data-prop")][i].venue);
			eventRow.attr("data-low", venueEvents[$(this).attr("data-prop")][i].priceMin);
			eventRow.attr("data-high", venueEvents[$(this).attr("data-prop")][i].priceMax);
			eventRow.attr("data-date", venueEvents[$(this).attr("data-prop")][i].date);
			var cell01 = $("<td>").text(venueEvents[$(this).attr("data-prop")][i].name);
			var cell02 = $("<td>").text(venueEvents[$(this).attr("data-prop")][i].venue);
			var cell03 = $("<td>").text(venueEvents[$(this).attr("data-prop")][i].priceMin);
			var cell04 = $("<td>").text(venueEvents[$(this).attr("data-prop")][i].priceMax);
			var cell05 = $("<td>").text(venueEvents[$(this).attr("data-prop")][i].date);
			var cell06 = $("<td>").html("<a href='"+venueEvents[$(this).attr("data-prop")][i].url+"' target='_blank'>BUY</a>");
			var cell07 = $("<td>").html("<button class='saveButton' data-i='" + i + "'  data-url='"+venueEvents[$(this).attr("data-prop")][i].url+"'>SAVE</button>");

			eventRow.append(cell01).append(cell02).append(cell03).append(cell04).append(cell05).append(cell06).append(cell07);
			$(tableBody).append(eventRow);
		}

		table.append(tableBody);
		panelBody.append(table);
		eventPanel.append(panelBody);

		var address = venueEvents[$(this).attr("data-prop")][0].venue + "<br> " + venueEvents[$(this).attr("data-prop")][0].address + " "+venueEvents[$(this).attr("data-prop")][0].city + ", " + venueEvents[$(this).attr("data-prop")][0].state + " "+ venueEvents[$(this).attr("data-prop")][0].postalCode;
    	    if(mapCreated === false){
    		  	initMap(address);
    			mapCreated = true;
    			  }
    		else{
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

	};

	$(document).on("click", ".venueButton", renderEvents);

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

	function saveFB () {
		console.log("working");
		var eventName = $("#event" + $(this).attr("data-i")).attr("data-name");
		var venueName = $("#event" + $(this).attr("data-i")).attr("data-venue");
		var minPrice = $("#event" + $(this).attr("data-i")).attr("data-low");
		var maxPrice = $("#event" + $(this).attr("data-i")).attr("data-high");
		var eventDate = $("#event" + $(this).attr("data-i")).attr("data-date");
		var url = $(this).attr("data-url");

		// Creates local "temporary" object for holding event data
		var eventToSave = {
		name: eventName,
		venue: venueName,
		lowestPrice: minPrice,
		highestPrice: maxPrice,
		date: eventDate,
		url: url
		};

		database.ref().push(eventToSave);
	};

	database.ref().orderByChild("dateAdded").on("child_added", function (childSnapshot) {
			var newRow = $("<tr>").addClass("row-" + counter);

			var cell01 = $("<td>").html(childSnapshot.val().name);
			var cell02 = $("<td>").html(childSnapshot.val().venue);
			var cell03 = $("<td>").html(childSnapshot.val().lowestPrice);
			var cell04 = $("<td>").html(childSnapshot.val().highestPrice);
			var cell05 = $("<td>").html(childSnapshot.val().date);
			var cell06 = $("<td>").html("<a href='"+childSnapshot.val().url+"' target='_blank'>BUY</a>");
			var cell07 = $("<td>").html("<button class='removeButton' data-counter='" + counter + "' data-key='"+ childSnapshot.key +"'>REMOVE</button>");

			newRow.append(cell01).append(cell02).append(cell03).append(cell04).append(cell05).append(cell06).append(cell07);

			$("#tableContent").append(newRow);

			counter++;

	}, function (error) {
  			alert(error.code);
  		});

	function removeFB () {
		database.ref().child($(this).attr("data-key")).remove();
		$(".row-" + $(this).attr("data-counter")).remove();
	};

	$(document).on("click", ".saveButton", saveFB);
	$(document).on("click", ".removeButton", removeFB);