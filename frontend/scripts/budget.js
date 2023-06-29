let api_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/query"

//window.onload = initPopulateForm


function fetchSingleBudget() {
  var statustext = document.getElementById("statustext")
  var spenttext = document.getElementById("spentvalue")
  var month = document.getElementById("month").value
  var category = document.getElementById("category").value

  if (month == "" || category == "") {
    statustext.innerHTML = "Error: must enter month and category"
    return
  }

  var params = {
    "type": "month-category",
    "month": month,
    "category": category
  }

  var authHeader = {"Authorization": localStorage.getItem("idtoken")}

  $.ajax({
    type: "GET",
    url: api_url,
    headers: authHeader,
    data: params,
    crossDomain: true,

    success: function(response) {
      statustext.innerHTML = "Success!"
      var total = 0
      response.forEach(tr => total += tr["amount"])
      spenttext.innerHTML = "$" + total.toFixed(2)
    },

    error: function() {
      statustext.innerHTML = "Error"
    }
  })

}
