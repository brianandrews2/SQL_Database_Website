//DELETE with JQUERY

function deleteCat(catID) {
    let link = '/delete-cat-ajax/';
    let data = {
      cat_id: catID
    };
  
    $.ajax({
      url: link,
      type: 'DELETE',
      data: JSON.stringify(data),
      contentType: "application/json; charset=utf-8",
      success: function(result) {
        deleteRow(catID);
      }
    });
  }
  
  function deleteRow(catID){
      let table = document.getElementById("cat-table");
      for (let i = 0, row; row = table.rows[i]; i++) {
         if (table.rows[i].getAttribute("data-value") == catID) {
              table.deleteRow(i);
              break;
         }
      }
  }