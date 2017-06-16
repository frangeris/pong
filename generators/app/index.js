'use strict';
const Generator = require('yeoman-generator');
var path = require('path');
var mkdirp = require('mkdirp');

module.exports = class extends Generator {
  initializing() {
    this.props = {};
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

  prompting() {
    return this.prompt([
      {
        type: 'input',
        name: 'name',
        message: 'Your project name'
      },
      {
        type: 'input',
        name: 'description',
        message: 'Your project description'
      }
    ]).then(answers => {
      this.props = answers;
    });
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
