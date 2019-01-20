let debug = require('debug')('fastboot');
let express = require('express');

let makeMiddleware = function(fastboot) {
  let publicFolder = express.static(fastboot.distPath, { index: false });

  let handoffError = function(error, req, res, next) {
    debug('fastboot error', error.message);
    let status = error.name === 'UnrecognizedURLError' ? 404 : 500;
    res.status(status);
    next(error);
  }

  let fastbootMiddleware = async function(req, res, next) {
    let path = req.originalUrl;

    try {
      let result = await fastboot.visit(path, { request: req, response: res });

      for (let [ header, value ] of result.headers.entries()) {
        debug('setting header', header, value)
        res.set(header, value);
      }

      if (result.error) {
        handoffError(result.error, req, res, next);

      } else {
        let body = await result.chunks();

        debug('serving fastboot response', result.statusCode);
        res.status(result.statusCode);

        body.forEach(chunk => {
          debug('writing body chunk', chunk.length);
          res.write(chunk);
        });

        res.end();
      }

    } catch(error) {
      handoffError(error, req, res, next);
    }

  };

  return [publicFolder, fastbootMiddleware];
};

module.exports = makeMiddleware;
