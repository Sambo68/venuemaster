	//Object that holds all venues and corresponding events
	var venueEvents = {};
	//counter used for creating individual row classes
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
        });
			});

	  }

	// Submit function that triggers when Submit Button is pressed on First Form
	$("#formID").on("submit", function (event) {
		//Prevents Reload of Page
		event.preventDefault();
		//Empties Content Divs
		$(".buttonsDiv").empty();
		$(".eventListDiv").empty();
		//Resets main holder object to store only new data
		venueEvents = {};

		//Grab inputs from zip code and radius on form
		var zipcode = $("#zipCode").val().trim();
		var radius = $("#radius").val().trim();

		//Data Validation for Zip Code
		if (zipcode < 9999 || zipcode > 99999) {
			alert("Not a Zip Code");
		}
		//Data Validation for Radius
		else if (radius < 1 || radius == "") {
			alert("Too Small of a Radius");
		}
		else {
			console.log("zipcode");
		
		//URL used for Google Maps API that dynamically changes zipcode portion of address
		var GMqueryURL = "https://maps.googleapis.com/maps/api/geocode/json?address="+zipcode+"&key=AIzaSyApGncbSHu8Y4FHV7GkSBWUPkgEnxMJFdQ"

		//Call upon Google Maps API
		$.ajax({
	    	url: GMqueryURL,
	        method: "GET"
	    }).done(function(response) {
	    	//Creates Latitude-Longitude location from Zip Code
	       	var latlong = response.results[0].geometry.location.lat + "," + response.results[0].geometry.location.lng;

	       	console.log(latlong);

	       	//URL for Ticket Master that dynamically changes latlong and radius portion of address
	       	var TMqueryURL = "https://app.ticketmaster.com/discovery/v2/events.json?latlong=" + latlong + "&radius="+radius+"&unit=miles&size=200&sort=date,asc&apikey=PnQlM2PZMMguQ58jEoIIRrokmLo4Jdjp";

	       	//Call upon Ticket Master API
			$.ajax({
	    		url: TMqueryURL,
	        	method: "GET"
	    	}).done(function(response) {
	       		console.log(response);

	       		//Creates "No Events" Jumbotron if no events are found
	       		if (response._embedded == undefined) {
	       			var jumbotron = $("<div>").addClass("jumbotron text-center ß noEvents");
	       			jumbotron.html("<h1>No Events Found</h1>");
	       			$(".buttonsDiv").append(jumbotron);
	       		}

	       		//Code for if there are events under that zip code/radius
	       		else {
	       		//For Loop that runs through total events for zip code/radius
	       		for (var i = 0; i < response._embedded.events.length; i++) {
	       			//create a variable that holds current venue name
	       			var venueName = response._embedded.events[i]._embedded.venues[0].name;

	       			//creates variable that holds price minimum and price maximum
	       			var priceMin;
	       			var priceMax;

	       			//If Price Range is non-existant, replace priceMin and priceMax with placeholder "N/A"
	       			if (response._embedded.events[i].priceRanges == undefined) {
	       				priceMin = "N/A";
	       				priceMax = "N/A";
	       			}
	       			//If Price Range exists, assign minimum and maximum to corresponding variables
	       			else {
	       				priceMin = response._embedded.events[i].priceRanges[0].min;
	       				priceMax = response._embedded.events[i].priceRanges[0].max;
	       			}

	       			//creates variable that holds the address
	       			var address;

	       			//If the address is not listed, replace the value with "N/A"
	       			if (response._embedded.events[i]._embedded.venues[0].address == undefined) {
	       				address = "N/A";
	       			}
	       			//If the address is listed, assign the address variable the corresponding address
	       			else {
	       				address = response._embedded.events[i]._embedded.venues[0].address.line1;
	       			}

	       			//creates the object that stores each events information and assigns each property its corresponding JSON path to the correct information (unless already assigned to a variable)
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

	       			//If the venue doesn't already exist in the venueEvents object, create a new property for the venue with a value of an array and push the current event into that array
	       			if (!(venueName in venueEvents)) {
	       				venueEvents[venueName]= [];
	       				venueEvents[venueName].push(eventObject);
	       			}
	       			//If the event exists, find the venue property in venueEvents and push the current event into that array
	       			else {
	       				venueEvents[venueName].push(eventObject);
	       			}
	       		};

	       		console.log (venueEvents);

	       		//Function to create venue buttons
	       		function renderButtons () {
	       		//empties buttons div
				$(".buttonsDiv").empty();
				//Creates the dynamic panel holding the button
				var buttonsPanel = $("<div>").addClass("panel panel-primary");
				var panelHeading = $("<div>").addClass("panel-heading").html("Local Venues");
				buttonsPanel.append(panelHeading);
				var panelBody = $("<div>").addClass("panel-body");
				//For Loop of each venue in venueEvents to create a corresponding button and appending it to the panel body
				for (var prop in venueEvents) {
					var button = $("<button>");
					button.text(prop).attr("data-prop", prop).addClass("venueButton");
					$(panelBody).append(button);
				}
				//Appends the buttons panel to the buttons div
				buttonsPanel.append(panelBody);
				$(".buttonsDiv").append(buttonsPanel); 
				};

				//Call upon the renderButtons function
	       		renderButtons();
	       	}
			});
		});
		}

		//reset values for the zip code and radius inputs to their default inputs
	    $("#zipCode").val("");
 		$("#radius").val("");
		return false;
	});

	//creates function that renders the events to event div
	function renderEvents () {
		//Empties the event list div
		$(".eventListDiv").empty();
		//Dynamically creates the panel that holds the events
		var eventPanel = $("<div>").addClass("panel panel-primary");
		var panelHeading = $("<div>").addClass("panel-heading").html("Events List");
		eventPanel.append(panelHeading);
		var panelBody = $("<div>").addClass("panel-body");
		//Dynamically creates the table that displays each event
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

		//Appends table heading information to the table
		theadRow.append(nameCol).append(venueCol).append(minCol).append(maxCol).append(dateCol).append(buyCol).append(saveCol);
		thead.append(theadRow);
		table.append(thead);

		//creates the variable that holds the table body information
		var tableBody = $("<tbody>").addClass("eventContent");

		//appends the event panel to the event list div on the page
		$(".eventListDiv").append(eventPanel);

		//For Loop that runs through the list of events under each venue property
		for (var i = 0; i < venueEvents[$(this).attr("data-prop")].length; i++) {
			//creates a variable that holds the event row
			var eventRow = $("<tr class= 'eventRow'>");
			//assigns event row an ID specific to each row
			eventRow.attr("id", "event"+i);
			//assigns attributes that hold the row's information in the created row
			eventRow.attr("data-name", venueEvents[$(this).attr("data-prop")][i].name);
			eventRow.attr("data-venue", venueEvents[$(this).attr("data-prop")][i].venue);
			eventRow.attr("data-low", venueEvents[$(this).attr("data-prop")][i].priceMin);
			eventRow.attr("data-high", venueEvents[$(this).attr("data-prop")][i].priceMax);
			eventRow.attr("data-date", venueEvents[$(this).attr("data-prop")][i].date);
			//creates the cells that hold the information/link/save button for the table
			var cell01 = $("<td>").text(venueEvents[$(this).attr("data-prop")][i].name);
			var cell02 = $("<td>").text(venueEvents[$(this).attr("data-prop")][i].venue);
			var cell03 = $("<td>").text(venueEvents[$(this).attr("data-prop")][i].priceMin);
			var cell04 = $("<td>").text(venueEvents[$(this).attr("data-prop")][i].priceMax);
			var cell05 = $("<td>").text(venueEvents[$(this).attr("data-prop")][i].date);
			var cell06 = $("<td>").html("<a href='"+venueEvents[$(this).attr("data-prop")][i].url+"' target='_blank'>BUY</a>");
			var cell07 = $("<td>").html("<button class='saveButton' data-i='" + i + "'  data-url='"+venueEvents[$(this).attr("data-prop")][i].url+"'><span class='glyphicon glyphicon-save'></span></button>");

			//appends the information to the row and the row to the table body
			eventRow.append(cell01).append(cell02).append(cell03).append(cell04).append(cell05).append(cell06).append(cell07);
			$(tableBody).append(eventRow);
		}

		//appends the table together and finishes the table event panel
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

				        var infowindow = new google.maps.InfoWindow({
				          content: address
				        });
				        map.setCenter(results[0].geometry.location);
				        var marker = new google.maps.Marker({
				            map: map,
				            position: results[0].geometry.location,
     				        title: address
				        });
				        marker.addListener('click', function() {
        			    infowindow.open(map, marker);
  				        });
				    } else {
				        alert('Geocode was not successful for the following reason: ' + status);
				      }
				    });
    			  }
	};

	//Links the renderEvents function to an onclick function for the venue buttons
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

	//function that saves the information to firebase
	function saveFB () {
		console.log("working");
		//creates variables that pull information from the event row
		var eventName = $("#event" + $(this).attr("data-i")).attr("data-name");
		var venueName = $("#event" + $(this).attr("data-i")).attr("data-venue");
		var minPrice = $("#event" + $(this).attr("data-i")).attr("data-low");
		var maxPrice = $("#event" + $(this).attr("data-i")).attr("data-high");
		var eventDate = $("#event" + $(this).attr("data-i")).attr("data-date");
		var url = $(this).attr("data-url");

		//Creates database child with properties to save to firebase
		var eventToSave = {
		name: eventName,
		venue: venueName,
		lowestPrice: minPrice,
		highestPrice: maxPrice,
		date: eventDate,
		url: url
		};

		//Push the child into the firebase database
		database.ref().push(eventToSave);
	};

	//Function that is triggered when a new child is added to the database
	database.ref().orderByChild("dateAdded").on("child_added", function (childSnapshot) {
			//Creates a new row for the saved table
			var newRow = $("<tr class= 'favoritRow'>").addClass("row-" + counter);

			//Creates cells for saved table that pulls values from firebase
			var cell01 = $("<td>").html(childSnapshot.val().name);
			var cell02 = $("<td>").html(childSnapshot.val().venue);
			var cell03 = $("<td>").html(childSnapshot.val().lowestPrice);
			var cell04 = $("<td>").html(childSnapshot.val().highestPrice);
			var cell05 = $("<td>").html(childSnapshot.val().date);
			var cell06 = $("<td>").html("<a href='"+childSnapshot.val().url+"' target='_blank'>BUY</a>");
			var cell07 = $("<td>").html("<button class='removeButton' data-counter='" + counter + "' data-key='"+ childSnapshot.key +"'><span class='glyphicon glyphicon-remove'></span></button>");

			//appends cells to the new row
			newRow.append(cell01).append(cell02).append(cell03).append(cell04).append(cell05).append(cell06).append(cell07);

			//appends the new row to the saved table
			$("#tableContent").append(newRow);

			//iterate the counter to differentiate each row
			counter++;

		//If error occurs alert with the error code
	}, function (error) {
  			alert(error.code);
  		});

	//function that removes a row from firebase/saved table
	function removeFB () {
		//removes firebase child from database
		database.ref().child($(this).attr("data-key")).remove();
		//removes row from the table
		$(".row-" + $(this).attr("data-counter")).remove();
	};

	//Links saveFB function to save buttons and removeFB function to remove buttons
	$(document).on("click", ".saveButton", saveFB);
	$(document).on("click", ".removeButton", removeFB);

	//creates submit event for submission of email form
	$("#emailID").on("submit", function (event) {
		//prevents reload of page
		event.preventDefault();

		//Creates variable to store the path of the rows in the table
		var rows = $("#savedTable tr");
		//creates variable that holds the e-mail content string
		var tableHTML = ""; 
		//For loop that goes through each row and pulls out the name of the event and date and appends them to the e-mail content html
		for (var i = 1; i < rows.length; i++) {
			var row = rows[i].children;
			var name = $(row[0]).html();
			var date = $(row[4]).html();
			tableHTML+=name + " " + date + ", ";
		}

		//Grabs the input value of the e-mail address field
		var emailAdd = $("#emailAdd").val().trim();

		//Function that validates whether the e-mail fits the e-mail address format or not 
		function validateForm() {
			//Creates variable that grabs input of form and the index of essential symbols @ and .
    		var x = document.forms["myForm"]["email"].value;
    		var atpos = x.indexOf("@");
    		var dotpos = x.lastIndexOf(".");
    		//Tests to see if email address fits valid email format and if incorrect triggers not a valid e-mail address
    		if (atpos<1 || dotpos<atpos+2 || dotpos+2>=x.length) {
        		alert("Not a valid e-mail address");
        		return false;
    		}
    		//If format is correct, it sends the e-mail
    		else {
    			emailjs.send("gmail","events_template",{
  				to_email: emailAdd, 
  				html: tableHTML
				});
		    	alert("E-mail Sent!");
		    	return true;
    		}
		}

		//Calls upon the validateForm function
		validateForm();

		//Resets the value of the e-mail address input to default
		$("#emailAdd").val("");
	});




