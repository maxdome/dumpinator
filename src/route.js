'use strict';

const co = require('co');

const Request = require('./request');

class Route {
  constructor(conf) {
    Object.assign(this, conf);
    this.state = 'pending';
    this.verbose = conf.verbose || false;
  }

  load() {
    return co(function* loadGen() {
      const request = new Request({
        verbose: this.verbose,
        timeout: 10000 || this.timeout
      });

      const route = {
        method: this.method,
        url: this.url,
        query: this.query,
        body: this.body,
        header: this.header
      };

      let response;
      try {
        this.state = 'downloading';
        response = yield request.load(route);
        this.state = 'downloaded';
      } catch (err) {
        this.state = 'download-failed';
        this.message = err.message;
        return null;
      }

      return response;
    }.bind(this));
  }

  extendResponse(response, test) {
    response.meta.expectedStatus = test.status;
    return response;
  }
}

module.exports = Route;
