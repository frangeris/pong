/**
 * This helper follow the specification "JSON API"
 * For more information, visit: http://jsonapi.org/format/
 */

module.exports = function () {
  // status code or error are required
  if (!arguments.length) {
    throw new Error('Invalid arguments supplied for response')
  }

  // default http code
  let statusCode = null
  let headers = {
    // required for CORS using lambda-proxy
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Credentials': true,
    'Content-Type': 'application/vnd.api+json'
  }

  // determinate the type of the args
  let body = {
    data: null
  }

  for (let arg of Array.from(arguments)) {
    switch (typeof (arg)) {
      case 'number':
        statusCode = arg
        break
      case 'object':
        if (arg instanceof Error) {
          delete body.data
          statusCode = statusCode || 400
          body.errors = [{ title: arg.message }]
        } else if (statusCode === 400) {
          delete body.data
          statusCode = statusCode || 200
          body.errors = arg
        } else {
          statusCode = statusCode || 200
          body.data = arg
        }
        break
    }
  }

  body = process.env.NODE_ENV === 'develop' ? body : JSON.stringify(body)

  /* global cb */
  return cb(null, { statusCode, body, headers })
}
