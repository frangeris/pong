'use strict'
const Generator = require('yeoman-generator')
const _ = require('lodash')
const yaml = require('js-yaml')
const fs = require('fs')
const mkdirp = require('mkdirp')
const glob = require('glob')

module.exports = class extends Generator {
  initializing () {
    this.props = {}
    this.id = null
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
            this.id = answers.path.split(/[{}]/).filter(p => p !== '' && !p.includes('/')).pop()
            by = ' by ' + this.id
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

    // by only when GET and id
    if (this.id && method === 'get') {
      filename = 'by'
      lambda += `-${filename}`
    }

    // build the configuration file
    try {
      // create function handler
      let destination = `functions/${folders.join('/')}`
      mkdirp(destination)
      let handler = `${destination}/${filename}.handler`
      this.fs.copyTpl(
        this.templatePath('handler'),
        this.destinationPath(`${destination}/${filename}.js`),
        {
          lambda,
          method,
          path: '../'.repeat(folders.length + 1)
        }
      )

      // overwrite serverless.yml
      let serverless = yaml.safeLoad(fs.readFileSync(this.configFile, 'utf8'))
      let name = typeof serverless.service === 'object' ? serverless.service.name : serverless.service
      serverless.functions[lambda] = {
        name: `${name}-${lambda}`,
        description: this.props.description,
        handler,
        events: [{
          http: {
            method: _.toUpper(this.props.method),
            path: this.props.path,
            cors: true
          }
        }]
      }

      // write the file
      fs.writeFile(
        this.configFile,
        yaml.safeDump(serverless),
        () => this.log.ok(`${_.toUpper(method)} ${this.props.path} ► ${handler} (${lambda})`)
      )
    } catch (err) {
      this.log.error(`Error: ${err.message}`)
    }
  }
}
