let pool_id = "us-east-1_nb47Kycit"
let client_id = "t4rpjmebifvs8adt4ktqbg16u"


function submitLogin() {
  var usn = document.getElementById("username").value
  var pwd = document.getElementById("password").value

  var authenticationData = {
	Username: usn,
	Password: pwd,
  };

  var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails(authenticationData);

  var poolData = {
	UserPoolId: pool_id,
	ClientId: client_id,
  };
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  var userData = {
	Username: usn,
	Pool: userPool,
  };

  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);
  cognitoUser.authenticateUser(authenticationDetails, {
	onSuccess: function(result) {
	  localStorage.setItem("username", usn)
	  localStorage.setItem("idtoken", result.getIdToken().getJwtToken());
	  localStorage.setItem("refreshtoken", result.getRefreshToken().getToken());
	  document.getElementById("statustext").innerHTML = "Success"
	},
	
	onFailure: function(err) {
	  document.getElementById("statustext").innerHTML = "Error"
	},
  });
}


function submitRefresh() {
  var refreshTokenStr = localStorage.getItem("refreshtoken")
  var usn = localStorage.getItem("username")

  var poolData = {
	UserPoolId: pool_id,
	ClientId: client_id,
  };
  var userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

  var userData = {
	Username: usn,
	Pool: userPool,
  };
  var cognitoUser = new AmazonCognitoIdentity.CognitoUser(userData);

  var cognitoToken = new AmazonCognitoIdentity.CognitoRefreshToken(
    {
      RefreshToken: refreshTokenStr
    })

  cognitoUser.refreshSession(cognitoToken, function(err, result) {
    if (err) {
      console.log(err, session)
    }
    else {
      localStorage.setItem("idtoken", result.getIdToken().getJwtToken());
    }
  })
}
