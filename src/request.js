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

      this.req.end((err, res) => {
        if (err) {
          return reject(err);
        }
        return resolve({
          headers: res.header,
          body: /^application.+json/.test(res.type) ? res.body : JSON.stringify(res.text)
        });
      });
    });
  }
}

module.exports = Request;
