const numMonths = 3
var monthOptions = populateMonths(numMonths)
const categoryOptions = ["Groceries", "Restaurants", "None"]

// this will not step on other on-ready functions 
window.addEventListener("load", initDropdowns)

function populateMonths(num) {
  months = []
  var d = new Date()

  for (var i = 0; i < num; i++) {
    months.push(d.toLocaleString("en-us",{month:"short", year: "2-digit"}))
    d.setMonth(d.getMonth() - 1)
  }

  return months
}

function initDropdowns() {
  var monthSelect = document.getElementById("month-select")
  var monthInput = document.getElementById("month")
  var categorySelect = document.getElementById("category-select")
  var categoryInput = document.getElementById("category")

  var opt = document.createElement("option")
  opt.setAttribute("value", "")
  opt.innerHTML = "--Select--"
  monthSelect.appendChild(opt)
  
  opt = document.createElement("option")
  opt.setAttribute("value", "")
  opt.innerHTML = "--Select--"
  categorySelect.appendChild(opt)

  // add month options
  for (const m of monthOptions) {
    opt = document.createElement("option")
    opt.setAttribute("value", m)
    opt.innerHTML = m
    monthSelect.appendChild(opt)
  }

  opt = document.createElement("option")
  opt.setAttribute("value", "Other")
  opt.innerHTML = "Other"
  monthSelect.appendChild(opt)

  // add category options
  for (const c of categoryOptions) {
    opt = document.createElement("option")
    opt.setAttribute("value", c)
    opt.innerHTML = c
    categorySelect.appendChild(opt)
  }

  opt = document.createElement("option")
  opt.setAttribute("value", "Other")
  opt.innerHTML = "Other"
  categorySelect.appendChild(opt)

  var changeMonth = function() {
    if (monthSelect.value == "Other") {
      monthInput.removeAttribute("style")
      monthInput.value = ""
    }
    else {
      monthInput.setAttribute("style", "display:none")
      monthInput.value = monthSelect.value
    }
  }
    
  var changeCategory = function() {
    if (categorySelect.value == "Other") {
      categoryInput.removeAttribute("style")
      categoryInput.value = ""
    }
    else {
      categoryInput.setAttribute("style", "display:none")
      categoryInput.value = categorySelect.value
    }
  }

  monthInput.setAttribute("style", "display:none")
  categoryInput.setAttribute("style", "display:none")

  monthSelect.onchange = changeMonth
  categorySelect.onchange = changeCategory
}
