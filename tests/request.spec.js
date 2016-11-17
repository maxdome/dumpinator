'use strict';

const inspect = require('inspect.js');
const sinon = require('sinon');
const Request = require('../src/request');

inspect.useSinon(sinon);

describe('Request', function() {
  describe('load()', function() {
    it('returns a correct output', function(done) {
      this.timeout(5000);
      const req = new Request();
      const options = {
        url: 'https://api.github.com/users/maxdome/repos'
      };

      req.load(options)
        .then((res) => {
          inspect(res).isObject();
          inspect(res).hasKeys(['headers', 'body']);
          done();
        });
    });
  });
});
