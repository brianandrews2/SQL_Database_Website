// Get the objects we need to modify
let addFoodsCatsForm = document.getElementById('add-foods-cats-form-ajax');

// Modify the objects we need
addFoodsCatsForm.addEventListener("submit", function (e) {
    
    // Prevent the form from submitting
    e.preventDefault();

    // Get form fields we need to get data from
    let inputCatId = document.getElementById("cat_id");
    let inputFoodId = document.getElementById("food_id");

    //alerts for missing inputs
    if (inputCatId.value.length === 0) {
        alert("Select cat");
        return;
    }
    if (inputFoodId.value.length === 0) {
        alert("Select food");
        return;
    }

    // Get the values from the form fields
    let catIdValue = inputCatId.value;
    let foodIdValue = inputFoodId.value;

    // Put our data we want to send in a javascript object
    let data = {
        cat_id: catIdValue,
        food_id: foodIdValue
    }
    
    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/add-foods-cats-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {

            // Add the new data to the table
            addRowToTable(xhttp.response);

            // Clear the input fields for another transaction
            inputCatId.value = '';
            inputFoodId.value = '';


        }
        else if (xhttp.readyState == 4 && xhttp.status != 200) {
            console.log("There was an error with the input.")
        }
        else if (xhttp.readyState == 3 && xhttp.status === 500) {
            alert("Duplicate entry")
            return;
        }
    }

    // Send the request and wait for the response

    xhttp.send(JSON.stringify(data));
})


// Creates a single row from an Object representing a single record from 
// Foods_Cats
addRowToTable = (data) => {

    // Get a reference to the current table on the page and clear it out.
    let currentTable = document.getElementById("foods-cats-table");

    // Get the location where we should insert the new row (end of table)
    let newRowIndex = currentTable.rows.length;

    // Get a reference to the new row from the database query (last object)
    let parsedData = JSON.parse(data);
    let newRow = parsedData[parsedData.length - 1]

    // Create a row and 5 cells
    let row = document.createElement("TR");
    let catIdCell = document.createElement("TD");
    let catNameCell = document.createElement("TD");
    let foodIdCell = document.createElement("TD");
    let dryOrWetCell = document.createElement("TD");
    let mealOrTreatCell = document.createElement("TD");
    let brandCell = document.createElement("TD");
    let flavorCell = document.createElement("TD");
    let requiresPrescriptionCell = document.createElement("TD");
    let updateCell = document.createElement("TD");
    let deleteCell = document.createElement("TD");

    // Fill the cells with correct data
    catIdCell.innerText = newRow.cat_id;
    catNameCell.innerText = newRow.name;
    foodIdCell.innerText = newRow.food_id;
    dryOrWetCell.innerText = newRow.dry_or_wet;
    mealOrTreatCell.innerText = newRow.meal_or_treat;
    brandCell.innerText = newRow.brand;
    flavorCell.innerText = newRow.flavor;
    requiresPrescriptionCell.innerText = newRow.requires_prescription;

    //update button
    let updateButton = document.createElement("button");
    updateButton.innerHTML = "Update";
    updateButton.onclick = function() {
        window.location.assign(`/update_foods_cats/?cat_id=${newRow.cat_id}&food_id=${newRow.food_id}`);
    }
    updateCell.appendChild(updateButton);

    //delete button
    let deleteButton = document.createElement('button')
    deleteButton.innerHTML = "Delete";
    deleteButton.onclick = function() {
        deleteFoodsCats(newRow.cat_id, newRow.food_id)
    }
    deleteCell.appendChild(deleteButton)

    // Add the cells to the row 
    row.appendChild(catIdCell);
    row.appendChild(catNameCell)
    row.appendChild(foodIdCell);
    row.appendChild(dryOrWetCell);
    row.appendChild(mealOrTreatCell);
    row.appendChild(brandCell);
    row.appendChild(flavorCell);
    row.appendChild(requiresPrescriptionCell);
    row.appendChild(updateCell);
    row.appendChild(deleteCell);

    // Add a row attribute so the deleteRow function can find a newly added row
    row.setAttribute('data-value-cat', newRow.cat_id);
    row.setAttribute('data-value-food', newRow.food_id);
    
    // Add the row to the table
    currentTable.appendChild(row);

}