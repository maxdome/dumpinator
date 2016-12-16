'use strict';

const lodash = require('lodash');
const superagent = require('superagent');

class Request {
  constructor(config) {
    this.config = config || {};
    this.defaults = {
      method: 'GET'
    };
  }

  load(options) {
    options = lodash.extend(this.defaults, options);

    return new Promise((resolve, reject) => {
      this.req = superagent[options.method.toLowerCase()](options.url)
          .timeout(this.config.timeout)
          .set('User-Agent', 'Dumpinator');

      if (options.query) {
        this.req.query(options.query);
      }

      if (options.body) {
        this.req.send(options.body);
      }

      lodash.each(options.header, (val, key) => {
        this.req.set(key, val);
      });

      const timer = Date.now();
      this.req.end((err, res) => {
        const responseTime = Date.now() - timer;
        if (err && !res) {
          return reject(err);
        }

        return resolve({
          meta: this.getRequestMeta(res, responseTime),
          headers: res.header,
          body: /^application.+json/.test(res.type) ? res.body : JSON.stringify(res.text)
        });
      });
    });
  }

  getRequestMeta(res, responseTime) {
    return {
      status: res.status,
      error: res.error,
      responseTime
    };
  }
}

module.exports = Request;
