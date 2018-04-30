// This function is used to insert a thousand separator in numbers.
function numberWithCommas(x) {

    var parts = x.toString().split(".");

    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ".");

    return parts.join(".");

}

// Variable used to count the number of users as returned from the database
// and to print the associated number of each user.
var count = 1;

// Create and show a table with its headings in the html page to
// accommodate the results returned from the database.  
var div = document.createElement('div'); // Create a div element as a containner of the table.

var br = document.createElement('br'); // Create a br element to insert an empty row.

var table = document.createElement('table'); // Create a table element.

// Set attributes for the table element. 	 
table.setAttribute('width', '100%');

table.setAttribute('border', '1px solid black');

table.setAttribute('style', 'table-layout: fixed');

var trTitle = document.createElement('tr'); // Create a tr (table row) element to accommodate the title of the table.

// Set attributew for the table title row element. 
trTitle.setAttribute('style', 'word-wrap:break-word');

// Create four title columns for the title row of the table. 	 
var th1 = document.createElement('th');

var th2 = document.createElement('th');

var th3 = document.createElement('th');

var th4 = document.createElement('th');

// Set attiibutes fot the four title columns. 	 
th1.setAttribute('style', ' word-wrap:break-word');

th2.setAttribute('style', ' word-wrap:break-word');

th3.setAttribute('style', ' word-wrap:break-word');

th4.setAttribute('style', ' word-wrap:break-word');

// Set titles fot the four title columns of the table.  	 
th1.innerHTML = "#";

th2.innerHTML = "Username";

th3.innerHTML = "Score";

th4.innerHTML = "Awards";

// Set the parent element (title row) for the four title columns. 	 
trTitle.appendChild(th1);

trTitle.appendChild(th2);

trTitle.appendChild(th3);

trTitle.appendChild(th4);

table.appendChild(trTitle);

// Access the "users" node in the database in descending order mode
// indirectly by the "score" attribute via the "invertedScore" attribute.
var userDataRef = firebase.database().ref("users").orderByChild("invertedScore");

userDataRef.once("value").then(function(snapshot) {

    // Iterate through the user records, access each record and create a new row
    // for each user in the table.
    snapshot.forEach(function(childSnapshot) {

        // Variable to hold the name of the current user.
        var user = childSnapshot.key;

        // Variable to hold the score of the current user in a format with thousand separator.    
        var score = numberWithCommas(childSnapshot.val().score);

        // Variable to hold the score of the current user in a format without thousand separator.     
        var scoreNumber = childSnapshot.val().score;

        // Create a  new row in the table for the current user.	 
        var tr = document.createElement('tr');

        // Set attributes for the new row in the table for the current user. 
        tr.setAttribute('align', 'center');

        tr.setAttribute('style', ' word-wrap:break-word');

        // Create four table row columns to accomodate data for the current user. 
        var td1 = document.createElement('td');

        var td2 = document.createElement('td');

        var td3 = document.createElement('td');

        var td4 = document.createElement('td');

        // Set attributes for the four table row columns to accomodate data for the current user. 	   
        td2.setAttribute('style', ' word-wrap:break-word');

        td3.setAttribute('style', ' word-wrap:break-word');

        td4.setAttribute('style', ' word-wrap:break-word');

        td1.setAttribute('style', ' word-wrap:break-word');

        // Set the appropriate current user's data in each column. 	   
        td1.innerHTML = count;

        td2.innerHTML = user;

        td3.innerHTML = score;

        // At the fourth column show an award according to set criteria.
        if (scoreNumber >= 50000) {

            td4.setAttribute('style', 'color:#FFD700');

            td4.innerHTML = "GOLD";

        } else if (scoreNumber >= 25000 && score < 50000) {

            td4.setAttribute('style', 'color:#C0C0C0');

            td4.innerHTML = "SILVER";

        } else if (scoreNumber >= 10000 && score < 25000) {

            td4.setAttribute('style', 'color:#CD7F32');

            td4.innerHTML = "BRONZE";

        } else {

        }

        // Set parent element (table row) for the four table colunns.   
        tr.appendChild(td1);

        tr.appendChild(td2);

        tr.appendChild(td3);

        tr.appendChild(td4);

        // Set parent element (table) for the table row.  
        table.appendChild(tr);

        // Set parent element(div) for the br element.    
        div.appendChild(br);

        // Set parent element(div) for the table element.       
        div.appendChild(table);

        // Set parent element(document) for the div element.    
        document.body.appendChild(div);

        // Increment the count number for each new user record returned from the database. 
        count = count + 1;

    });

});