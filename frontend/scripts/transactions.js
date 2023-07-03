const api_query_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/query"
const api_edit_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/edit"
const api_add_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/add"
const api_delete_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/delete"

window.onload = fetchTransactionsIfRequested


function fetchTransactionsIfRequested() {
  const params = new URLSearchParams(window.location.search)

  if (params.get("month") != null) {
    document.getElementById("month").value = params.get("month")
    document.getElementById("category").value = params.get("category")
    fetchTransactions()
  }
}


function fetchTransactions() {
  var statustext = document.getElementById("statustext")
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
    url: api_query_url,
    headers: authHeader,
    data: params,
    crossDomain: true,

    success: function(response) {
      loadTable(response)
    },

    error: function(err) {
      if (err.status == "401") {
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

function loadTable(data) {
  document.getElementById("statustext").innerHTML = "TABLE LOADED"
}
