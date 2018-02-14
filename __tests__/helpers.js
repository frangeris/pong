'use strict'
const {resolver, validate} = require('../generators/app/templates/helpers')

global.cb = (err, message) => message // eslint-disable-line

describe('helpers', () => {
  it('validate incorrect fields', () => {
    resolver.setRequired([
      'param1',
      'param2',
      'param3'
    ])

    return expect(validate({})).rejects.toBeDefined()
  })

  it('validate correct fields', () => {
    resolver.setRequired([
      'param1',
      'param2',
      'param3'
    ])

    return expect(validate({
      param1: 'value1',
      param2: 'value2',
      param3: 'value3'
    })).resolves.toBeUndefined()
  })

  xit('should generate a valid jwks-pem.json')
})
