'use strict';
const path = require('path');
const assert = require('yeoman-assert');
const helpers = require('yeoman-test');

describe('serverless-boilerplate:app', () => {
  beforeEach(() => {
    return helpers.run(path.join(__dirname, '../generators/app'));
  });

  // Validate structure
  it('generate base files', () => {
    assert.file([
      'functions',
      'helpers',
      'templates',
      'tests',
      '.env.yml.example',
      '.gitignore',
      'boilerplate-logo.svg',
      'LICENSE',
      'package.json',
      'README.md',
      'serverless.yml'
    ]);
  });
});
