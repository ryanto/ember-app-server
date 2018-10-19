let debug = require('debug')('fastboot');
let path = require('path');
let exec = require('child_process').exec;

class CLI {

  constructor(options) {
    this.path = options.path;
  }

  async build() {
    debug('starting build');
    await this.exec(`ember build --output-path=${this.path}`);
    debug('finished building');
  }

  get distPath() {
    return path.join(process.cwd(), this.path);
  }

  async exec(command) {
    return await new Promise((resolve, reject) => {
      exec(command, (error, stdout, stderr) => {
        if (error) {
          reject(error);
        } else {
          resolve();
        }
      });
    });
  }

}

module.exports = CLI;
