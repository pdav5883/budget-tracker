let api_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/query"

let default_category = "Groceries"

window.onload = fetchSingleBudgetDefault

function fetchSingleBudgetDefault() {
  document.getElementById("month").value = new Date().toLocaleString("en-us",{month:"short", year: "2-digit"})
  document.getElementById("category").value = default_category

  fetchSingleBudget()
}


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
      statustext.innerHTML = ""
      var total = 0
      response.forEach(tr => total += tr["amount"])
      spenttext.innerHTML = "$" + total.toFixed(2)
    },

    error: function(err) {
      if (err.status == "401") {
	statustext.innerHTML = "Invalid Login Credentials"
      }
      else {
	statustext.innerHTML = "Error"
      }
    }
  })

}
