let debug = require('debug')('fastboot');
let builds = require('./builds');
let FastBoot = require('fastboot');
let express = require('express');
let cluster = require('cluster');
let clientAppMiddleware = require('./middleware/client-app');
let fastbootMiddleware = require('./middleware/fastboot');
let ClientAppOutput = require('./output/client-app');
let FastbootOutput = require('./output/fastboot');

class AppServer {
  constructor(options) {
    let defaults = {
      workers: 4
    };

    this.options = Object.assign(defaults, options);
    this.builder = new builds[this.options.build.name](this.options.build);
  }

  async prepare() {
    let hasWorkers = this.options.workers > 0;
    let isParent = cluster.isMaster;

    if (isParent) {
      await this.build();
    }

    if (isParent && hasWorkers) {
      this.fork();
      // master node with workers never resolves, it will sit here
      // and let the workers serve the app.
      return new Promise(resolve => {});

    } else {
      let appServer = this;

      debug('ready', process.pid);

      return {
        app: this.expressApp,
        middleware: {
          get fastbootApp() {
            return fastbootMiddleware(appServer.fastboot);
          },
          get clientApp() {
            return clientAppMiddleware(appServer.distPath);
          }
        },
        output: {
          fastboot: new FastbootOutput(appServer),
          clientApp: new ClientAppOutput(appServer),
        },
        config: {
          get distPath() {
            return appServer.distPath;
          }
        }
      };
    }
  }

  async build() {
    debug('building app');
    await this.builder.build();
  }

  fork() {
    debug('forking workers');
    let { workers } = this.options;

    let workerEnv = {
      FASTBOOT_DIST_PATH: this.distPath
    };

    cluster.on('exit', () => {
      debug('restarting worker');
      cluster.fork(workerEnv);
    });

    for (let i = 0; i < workers; i++) {
      cluster.fork(workerEnv);
    }
  }

  get distPath() {
    return process.env.FASTBOOT_DIST_PATH || this.builder.distPath;
  }

  get fastboot() {
    if (!this._fastboot) {
      this._fastboot = new FastBoot({
        distPath: this.distPath,
        resilient: true
      });
    }

    return this._fastboot;
  }

  get expressApp() {
    let app = express();

    return app;
  }
}

module.exports = AppServer;
