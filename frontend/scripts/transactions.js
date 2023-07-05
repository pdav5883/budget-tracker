const api_query_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/query"
const api_edit_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/edit"
const api_add_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/add"
const api_delete_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/delete"

// db name, header name, visible
const columns = [["id", "ID", false],
                 ["date", "Date", true],
  		 ["description", "Descr", true],
  		 ["account", "Acct", true],
  		 ["category", "Category", true],
  		 ["amount", "Amount", true]]

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
  var table = document.getElementById("transactionstable")
  table.innerHTML = ""
  
  var row = document.createElement("tr")
  var cell = null
  
  // headers
  for (const c of columns) {
    cell = document.createElement("th")
    cell.innerHTML = c[1]

    if (!c[2]) {
      cell.setAttribute("style", "display:none")
    }

    row.appendChild(cell)
  }

  // changed column tracks whether a row has been updated by user
  cell = document.createElement("th")
  cell.innerHTML = "Changed"
  cell.setAttribute("style", "display:none")
  row.appendChild(cell)

  table.appendChild(row)

  // entries
  for (var i = 0; i < data.length; i++) {
    row = document.createElement("tr")

    for (const c of columns) {
      cell = document.createElement("td")
      cell.innerHTML = data[i][c[0]]
      
      if (!c[2]) {
	cell.setAttribute("style", "display:none")
      }
      row.appendChild(cell)
    }
    // changed cell
    cell = document.createElement("td")
    cell.innerHTML = false
    cell.setAttribute("style", "display:none")
    row.appendChild(cell)

    table.appendChild(row)
  }
}
