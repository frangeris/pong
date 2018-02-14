'use strict'
const path = require('path')
const assert = require('yeoman-assert')
const helpers = require('yeoman-test')

describe('pong:app', () => {
  beforeEach(() => {
    return helpers.run(path.join(__dirname, '../generators/app'))
  })

  // validate structure
  it('generate base files', () => {
    assert.file([
      '__tests__',
      '.vscode',
      'functions',
      'helpers',
      'templates',
      '.env.yml.example',
      '.gitignore',
      'LICENSE',
      'package.json',
      'README.md',
      'serverless.yml'
    ])
  })
})
