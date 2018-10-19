let path = require('path');
let fs = require('fs');
let AppServer = require('../src/app-server');
let chai = require('chai');
let chaiHttp = require('chai-http');
let expect = chai.expect;
chai.use(chaiHttp);

describe('Client app middleware', function() {
  let emberApp;
  let helloWorldPath = 'test-projects/scenario-1-hello-world-app/dist';

  beforeEach(() => {
    emberApp = new AppServer({
      workers: 0,
      build: {
        name: 'prebuilt',
        path: helloWorldPath
      }
    });
  });

  it('should expose a middleware function', async function() {
    let { middleware } = await emberApp.prepare();

    expect(middleware.clientApp).to.exist;
  });

  it('should expose a middleware that serves the ember apps index', async function() {
    let { app, middleware } = await emberApp.prepare();
    app.use(middleware.clientApp);

    let res = await chai.request(app).get('/')
    let indexHtml = fs.readFileSync(path.join(helloWorldPath, 'index.html'));

    expect(res.status).to.equal(200);
    expect(res.text).to.equal(indexHtml.toString());
  });

  it('should serve an ember app', async function() {
    let { app, middleware } = await emberApp.prepare();
    app.use(middleware.clientApp);

    let res = await chai.request(app).get('/')

    expect(res.status).to.equal(200);
    expect(res.text).to.include('<script src="/assets/vendor.js"></script>');
    expect(res.text).to.include('<link integrity="" rel="stylesheet" href="/assets/vendor.css">');
  });

  it('should serve an ember app for any url', async function() {
    let { app, middleware } = await emberApp.prepare();
    app.use(middleware.clientApp);

    let res = await chai.request(app).get('/some/route/here')

    expect(res.status).to.equal(200);
    expect(res.text).to.include('<script src="/assets/vendor.js"></script>');
    expect(res.text).to.include('<link integrity="" rel="stylesheet" href="/assets/vendor.css">');
  });

  it('should serve assets', async function() {
    let { app, middleware } = await emberApp.prepare();
    app.use(middleware.clientApp);

    let res = await chai.request(app).get('/assets/vendor.js');

    expect(res.status).to.equal(200);
    expect(res.type).to.equal('application/javascript');
  });

  it('should block live reload', async function() {
    let { app, middleware } = await emberApp.prepare();
    app.use(middleware.clientApp);

    let res = await chai.request(app).get('/ember-cli-live-reload.js');

    expect(res.notFound).to.be.true;
  });
});
