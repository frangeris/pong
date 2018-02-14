/**
 * response() helper follow the specification "JSON API"
 * For more information, visit: http://jsonapi.org/format/
 */

module.exports = function () {
  // status code or error are required
  if (!arguments.length) {
    throw new Error('Invalid arguments supplied for response')
  }

  // default values
  let statusCode = null
  let headers = {
    // required for CORS using lambda-proxy
    'Access-Control-Allow-Origin': '*',

    // required for cookies, authorization headers with HTTPS
    'Access-Control-Allow-Credentials': true
  }

  let body = {
    data: null
  }

  // determinate the type of the args
  for (let arg of Array.from(arguments)) {
    switch (typeof (arg)) {
      case 'number':
        statusCode = arg
        break
      case 'object':
        if (arg instanceof Error) {
          statusCode = statusCode || 400
          delete body.data
          body.error = {
            title: arg.message || 'Bad Request',
            meta: {
              // aws id request
            }
          }
        } else {
          statusCode = statusCode || 200
          body.data = arg
        }
        break
    }
  }

  body = JSON.stringify(body)

  /* global cb */
  return cb(null, { statusCode, body, headers })
}
