const api_query_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/query"
const api_edit_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/edit"
const api_add_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/add"
const api_delete_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/delete"

// keeps track of transaction updates and new items to send to DB
var tableUpdates = null // object with id as key
var tableNew = null     // array of new row elements

// NOTE: baked in assumption that id is first column, all other columns are editable

// db name, header name, visible, width
const columns = [["id", "ID", false, 0],
                 ["date", "Date", true, 12],
  		 ["description", "Descr", true, 20],
  		 ["account", "Acct", true, 10],
  		 ["category", "Category", true, 10],
  		 ["amount", "Amount", true, 6]]

window.addEventListener("load", fetchTransactionsIfRequested)


function fetchTransactionsIfRequested() {
  const params = new URLSearchParams(window.location.search)

  if (params.get("month") != null) {
    document.getElementById("month-select").value = params.get("month")
    document.getElementById("month").value = params.get("month")
    document.getElementById("category-select").value = params.get("category")
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
  tableNew = []

  var table = document.getElementById("transactionstable")
  table.innerHTML = ""
  
  var row = document.createElement("tr")
  var cell = null
  var content = null
  
  // header
  for (const c of columns) {
    cell = document.createElement("th")
    cell.innerHTML = c[1]

    if (!c[2]) {
      cell.setAttribute("style", "display:none")
    }

    row.appendChild(cell)
  }
  
  table.appendChild(row)

  // entries
  for (var i = 0; i < data.length; i++) { 
    table.appendChild(createRow(data[i], true))
  }
  document.getElementById("statustext").innerHTML = "Loaded " + data.length + " transactions"
}


function createRow(vals, isListening) {
  // if vals is null, then we're creating a new row, so create and assign random ID
  if (vals == null) {
    vals = {}
    for (const c of columns) {
      vals[c[0]] = ""
    }
    vals["id"] = Math.random().toString(36).slice(2)
  }

  var row = document.createElement("tr")
  var cell = null
  var content = null

  for (const c of columns) {
    cell = document.createElement("td")

    if (c[2]) {
      content = document.createElement("input")
      content.setAttribute("type", "text")
      content.setAttribute("size", c[3])
      if (isListening) {
	content.setAttribute("onchange", "tableChangeEvent(this)")
      }
      content.setAttribute("field", c[0])
      content.value = vals[c[0]]
      cell.appendChild(content)
    }
    else {
      cell.innerHTML = vals[c[0]]
      cell.setAttribute("style", "display:none")
    }
    row.appendChild(cell)
  }
  return row
}

function tableChangeEvent(elem) {
  var id = elem.parentNode.parentNode.firstChild.textContent

  if (!(id in tableUpdates)) {
    tableUpdates[id] = {"id": id}
  }

  tableUpdates[id][elem.getAttribute("field")] = elem.value

}


function newTransaction() {
  var table = document.getElementById("transactionstable")
  var newRow = createRow(null, false) 
  table.insertBefore(newRow, table.children[1])
  tableNew.push(newRow)
}


function pushTransactionUpdates() {
  // TODO: this should really be two functions: one for new rows one for edits
  // TODO: fix ugly that tableNew is cleared on success only, tableUpdate always cleared
  var statustext = document.getElementById("statustext")
  var numSuccess = 0
  var numFail = 0

  var authHeader = {"Authorization": localStorage.getItem("idtoken")}

  // new transactions
  var body = []
  for (var row of tableNew) {
    body.push(rowToData(row))
  }

  if (body.length > 0) {
    $.ajax({
      type: "POST",
      url: api_add_url,
      headers: authHeader,
      data: JSON.stringify(body),
      crossDomain: true,
      dataType: "text",  // must be text to ensure ajax parses no response from lambda

      success: function(response) {
	numSuccess += body.length
	statustext.innerHTML = "Table changes: " + numSuccess + " success, " + numFail + " fail"
	for (var row of tableNew) {
	  addUpdateListener(row)
	}
	tableNew = []
      },

      error: function(err) {
	numFail += body.length
	statustext.innerHTML = "Table changes: " + numSuccess + " success, " + numFail + " fail"
      }
    })
  }
  
  // transaction updates
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
	statustext.innerHTML = "Table changes: " + numSuccess + " success, " + numFail + " fail"
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
	  statustext.innerHTML = "Table changes: " + numSuccess + " success, " + numFail + " fail"
        }
      }
    })
  }
  tableUpdates = {}
}


function rowToData(row) {
  // convert an html row in transaction table to object
  data = {"id": row.firstChild.textContent}
  
  for (var i = 1; i < row.children.length; i++) {
    data[row.children[i].firstChild.getAttribute("field")] = row.children[i].firstChild.value
  }

  return data
}


function addUpdateListener(row) {
  // adds onchange event to newly added rows that are being saved to DB
  for (var i = 1; i < row.children.length; i++) {
    row.children[i].firstChild.setAttribute("onchange", "tableChangeEvent(this)")
  }
}
