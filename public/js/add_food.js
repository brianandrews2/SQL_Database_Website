// Get the objects we need to modify
let addFoodForm = document.getElementById('add-food-form-ajax');

// Modify the objects we need
addFoodForm.addEventListener("submit", function (e) {
    
    // Prevent the form from submitting
    e.preventDefault();

    // Get form fields we need to get data from
    let inputDryOrWet = document.getElementById("dry_or_wet");
    let inputMealOrTreat = document.getElementById("meal_or_treat");
    let inputBrand = document.getElementById("brand");
    let inputFlavor = document.getElementById("flavor");
    let inputRequiresPrescription = document.getElementById("requires_prescription");
    let inputCost = document.getElementById("cost");

    //alerts for missing inputs
    if (inputDryOrWet.value.length === 0) {
        alert("Select dry or wet");
        return;
    }
    if (inputMealOrTreat.value.length === 0) {
        alert("Select meal or treat")
        return;
    }
    if (inputBrand.value.length === 0) {
        alert("Enter brand");
        return;
    }
    if (inputFlavor.value.length === 0) {
        alert("Enter flavor");
        return;
    }
    if (inputRequiresPrescription.value.length === 0) {
        alert("Select Yes or No if food requires prescription");
        return;
    }

    // Get the values from the form fields
    let dryOrWetValue = inputDryOrWet.value;
    let mealOrTreatValue = inputMealOrTreat.value;
    let brandValue = inputBrand.value;
    let flavorValue = inputFlavor.value;
    let requiresPrescriptionValue = inputRequiresPrescription.value;
    let costValue = inputCost.value;

    //convert Yes/No to TinyInt
    if (requiresPrescriptionValue === "Yes") {
        requiresPrescriptionValue = 1
    } else {
        requiresPrescriptionValue = 0
    }

    // Put our data we want to send in a javascript object
    let data = {
        dry_or_wet: dryOrWetValue,
        meal_or_treat: mealOrTreatValue,
        brand: brandValue,
        flavor: flavorValue,
        requires_prescription: requiresPrescriptionValue,
        cost: costValue
    }
    
    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/add-food-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {

            // Add the new data to the table
            addRowToTable(xhttp.response);

            // Clear the input fields for another transaction
            inputDryOrWet.value = '';
            inputMealOrTreat.value = '';
            inputBrand.value = '';
            inputFlavor.value = '';
            inputRequiresPrescription.value = '';
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
    let currentTable = document.getElementById("food-table");

    // Get the location where we should insert the new row (end of table)
    let newRowIndex = currentTable.rows.length;

    // Get a reference to the new row from the database query (last object)
    let parsedData = JSON.parse(data);
    let newRow = parsedData[parsedData.length - 1]

    // Create a row and 5 cells
    let row = document.createElement("TR");
    let idCell = document.createElement("TD");
    let dryOrWetCell = document.createElement("TD");
    let mealOrTreatCell = document.createElement("TD");
    let brandCell = document.createElement("TD");
    let flavorCell = document.createElement("TD");
    let requiresPrescriptionCell = document.createElement("TD");
    let costCell = document.createElement("TD");
    let updateCell = document.createElement("TD");
    let deleteCell = document.createElement("TD");

    // Fill the cells with correct data
    idCell.innerText = newRow.food_id;
    dryOrWetCell.innerText = newRow.dry_or_wet;
    mealOrTreatCell.innerText = newRow.meal_or_treat;
    brandCell.innerText = newRow.brand;
    flavorCell.innerText = newRow.flavor;
    requiresPrescriptionCell.innerText = newRow.requires_prescription;
    costCell.innerText = newRow.cost;

    //update button
    let updateButton = document.createElement("button");
    updateButton.innerHTML = "Update";
    updateButton.onclick = function() {
        window.location.assign(`/foods/${newRow.food_id}`);
    }
    updateCell.appendChild(updateButton);

    //delete button
    let deleteButton = document.createElement('button')
    deleteButton.innerHTML = "Delete";
    deleteButton.onclick = function() {
        deleteFood(newRow.food_id)
    }
    deleteCell.appendChild(deleteButton)


    // Add the cells to the row 
    row.appendChild(idCell);
    row.appendChild(dryOrWetCell);
    row.appendChild(mealOrTreatCell);
    row.appendChild(brandCell);
    row.appendChild(flavorCell);
    row.appendChild(requiresPrescriptionCell);
    row.appendChild(costCell);
    row.appendChild(updateCell)
    row.appendChild(deleteCell);

    // Add a row attribute so the deleteRow function can find a newly added row
    row.setAttribute('data-value', newRow.food_id);
    
    // Add the row to the table
    currentTable.appendChild(row);
}