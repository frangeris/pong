'use strict'
const Generator = require('yeoman-generator')
const _ = require('lodash')
const yaml = require('js-yaml')
const fs = require('fs')
const mkdirp = require('mkdirp')
const glob = require('glob')

module.exports = class extends Generator {
  initializing () {
    // this.currentDir = path.basename(process.cwd());
    this.props = {}
    this.byId = false
    this.resources = []

    // Find conf file
    let locate = () => {
      let files = glob.sync('{./,../,../../,../../../}/serverless.yml', {
        nodir: true,
        realpath: true
      })

      if (!files) {
        this.log.error('serverless.yml NOT FOUND, for overwrite go inside a project.')
      }

      return files ? files[0] : './'
    }

    this.configFile = locate()
  }

  prompting () {
    return this.prompt([
      {
        type: 'input',
        name: 'path',
        message: 'Path (can include parameters)',
        filter: value => (!value || !value.startsWith('/')) ? `/${value}` : _.toLower(value),
        validate: value => {
          // @TODO: cant have special chars
          return !_.isEmpty(value)
        }
      },

      {
        type: 'list',
        name: 'method',
        message: 'Which HTTP method?',
        choices: () => {
          return [
            'GET',
            'POST',
            'PUT',
            'DELETE',
            'HEAD',
            'CONNECT',
            'OPTIONS',
            'PATH'
          ]
        },
        filter: _.toLower
      },
      {
        type: 'input',
        name: 'description',
        message: 'Your function description',
        default: answers => {
          let by = ''
          this.resources = answers.path.split('/').filter(p => p !== '' && !p.match(/{|}/))
          if (answers.path.endsWith('}')) {
            this.byId = true
            by = ' by ' + answers.path.split(/[{}]/).filter(p => p !== '' && !p.includes('/')).pop()
          }

          return `${_.capitalize(answers.method)} ${this.resources.join(' ')}${by}`
        }
      }
    ]).then(answers => {
      this.props = answers
    })
  }

  writing () {
    let method = `${this.props.method}`
    let filename = method
    let lambda = `${method}-${this.resources.join('-')}`
    let folders = this.props.path.match(/[\w]+(?![^{]*\})/g)

    // only when by resource
    if (this.byId) {
      filename = 'id'
    }

    // Name of lambda
    // handler += this.props.name;
    if (method === 'get' && this.byId) {
      lambda += '-id'
    }

    // build the configuration file
    try {
      let http = {
        method: _.toUpper(this.props.method),
        path: this.props.path,
        cors: true
      }

      // create function handler
      mkdirp(folders)
      this.fs.copyTpl(
        this.templatePath('handler'),
        this.destinationPath(`${folders}/${filename}.js`),
        {
          lambda,
          method,
          path: '../'.repeat(folders.length)
        }
      )

      // overwrite serverless.yml
      let serverless = yaml.safeLoad(fs.readFileSync(this.configFile, 'utf8'))
      serverless.functions[lambda] = {
        name: `${serverless.service}-${lambda}`,
        description: this.props.description,
        handler: `functions/${folders.join('/')}/${filename}.handler`,
        events: [{ http }]
      }

      // write the file
      fs.writeFile(
        this.configFile,
        yaml.safeDump(serverless),
        () => this.log.ok(`${_.toUpper(method)} ${this.props.path} for "${lambda}"`)
      )
    } catch (error) {
      this.log.error('Could not read/write serverless.yml file.')
    }
  }
}
