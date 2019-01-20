let fs = require('fs');
let AppServer = require('../src/app-server');
let chai = require('chai');
let chaiHttp = require('chai-http');
let expect = chai.expect;
chai.use(chaiHttp);

describe('Fastboot app middleware', function() {
  let emberApp;
  let fastbootAppPath = 'test-projects/scenario-2-fastboot/dist';

  beforeEach(() => {
    emberApp = new AppServer({
      workers: 0,
      build: {
        name: 'prebuilt',
        path: fastbootAppPath
      }
    });
  });

  it('should expose a middleware function', async function() {
    let { middleware } = await emberApp.prepare();

    expect(middleware.fastbootApp).to.exist;
  });

  it('should get the ember apps homepage from fastboot', async function() {
    let { app, middleware } = await emberApp.prepare();
    app.use(middleware.fastbootApp);

    let res = await chai.request(app).get('/');

    expect(res.status).to.equal(200);
    expect(res.text).to.include('<script src="/assets/vendor.js"></script>');
    expect(res.text).to.include('<link integrity="" rel="stylesheet" href="/assets/vendor.css">');
    expect(res.text).to.include('<h2 id="title">Congratulations, you made it!</h2>');
  });

  it('should get an ember route from fastboot', async function() {
    let { app, middleware } = await emberApp.prepare();
    app.use(middleware.fastbootApp);

    let res = await chai.request(app).get('/a-fastboot-route');

    expect(res.status).to.equal(200);
    expect(res.text).to.include('this route was rendered by fastboot');
  });

  it('should get a header set by fastboot', async function() {
    let { app, middleware } = await emberApp.prepare();
    app.use(middleware.fastbootApp);

    let res = await chai.request(app).get('/header-route');

    expect(res.status).to.equal(200);
    expect(res.get('x-from-fastboot')).to.equal('with love');
  });

  it('should get the status code from fastboot', async function() {
    let { app, middleware } = await emberApp.prepare();
    app.use(middleware.fastbootApp);

    let res = await chai.request(app).get('/not-found');

    expect(res.status).to.equal(404);
    expect(res.notFound).to.be.true;
  });

  it('should get a url that errors in fastboot', async function() {
    let { app, middleware } = await emberApp.prepare();
    app.use(middleware.fastbootApp);

    let res = await chai.request(app).get('/buggy-route');

    expect(res.status).to.equal(500);
    expect(res.text).to.include('ReferenceError: document is not defined');
  });

  it('should expose a function that renders a fastboot app', async function() {
    let { output } = await emberApp.prepare();

    let { statusCode, html } = await output.fastboot.generate({
      originalUrl: '/a-fastboot-route',
      headers: {
        cookie: ''
      }
    }, {});

    expect(statusCode).to.equal(200);
    expect(html).to.include('this route was rendered by fastboot');
  });

  it('should give an error when it cannot render a page', async function() {
    let { output } = await emberApp.prepare();

    let { error } = await output.fastboot.generate({
      originalUrl: '/buggy-route',
      headers: {
        cookie: ''
      }
    }, {});

    expect(error.message).to.include('document is not defined');
  });

  it('should serve assets', async function() {
    let { app, middleware } = await emberApp.prepare();
    app.use(middleware.fastbootApp);

    let res = await chai.request(app).get('/assets/vendor.js');

    expect(res.status).to.equal(200);
    expect(res.type).to.equal('application/javascript');
  });

  it('errors if trying to use a non fastboot app', async function() {
    let helloWorldPath = 'test-projects/scenario-1-hello-world-app/dist';
    let clientEmberApp = new AppServer({
      workers: 0,
      build: {
        name: 'prebuilt',
        path: helloWorldPath
      }
    });

    let { app, middleware } = await clientEmberApp.prepare();

    let message = `Couldn't find ${process.cwd()}/test-projects/scenario-1-hello-world-app/dist/package.json. You may need to update your version of ember-cli-fastboot.`;

    expect(() => app.use(middleware.fastbootApp))
      .to.throw(message);
  });

});
