// Get a reference to the database service.
var database = firebase.database();

// Check if connected to database sevice.
var connectedRef = database.ref(".info/connected");

connectedRef.on("value", function(snap) {

    if (snap.val() === true) {

        console.log("connected");

    } else {

        console.log("not connected");

    }

});

// This function is used to insert a thousand separator in numbers.
function numberWithCommas(x) {

    var parts = x.toString().split(".");

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return parts.join(".");

}

// This function is used to clear all data from the database.  
function functionToExec() {

    // Get a reference for the database. 
    var ref = database.ref();

    // Clear all data from the database.
    ref.remove().then(() => {

        // Once finished alert the user accordingly.
        alert("Data was cleared successfully!");

        // When user closes the alert dialog reload the current page
        // to get the updated version of the map.
        window.location.reload();

    });

}

// Declare a variable to hold the score of the current user.
var totalpoints;

// Declare a variable to hold a handle to the element for the score of the current user.
var textbox2;

// Get the name of the current user from the session storage.
var username = window.localStorage.getItem('username');

// Create, activate and show a new "Clear Data" button if the curent user is "admin".
if (username == "admin") {

    var div = document.getElementById("div");

    var newButton = document.createElement('button');

    newButton.setAttribute('style', 'height:27px;width:250px;background-color:grey;margin-left:auto;margin-right:auto;display:block');

    newButton.setAttribute('onclick', 'functionToExec()');

    newButton.innerHTML = "Clear Data";

    div.appendChild(newButton);

}

// Declare a variable to hold a handle to the element for the username of the current user.
var textbox1 = document.getElementById('textbox1');

// Set the value of the element with the name of the current user.
textbox1.value = username;

// Get a reference for the database at the "score" node.
var refpoints = database.ref().child('users/' + username + '/score');

// Get a reference for the database at the "invertedScore" node.
var refpointsInverted = database.ref().child('users/' + username + '/invertedScore');

// Get a reference for the database at the "users" node.
var refuser = database.ref().child('users');

// Initialize a variable to hold to count the numner of username occurences
// in the database.
var count = 0;

// Iterate through "users" node to search if the current user exists already
// in the database.
refuser.once("value", function(snapshot) {

    // If there are user records in the database, proceed.
    if (snapshot.val() != null) {

        // Iteration.
        snapshot.forEach(function(child) {

            if (child.key == username) {

                count = count + 1;

            }

        });

        // If the current user doesn't exist in the database create a new user record
        // with two attibutes ("score" and "invertedScore"). The first attribute holds
        // each user's score and the second one the inverted score for ordering purposes.
        if (count == 0) {

            refuser.child(username).set({
                score: "0",
                invertedScore: "-9007199254740991" // Set to the minimum int value for ordering purposes.

            });

        }

        // If there aren't any user records in the database, proceed.
    } else {

        refuser.child(username).set({
            score: "0",
            invertedScore: "-9007199254740991" // Set to the minimum int value for ordering purposes.

        });

    }

});

// Get a reference to the "layer" node of the database.
var ref = database.ref().child('layer');

// Define a variable to hold the current layer value from database.
var syn;

// Access the "layer" node of the database.
ref.once("value", function(snapshot) {

    // Iterate through the "layer" node of the database. 
    snapshot.forEach(function(child) {

        // Iterate through the "layer_id" node of the database.	 
        child.forEach(function(ch) {

            // If the node found is not "username", get the layer data and add them to
            // the current map. 
            if (ch.key != "username") {

                // Get the current layer value from database.
                syn = ch.val();

                // If database node isn't null, proceed. 
                if (syn != null) {

                    // Get the transformed to layer GeoJSON value of syn.
                    var layer = L.GeoJSON.geometryToLayer(syn);

                    layer._layerID = child.key;

                    // Add the layer to the current feature group.
                    layer.addTo(editableLayers);

                }

            }

        });

    });

});

// Set the center of the map.
var center = [40.63000, 22.96000];

// Create the map.
var map = L.map('map').setView(center, 15);

// Set up the OSM layer.
L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: 'Data © <a href="http://osm.org/copyright">OpenStreetMap</a>',
        maxZoom: 18
    }).addTo(map);

// Initialise the FeatureGroup to store editable layers.
var editableLayers = new L.FeatureGroup();

// Add the feature group to the map.
map.addLayer(editableLayers);

// Set the options for the map
var options = {

    position: 'topleft',
    draw: {
        polyline: {
            shapeOptions: {
                color: 'yellow',
                weight: 10
            }
        },
        // Enable/Disable toolbar item by setting it 
        // to true/false.
        polyline: true, // Turns on this drawing tool,

        circle: false, // Turns off this drawing tool.

        polygon: false, // Turns off this drawing tool.

        marker: false, // Turns off this drawing tool.

        rectangle: false, // Turns off this drawing tool.

        edit: true, // Turns on this drawing tool.

        remove: true // Turns on this drawing tool.

    },

    edit: {

        featureGroup: editableLayers, //REQUIRED!!

    },
    remove: {

        featureGroup: editableLayers, //REQUIRED!!

    }

};

// Initialise the draw control and pass it the FeatureGroup of editable layers.
var drawControl = new L.Control.Draw(options);

// Add the controls to the map.
map.addControl(drawControl);

// Access the database to get the current score of the current user
// and show it to the appropriate field of the page.
refpoints.once("value", function(snapshot) {

    totalpoints = snapshot.val();

    textbox2 = document.getElementById('textbox2');

    if (totalpoints != null) {

        textbox2.value = numberWithCommas(totalpoints);

    } else {

        textbox2.value = 0;

    }

});

// Method that handles the drawing of new polylines (bike routes) on the map.
map.on('draw:created', function(e) {

    // Get the new layer.
    layer = e.layer;

    // Set a new random ID attribute for the layer object.
    layer._layerID = Math.round(Math.random() * 10000);

    // Variables necessary to count the length of the new bike route.
    var distance = 0,
        coords = null,
        coordsArray = layer._latlngs;

    // Count the length of the new bike route. 
    for (i = 0; i < coordsArray.length - 1; i++) {

        coords = coordsArray[i];

        distance += coords.distanceTo(coordsArray[i + 1]);

    }

    // Show an information (length in meters and relative points) and confirmation 
    // dialog to the user for the new bike route. If the user accepts, the new bike
    // route is saved in the database. If the user declines, the new nike route is
    // not saved i the database.
    if (window.confirm("You defined " + Math.round(distance) + " bike route meters and you could earn " +
            Math.round(distance) * 2 + " points. Approve to earn the points.")) {

        // Add the new layer to the current feature group.
        editableLayers.addLayer(layer);

        // Transform the new layer to a GeoJSON object.
        var json = layer.toGeoJSON();

        // Create/access the appropriate "layerID" node in the database.
        var ref5 = ref.child(layer._layerID);

        // In the appropriate "layerID" node, create a username node with value the
        // current username.  
        ref5.set({
            username: username
        });

        // In the appropriate "layerID" node, create a new layer node.
        ref5.push(json);

        // Update the total points variable with the new score of the user.   
        totalpoints = Number(totalpoints) + Number(Math.round(distance) * 2);

        // Update the "score" node in the database with the new score of the user.        
        refpoints.set(totalpoints);

        // Update the "invertedScore" node in the database with the new score of the user.  
        // If the updated total score is zero, set the inverted score to minimum for ordering purposes.   
        if (totalpoints == 0) {

            refpointsInverted.set(-9007199254740991);

            // If the updated total score is not zero, updated the inverted score in the database.    	
        } else {

            refpointsInverted.set(totalpoints * -1);

        }

        // Update the output element that shows the score to the user with the updated
        // total score value.   
        textbox2.value = numberWithCommas(totalpoints);

        // If the user doesn't confirm the new route, do nothing, just return.    	
    } else {

    }

});

// Set up a listener to the map to act and save the
// edited polyline to the Firebase.
map.on('draw:edited', function(e) {

    // Get the updated layers.
    var layers = e.layers;

    // Iterate through the updated layers.
    layers.eachLayer(function(layer) {

        // Transform the updated layer to GeoJSON object.
        var json = layer.toGeoJSON();

        // Get a reference of the "layerId" node in the database.
        var ref6 = ref.child(layer._layerID);

        // Get a reference of the "username" node in the database.  
        var ref10 = ref6.child('username');

        // Access the "username" node in the database.      
        ref10.once("value", function(snapshot) {

            // A user can alter only bike routes tha she/he has created. 
            if (snapshot.val() == username) {

                // Ask the user to confirm the bike route modification and inform him of the benefits.
                // If user confirms, update the polyline on the map, the appropriate layer and the score in the database.
                // If user declines, do nothing, just return.  	 	 	
                if (window.confirm("If you alter the route you would earn a fixed amount of 200 points for the correction. Approve to proceed.")) {

                    // Update the total score of the current score.	   	 
                    totalpoints = totalpoints + 200;

                    // Update the "score" and "invertedScore" of the current user in the database.      
                    refpoints.set(totalpoints);

                    if (totalpoints == 0) {

                        refpointsInverted.set(-9007199254740991);

                    } else {

                        refpointsInverted.set(totalpoints * -1);

                    }

                    // Update the textbox element with the new score of the current user.  
                    textbox2.value = numberWithCommas(totalpoints);

                    // Update the respective layer in the database.   
                    ref6.remove();

                    ref6.set({
                        username: username
                    });

                    ref6.push(json);

                    // If user declines the modification, refresh the current page. 		 
                } else {

                    window.location.reload();

                }

                // The user cannot alter bike routes that she/he has not created.
                // Alert the current user accordingly.
            } else {

                alert("You cannot alter bike routes of another user!");

                window.location.reload();

            }

        });

    });

});

// Set up a listener to the map delete chosen 
// polylines from the Firebase.
map.on('draw:deleted', function(e) {

    // Get the the layers (polylines) to be deleted.
    var layers = e.layers;

    // Iterate through the layers (polylines) to be deleted.
    layers.eachLayer(function(layer) {

        // Transform the current layer (polylines) to be deleted to GeoJSON object.
        var json = layer.toGeoJSON();

        // Get a reference of the "layerId" node in the database.   
        var ref8 = ref.child(layer._layerID);

        // Get a reference of the "username" node in the database.                                       
        var ref9 = ref8.child('username');

        // Access the "username" node in the database.   
        ref9.once("value", function(snapshot) {

            // A user can delete only bike routes tha she/he has created.  
            if (snapshot.val() == username) {

                // Define and set variables used to calculate the length of the
                // bike route to be deleted.
                var distance = 0,
                    coords = null,
                    coordsArray = layer._latlngs;

                // Calculate the length of the bike route to be deleted.	
                for (i = 0; i < coordsArray.length - 1; i++) {

                    coords = coordsArray[i];

                    distance += coords.distanceTo(coordsArray[i + 1]);

                }

                // Ask the user to confirm the bike route deletion and inform him of the benefits/drawbacks.
                // If user confirms, delete the polyline on the map and the appropriate layer in the database
                // and update the score in the database and on the page.
                // If user declines, do nothing, just return.  	 	 	 	
                if (window.confirm("If you delete the route you would lose " + Math.round(distance) * 2 + " points that you have earned " +
                        "but also you will earn 200 points for the correction. Approve to proceed.")) {

                    // Update the total points variable with the ew score of the current user (after the deletion).	   	 
                    totalpoints = totalpoints - Math.round(distance) * 2 + 200;

                    // Update the "score" and "invertedScore" of the current user in the database.        
                    refpoints.set(totalpoints);

                    if (totalpoints == 0) {

                        refpointsInverted.set(-9007199254740991);

                    } else {

                        refpointsInverted.set(totalpoints * -1);

                    }

                    // Update the textbox element with the new score of the current user.   
                    textbox2.value = numberWithCommas(totalpoints);

                    // Delete the respective layer from the database.   
                    ref8.remove();

                    // If user declines the modification, refresh the current page.  		 
                } else {

                    window.location.reload();

                }

                // The user cannot delete bike routes that she/he has not created.
                // Alert the current user accordingly.
            } else {

                alert("You cannot delete bike routes of another user!");

                window.location.reload();

            }

        });

    });

});