	var venueEvents = {};

	$("#formID").on("submit", function (event) {
		event.preventDefault();

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

	       			var eventObject = {
	       				name: response._embedded.events[i].name,
	       				priceMin: priceMin,
	       				priceMax: priceMax,
	       				date: response._embedded.events[i].dates.start.localDate,
	       				url: response._embedded.events[i].url,
	       				address: response._embedded.events[i]._embedded.venues[0].address.line1,
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
				$("#buttonsDiv").empty();
				for (var prop in venueEvents) {
					var button = $("<button>");
					button.text(prop).attr("data-prop", prop).addClass("venueButton");
					$(".buttonsDiv").append(button);
				}
				};

	       		renderButtons();
			});
		});

		return false;
	});

	function renderEvents () {
		$(".eventListDiv").empty();
		for (var i = 0; i < venueEvents[$(this).attr("data-prop")].length; i++) {
			var eventDiv = $("<div>");
			eventDiv.html("<p>" + venueEvents[$(this).attr("data-prop")][i].name + " - " + venueEvents[$(this).attr("data-prop")][i].date + "</p>");
			$(".eventListDiv").append(eventDiv);
		}
	};

	$(document).on("click", ".venueButton", renderEvents);