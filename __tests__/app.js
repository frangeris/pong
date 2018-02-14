'use strict'
const path = require('path')
const assert = require('yeoman-assert')
const helpers = require('yeoman-test')

describe('serverless-boilerplate:app', () => {
  beforeEach(() => {
    return helpers.run(path.join(__dirname, '../generators/app'))
  })

  // validate structure
  it('generate base files', () => {
    assert.file([
      '.vscode',
      'functions',
      'helpers',
      'templates',
      'tests',
      '.env.yml.example',
      '.gitignore',
      'LICENSE',
      'package.json',
      'README.md',
      'serverless.yml'
    ])
  })
})
