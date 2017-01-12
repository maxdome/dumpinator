'use strict';

const lodash = require('lodash');
const superagent = require('superagent');

class Request {
  constructor(config) {
    config = config || {};
    this.verbose = config.verbose || false;
    this.timeout = config.timeout || 10000;
    this.defaults = {
      method: 'GET'
    };
  }

  load(options) {
    options = lodash.extend(this.defaults, options);

    return new Promise((resolve, reject) => {
      if (this.verbose) {
        console.log('[DEBUG] get route:', options.method, options.url); // eslint-disable-line no-console
      }

      this.req = superagent[options.method.toLowerCase()](options.url)
          .timeout(this.timeout)
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
          if (this.verbose) {
            console.log('[DEBUG] got error:', options.method, options.url, err); // eslint-disable-line no-console
          }
          return reject(err);
        }

        if (this.verbose) {
          console.log('[DEBUG] got response:', options.method, options.url, res.status, res.error); // eslint-disable-line no-console
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
