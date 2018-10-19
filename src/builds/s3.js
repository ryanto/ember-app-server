let debug = require('debug')('fastboot');

// based on tom's s3 downloader

let rp = require('request-promise-native');
let request = require('request');
let fs = require('fs');
let path = require('path');
let fsp  = require('fs-promise');
let exec = require('child_process').exec;

class S3 {

  constructor(options) {
    this.options = options;
  }

  async build() {
    this.info = await this.fetchInfo();

    await this.removeOldApp();
    await fsp.ensureDir('tmp');
    await this.download();
    await this.unzip();
    await this.installNPMDependencies();
  }

  get zipPath() {
    return `tmp/${path.basename(this.info.key)}`;
  }

  get distPath() {
    let name = path.basename(this.zipPath, '.zip');
    let distPath = name.split('-').slice(0, -1).join('-');

    return path.join(process.cwd(), `tmp/${distPath}`);
  }

  async fetchInfo() {
    let { bucket, deployInfo } = this.options;
    let url = `https://s3.amazonaws.com/${bucket}/${deployInfo}`;

    debug('fetching deploy info', url);

    let data = await rp(url);
    let info = JSON.parse(data);

    debug('deploy info', info);

    return info;
  }

  async removeOldApp() {
    debug('removing old dist path', this.distPath);
    await fsp.remove(this.distPath);
  }

  async download() {
    await new Promise((res, rej) => {
      let key = this.info.key;
      let bucket = this.options.bucket;

      let zipPath = this.zipPath;
      let file = fs.createWriteStream(zipPath);

      let url = `https://s3.amazonaws.com/${bucket}/${key}`;

      debug('downloading archive', url);

      request(url)
        .pipe(file)
        .on('close', res)
        .on('error', rej);
    });
  }

  async unzip() {
    debug('unzipping archive', this.zipPath);
    await this.exec('unzip ' + this.zipPath + ' -d tmp');
  }

  async installNPMDependencies() {
    debug('installing npm dependencies');
    await this.exec(`cd ${this.distPath} && npm install`);
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

module.exports = S3;
