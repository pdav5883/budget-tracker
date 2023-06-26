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
	  var idToken = result.getIdToken().getJwtToken();
	  var refreshToken = result.getRefreshToken().getToken();
	  // TODO: store
	},
	
	onFailure: function(err) {
		alert(err.message || JSON.stringify(err));
	},
});}
