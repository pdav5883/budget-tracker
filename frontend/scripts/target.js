const api_query_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/query"
const api_edit_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/edit"
const api_add_url = "https://wsrxbgjqa1.execute-api.us-east-1.amazonaws.com/prod/add"


// Probably not the most elegant way, but ajax is async so can't
// call fetchTarget from within saveTarget
// 
// To query target, fetchTarget runs without a callback, which
// causes amount.value to be set on the page.
//
// To edit/add target fetchTarget is run with saveTarget as a
// callback. If fetchTarget gets a target value back in response,
// then saveTarget is run. If saveTarget gets a null then it hits
// add api, if it gets a value it hits edit api.


function fetchTarget(callback) {
  var statustext = document.getElementById("statustext")
  const month = document.getElementById("month").value
  const category = document.getElementById("category").value

  if (month == "" || category == "") {
    statustext.innerHTML = "Error: must enter month and category"
    return
  }

  const params = {
    "type": "id",
    "id": makeTargetId(month, category)
  }

  const authHeader = {"Authorization": localStorage.getItem("idtoken")}

  $.ajax({
    type: "GET",
    url: api_query_url,
    headers: authHeader,
    data: params,
    crossDomain: true,

    success: function(response) {
      if (response != null) {
	if (!callback) {
	  document.getElementById("amount").value = response["amount"]
	  statustext.innerHTML = ""
	}
	else {
	  callback(response["amount"])
	}
      }
      else {
	if (!callback) {
	  statustext.innerHTML = "Month-Category Target does not exist yet"
	}
	else {
	  callback(null)
	}
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


function saveTarget(targetValue) {
  var statustext = document.getElementById("statustext")
  const amount = document.getElementById("amount").value
  const month = document.getElementById("month").value
  const category = document.getElementById("category").value

  if (month == "" || category == "" || amount == "") {
    statustext.innerHTML = "Error: must enter month, category, and amount"
    return
  }

  const authHeader = {"Authorization": localStorage.getItem("idtoken")}
  const targetId = makeTargetId(month, category)

  // call edit api
  if (targetValue) {
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
    $.ajax({
      type: "POST",
      url: api_add_url,
      headers: authHeader,
      data: JSON.stringify([{"id": targetId, "amount": amount, "isTarget": null}]),
      crossDomain: true,
      dataType: "text",  // must be text to ensure ajax parses no response from lambda

      success: function(response) {
	statustext.innerHTML = "Success: target added"
      },

      error: function(err) {
	statustext.innerHTML = "Error"
      }
    })
  }
}

