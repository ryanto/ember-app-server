let path = require('path');
let AppServer = require('../src/app-server');
let chai = require('chai');
let chaiHttp = require('chai-http');
let expect = chai.expect;
chai.use(chaiHttp);

describe('Express app', function() {
  let emberApp;
  let helloWorldPath = path.join(process.cwd(), 'test-projects', 'scenario-1-hello-world-app', 'dist');

  beforeEach(() => {
    emberApp = new AppServer({
      workers: 0,
      build: {
        name: 'prebuilt',
        path: helloWorldPath
      }
    });
  });

  it('should start an express server', async function() {
    let { app } = await emberApp.prepare();

    app.get('/hello-world', (req, res) => {
      res.send('hello world!');
    });

    let res = await chai.request(app).get('/hello-world')

    expect(res.status).to.equal(200);
    expect(res.text).to.equal('hello world!');
  });

});
