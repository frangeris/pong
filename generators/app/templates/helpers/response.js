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
  let statusCode = 200
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
        if (statusCode === 400) {
          delete body.data
          body.errors = arg
        } else if (arg instanceof Error) {
          delete body.data
          body.errors = [{ title: arg.message }]
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
