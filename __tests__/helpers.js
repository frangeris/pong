'use strict';
const {resolver, validate, response} = require('../generators/app/templates/helpers');

// eslint-disable-next-line
global.cb = (err, message) => message;

describe('helpers', () => {
  it('validate incorrect fields', () => {
    resolver.setRequired([
      'param1',
      'param2',
      'param3'
    ]);

    return expect(validate({})).rejects.toBeDefined();
  });

  it('validate correct fields', () => {
    resolver.setRequired([
      'param1',
      'param2',
      'param3'
    ]);

    return expect(validate({
      param1: 'value1',
      param2: 'value2',
      param3: 'value3'
    })).resolves.toBeUndefined();
  });

  it('should return valid response', () => {
    let result = response();
    expect(result).toHaveProperty('body');
    expect(result).toHaveProperty('headers');
    expect(result).toHaveProperty('statusCode');
    expect(result.statusCode).toBe(200);
  });

  it('should return invalid response', () => {
    let result = response(new Error('invalid'));
    expect(result).toHaveProperty('body');
    expect(result).toHaveProperty('headers');
    expect(result).toHaveProperty('statusCode');
    expect(result.statusCode).toBe(400);
  });

  xit('should generate a valid jwks-pem.json');
});
