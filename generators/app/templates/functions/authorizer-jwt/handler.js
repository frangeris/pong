const jwt = require('jsonwebtoken')
const AuthPolicy = require('./authpolicy')
const response = require('../helpers/response')

exports.handler = function (event, context) {
  let pems = require('./jwks.pem')
  let token = event.authorizationToken;

  // fail if the token is not jwt
  let decodedJwt = jwt.decode(token, { complete: true });
  if (!decodedJwt) {
    response(401)
  }

  // fail if token is not from your UserPool
  if (decodedJwt.payload.iss != iss) {
    response(401)
  }

  // reject the jwt if it's not an 'Access Token'
  if (decodedJwt.payload.token_use != 'access') {
    response(401)
  }

  // get the kid from the token and retrieve corresponding PEM
  let kid = decodedJwt.header.kid;
  let pem = pems[kid];
  if (!pem) {
    response(401)
  }

  // verify the signature of the JWT token to ensure it's really coming from your User Pool
  jwt.verify(token, pem, { issuer: iss }, function (err, payload) {
    if (err) {
      response(401)
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
