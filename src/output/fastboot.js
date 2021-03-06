class FastbootOutput {
  constructor(appServer) {
    this.appServer = appServer;
  }

  async generate(req, res) {
    let fastboot = this.appServer.fastboot;
    let fastbootResult;
    let result = {};

    try {
      fastbootResult = await fastboot.visit(req.originalUrl, {
        request: req,
        response: res
      });

      // console.log(fastbootResult);

      result.error = fastbootResult.error;
      result.statusCode = fastbootResult.statusCode;

    } catch(error) {
      result = { error };
    }

    // if we get a 200 lets start unpacking the fastboot object
    if (fastbootResult.statusCode >= 200) {
      result.html = await fastbootResult.html();

      let headerKeys = Array.from(fastbootResult.headers.keys());

      result.headers = headerKeys.reduce((dict, key) => {
        dict[key] = fastbootResult.headers.get(key);
        return dict;
      }, {});
    }

    return result;
  }
}

module.exports = FastbootOutput;
