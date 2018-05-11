'use strict'
const validate = require('../../generators/app/templates/helpers/validate')
const path = require('path')

describe('validate helper', () => {
  it('should return error when no parameters', () => {
    let check = () => validate()
    expect(check).toThrowError()
  })

  it('should validate against schema', () => {
    let check = validate({}, path.join(__dirname, 'schema.json'))
    expect(check).toHaveProperty('valid')
    expect(check).toHaveProperty('errors')
    expect(check.valid).toBeFalsy()
  })
})
