// Get the objects we need to modify
let addCatBedForm = document.getElementById('add-cat-bed-form-ajax');

// Modify the objects we need
addCatBedForm.addEventListener("submit", function (e) {
    
    // Prevent the form from submitting
    e.preventDefault();

    // Get form fields we need to get data from
    let inputBedType = document.getElementById("bed_type");
    let inputCatId = document.getElementById("cat_id");
    let inputCost = document.getElementById("cost");

    //alerts for missing inputs
    if (inputBedType.value.length === 0) {
        alert("Enter bed type");
        return;
    }

    // Get the values from the form fields
    let bedTypeValue = inputBedType.value;
    let catIdValue = inputCatId.value;
    let costValue = inputCost.value;


    // Put our data we want to send in a javascript object
    let data = {
        bed_type: bedTypeValue,
        cat_id: catIdValue,
        cost: costValue
    }
    
    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/add-cat-bed-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {

            // Add the new data to the table
            addRowToTable(xhttp.response);

            // Clear the input fields for another transaction
            inputBedType.value = '';
            inputCatId.value = '';
            inputCost.value = '';

        }
        else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("There was an error with the input.")
        }
    }

    // Send the request and wait for the response
    xhttp.send(JSON.stringify(data));
})


// Creates a single row from an Object representing a single record from 
// Cats
addRowToTable = (data) => {

    // Get a reference to the current table on the page and clear it out.
    let currentTable = document.getElementById("cat-bed-table");

    // Get the location where we should insert the new row (end of table)
    let newRowIndex = currentTable.rows.length;

    // Get a reference to the new row from the database query (last object)
    let parsedData = JSON.parse(data);
    let newRow = parsedData[parsedData.length - 1]

    // Create a row and 5 cells
    let row = document.createElement("TR");
    let idCell = document.createElement("TD");
    let bedTypeCell = document.createElement("TD");
    let catIdCell = document.createElement("TD");
    let costCell = document.createElement("TD");
    let updateCell = document.createElement("TD");
    let deleteCell = document.createElement("TD");

    // Fill the cells with correct data
    idCell.innerText = newRow.cat_bed_id;
    bedTypeCell.innerText = newRow.bed_type;
    catIdCell.innerText = newRow.cat_id;
    costCell.innerText = newRow.cost;

    //update button
    let updateButton = document.createElement("button");
    updateButton.innerHTML = "Update";
    updateButton.onclick = function() {
        window.location.assign(`/cat_beds/${newRow.cat_bed_id}`);
    }
    updateCell.appendChild(updateButton);

    //delete button
    let deleteButton = document.createElement('button')
    deleteButton.innerHTML = "Delete";
    deleteButton.onclick = function() {
        deleteCatBed(newRow.cat_bed_id)
    }
    deleteCell.appendChild(deleteButton)


    // Add the cells to the row 
    row.appendChild(idCell);
    row.appendChild(bedTypeCell);
    row.appendChild(catIdCell);
    row.appendChild(costCell);
    row.appendChild(updateCell);
    row.appendChild(deleteCell);

    // Add a row attribute so the deleteRow function can find a newly added row
    row.setAttribute('data-value', newRow.cat_bed_id);
    
    // Add the row to the table
    currentTable.appendChild(row);
}