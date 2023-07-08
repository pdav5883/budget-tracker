const api_query_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/query"
const api_edit_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/edit"
const api_add_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/add"


function fetchTarget() {
  // Returns true if target already exists, false if not, null if error
  var statustext = document.getElementById("statustext")
  var amount = document.getElementById("amount")
  const month = document.getElementById("month").value
  const category = document.getElementById("category").value

  if (month == "" || category == "") {
    statustext.innerHTML = "Error: must enter month and category"
    return
  }

  var params = {
    "type": "id",
    "id": makeTargetId(month, category)
  }

  var authHeader = {"Authorization": localStorage.getItem("idtoken")}

  $.ajax({
    type: "GET",
    url: api_query_url,
    headers: authHeader,
    data: params,
    crossDomain: true,

    success: function(response) {
      if (response != null) {
	amount.value = response["amount"]
	return true
      }
      else {
	statustext.innerHTML = "Month-Category Target does not exist yet"
	return false
      }
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


function makeTargetId(month, category) {
  return "target_" + month.toLowerCase().replace(/\s/g,"") + "_" + category.toLowerCase().replace(/\s/g,"")
}


function saveTarget() {
  var statustext = document.getElementById("statustext")
  const amount = document.getElementById("amount").value
  const month = document.getElementById("month").value
  const category = document.getElementById("category").value

  if (month == "" || category == "" || amount == "") {
    statustext.innerHTML = "Error: must enter month, category, and amount"
    return
  }

  const targetExists = fetchTarget()

  if (targetExists == null) {
    // error text was filled in fetchTaret()
    return
  }

  const authHeader = {"Authorization": localStorage.getItem("idtoken")}
  const targetId = makeTargetId(month, category)

  // call edit api
  if (targetExists) {
    $.ajax({
      type: "PUT",
      url: api_edit_url,
      headers: authHeader,
      data: JSON.stringify({"id": targetId, "amount": amount}),
      crossDomain: true,
      dataType: "text",  // must be text to ensure ajax parses no response from lambda

      success: function(response) {
	statustext.innerHTML = "Success: target updated"
      },

      error: function(err) {
	statustext.innerHTML = "Error"
      }
    })
  }

  // call new api
  else {
    statustext.innerHTML = "Not Implemented"
  }
}

