'use strict'
const response = require('../../helpers/response')

module.exports.handler = (event, context, callback) => {
  global.cb = callback

  // see logs in AWS Cloudwatch
  console.log('<%= name %> <%= method %> http method')

  response(200)
};
