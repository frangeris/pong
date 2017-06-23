'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('serverless-boilerplate:function', () => {
  beforeEach(done => {
    helpers
      .run(path.join(__dirname, '../generators/function'), {
        tmpir: false
      })
      .withPrompts({
        method: 'GET',
        name: 'users'
      })
      .withGenerators([
        [helpers.createDummyGenerator(), '../generators/app']
      ])
      .on('end', done);
  });

  it('generate GET method', () => {
    assert.file('functions/users/get.js');
  });
});
