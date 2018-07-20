const { MongoClient } = require('mongodb')
const response = require('./response').default

let mongodb = () => {
  return MongoClient.connect(process.env.MONGO_URI).catch(err => response(Error(err)))
}

module.exports = {
  mongodb
}
