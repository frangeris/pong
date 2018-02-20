'use strict'
const response = require('../generators/app/templates/helpers/response')

// eslint-disable-next-line
global.cb = (err, payload) => payload

describe('response helper', () => {
  it('should return OK', () => {
    let result = response(200)
    expect(result).toHaveProperty('body')
    expect(JSON.parse(result.body)).toHaveProperty('data')
    expect(result).toHaveProperty('headers')
    expect(result).toHaveProperty('statusCode')
    expect(result.statusCode).toBe(200)
  })

  it('should return not errors bad request', () => {
    let result = response(400)
    expect(result).toHaveProperty('body')
    expect(result).toHaveProperty('headers')
    expect(result).toHaveProperty('statusCode')
    expect(result.statusCode).toBe(400)
  })

  it('should return errors bad request', () => {
    let result = response(400, [])
    expect(result).toHaveProperty('body')
    expect(JSON.parse(result.body)).toHaveProperty('errors')
    expect(result).toHaveProperty('headers')
    expect(result).toHaveProperty('statusCode')
    expect(result.statusCode).toBe(400)
  })

  it('should return unauthorized', () => {
    let result = response(401, new Error('Invalid Error'))
    let body = JSON.parse(result.body)
    expect(result).toHaveProperty('body')
    expect(result).toHaveProperty('headers')
    expect(result).toHaveProperty('statusCode')
    expect(body).toHaveProperty('errors')
    expect(body.errors).toContainEqual({ title: 'Invalid Error' })
    expect(result.statusCode).toBe(401)
  })
})
