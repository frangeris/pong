'use strict';
const Generator = require('yeoman-generator');
const path = require('path');
const mkdirp = require('mkdirp');
const _ = require('lodash');
const fs = require('fs');

// Normalize the name of project
function makeProjectName(name) {
  name = _.kebabCase(name);
  name = name.indexOf('api') === -1 ? name + '-api' : name;
  return name;
}

module.exports = class extends Generator {
  initializing() {
    this.props = {};
    try {
      fs.statSync(this.destinationPath('serverless.yml'));
      this.log('Project detected, updating the core instead...');
    } catch (ex) { }
  }

  prompting() {
    return this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Your project name',
        default: makeProjectName(path.basename(process.cwd())),
        filter: makeProjectName
      },
      {
        type: 'input',
        name: 'description',
        default: 'Serverless Restful API',
        message: 'Your project description'
      },
      {
        type: 'input',
        name: 'region',
        default: 'us-west-1',
        message: 'AWS API Gateway region'
      }
    ]).then(answers => {
      this.props = answers;
    });
  }

  defaults() {
    if (path.basename(this.destinationPath()) !== this.props.name) {
      this.log(
        'Your generator must be inside a folder named ' + this.props.name + '\n' +
        'I\'ll automatically create this folder.'
      );
      mkdirp(this.props.name);
      this.destinationRoot(this.destinationPath(this.props.name));
    }
  }

  writing() {
    // Copy normal files
    this.fs.copyTpl(
      this.templatePath(),
      this.destinationPath(),
      this.props
    );

    // Hidden files
    this.fs.copy(
      this.templatePath('.*'),
      this.destinationPath()
    );

    // Migrate .env vars
    this.fs.copy(
      this.templatePath('.env.yml.example'),
      this.destinationPath('.env.yml')
    );
  }

  install() {
    this.installDependencies({
      npm: true,
      bower: false
    });
  }
};
