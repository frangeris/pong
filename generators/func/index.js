'use strict'
const Generator = require('yeoman-generator')
const _ = require('lodash')
const yaml = require('js-yaml')
const fs = require('fs')
const mkdirp = require('mkdirp')
const path = require('path')
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
        this.log.error('serverless.yml NOT FOUND, for overwrite go inside a project.');
      }

      return files ? files[0] : './'
    }

    this.configFile = locate()
  }

  prompting () {
    return this.prompt([
      {
        type: 'input',
        name: 'url',
        message: 'Resource URL (can include parameters)',
        filter: value => {
          if (!value.startsWith('/')) {
            value = `/${value}`
          }
          return _.toLower(value)
        },
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
          this.resources = answers.url.split('/').filter(p => p !== '' && !p.match(/{|}/))
          if (answers.url.endsWith('}')) {
            this.byId = true
            by = ' by ' + answers.url.split(/[{}]/).filter(p => p !== '' && !p.includes('/')).pop()
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
    let handler = 'functions/'

    // Only when by resource
    if (this.byId) {
      filename = 'id'
    }

    // Name of lambda
    // handler += this.props.name;
    if (method === 'get' && this.props.nested.match(/By id/)) {
      lambda += '-id'
    }
    handler += `/${filename}.handler`

    console.log(method, filename, lambda, handler)

    /*
    // Build the configuration file
    if (this.props.nested.match(/By id/)) {
      dest += this.props.name;
    } else if (this.props.nested.match(/Nested/)) {
      // Nested
      lambda += `-${this.currentDir}`;
      handler += `${this.currentDir}/`;
      dest = this.props.name;
    } else {
      dest += this.props.name;
    }



    try {
      // Substract the url path
      let nestedPath = this.props.nested.match(`"(.*)"`);
      let urlPath = nestedPath ? nestedPath[1] : this.props.name;

      // Start overwrite config file
      let serverless = yaml.safeLoad(fs.readFileSync(this.configFile, 'utf8'));
      let http = {
        method: _.toUpper(this.props.method),
        path: urlPath
      };

      // Enable cors by default
      http.cors = true;

      serverless.functions[lambda] = {
        name: `${serverless.service}-${lambda}`,
        description: this.props.description,
        handler,
        events: [
          {
            http
          }
        ]
      };

      fs.writeFile(
        this.configFile,
        yaml.safeDump(serverless),
        () => this.log.ok(`${_.toUpper(method)} ${urlPath} for "${lambda}" function generated successfully`)
      );
    } catch (ex) {
      this.log.error('Could not read/write serverless.yml file.');
    }

    // Create function handler
    mkdirp(dest);
    this.fs.copyTpl(
      this.templatePath('handler.js'),
      this.destinationPath(`${dest}/${filename}.js`),
      {
        lambda,
        method,
        path: (this.props.nested.match(/Nested/)) ? '../../..' : '../..'
      }
    );
    */
  }
};
