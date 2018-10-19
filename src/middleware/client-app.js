let path = require('path');
let express = require('express');
let isDev = process.env.NODE_ENV !== 'production';

let makeMiddleware = function(distPath) {
  // public server: assets and anything in dist
  let publicFolder = express.static(distPath, { index: false });

  // block live reload
  // if running this with a development ember app, there will be a request to live
  // reload, which this server doesnt support. In order to not cause confusion, we're
  // going to ignore that request.
  let blockLiveReload = function(req, res, next) {
    if (isDev && req.path === '/ember-cli-live-reload.js') {
      res.status(404);
      res.end();
    } else {
      next();
    }
  };

  // index.html: any html request will serve the ember app and let ember's router
  // do it's thing.
  let appIndex = function(req, res, next) {
    let htmlFile = path.join(distPath, 'index.html');
    res.sendFile(htmlFile);
  };

  return [publicFolder, blockLiveReload, appIndex];
};

module.exports = makeMiddleware;
