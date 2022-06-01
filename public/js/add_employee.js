// Get the objects we need to modify
let addEmployeeForm = document.getElementById('add-employee-form-ajax');

// Modify the objects we need
addEmployeeForm.addEventListener("submit", function (e) {
    
    // Prevent the form from submitting
    e.preventDefault();

    // Get form fields we need to get data from
    let inputFirstName = document.getElementById("first_name");
    let inputLastName = document.getElementById("last_name");
    let inputWorkEmail = document.getElementById("work_email");
    let inputPersonalEmail = document.getElementById("personal_email");
    let inputPhoneNumber = document.getElementById("phone_number");
    let inputStartingDate = document.getElementById("starting_date");

    //alerts for missing inputs
    if (inputFirstName.value.length === 0) {
        alert("Enter a first name");
        return;
    }
    if (inputLastName.value.length === 0) {
        alert("Enter a last name");
        return;
    }
    if (inputWorkEmail.value.length === 0) {
        alert("Enter a work email");
        return;
    }
    if (inputPersonalEmail.value.length === 0) {
        alert("Enter a personal email")
        return;
    }
    if (inputPhoneNumber.value.length === 0) {
        alert("Enter a phone number");
        return;
    }
    if (inputStartingDate.value.length === 0) {
        alert("Enter a starting date");
        return;
    }

    // Get the values from the form fields
    let firstNameValue = inputFirstName.value;
    let lastNameValue = inputLastName.value;
    let workEmailValue = inputWorkEmail.value;
    let personalEmailValue = inputPersonalEmail.value;
    let phoneNumberValue = inputPhoneNumber.value;
    let startingDateValue = inputStartingDate.value;

    // Put our data we want to send in a javascript object
    let data = {
        first_name: firstNameValue,
        last_name: lastNameValue,
        work_email: workEmailValue,
        personal_email: personalEmailValue,
        phone_number: phoneNumberValue,
        starting_date: startingDateValue
    }
    
    // Setup our AJAX request
    var xhttp = new XMLHttpRequest();
    xhttp.open("POST", "/add-employee-ajax", true);
    xhttp.setRequestHeader("Content-type", "application/json");

    // Tell our AJAX request how to resolve
    xhttp.onreadystatechange = () => {
        if (xhttp.readyState == 4 && xhttp.status == 200) {

            // Add the new data to the table
            addRowToTable(xhttp.response);

            // Clear the input fields for another transaction
            inputFirstName.value = '';
            inputLastName.value = '';
            inputWorkEmail.value = '';
            inputPersonalEmail.value = '';
            inputPhoneNumber.value = '';
            inputStartingDate.value = '';
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
    let currentTable = document.getElementById("employee-table");

    // Get the location where we should insert the new row (end of table)
    let newRowIndex = currentTable.rows.length;

    // Get a reference to the new row from the database query (last object)
    let parsedData = JSON.parse(data);
    let newRow = parsedData[parsedData.length - 1]

    // Create a row and 5 cells
    let row = document.createElement("TR");
    let idCell = document.createElement("TD");
    let firstNameCell = document.createElement("TD");
    let lastNameCell = document.createElement("TD");
    let workEmailCell = document.createElement("TD");
    let personalEmailCell = document.createElement("TD");
    let phoneNumberCell = document.createElement("TD");
    let startingDateCell = document.createElement("TD");
    let updateCell = document.createElement("TD");
    let deleteCell = document.createElement("TD");

    // Fill the cells with correct data
    idCell.innerText = newRow.employee_id;
    firstNameCell.innerText = newRow.first_name;
    lastNameCell.innerText = newRow.last_name;
    workEmailCell.innerText = newRow.work_email;
    personalEmailCell.innerText = newRow.personal_email;
    phoneNumberCell.innerText = newRow.phone_number;
    startingDateCell.innerText = newRow.starting_date;

    //update button
    let updateButton = document.createElement("button");
    updateButton.innerHTML = "Update";
    updateButton.onclick = function() {
        window.location.assign(`/employees/${newRow.employee_id}`);
    }
    updateCell.appendChild(updateButton);

    //delete button
    let deleteButton = document.createElement('button')
    deleteButton.innerHTML = "Delete";
    deleteButton.onclick = function() {
        deleteEmployee(newRow.employee_id)
    }
    deleteCell.appendChild(deleteButton)

    // Add the cells to the row 
    row.appendChild(idCell);
    row.appendChild(firstNameCell);
    row.appendChild(lastNameCell);
    row.appendChild(workEmailCell);
    row.appendChild(personalEmailCell);
    row.appendChild(phoneNumberCell);
    row.appendChild(startingDateCell);
    row.appendChild(updateCell);
    row.appendChild(deleteCell);

    // Add a row attribute so the deleteRow function can find a newly added row
    row.setAttribute('data-value', newRow.employee_id);
    
    // Add the row to the table
    currentTable.appendChild(row);
}