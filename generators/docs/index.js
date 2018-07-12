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
        message: 'AWS Api Gateway Api (id):',
        validate: value => {
          return !_.isEmpty(value)
        }
      }
    ])
    .then(answers => (this.props = answers))
  }

  async writing () {
    // serverless.yml
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
      let doc = response.data
      doc.definitions = {}

      // jwt auth
      doc.securityDefinitions = {
        JWT: {
          type: 'apiKey',
          in: 'header',
          name: 'JWT Token'
        }
      }

      // iterate over paths
      for (let path in doc.paths) {
        for (let method in doc.paths[path]) {
          // remove options method
          if (method === 'options') {
            delete doc.paths[path].options
            continue
          }

          let parameters = []
          let schema = {}
          let resources = path.match(/(\w+)(?![^{]*\})/g)
          let name = `${method}-${resources.join('-')}`
          let params = path.match(/{([^}]+)}/g)

          // @TODO: resource by
          // only serverless functions
          /*
          if (!payload.functions[name]) {
            continue
          }
          */

          // append path parameters
          if (params) {
            for (let name of params) {
              parameters.push(
                {
                  in: 'path',
                  name: name.replace(/\{|\}/g, ''),
                  required: true,
                  type: 'string'
                }
              )
            }
          }

          // does it have schema?
          let exists = fs.existsSync(`./schemas/${name}.json`)
          if (exists) {
            let data = fs.readFileSync(`./schemas/${name}.json`, 'utf8')
            schema = JSON.parse(data)

            // add schema to definitions
            doc.definitions[name] = schema
          }

          // parameters by method
          let param = {}
          switch (method.toUpperCase()) {
            case 'PATCH':
            case 'PUT':
            case 'POST':
              param = {
                in: 'body',
                required: true,
                name: 'body',
                description: `object`
              }

              if (exists) {
                param.schema = {
                  '$ref': `#/definitions/${name}`
                }
              }
              parameters.push(param)
              break
            case 'DELETE':
            case 'GET':
              // @TODO: move to general, post can have query parameters
              // iterate all parameters
              if (exists) {
                for (let query in schema.properties) {
                  parameters.push(
                    {
                      in: 'query',
                      name: query,
                      required: schema.required.includes(query),
                      type: 'string'
                    }
                  )
                }
              }
              break
          }

          let tags = resources.length ? [resources[0]] : []
          doc.paths[path][method] = {
            tags,
            parameters,
            responses: {
              200: {
                description: 'Ok'
              },
              204: {
                description: 'Ok, But No Content'
              },
              400: {
                description: 'Validation Error'
              },
              401: {
                description: 'Unauthorized'
              },
              403: {
                description: 'Missing Authentication Token'
              },
              502: {
                description: 'Internal Server Error'
              }
            }
          }

          // @HOTFIX: issue with [resources]-id
          const func = payload.functions[name]
          if (func) {
            // Add description as summary
            if (func.description) {
              doc.paths[path][method].summary = func.description
            }

            // is it secured?
            const events = func.events
            let index = events.findIndex(event => event.http)
            if (events[index].authorizer) {
              doc.paths[path][method].security = [
                { JWT: [] }
              ]
            }
          }
        }
      }

      fs.writeFile(this.destinationPath('docs/swagger.json'), JSON.stringify(doc), () => this.log.ok(`Swagger docs generated`))
    } catch (err) {
      this.log.error(err.message)
    }
  }
}
