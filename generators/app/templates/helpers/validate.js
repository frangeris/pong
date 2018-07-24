const fs = require('fs')
const Ajv = require('ajv')

var ajv = new Ajv({ allErrors: true, jsonPointers: true })
module.exports = (payload, path) => {
  const schema = JSON.parse(fs.readFileSync(path, 'utf8'))
  if (!ajv.validate(schema, payload)) {
    throw ajv.errors.map(err => ({ error: err.keyword, path: err.dataPath || '/', message: err.message }))
  }
}
