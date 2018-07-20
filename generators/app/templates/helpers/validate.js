const yaml = require('js-yaml')
const fs = require('fs')
const Ajv = require('ajv')

var ajv = new Ajv({ allErrors: true, jsonPointers: true })
const errors = err => ({ error: err.keyword, path: err.dataPath || '/', message: err.message })
module.exports = (payload, schemaPath) => {
  let schema = yaml.safeLoad(fs.readFileSync(schemaPath, 'utf8'))
  return {
    valid: ajv.validate(schema, payload),
    errors: ajv.errors ? ajv.errors.map(errors) : null
  }
}
