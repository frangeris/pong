'use strict'
const response = require('../generators/app/templates/helpers/response')

// eslint-disable-next-line
global.cb = (err, message) => message;

describe('response helper', () => {
  it('should return OK', () => {
    let result = response(200)
    expect(result).toHaveProperty('body')
    expect(JSON.parse(result.body)).toHaveProperty('data')
    expect(result).toHaveProperty('headers')
    expect(result).toHaveProperty('statusCode')
    expect(result.statusCode).toBe(200)
  })

  it('should return Bad Request', () => {
    let result = response(new Error('invalid'))
    expect(result).toHaveProperty('body')
    expect(JSON.parse(result.body)).toHaveProperty('error')
    expect(result).toHaveProperty('headers')
    expect(result).toHaveProperty('statusCode')
    expect(result.statusCode).toBe(400)
  })

  it('should return Unauthorized', () => {
    let result = response(401, new Error('invalid'))
    expect(result).toHaveProperty('body')
    expect(JSON.parse(result.body)).toHaveProperty('error')
    expect(result).toHaveProperty('headers')
    expect(result).toHaveProperty('statusCode')
    expect(result.statusCode).toBe(401)
  })
})
