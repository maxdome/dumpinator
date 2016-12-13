'use strict';

const inspect = require('inspect.js');
const sinon = require('sinon');
const Request = require('../src/request');

inspect.useSinon(sinon);

describe('Request', () => {
  describe('load()', () => {
    it.skip('returns a correct output', function () {
      this.timeout(5000);
      const req = new Request();
      const options = {
        url: 'https://api.github.com/users/maxdome/repos'
      };

      return req.load(options)
        .then((res) => {
          inspect(res).isObject();
          inspect(res).hasKeys(['headers', 'body']);
        });
    });
  });
});
