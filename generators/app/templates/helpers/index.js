const __async__ = require('asyncawait/async')
const __await__ = require('asyncawait/await')
const optionsResolver = require('options-resolver')
const resolver = optionsResolver();

// apply validations using options resolver
let validate = __async__((event) => {
  __await__(resolver.resolve(event))
})

// @depretated: use response.js helper instead
let response = (message = 'Request processed successfully', statusCode = undefined, body = {}, headers = {}) => {

  // @TODO: add support for return awsRequestId
  // requestId: context.awsRequestId,

  let status = statusCode ? statusCode : 200

  // is it an Error?
  if (message instanceof Error) {
    status = 400
    message = message.message
  }

  body.message = message
  body = JSON.stringify(body)

  // return integration response
  return cb(null, { statusCode: status, body, headers })
}

module.exports = { validate, resolver, response }
