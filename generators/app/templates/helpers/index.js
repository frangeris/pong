const async = require('asyncawait/async')
const await = require('asyncawait/await')
const optionsResolver = require('options-resolver')
const resolver = optionsResolver();

// apply validations using options resolver
let validate = async ((event) => {
    await (resolver.resolve(event))
})

let hello = () => {
  console.log('works')
}

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
    cb(null, { statusCode: status, body, headers })
}

module.exports = { validate, resolver, response }
