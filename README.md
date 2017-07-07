<div align="center">
    <img src="https://cdn.rawgit.com/frangeris/serverless-boilerplate/master/boilerplate-logo.svg"
      alt="Serverless RESTful Boilerplate" width="500" />
</div>

# Serverless RESTful Boilerplate (microservices pattern)

[![serverless](http://public.serverless.com/badges/v3.svg)](http://www.serverless.com)
[![Build Status](https://travis-ci.org/frangeris/serverless-boilerplate.svg?branch=master)](https://travis-ci.org/frangeris/serverless-boilerplate)
[![Dependency Status][daviddm-image]][daviddm-url]
[![node](https://img.shields.io/badge/node-6.10-brightgreen.svg)](https://packagist.org/packages/frangeris/serverless-boilerplate)
[![Semantic Releases][semantic-release-badge]][semantic-release]
[![PRs Welcome][prs-badge]][prs]

[daviddm-image]: https://david-dm.org/frangeris/serverless-boilerplate.svg?theme=shields.io
[daviddm-url]: https://david-dm.org/frangeris/serverless-boilerplate
[semantic-release]: https://github.com/frangeris/serverless-boilerplate/releases
[semantic-release-badge]: https://img.shields.io/badge/%20%20%F0%9F%93%A6%F0%9F%9A%80-semantic--release-e10079.svg?style=flat-square
[prs-badge]: https://img.shields.io/badge/PRs-welcome-brightgreen.svg?style=flat-square
[prs]: http://makeapullrequest.com

This boilerplate want's to simplify the process of RESTful apis creations under serverless arquitecture in AWS (serverless +v1.x), create a good codebase with scalability while the project grow up could require a lot of efford, time and dedication for know how the framework works, often this process of learning tends to be while we're building the product and this require agility and fast learning, customizing the code could be annoying a take more time than expected, that's the reason of this skeleton. 

## Installation

First, install [Yeoman](http://yeoman.io) and `generator-serverless-boilerplate` using [npm](https://www.npmjs.com/) (we assume you have pre-installed [node.js](https://nodejs.org/)).

```bash
npm install -g yo
npm install -g generator-serverless-boilerplate
```

Then generate your new project:

```bash
yo serverless-boilerplate
```

To generate new functions inside a project (recomended for overwrite `serverless.yml`):

```bash
$ yo serverless-boilerplate:function
? Function name users
? Which HTTP method? GET
? Is it a nested resource? No
? Your function description Get users
   create functions/users/get.js
✔ Function "get-users" generated successfully
```

Functions also can be nested resources, running the same above inside the functions folder will create another folder in, eg:

```bash
$ pwd
/home/dev/code/code-api/functions/users

dev @ ~/code/code-api/functions/users
$ yo serverless-boilerplate:function
? Function name orgs
? Which HTTP method? GET
? Is it a nested resource? Yes
? Your function description Get users orgs
   create orgs/get-users.js
✔ Function "get-users-orgs" generated successfully

dev @ ~/code/code-api/functions/users
$ ls
total 16K
drwxr-xr-x 3 dev 4,0K jun 27 10:41 .
drwxr-xr-x 4 dev 4,0K jun 27 10:36 ..
-rw-r--r-- 1 dev  266 jun 27 10:36 get.js
drwxr-xr-x 2 dev 4,0K jun 27 10:41 orgs
```
**[WIP]** Currently the `function` subgenerator don't save the path with parameters, so *parameters* must be added manually.

## How apply updates?
Thank's to [Yeoman](http://yeoman.io) :raised_hands: we have a [conflict handler](http://yeoman.io/generator/Conflicter.html) out-of-the-box.

> The Conflicter is a module that can be used to detect conflict between files. Each Generator file system helpers pass files through this module to make sure they don't break a user file.

To update a project with the latest features in the boilerplate just run `yo serverless-boilerplate` inside the project, the generator must detect and automatically inform that an update will be made.

```bash
dev @ ~/code/my-api
$ yo serverless-boilerplate
Project detected, updating the core instead...
? Your project name (my-api)
```
*Note:* it will ask for some fields in case you want to update basic parameters in `serverless.yml`, in case nothing change, hit enter to use existing previous values.

## Now, let's Rock n' roll
The project structure presented in this boilerplate is Microservices Pattern, where functionality is grouped primarily by function rather than resources. Each job or functionality is isolated within a separate Lambda function.

If you wish to read more about this pattern and comparation with others, please check out this awesome [writeup](https://serverless.com/blog/serverless-architecture-code-patterns/) by [Eslam Hefnawy](https://github.com/eahefnawy).

The basic project contains the following directory structure:
```
.
├── serverless.yml
├── README.md
├── LICENSE
├── package.json
├── .gitignore
├── .env.yml.example
├── templates
│   ├── request.vtl
|   └── response.vtl
├── helpers
│   ├── index.js
│   ├── jwks-to-pem.js
│   └── response.js
├── functions
│   └── authorizer-jwt
│       ├── authpolicy.js
│       └── handler.js
│   └── example
│       ├── event.json
│       ├── get.js
│       ├── post.js
│       ├── put.js
│       └── delete.js
└── tests
```

## Terms and concepts

#### The service (Api Gateway)
Due to the current limitations where every service will create an individual API in API Gateway (WIP), we'll be working with a unique service with all the functions (resources) that will be exposed.

#### serverless.yml
The default provider is `aws`, see [documentation](https://serverless.com/framework/docs/providers/aws/guide/serverless.yml/) for complete list of options available.

#### package.js (required packages)
- [yortus/asyncawait](https://github.com/yortus/asyncawait) for avoid [callback hell](http://callbackhell.com/) in validation helper.
- [krachot/options-resolver](https://github.com/krachot/options-resolver) as port of Symfony component [OptionsResolver](http://symfony.com/doc/current/components/options_resolver.html)
- [HyperBrain/serverless-aws-alias](https://github.com/HyperBrain/serverless-aws-alias) enables use of AWS aliases on Lambda functions.
- [Brightspace/node-jwk-to-pem](https://github.com/Brightspace/node-jwk-to-pem) used to convert jwks to pem file.
- [mzabriskie/axios](https://github.com/mzabriskie/axios) Awesome HTTP client for make request.

#### Stages
The default stage is "develop", for create a new one, use the package `serverless-aws-alias` and change the value in `serverless.yml` or pass it as `--option` when deployment.

#### .env.yml.example
Environment variables used by your function, variables are grouped by stage, so this meas variables will only be available depending of the stage where you defined them, variables are loaded automatically, there is not need to "require a file early as possible", so copy the file `.env.yml.example` to `.env.yml` and write the real values, depending the value for `stage` in `serverless.yml` file, values will be loaded, eg: 

Create your final env vars file

```sh
$ cp .env.yml.example .env.yml
```

Now add the values per stage

```yml
develop:
  AWS_SECRET_KEY: dontsavethiscredentialsstringsincode

prod:
  AWS_SECRET_KEY: dontsavethiscredentialsstringsincode
```

And access them natively in you code from `process.env`:

```javascript
module.exports.handler = (event, context, callback) => {
    console.log(process.env.AWS_SECRET_KEY)
}
```

`.env.yml.example` is added to VCS for keep reference of the variables, not values. `.env.yml` is not uploaded either aws when create the package or vcs.

#### templates
Templates are optionals, used when the integration is `lambda`, this method is more complicated and involves a lot more configuration of the http event syntax, [more info](https://serverless.com/framework/docs/providers/aws/events/apigateway/#lambda-integration).

The templates are defined as plain text, however you can also reference an external file with the help of the `${file(templates/response.vtl)}` syntax, use [Apache Velocity](http://velocity.apache.org/) syntax for custom.  

#### helpers
Helpers are just custom reusable functions for facilitate some repetitive tasks like validations, custom response, etc.

Here the current availables:
- *jwks-to-pem.js* file to convert jwks json to pem file used in `authorizer-jwt` function, eg: inside a project:
```bash
$ cd helpers
$ node jwks-to-pem.js <url to jwks.json>
```
> `jwks.json` is usually located in `https://cognito-idp.{region}.amazonaws.com/{userPoolId}/.well-known/jwks.json`.

This will generate a json file with the pem keys in it, `authorizer-jwt` use this file to authenticate using [JSON Web Tokens](https://jwt.io/) with [cognito integration](https://aws.amazon.com/blogs/mobile/integrating-amazon-cognito-user-pools-with-api-gateway/) for secure your resources, [more info](https://docs.aws.amazon.com/cognito/latest/developerguide/amazon-cognito-user-pools-using-tokens-with-identity-providers.html).

The authorizer needs to khow the `iss` of the [jwt](https://tools.ietf.org/html/rfc7519#section-4.1.1), so add the value to `env.yml` and replate the values of `region, userPoolId`, like this:
```bash
develop:
  AWS_ISS: https://cognito-idp.{region}.amazonaws.com/{userPoolId}
```
If the function needs to be secured using jwt authorizer, remember to add it inside the function template in `serverless.yml` file, eg like this:
```yml
  get-users-orgs:
    name: test-api-get-users-orgs
    description: Get users orgs
    handler: functions/users/orgs/get.handler
    events:
      - http:
          path: '/users/{sub}/orgs'
          method: GET
          cors: true
          authorizer: authorizer-jwt
```

- `validate()` this method return a `Promise` and throw an `Error` if the validation fails.
- `response()` **@deprecated**, use `'/helpers/response'` instead, is a shorcut for the callback received in the lambda handler, but this add the json body for integration response in API Gateway at the same time, eg:

```javascript
const { response, resolver, validate } = require('path/to/helpers')

// success response
response() // 200 - {"message": "Request processed successfully"}
response('this works like a charm!') // 200 - {"message": "this works like a charm!"}
response('Oh, you user has been created', 201) // 201 - {"message": "Oh, you user has been created"}

// and the erros
response(new Error('something fails')) // 400 - {"message": "something fails"}
response(new Error('something fails with style'), 500) // 500 - {"message": "something fails with style"}

```

Also `response()` could receive a `body` and `headers` objects for more customization of the response.

```javascript

let headers = {
    "x-custom-header" : "My Header Value"
}

let body = {
    name: 'Jhon Due',
    age: 25,
    company: 'The Company',
    location: 'Somewhere'
}

response('user logged', 200, body, headers)

```

There's a new version final version of `response()`, the main differences between using `response()` from `require('helpers')` and `require('helpers/response')` is that the new one implement [JSON API](http://jsonapi.org) standard.

> Using response from `require('helpers')` will be deprecated in the next major release.

Samples of the new `response` **using lambda-proxy integration**, [more info of integrations](https://serverless.com/framework/docs/providers/aws/events/apigateway).
```javascript
const response = require('path/to/helpers/response')
response(201)
// {"statusCode": 201, "body": "{\"data\":null}","headers": {}}

response(403, new Error('my custom error message'))
// {"statusCode": 403, "body": "{\"error\":{\"title\":\"my custom error message\",\"meta\":{}}}", "headers":{}}

response(501, {key: 'value'})
//{"statusCode": 501, "body": "{\"data\":{\"key\":\"value\"}}", "headers": {}}
 
response(403)
// {"statusCode": 403, "body": "{\"data\":null}", "headers": {}}

response()
// Error - Invalid arguments supplied for response
```

> **[WIP]** Customization of header using the new response is not supported for now...

- `resolver` just an `object` to interact with [krachot/options-resolver](https://github.com/krachot/options-resolver)
**For use response helpers it's extremely required add this code at the very begining of the handler**, the reason is that `response` helper use the lambda `callback` function for finish the execution of the lambda and is not cool always send it by parameter...

```javascript
module.exports.handler = (event, context, callback) => {

    // needed for response scope
    global.cb = callback
```

The other issue is related to request body, from [Serverless docs](https://serverless.com/framework/docs/providers/aws/events/apigateway/#simple-http-endpoint) and [AWS Developer Guide](https://docs.aws.amazon.com/apigateway/latest/developerguide/api-gateway-set-up-simple-proxy.html#api-gateway-simple-proxy-for-lambda-input-format):

Note: When the body is a JSON-Document, you must parse it yourself

```json
{
    "resource": "Resource path",
    "path": "Path parameter",
    "httpMethod": "Incoming request's method name",
    "headers": {},
    "queryStringParameters": {},
    "pathParameters":  {},
    "stageVariables": {},
    "requestContext": {},
    "body": "A JSON STRING OF THE REQUEST PAYLOAD.",
    "isBase64Encoded": "A boolean flag to indicate if the applicable request payload is Base64-encode"
}
```

That means we must to parse the body received, in every functions, is not an object, is an string, so

```javascript
module.exports.handler = (event, context, callback) => {

    // needed for response scope
    global.cb = callback

    // parse the body string to object
    let body = JSON.parse(event.body)

    ...
```

After adding the code bellow, just import the helper lib built-in and that's it... ^_^

```javascript
const { validate, resolver, response } = require('../../helpers')

module.exports.handler = (event, context, callback) => {

    // needed for response scope
    global.cb = callback

    // parse the body string to object
    let body = JSON.parse(event.body)

    // marking as required some parameters
    resolver.setRequired([
        'email',
        'password'
    ])

    // { email: 'tommy@powerrangers.com' }
    validate(event)
        
        // all good!
        .then((body) => console.log('passed!'))
        
        /*
            400 Bad Request
            {"message": "The required options \"password\" are missing"}
        */
        .catch((err) => response(err)) 
}
```

## Development

Install dependencies:

``` bash
npm install
```

## License
This boilerplate is open-sourced software licensed under the [MIT license](http://opensource.org/licenses/MIT) © [Frangeris Peguero](http://github.com/frangeris)
