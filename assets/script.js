	var venueEvents = {};

	$("#formID").on("submit", function (event) {
		event.preventDefault();
		$(".buttonsDiv").empty();
		$(".eventListDiv").empty();

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
			var cell01 = $("<td>").text(venueEvents[$(this).attr("data-prop")][i].name);
			var cell02 = $("<td>").text(venueEvents[$(this).attr("data-prop")][i].venue);
			var cell03 = $("<td>").text(venueEvents[$(this).attr("data-prop")][i].priceMin);
			var cell04 = $("<td>").text(venueEvents[$(this).attr("data-prop")][i].priceMax);
			var cell05 = $("<td>").text(venueEvents[$(this).attr("data-prop")][i].date);
			var cell06 = $("<td>").html("<a href='"+venueEvents[$(this).attr("data-prop")][i].url+"' target='_blank'>BUY</a>");
			var cell07 = $("<td>").html("<button class='saveButton data-" + i + "'>SAVE</button>");

			eventRow.append(cell01).append(cell02).append(cell03).append(cell04).append(cell05).append(cell06).append(cell07);
			$(tableBody).append(eventRow);
		}

		table.append(tableBody);
		panelBody.append(table);
		eventPanel.append(panelBody);

	};

	$(document).on("click", ".venueButton", renderEvents);