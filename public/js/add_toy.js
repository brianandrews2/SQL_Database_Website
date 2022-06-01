// Get the objects we need to modify
let addToyForm = document.getElementById('add-toy-form-ajax');

// Modify the objects we need
addToyForm.addEventListener("submit", function (e) {
    
    // Prevent the form from submitting
    e.preventDefault();

    // Get form fields we need to get data from
    let inputContainsCatnip = document.getElementById("contains_catnip");
    let inputName = document.getElementById("name");
    let inputCost = document.getElementById("cost");
    let inputCatId = document.getElementById("cat_id");

    //alerts for missing inputs
    if (inputContainsCatnip.value.length === 0) {
        alert("Select Yes or No if toy contains catnip");
        return;
    }
    if (inputName.value.length === 0) {
        alert("Enter name");
        return;
    }

    // Get the values from the form fields
    let containsCatnipValue = inputContainsCatnip.value;
    let nameValue = inputName.value;
    let costValue = inputCost.value;
    let catIdValue = inputCatId.value;

    //convert Yes/No to TinyInt
    if (containsCatnipValue === "Yes") {
        containsCatnipValue = 1
    } else {
        containsCatnipValue = 0
    }

    // Put our data we want to send in a javascript object
    let data = {
        contains_catnip: containsCatnipValue,
        name: nameValue,
        cost: costValue,
        cat_id: catIdValue,
    }
    
    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/add-toy-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {

            // Add the new data to the table
            addRowToTable(xhttp.response);

            // Clear the input fields for another transaction
            inputContainsCatnip.value = '';
            inputName.value = '';
            inputCost.value = '';
            inputCatId.value = '';
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
    let currentTable = document.getElementById("toy-table");

    // Get the location where we should insert the new row (end of table)
    let newRowIndex = currentTable.rows.length;

    // Get a reference to the new row from the database query (last object)
    let parsedData = JSON.parse(data);
    let newRow = parsedData[parsedData.length - 1]

    // Create a row and 5 cells
    let row = document.createElement("TR");
    let idCell = document.createElement("TD");
    let containsCatnipCell = document.createElement("TD");
    let nameCell = document.createElement("TD");
    let costCell = document.createElement("TD");
    let catIdCell = document.createElement("TD");
    let updateCell = document.createElement("TD");
    let deleteCell = document.createElement("TD");

    // Fill the cells with correct data
    idCell.innerText = newRow.toy_id;
    containsCatnipCell.innerText = newRow.contains_catnip;
    nameCell.innerText = newRow.name;
    costCell.innerText = newRow.cost;
    catIdCell.innerText = newRow.cat_id;

    //update button
    let updateButton = document.createElement("button");
    updateButton.innerHTML = "Update";
    updateButton.onclick = function() {
        window.location.assign(`/toys/${newRow.toy_id}`);
    }
    updateCell.appendChild(updateButton);

    //delete button
    let deleteButton = document.createElement('button')
    deleteButton.innerHTML = "Delete";
    deleteButton.onclick = function() {
        deleteToy(newRow.toy_id)
    }
    deleteCell.appendChild(deleteButton)

    // Add the cells to the row 
    row.appendChild(idCell);
    row.appendChild(containsCatnipCell);
    row.appendChild(nameCell);
    row.appendChild(costCell);
    row.appendChild(catIdCell);
    row.appendChild(updateCell);
    row.appendChild(deleteCell);

    // Add a row attribute so the deleteRow function can find a newly added row
    row.setAttribute('data-value', newRow.toy_id);
    
    // Add the row to the table
    currentTable.appendChild(row);
}