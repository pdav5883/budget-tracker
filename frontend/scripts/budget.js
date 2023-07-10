let api_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/query"
let default_category = "Groceries"

window.addEventListener("load", function() {
  document.getElementById("spentamount").onclick = function () {
    const month = document.getElementById("month").value
    const category = document.getElementById("category").value
    window.location.href = "/transactions.html?month=" + month + "&category=" + category
  }
  fetchSingleBudgetDefault()
})

function fetchSingleBudgetDefault() {
  const m = new Date().toLocaleString("en-us",{month:"short", year: "2-digit"})
  document.getElementById("month-select").value = m
  document.getElementById("month").value = m
  document.getElementById("category-select").value = default_category
  document.getElementById("category").value = default_category

  fetchSingleBudget()
}


function fetchSingleBudget() {
  var statustext = document.getElementById("statustext")
  var spentAmount = document.getElementById("spentamount")
  var targetAmount = document.getElementById("targetamount")
  const month = document.getElementById("month").value
  const category = document.getElementById("category").value

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
      spentAmount.innerHTML = "$" + total.toFixed(2)

      // from target.js, with callback to populate text
      fetchTarget(function(tAmt) {
	if (tAmt) {
	  targetAmount.innerHTML = "$" + tAmt.toFixed(2)
	}
	else {
	  targetAmount.innerHTML = "N/A"
	}
      })
    },

    error: function(err) {
      if (err.status == "401") {
	spentAmount.innerHTML = ""
	targetAmount.innerHTML = ""
	if (localStorage.getItem("refreshtoken") != null) {
	  statustext.innerHTML = "Refreshing Login Credentials..."
	  submitRefresh() // from login.js
	  statustext.innerHTML += "Try Again"
	}
	else {
	  statustext.innerHTML = "Error: Login Required"
	}
      }
      else {
	statustext.innerHTML = "Error"
      }
    }
  })
}
