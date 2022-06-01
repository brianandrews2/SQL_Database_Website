// DELETE with JavaScript

function deleteFoodsCats(catID, foodID) {
    // Put our data we want to send in a javascript object
    let data = {
        cat_id: catID,
        food_id: foodID
    };

    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("DELETE", "/delete-foods-cats-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 204) {

            // Add the new data to the table
            deleteRow(catID, foodID);

        }
        else if (xhttp.readyState == 4 && xhttp.status != 204) {
            console.log("There was an error with the input.")
        }
    }
    // Send the request and wait for the response
    xhttp.send(JSON.stringify(data));
}


function deleteRow(catID, foodID){

    let table = document.getElementById("foods-cats-table");
    for (let i = 0, row; row = table.rows[i]; i++) {
       //iterate through rows
       //rows would be accessed using the "row" variable assigned in the for loop
       if (table.rows[i].getAttribute("data-value-cat") == catID && table.rows[i].getAttribute("data-value-food") == foodID) {
            table.deleteRow(i);
            break;
       }
    }
}