'use strict'
const Generator = require('yeoman-generator')
const fs = require('fs')
const glob = require('glob')
const yaml = require('js-yaml')
const _ = require('lodash')
const AWS = require('aws-sdk')
const axios = require('axios')
const aws4 = require('aws4')
const mkdirp = require('mkdirp')

module.exports = class extends Generator {
  initializing () {
    this.props = {}

    // find conf file
    let locate = () => {
      let files = glob.sync('{./,../,../../,../../../}/serverless.yml', {
        nodir: true,
        realpath: true
      })

      if (!files) {
        this.log.error('serverless.yml file, invalid serverless project.')
      }

      return files ? files[0] : './'
    }

    this.serverless = locate()
  }
  prompting () {
    return this.prompt([
      {
        type: 'input',
        name: 'id',
        message: 'Rest api id',
        validate: value => {
          return !_.isEmpty(value)
        }
      }
    ])
    .then(answers => (this.props = answers))
  }

  async writing () {
    let payload = yaml.safeLoad(fs.readFileSync(this.serverless, 'utf8'))

    // get aws credentials
    let config = new AWS.Config()

    // sign request
    let { accessKeyId, secretAccessKey } = config.credentials
    let opts = {
      path: `/restapis/${this.props.id}/stages/${payload.provider.stage}/exports/swagger?extensions=postman`,
      service: 'apigateway',
      region: payload.provider.region,
      headers: {
        Accept: 'application/json'
      }
    }
    aws4.sign(opts, { accessKeyId, secretAccessKey })

    // request
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = false
    let request = {
      method: 'GET',
      baseURL: `https://apigateway.${payload.provider.region}.amazonaws.com`,
      url: opts.path,
      headers: opts.headers
    }
    try {
      // create docs folder
      mkdirp(this.destinationPath('docs'))
      let response = await axios(request)
      fs.writeFile(this.destinationPath('docs/swagger.json'), JSON.stringify(response.data), () => this.log.ok(`Swagger docs generated`))
    } catch (err) {
      this.log.error(err.message)
    }
  }
}
