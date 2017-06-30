const jwt = require('jsonwebtoken')
const request = require('request')
const jwkToPem = require('jwk-to-pem')
const AuthPolicy = require('./authpolicy')

exports.handler = function (event, context) {
  let pems = require('./jwks.pem')
  let token = event.authorizationToken;

  // fail if the token is not jwt
  let decodedJwt = jwt.decode(token, { complete: true });
  if (!decodedJwt) {
    console.log("Not a valid JWT token");
    context.fail("Unauthorized");
    return;
  }

  // fail if token is not from your UserPool
  if (decodedJwt.payload.iss != iss) {
    console.log("invalid issuer");
    context.fail("Unauthorized");
    return;
  }

  // reject the jwt if it's not an 'Access Token'
  if (decodedJwt.payload.token_use != 'access') {
    console.log("Not an access token");
    context.fail("Unauthorized");
    return;
  }

  // get the kid from the token and retrieve corresponding PEM
  let kid = decodedJwt.header.kid;
  let pem = pems[kid];
  if (!pem) {
    console.log('Invalid access token');
    context.fail("Unauthorized");
    return;
  }

  // verify the signature of the JWT token to ensure it's really coming from your User Pool
  jwt.verify(token, pem, { issuer: iss }, function (err, payload) {
    if (err) {
      context.fail("Unauthorized");
    } else {
      // valid token. Generate the API Gateway policy for the user
      // always generate the policy on value of 'sub' claim and not for 'username' because username is reassignable
      // sub is UUID for a user which is never reassigned to another user.
      let principalId = payload.sub;

      // get AWS AccountId and API Options
      let apiOptions = {};
      let tmp = event.methodArn.split(':');
      let apiGatewayArnTmp = tmp[5].split('/');
      let awsAccountId = tmp[4];
      apiOptions.region = tmp[3];
      apiOptions.restApiId = apiGatewayArnTmp[0];
      apiOptions.stage = apiGatewayArnTmp[1];
      let method = apiGatewayArnTmp[2];
      let resource = '/'; // root resource
      if (apiGatewayArnTmp[3]) {
        resource += apiGatewayArnTmp[3];
      }
      // for more information on specifics of generating policy, refer to blueprint for API Gateway's Custom authorizer in Lambda console
      let policy = new AuthPolicy(principalId, awsAccountId, apiOptions);
      policy.allowAllMethods();
      context.succeed(policy.build());
    }
  });
};
