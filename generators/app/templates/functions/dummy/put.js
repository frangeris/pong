'use strict';
const { response } = require('../../helpers')

module.exports.handler = (event, context, callback) => {

  global.cb = callback

  // see logs in AWS Cloudwatch
  console.log('put http method')

  response('hello from dummy put')
};
