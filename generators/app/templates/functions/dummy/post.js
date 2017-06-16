'use strict';
const { validate, resolver, response } = require('../../helpers')

module.exports.handler = (event, context, callback) => {

	// needed for response scope
	global.cb = callback
	let body = JSON.parse(event.body)

	// field validations
	resolver.setRequired([
		'email',
		'password',
	])

	// pass validation?
	validate(body)
		.then(() => {
			response('works', 201)
		})
		.catch((err) => {

			// validation fail
			response(new Error(err))
		})
}
