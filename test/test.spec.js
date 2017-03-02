'use strict';

const inspect = require('inspect.js');
const sinon = require('sinon');

inspect.useSinon(sinon);

const Test = require('../src/test');

describe('Test', () => {
  describe('class', () => {
    it('instanciates a Test', () => {
      const test = new Test({
        left: { url: '/foo' },
        right: { url: '/foo' }
      });
      inspect(test).isObject();
      inspect(test).hasKeys([
        'left',
        'right',
        'state'
      ]);
    });
  });

  describe('run', () => {
    let test;
    beforeEach(() => {
      test = new Test({
        left: {
          method: 'GET',
          url: 'https://raw.githubusercontent.com/maxdome/dumpinator/develop/test/fixtures/v1/banana.json'
        },
        right: {
          method: 'GET',
          url: 'https://raw.githubusercontent.com/maxdome/dumpinator/develop/test/fixtures/v1/banana.json'
        },
        ignoreHeader: [
          'x-fastly-request-id',
          'x-served-by',
          'x-timer',
          'x-cache-hits',
          'date',
          'etag',
          'expires',
          'source-age'
        ]
      });
    });

    it('has a run() method', () => {
      inspect(test).hasMethod('run');
    });

    it('runs a test', () => {
      const p = test.run();
      inspect(p).isPromise();
      return p.then(() => {
        if (test.state === 'failed') {
          inspect(test.left.response.headers).isEql(test.right.response.headers);
          inspect(test.left.response.body).isEql(test.right.response.body);
        }

        inspect(test.state).isEql('passed');
      });
    });
  });
});
