/*
    Description:  A SQL database to manage the Cat Oasis cat shelter
    Author:  Brian Andrews
    Summary:  Cat Oasis is a facility that gives dozens of rescued cats a beautiful cat-friendly
    home. The website database will keep track of all the cats, the cat’s toys, the food each cat
    eats, the bed provided to each cat, and employees that work there.
*/


/*
    SETUP
*/

// Express
var express = require('express');
var app = express();
app.use(express.json())
app.use(express.urlencoded({extended: true}))
PORT = 9876;

// Database
var db = require('./database/db-connector');

// Handlebars
const { engine } = require('express-handlebars');
var exphbs = require('express-handlebars');     // Import express-handlebars
app.engine('.hbs', engine({extname: ".hbs"}));  // Create an instance of the handlebars engine to process templates
app.set('view engine', '.hbs');                 // Tell express to use the handlebars engine whenever it encounters a *.hbs file.

// Static Files
app.use(express.static('public'));
var bodyParser = require('body-parser');
app.use(bodyParser.urlencoded({extended:true}));

/**
 * 
 * Functions
 */

/**
 * Format Date
 */
 function formatDate(birth_date) {

    //if no birthdate
    if (birth_date === null) {
        return "null"
    }
    if (birth_date === "null") {
        return "null"
    }
    else {
        let year = birth_date.getFullYear().toString();
        let month = (birth_date.getMonth()+1).toString();  //for some reason getMonth() is 1 month behind
        if (month.length === 1) {
            month = `0${month}`
        }
        let day = birth_date.getDate().toString();
        if (day.length === 1) {
            day = `0${day}`
        }
        birth_date = `${year}-${month}-${day}`
        return birth_date
    }
}

/*
    ROUTES
*/

/**
 * Home Page
 */
app.get('/', function(req, res)
    {
        res.render('index');                   
    });                            

////////////////////////// CATS ////////////////////////
/**
 * Cat Page / SELECT
 */
app.get('/cats', function(req, res){  
        let query1;

        if (req.query.name === undefined) {
            query1 = "SELECT * FROM Cats;";               // Define our query
        }
        //search
        else {
            query1 = `SELECT * FROM Cats WHERE name LIKE "${req.query.name}%"`;
        }
        
        let query2 = "SELECT * FROM Employees;";

        db.pool.query(query1, function(error, rows, fields){    // Execute the query
            let cats = rows;

            //Update display format for table for null values
            for (let cat of cats) {
                if (cat.breed === null) {
                    cat.breed = "null"
                }
                cat.birth_date = formatDate(cat.birth_date);
            }

            db.pool.query(query2, (error, rows, fields) => {
                let employees = rows;
                res.render('cats', {data: cats, employees: employees});

            });
        });                                       
    });                                                        


/**
 * INSERT Cat
 */
app.post('/add-cat-ajax', function(req, res) 
{
    // Capture the incoming data and parse it back to a JS object
    let data = req.body;
    let birth_date = parseInt(data.birth_date);
    let query1;

    // Capture NULL values
    if (data.breed.length === 0 && isNaN(birth_date)){
        query1 = `INSERT INTO Cats (name, breed, birth_date, gender, employee_id) VALUES ('${data.name}', NULL, NULL, '${data.gender}', '${data.employee_id}');`
    }
    else if (isNaN(birth_date)) {
        query1 = `INSERT INTO Cats (name, breed, birth_date, gender, employee_id) VALUES ('${data.name}', '${data.breed}', NULL, '${data.gender}', '${data.employee_id}');`
    }
    else if (data.breed.length === 0) {
        query1 = `INSERT INTO Cats (name, breed, birth_date, gender, employee_id) VALUES ('${data.name}', NULL, '${data.birth_date}', '${data.gender}', '${data.employee_id}');`
    }
    else {
        query1 = `INSERT INTO Cats (name, breed, birth_date, gender, employee_id) VALUES ('${data.name}', '${data.breed}', '${data.birth_date}', '${data.gender}', '${data.employee_id}');`
    }

    // Execute query    
    db.pool.query(query1, function(error, rows, fields){
        if (error) {
            console.log(error)
            res.sendStatus(400);
        }
        else
        {
            // If there was no error, perform a SELECT * on Cats
            query2 = `SELECT * FROM Cats;`;
            db.pool.query(query2, function(error, rows, fields){

                // If there was an error on the second query, send a 400
                if (error) {
                    
                    // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
                    console.log(error);
                    res.sendStatus(400);
                }
                // If all went well, send the results of the query back.
                else
                {
                    let cats = rows;

                    //Update display format for table for null values
                    for (let cat of cats) {
                        if (cat.breed === null) {
                            cat.breed = "null"
                        }
                        cat.birth_date = formatDate(cat.birth_date)
                    }
                    res.send(cats);
                }
            })
        }
    })
});

/**
 * DELETE Cat
 */
app.delete('/delete-cat-ajax/', function(req, res, next) {
    let data = req.body;
    let catID = parseInt(data.cat_id);
    let deleteCat = 'DELETE FROM Cats WHERE cat_id = ?';
    db.pool.query(deleteCat, [catID], function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            res.sendStatus(204);
        }
    })
})

/**
 * UPDATE Cat Page
 */
app.get('/cats/:cat_id', function(req, res) {
    let cat_id = req.params.cat_id;

    query1 = "SELECT * FROM Cats WHERE cat_id = ?"
    query2 = "SELECT * FROM Employees"

    db.pool.query(query1, [cat_id], function(error, rows, fields) {
        let cat = rows;
        let formatted_date = formatDate(cat[0].birth_date);
        cat[0].birth_date = formatted_date;
        db.pool.query(query2, function(error, rows, fields) {
            let employees = rows;
            res.render('update_cat', {cat: cat, employees: employees});
        });
    });
});

/**
 * UPDATE Cat / POST
 */
app.post('/cats/:cat_id', function(req, res){
    // redirect if name is blank because it is required
    if (req.body.name.length === 0) {
        console.log("Name cannot be left empty")
        res.redirect('/cats');
        return
    }

    let query1;
    let inserts;

    //account for both null birthday and null breed
    if (req.body.birth_date.length === 0 && req.body.breed.length === 0) {
        query1 = 'UPDATE Cats SET name=?, breed=NULL, birth_date=NULL, gender=?, employee_id=? WHERE cat_id=?';
        inserts = [req.body.name, req.body.gender, req.body.employee_id, req.params.cat_id]
    }
    //account for null birthday because birthday has to be formatted in the table
    else if (req.body.birth_date.length === 0) {
        query1 = 'UPDATE Cats SET name=?, breed=?, birth_date=NULL, gender=?, employee_id=? WHERE cat_id=?';
        inserts = [req.body.name, req.body.breed, req.body.gender, req.body.employee_id, req.params.cat_id]
    }
    //account for null breed because it needs to be formatted as null
    else if (req.body.breed.length === 0) {
        query1 = 'UPDATE Cats SET name=?, breed=NULL, birth_date=?, gender=?, employee_id=? WHERE cat_id=?';
        inserts = [req.body.name, req.body.birth_date, req.body.gender, req.body.employee_id, req.params.cat_id]
    }

    else {
        query1 = 'UPDATE Cats SET name=?, breed=?, birth_date=?, gender=?, employee_id=? WHERE cat_id=?';
        inserts = [req.body.name, req.body.breed, req.body.birth_date, req.body.gender, req.body.employee_id, req.params.cat_id]
    }

    db.pool.query(query1, inserts, function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else{
            res.redirect('/cats');
        }
    })
})

///////////////////////////////// EMPLOYEES //////////////////////
/**
 * Employee Page / SELECT
 */
 app.get('/employees', function(req, res)
 {  
     let query1;

     if (req.query.first_name === undefined) {
         query1 = "SELECT * FROM Employees;";               // Define our query
     }

     else {
         query1 = `SELECT * FROM Employees WHERE first_name LIKE "${req.query.first_name}%"`;
     }
    
     db.pool.query(query1, function(error, rows, fields){    // Execute the query
         let employees = rows;
         for (let employee of employees) {
             employee.starting_date = formatDate(employee.starting_date);
         }
         res.render('employees', {data: employees});
     });                                       
 });   

 /**
  * INSERT Employee
  */
 app.post('/add-employee-ajax', function(req, res) {
    let data = req.body;

     // Create and run query
    query1 = `INSERT INTO Employees (first_name, last_name, work_email, personal_email, phone_number, starting_date) VALUES ('${data.first_name}','${data.last_name}', '${data.work_email}', '${data.personal_email}', '${data.phone_number}', '${data.starting_date}');`;
    db.pool.query(query1, function(error, rows, fields) {
        if (error) {
            console.log(error)
            res.sendStatus(400);
        }
        else {
            query2 = 'SELECT * from Employees;';
            db.pool.query(query2, function(error, rows, fieldss) {
                if (error) {
                    console.log(error);
                    res.sendStatus(400);
                }
                else {
                    res.send(rows);
                }
            })
        }
    })
})

/**
 * DELETE Employee
 */
 app.delete('/delete-employee-ajax/', function(req, res, next) {
    let data = req.body;
    let employeeID = parseInt(data.employee_id);
    let deleteEmployee = 'DELETE FROM Employees WHERE employee_id = ?';
    db.pool.query(deleteEmployee, [employeeID], function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            res.sendStatus(204);
        }
    })
})

/**
 * UPDATE Employee Page
 */
app.get('/employees/:employee_id', function(req, res) {
    let employee_id = req.params.employee_id;

    query1 = "SELECT * FROM Employees WHERE employee_id = ?";

    db.pool.query(query1, [employee_id], function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            let employee = rows;
            let formatted_date = formatDate(employee[0].starting_date);
            employee[0].starting_date = formatted_date;
            res.render('update_employee', {employee: employee});
        }
    });
});

/**
 * UPDATE Employee POST
 */
app.post('/employees/:employee_id', function(req, res) {
    
    //if any values are null, redirect because all are required
    if (req.body.first_name.length === 0) {
        console.log("First name cannot be left empty")
        res.redirect('/employees');
        return
    }
    if (req.body.last_name.length === 0) {
        console.log("Last name cannot be left empty")
        res.redirect('/employees');
        return
    }
    if (req.body.work_email.length === 0) {
        console.log("Work email cannot be left empty")
        res.redirect('/employees');
        return
    }
    if (req.body.personal_email.length === 0) {
        console.log("Personal email cannot be left empty")
        res.redirect('/employees');
        return
    }
    if (req.body.phone_number.length === 0) {
        console.log("Phone number cannot be left empty")
        res.redirect('/employees');
        return
    }
    if (req.body.starting_date.length === 0) {
        console.log("Starting date cannot be left empty")
        res.redirect('/employees');
        return
    }

    query1 = 'UPDATE Employees SET first_name=?, last_name=?, work_email=?, personal_email=?, phone_number=?, starting_date=? WHERE employee_id=?';
    let inserts = [req.body.first_name, req.body.last_name, req.body.work_email, req.body.personal_email, req.body.phone_number, req.body.starting_date, req.params.employee_id]
    db.pool.query(query1, inserts, function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            res.redirect('/employees');
        }
    });
});

//////////////////////////////// CAT BEDS /////////////////////////////
/**
 * Cat Bed Page / SELECT
 */
 app.get('/cat_beds', function(req, res)
 {  
     let query1;

     if (isNaN(req.query.cat_bed_id)) {
         query1 = "SELECT * FROM Cat_Beds;";               // Define our query
     }

     else {
         query1 = `SELECT * FROM Cat_Beds WHERE cat_bed_id LIKE '${req.query.cat_bed_id}%'`;
     }
     
     let query2 = "SELECT * FROM Cats;";

     db.pool.query(query1, function(error, rows, fields){    // Execute the query
         let cat_beds = rows;
         //reformat null values for UI table
         for (let cat_bed of cat_beds) {
             if (cat_bed.cat_id === null) {
                 cat_bed.cat_id = "null"
             }
             if (cat_bed.cost === null) {
                 cat_bed.cost = "null"
             }
         }

         db.pool.query(query2, (error, rows, fields) => {
             let cats = rows;
             res.render('cat_beds', {data: cat_beds, cats: cats});
         });
     });                                       
 });    

 /**
  * INSERT Cat Bed
  */
  app.post('/add-cat-bed-ajax', function(req, res) 
  {
      // Capture the incoming data and parse it back to a JS object
      let data = req.body;
      let query1;
      // Capture NULL values
      let cat_id = parseInt(data.cat_id);
      let cost = parseInt(data.cost);

      if (isNaN(cost) && isNaN(cat_id)){
        query1 = `INSERT INTO Cat_Beds (bed_type, cat_id, cost) VALUES ('${data.bed_type}', NULL, NULL);`
      }
      else if (isNaN(cat_id)){
        query1 = `INSERT INTO Cat_Beds (bed_type, cat_id, cost) VALUES ('${data.bed_type}', NULL, '${data.cost}');`
      }
      else if (isNaN(cost)) {
        query1 = `INSERT INTO Cat_Beds (bed_type, cat_id, cost) VALUES ('${data.bed_type}', '${data.cat_id}', NULL);`
      }
      else{
        query1 = `INSERT INTO Cat_Beds (bed_type, cat_id, cost) VALUES ('${data.bed_type}', '${data.cat_id}', '${data.cost}');`
      }
  
      // Execute query
      db.pool.query(query1, function(error, rows, fields){
          if (error) {
              console.log(error)
              res.sendStatus(400);
          }
          else
          {
              // If there was no error, perform a SELECT * on Cat_Beds
              query2 = `SELECT * FROM Cat_Beds;`;
              db.pool.query(query2, function(error, rows, fields){
  
                  // If there was an error on the second query, send a 400
                  if (error) {
                      // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
                      console.log(error);
                      res.sendStatus(400);
                  }
                  // If all went well, send the results of the query back.
                  else
                  {
                    let cat_beds = rows;
                    //reformat null values for UI table
                    for (let cat_bed of cat_beds) {
                        if (cat_bed.cat_id === null) {
                            cat_bed.cat_id = "null"
                        }
                        if (cat_bed.cost === null) {
                            cat_bed.cost = "null"
                        }
                    }
                      res.send(cat_beds);
                  }
              })
          }
      })
  });

/**
 * DELETE Cat_Bed
 */
app.delete('/delete-cat-bed-ajax/', function(req, res, next) {
    let data = req.body;
    let catBedID = parseInt(data.cat_bed_id);
    let deleteCatBed = 'DELETE FROM Cat_Beds WHERE cat_bed_id = ?';
    db.pool.query(deleteCatBed, [catBedID], function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else {
            res.sendStatus(204);
        }
    })
})

/**
 * Update Cat_Bed Page
 */
app.get('/cat_beds/:cat_bed_id', function(req, res) {
    let cat_bed_id = req.params.cat_bed_id;
    let query3;

    query1 = "SELECT * FROM Cat_Beds WHERE cat_bed_id = ?";
    query2 = "SELECT Cat_Beds.cat_id, Cats.name FROM Cat_Beds INNER JOIN Cats ON Cat_Beds.cat_id=Cats.cat_id WHERE Cat_Beds.cat_bed_id = ?"
   
    db.pool.query(query1, [cat_bed_id], function(error, rows, fields) {
        if (error) {
            res.sendStatus(400);
            console.log(error)
        } else {
            let cat_bed = rows;
            db.pool.query(query2, [cat_bed[0].cat_bed_id],function(error, rows, fields) {
                if (error) {
                    res.sendStatus(400);
                    console.log(error)
                } else {
                    // if null cat id
                    let cat;
                    if (rows.length === 0) {
                        cat = ""
                        query3 = "SELECT * FROM Cats"
                    // if not null cat id
                    } else {
                        cat = rows;
                        query3 = `SELECT * FROM Cats WHERE cat_id <> ${cat[0].cat_id}`;
                    }
                    db.pool.query(query3, function(error, rows, fields) {
                        if (error) {
                            res.sendStatus(error);
                            console.log(error);
                        } else {
                            let cats = rows;
                            res.render('update_cat_bed', {cat_bed: cat_bed, cat: cat, cats: cats})
                        }
                    })

                }
            })
        }
    })
})

/**
 * UPDATE Cat_Bed / POST
 */
app.post('/cat_beds/:cat_bed_id', function(req, res) {

    //if bed_type is null, redirect because bed_type is required
    if (req.body.bed_type.length === 0) {
        console.log("Bed Type cannot be left empty")
        res.redirect('/cat_beds');
        return
    }

    let query1;
    //Account for null values
    let cat_id = parseInt(req.body.cat_id);
    let cost = parseInt(req.body.cost);

    if (isNaN(cat_id) && isNaN(cost)) {
        query1 = `UPDATE Cat_Beds SET bed_type='${req.body.bed_type}', cat_id=NULL, cost=NULL WHERE cat_bed_id='${req.params.cat_bed_id}'`
    }
    else if (isNaN(cat_id)) {
        query1 = `UPDATE Cat_Beds SET bed_type='${req.body.bed_type}', cat_id=NULL, cost='${req.body.cost}' WHERE cat_bed_id='${req.params.cat_bed_id}'`
    }
    else if (isNaN(cost)) {
        query1 = `UPDATE Cat_Beds SET bed_type='${req.body.bed_type}', cat_id=${req.body.cat_id}, cost=NULL WHERE cat_bed_id='${req.params.cat_bed_id}'`
    }
    else {
        query1 = `UPDATE Cat_Beds SET bed_type='${req.body.bed_type}', cat_id=${req.body.cat_id}, cost=${req.body.cost} WHERE cat_bed_id='${req.params.cat_bed_id}'`
    }
    //let inserts = [req.body.bed_type, req.body.cat_id, req.body.cost, req.params.cat_bed_id]
    db.pool.query(query1, function(error, rows, fields) {
        if(error) {
            res.sendStatus(400);
            console.log(error)
        } else {
            res.redirect('/cat_beds');
        }
    });
});


//////////////////////////////// FOODS ////////////////////////////////////
/**
 * Foods Page / SELECT
 */
app.get('/foods', function(req, res) {
    let query1;

    if (req.query.food_id === undefined) {
        query1 = "SELECT * FROM Foods";
    }
    else {
        query1 = `SELECT * FROM Foods WHERE food_id LIKE "${req.query.food_id}%"`;
    }

    db.pool.query(query1, function(error, rows, fields) {
        let foods = rows;

        //update boolean 0/1 to Yes/No
        for (let food of foods) {
            if (food.requires_prescription === 1) {
                food.requires_prescription = "Yes"
            } else{
                food.requires_prescription = "No"
            } 
        }

        //update null to appear as 'null' in the table
        for (let food of foods) {
            if (food.cost === null) {
                food.cost = "null"
            }
        }
        res.render('foods', {data: foods});
    });
});


/**
  * INSERT Food
  */
 app.post('/add-food-ajax', function(req, res) 
 {
     // Capture the incoming data and parse it back to a JS object
     let data = req.body;
 
     // Capture NULL values

     let cost = parseInt(data.cost);
     if (isNaN(cost))
     {
         data.cost = 'NULL'
     }
     // Create the query and run it on the database
     query1 = `INSERT INTO Foods (dry_or_wet, meal_or_treat, brand, flavor, requires_prescription, cost) VALUES ('${data.dry_or_wet}', '${data.meal_or_treat}', '${data.brand}', '${data.flavor}', '${data.requires_prescription}', ${data.cost});`
     db.pool.query(query1, function(error, rows, fields){
 
         // Check to see if there was an error
         if (error) {
 
             // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
             console.log(error)
             res.sendStatus(400);
         }
         else
         {
             // If there was no error, perform a SELECT * on Foods
             query2 = `SELECT * FROM Foods;`;
             db.pool.query(query2, function(error, rows, fields){
 
                 // If there was an error on the second query, send a 400
                 if (error) {
                     
                     // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
                     console.log(error);
                     res.sendStatus(400);
                 }
                 // If all went well, send the results of the query back.
                 else
                 {
                     let foods = rows;

                     //update foods from boolean 0/1 to Yes/No
                     for (let food of foods) {
                        if (food.requires_prescription === 1) {
                            food.requires_prescription = "Yes"
                        } else{
                            food.requires_prescription = "No"
                        } 
                    }

                    //update null to appear as 'null' in the table
                    for (let food of foods) {
                        if (food.cost === null) {
                            food.cost = "null"
                        }
                    }

                     res.send(foods);
                 }
             })
         }
     })
 });

 /**
  * DELETE Food
  */
app.delete('/delete-food-ajax', function(req, res, next) {
    let data = req.body;
    let foodID = parseInt(data.food_id);
    let deleteFood = 'DELETE FROM Foods WHERE food_id = ?';
    db.pool.query(deleteFood, [foodID], function(error, rows, fields) {
        if(error) {
            console.log(error);
            res.sendStatus(400);
        } else{
            res.sendStatus(204);
        }
    })
})

/**
 * UPDATE Food Page
 */
app.get('/foods/:food_id', function(req, res) {
    let food_id = req.params.food_id;

    query1 = "SELECT * FROM Foods WHERE food_id = ?";

    db.pool.query(query1, [food_id], function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            let food = rows;
            res.render('update_food', {food: food});
        }
    });
});

/**
 * UPDATE Food POST
 */
app.post('/foods/:food_id', function(req, res) {
    if (req.body.requires_prescription === "Yes") {
        req.body.requires_prescription = 1;
    }
    else {
        req.body.requires_prescription = 0;
    }
    
    //if brand or flavor is null, redirect because brand and flavor are required
    if (req.body.brand.length === 0) {
        console.log("Brand cannot be left empty")
        res.redirect('/foods');
        return
    }
    if (req.body.flavor.length === 0) {
        console.log("Flavor cannot be left empty")
        res.redirect('/foods');
        return
    }

    let query1
    let inserts
    //if cost is null
    if (req.body.cost.length === 0) {
        query1 = 'UPDATE Foods SET dry_or_wet=?, meal_or_treat=?, brand=?, flavor=?, requires_prescription=?, cost=NULL WHERE food_id=?';
        inserts = [req.body.dry_or_wet, req.body.meal_or_treat, req.body.brand, req.body.flavor, req.body.requires_prescription, req.params.food_id];
    }
    else {
        query1 = 'UPDATE Foods SET dry_or_wet=?, meal_or_treat=?, brand=?, flavor=?, requires_prescription=?, cost=? WHERE food_id=?';
        inserts = [req.body.dry_or_wet, req.body.meal_or_treat, req.body.brand, req.body.flavor, req.body.requires_prescription, req.body.cost, req.params.food_id];
    }

    db.pool.query(query1, inserts, function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else {
            res.redirect('/foods')
        }
    })
})



 ////////////////////////////////// TOYS ////////////////////////
 /**
  * Toys Page / SELECT
  */
  app.get('/toys', function(req, res)
  {  
      let query1;
 
      if (req.query.toy_id === undefined) {
          query1 = "SELECT * FROM Toys;";               // Define our query
      }
 
      //search
      else {
          query1 = `SELECT * FROM Toys WHERE toy_id LIKE "${req.query.toy_id}%"`;
      }

      let query2 = "SELECT * FROM Cats;";
     
      db.pool.query(query1, function(error, rows, fields){    // Execute the query
          let toys = rows;
          for (let toy of toys) {
            //catnip
            if (toy.contains_catnip === 0) {
              toy.contains_catnip = "No"
            } 
            else {
                toy.contains_catnip = "Yes"
            }
            //cat_id
            if (toy.cat_id === null) {
                toy.cat_id = "null"
            }
            //cost
            if (toy.cost === null) {
                toy.cost = "null"
            }
        }

        db.pool.query(query2, (error, rows, fields) => {
            let cats = rows;
            res.render('toys', {data: toys, cats: cats});
        });
      });                                       
  });

  /**
   * INSERT Toy
   */
   app.post('/add-toy-ajax', function(req, res) 
   {
       // Capture the incoming data and parse it back to a JS object
       let data = req.body;
       let query1;
   
       // Capture NULL values
       let cost = parseInt(data.cost);
       let cat_id = parseInt(data.cat_id);

       if (isNaN(cost) && isNaN(cat_id)){
            query1 = `INSERT INTO Toys (contains_catnip, name, cost, cat_id) VALUES ('${data.contains_catnip}', '${data.name}', NULL, NULL);`
       }
       else if (isNaN(cost)) {
            query1 = `INSERT INTO Toys (contains_catnip, name, cost, cat_id) VALUES ('${data.contains_catnip}', '${data.name}', NULL, '${data.cat_id}');`
       }
       else if (isNaN(cat_id)){
            query1 = `INSERT INTO Toys (contains_catnip, name, cost, cat_id) VALUES ('${data.contains_catnip}', '${data.name}', '${data.cost}', NULL);`
       }
       else {
            query1 = `INSERT INTO Toys (contains_catnip, name, cost, cat_id) VALUES ('${data.contains_catnip}', '${data.name}', '${data.cost}', '${data.cat_id}');`
       }
   
       // Execute query
       db.pool.query(query1, function(error, rows, fields){
           if (error) {
               console.log(error)
               res.sendStatus(400);
           }
           else
           {
               // If there was no error, perform a SELECT * on Toys
               query2 = `SELECT * FROM Toys;`;
               db.pool.query(query2, function(error, rows, fields){
                   if (error) {
                       console.log(error);
                       res.sendStatus(400);
                   }
                   else
                   {
                    let toys = rows;

                    //reformat values for table display
                    for (let toy of toys) {
                        //catnip
                        if (toy.contains_catnip === 0) {
                          toy.contains_catnip = "No"
                        } 
                        else {
                            toy.contains_catnip = "Yes"
                        }
                        //cat_id
                        if (toy.cat_id === null) {
                            toy.cat_id = "null"
                        }
                        //cost
                        if (toy.cost === null) {
                            toy.cost = "null"
                        }
                    }
                    res.send(toys);
                   }
               })
           }
       })
   });


/**
 * DELETE Toy
 */
app.delete('/delete-toy-ajax/', function(req, res, next) {
    let data = req.body;
    let toyID = parseInt(data.toy_id);
    let deleteToy = 'DELETE FROM Toys WHERE toy_id = ?';
    db.pool.query(deleteToy, [toyID], function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            res.sendStatus(204);
        }
    })
})

/**
 * UPDATE Toy Page
 */
app.get('/toys/:toy_id', function(req, res) {
    let toy_id = req.params.toy_id;

    query1 = "SELECT * FROM Toys WHERE toy_id = ?"
    query2 = "SELECT Toys.cat_id, Cats.name FROM Toys INNER JOIN Cats on Toys.cat_id=Cats.cat_id WHERE Toys.toy_id = ?"

    db.pool.query(query1, [toy_id], function(error, rows, fields) {
        let toy = rows;
        db.pool.query(query2, [toy[0].toy_id], function(error, rows, fields) {
            let cat;
            let query3;
            if (rows.length === 0) {
                cat = "";
                query3 = "SELECT * FROM Cats";
            }
            else {
                cat = rows;
                query3 = `SELECT * FROM Cats WHERE cat_id <> ${cat[0].cat_id}`
            }
            db.pool.query(query3, function(error, rows, fields) {
                if (error) {
                    console.log(error);
                    res.sendStatus(400);
                } else {
                    let cats = rows;
                    res.render('update_toy', {toy: toy, cat: cat, cats: cats})
                }
            });

        });
    });
});

/**
 * UPDATE Toy / POST
 */
app.post('/toys/:toy_id', function(req, res) {
    if (req.body.contains_catnip === "Yes") {
        req.body.contains_catnip = 1;
    }
    else {
        req.body.contains_catnip = 0;
    }

    //if name is null, redirect because name is required
    if (req.body.name.length === 0) {
        console.log("Name cannot be left empty")
        res.redirect('/toys');
        return
    }

    //account for null values
    let query;
    let inserts;

    //both cost and cat_id null
    if (req.body.cost.length === 0 && req.body.cat_id.length === 0) {
        query1 = "UPDATE Toys SET contains_catnip=?, name=?, cost=NULL, cat_id=NULL WHERE toy_id=?"
        inserts = [req.body.contains_catnip, req.body.name, req.params.toy_id]
    }
    //cost null
    else if (req.body.cost.length === 0) {
        query1 = "UPDATE Toys SET contains_catnip=?, name=?, cost=NULL, cat_id=? WHERE toy_id=?"
        inserts = [req.body.contains_catnip, req.body.name, req.body.cat_id, req.params.toy_id]
    }
    //cat_id null
    else if (req.body.cat_id.length === 0) {
        query1 = "UPDATE Toys SET contains_catnip=?, name=?, cost=?, cat_id=NULL WHERE toy_id=?"
        inserts = [req.body.contains_catnip, req.body.name, req.body.cost, req.params.toy_id]
    }
    else {
        query1 = "UPDATE Toys SET contains_catnip=?, name=?, cost=?, cat_id=? WHERE toy_id=?"
        inserts = [req.body.contains_catnip, req.body.name, req.body.cost, req.body.cat_id, req.params.toy_id]
    }

    db.pool.query(query1, inserts, function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            res.redirect('/toys');
        }
    })
})


////////////////////////////// FOODS_CATS /////////////////////////
/**
 * Foods_Cats Page / SELECT
 */
 app.get('/foods_cats', function(req, res){
    let query1;
    if (req.query.name === undefined) {
        query1 = "SELECT Foods_Cats.cat_id, Cats.name, Foods_Cats.food_id, Foods.dry_or_wet, Foods.meal_or_treat, Foods.brand, Foods.flavor, Foods.requires_prescription FROM Cats INNER JOIN Foods_Cats ON Cats.cat_id=Foods_Cats.cat_id INNER JOIN Foods ON Foods.food_id=Foods_Cats.food_id ORDER BY Cats.cat_id, Foods.food_id";
    }
    else {
        query1 = `SELECT Foods_Cats.cat_id, Cats.name, Foods_Cats.food_id, Foods.dry_or_wet, Foods.meal_or_treat, Foods.brand, Foods.flavor, Foods.requires_prescription FROM Cats INNER JOIN Foods_Cats ON Cats.cat_id=Foods_Cats.cat_id INNER JOIN Foods ON Foods.food_id=Foods_Cats.food_id WHERE Cats.name LIKE '${req.query.name}%' ORDER BY Cats.cat_id, Foods.food_id`;
    }

    //query1 = "SELECT Foods_Cats.cat_id, Cats.name, Foods_Cats.food_id, Foods.dry_or_wet, Foods.meal_or_treat, Foods.brand, Foods.flavor, Foods.requires_prescription FROM Cats INNER JOIN Foods_Cats ON Cats.cat_id=Foods_Cats.cat_id INNER JOIN Foods ON Foods.food_id=Foods_Cats.food_id ORDER BY Cats.cat_id, Foods.food_id";
    let query2 = "SELECT * FROM Cats;";
    let query3 = "SELECT * FROM Foods;";
    
    db.pool.query(query1, function(error, rows, fields){   
        let foods_cats = rows;
        for (let foods_cats of rows) {
            if (foods_cats.requires_prescription === 0) {
                foods_cats.requires_prescription = "No"
            } else {
                foods_cats.requires_prescription = "Yes"
            }
        }

        db.pool.query(query2, (error, rows, fields) => {
            let cats = rows;

            db.pool.query(query3, (error, rows, fields) => {
                let foods = rows;
                res.render('foods_cats', {data: foods_cats, cats: cats, foods: foods});
            })

       });
     });                                       
 });

 /**
  * INSERT Foods_Cats
  */
  app.post('/add-foods-cats-ajax', function(req, res) 
  {
    // Capture the incoming data and parse it back to a JS object
    let data = req.body;

    //verify new foods_cats is unique
    unique_query = "SELECT * FROM Foods_Cats WHERE cat_id = ? AND food_id = ?"
    let unique_inserts = [req.body.cat_id, req.body.food_id]
    db.pool.query(unique_query, unique_inserts, function (error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            if (rows.length > 0) {
                res.sendStatus(500)
            } else {
            
                // Create the query and run it on the database
                query1 = `INSERT INTO Foods_Cats (cat_id, food_id) VALUES ('${data.cat_id}', '${data.food_id}');`
                db.pool.query(query1, function(error, rows, fields){
                    if (error) {
                        console.log(error)
                        res.sendStatus(400);
                    }
                    else
                    {
                        // If there was no error, perform a SELECT on Foods_Cats
                        query2 = `SELECT Foods_Cats.cat_id, Cats.name, Foods_Cats.food_id, Foods.dry_or_wet, Foods.meal_or_treat, Foods.brand, Foods.flavor, Foods.requires_prescription FROM Cats INNER JOIN Foods_Cats ON Cats.cat_id=Foods_Cats.cat_id INNER JOIN Foods ON Foods.food_id=Foods_Cats.food_id WHERE Foods_Cats.cat_id=${data.cat_id} AND Foods_Cats.food_id=${data.food_id} ORDER BY Cats.cat_id, Foods.food_id`;
                        db.pool.query(query2, function(error, rows, fields){
            
                            // If there was an error on the second query, send a 400
                            if (error) {
                                
                                // Log the error to the terminal so we know what went wrong, and send the visitor an HTTP response 400 indicating it was a bad request.
                                console.log(error);
                                res.sendStatus(400);
                            }
                            // If all went well, send the results of the query back.
                            else
                            {
                                console.log(rows)
                                res.send(rows);
                            }
                        })
                    }
                })
              }
            }
        })
  });

/**
 * DELETE Foods_Cats
 */
app.delete('/delete-foods-cats-ajax/', function(req, res, next) {
    let data = req.body;
    let catID = parseInt(data.cat_id);
    let foodID = parseInt(data.food_id);

    let deleteFoodsCats = 'DELETE FROM Foods_Cats WHERE Foods_Cats.cat_id = ? AND Foods_Cats.food_id = ?;';
    db.pool.query(deleteFoodsCats, [catID, foodID], function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        }
        else {
            res.sendStatus(204);
        }
    })
})

/**
 * UPDATE Foods_Cats Page
 */
app.get('/update_foods_cats/', function(req, res) {
    let cat_id = req.query.cat_id;
    let food_id = req.query.food_id;

    query1 = "SELECT * FROM Foods_Cats WHERE cat_id=? AND food_id=?";
    query2 = "SELECT * FROM Foods"

    db.pool.query(query1, [cat_id, food_id], function(error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            let foods_cats = rows;
            db.pool.query(query2, function(error, rows, fields) {
                if (error) {
                    console.log(error);
                    res.sendStatus(400);
                } else {
                    let foods = rows;
                    res.render('update_foods_cats', {foods_cats: foods_cats, foods: foods})
                }
            })
        }
    })
})

/**
 * UPDATE Foods_Cats POST
 */
app.post('/update_foods_cats/', function(req, res) {

    //verify new foods_cats is unique
    unique_query = "SELECT * FROM Foods_Cats WHERE cat_id = ? AND food_id = ?"
    let unique_inserts = [req.query.cat_id, req.body.food_id]
    db.pool.query(unique_query, unique_inserts, function (error, rows, fields) {
        if (error) {
            console.log(error);
            res.sendStatus(400);
        } else {
            console.log(rows);
            if (rows.length > 0) {
                console.log("Duplicate entry")
                res.redirect('/foods_cats')
            } else {

                //uniqueness verified, continue with UPDATE
                query1 = "UPDATE Foods_Cats SET food_id=? WHERE Foods_Cats.cat_id=? AND Foods_Cats.food_id=?;"
                let inserts = [req.body.food_id, req.query.cat_id, req.query.food_id]
                db.pool.query(query1, inserts, function(error, rows, fields) {
                    if (error) {
                        console.log(error);
                        res.sendStatus(400);
                    } else {
                        res.redirect('/foods_cats')
                    }
                })
            }
        }
    })
})


app.get('/test', function(req, res) {
    res.render('update_foods_cats')
})


/*
    LISTENER
*/
app.listen(PORT, function(){
    console.log('Express started on http://localhost:' + PORT + '; press Ctrl-C to terminate.')
});
