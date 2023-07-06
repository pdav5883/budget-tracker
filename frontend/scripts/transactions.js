const api_query_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/query"
const api_edit_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/edit"
const api_add_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/add"
const api_delete_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/delete"

// keeps track of transaction updates to send to DB
var tableUpdates = null

// db name, header name, visible, width
const columns = [["id", "ID", false, 0],
                 ["date", "Date", true, 12],
  		 ["description", "Descr", true, 20],
  		 ["account", "Acct", true, 10],
  		 ["category", "Category", true, 10],
  		 ["amount", "Amount", true, 6]]

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
  tableUpdates = {}

  var table = document.getElementById("transactionstable")
  table.innerHTML = ""
  
  var row = document.createElement("tr")
  var cell = null
  var content = null
  
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

      if (c[2]) {
	content = document.createElement("input")
        content.setAttribute("type", "text")
        content.setAttribute("size", c[3])
	content.setAttribute("onchange", "tableChangeEvent(this)")
	content.setAttribute("field", c[0])
        content.value = data[i][c[0]]
        cell.appendChild(content)
      }
      else {
	cell.innerHTML = data[i][c[0]]
	cell.setAttribute("style", "display:none")
      }
      row.appendChild(cell)
    }
    table.appendChild(row)
  }

  document.getElementById("statustext").innerHTML = "Loaded " + data.length + " transactions"
}


function tableChangeEvent(elem) {
  var id = elem.parentNode.parentNode.firstChild.textContent

  if (!(id in tableUpdates)) {
    tableUpdates[id] = {"id": id}
  }

  tableUpdates[id][elem.getAttribute("field")] = elem.value

}


function pushTransactionUpdates() {
  var statustext = document.getElementById("statustext")
  var numSuccess = 0
  var numFail = 0

  var authHeader = {"Authorization": localStorage.getItem("idtoken")}
  
  for (const [k, params] of Object.entries(tableUpdates)) {
    $.ajax({
      type: "PUT",
      url: api_edit_url,
      headers: authHeader,
      data: JSON.stringify(params),
      crossDomain: true,
      dataType: "text",  // must be text to ensure ajax parses no response from lambda

      success: function(response) {
        numSuccess++
	statustext.innerHTML = "Table updates: " + numSuccess + " success, " + numFail + " fail"
      },

      error: function(err) {
        if (err.status == "401") {
	  if (localStorage.getItem("refreshtoken") != null) {
	    statustext.innerHTML = "Refreshing Login Credentials..."
	    submitRefresh() // from login.js
	    statustext.innerHTML += "Try Again"
	    return
	  }
	  else {
	    statustext.innerHTML = "Error: Login Required"
	    return
	  }
        }
        else {
	  numFail++
	  statustext.innerHTML = "Table updates: " + numSuccess + " success, " + numFail + " fail"
        }
      }
    })
  }

  tableUpdates = {}
}
