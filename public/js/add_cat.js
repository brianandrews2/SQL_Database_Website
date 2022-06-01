// Get the objects we need to modify
let addCatForm = document.getElementById('add-cat-form-ajax');

// Modify the objects we need
addCatForm.addEventListener("submit", function (e) {
    
    // Prevent the form from submitting
    e.preventDefault();

    // Get form fields we need to get data from
    let inputName = document.getElementById("name");
    let inputBreed = document.getElementById("breed");
    let inputBirthDate = document.getElementById("birth_date");
    let inputGender = document.getElementById("gender");
    let inputEmployeeId = document.getElementById("employee_id");

    //alerts for missing inputs
    if (inputName.value.length === 0) {
        alert("Enter a name");
        return;
    }
    if (inputGender.value.length === 0) {
        alert("Enter a gender");
        return;
    }
    if (inputEmployeeId.value.length ===0) {
        alert("Enter a caretaker employee");
        return;
    }

    // Get the values from the form fields
    let nameValue = inputName.value;
    let breedValue = inputBreed.value;
    let birthDateValue = inputBirthDate.value;
    let genderValue = inputGender.value;
    let employeeIdValue = inputEmployeeId.value;

    // Put our data we want to send in a javascript object
    let data = {
        name: nameValue,
        breed: breedValue,
        birth_date: birthDateValue,
        gender: genderValue,
        employee_id: employeeIdValue
    }
    
    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/add-cat-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {

            // Add the new data to the table
            addRowToTable(xhttp.response);

            // Clear the input fields for another transaction
            inputName.value = '';
            inputBreed.value = '';
            inputBirthDate.value = '';
            inputGender.value = '';
            inputEmployeeId.value = '';
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
    let currentTable = document.getElementById("cat-table");

    // Get the location where we should insert the new row (end of table)
    let newRowIndex = currentTable.rows.length;

    // Get a reference to the new row from the database query (last object)
    let parsedData = JSON.parse(data);
    let newRow = parsedData[parsedData.length - 1]

    // Create a row and cells
    let row = document.createElement("TR");
    let idCell = document.createElement("TD");
    let nameCell = document.createElement("TD");
    let breedCell = document.createElement("TD");
    let birthDateCell = document.createElement("TD");
    let genderCell = document.createElement("TD");
    let employeeIdCell = document.createElement("TD");
    let updateCell = document.createElement("TD");
    let deleteCell = document.createElement("TD");

    // Fill the cells with correct data
    idCell.innerText = newRow.cat_id;
    nameCell.innerText = newRow.name;
    breedCell.innerText = newRow.breed;
    birthDateCell.innerText = newRow.birth_date;
    genderCell.innerText = newRow.gender;
    employeeIdCell.innerText = newRow.employee_id;

    //update button
    let updateButton = document.createElement("button");
    updateButton.innerHTML = "Update";
    updateButton.onclick = function() {
        window.location.assign(`/cats/${newRow.cat_id}`);
    }
    updateCell.appendChild(updateButton);

    //delete button
    let deleteButton = document.createElement('button')
    deleteButton.innerHTML = "Delete";
    deleteButton.onclick = function() {
        deleteCat(newRow.cat_id)
    }
    deleteCell.appendChild(deleteButton)


    // Add the cells to the row 
    row.appendChild(idCell);
    row.appendChild(nameCell);
    row.appendChild(breedCell);
    row.appendChild(birthDateCell);
    row.appendChild(genderCell);
    row.appendChild(employeeIdCell);
    row.appendChild(updateCell);
    row.appendChild(deleteCell);

    // Add a row attribute so the deleteRow function can find a newly added row
    row.setAttribute('data-value', newRow.cat_id);
    
    // Add the row to the table
    currentTable.appendChild(row);
}