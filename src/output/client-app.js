let path = require('path');
let fs = require('fs');

class ClientAppOutput {
  constructor(appServer) {
    this.appServer = appServer;
    this._html = null;
  }

  generate() {
    if (!this._html) {
      let distPath = this.appServer.distPath;
      let htmlFile = path.join(distPath, 'index.html');
      this._html = fs.readFileSync(htmlFile);
    }

    return {
      html: this._html
    };
  }
}

module.exports = ClientAppOutput;
