const handler = require(process.argv[2])
const yaml = require('js-yaml')
const fs = require('fs')

try {
  // load env vars
  let vars = yaml.safeLoad(fs.readFileSync(process.argv[4] + '/.env.yml', 'utf8'))
  process.env = vars.develop

  // run lambda
  let context = {
    callbackWaitsForEmptyEventLoop: null
  }
  let event = require('./event.json')
  event.body = JSON.stringify(event.body)
  handler.handler(event, context, (err, response) => {
    console.dir(response.body)
    process.exit()
  })
} catch (err) {
  console.log(err)
}
