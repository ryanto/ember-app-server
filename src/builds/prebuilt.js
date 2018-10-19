let path = require('path');

class Prebuilt {

  constructor(options) {
    this.path = options.path;
  }

  async build() {
    return Promise.resolve();
  }

  get distPath() {
    return path.join(process.cwd(), this.path);
  }
}

module.exports = Prebuilt;
