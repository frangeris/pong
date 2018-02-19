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
    'Access-Control-Allow-Credentials': true,
    'Content-Type': 'application/vnd.api+json'
  }

  // determinate the type of the args
  let body = {}
  for (let arg of Array.from(arguments)) {
    switch (typeof (arg)) {
      case 'number':
        statusCode = arg
        break
      case 'object':
        if (statusCode === 400 || arg instanceof Error) {
          body.errors = arg
        } else {
          body.data = arg
        }
        break
    }
  }

  body = JSON.stringify(body)

  /* global cb */
  return cb(null, { statusCode, body, headers })
}
