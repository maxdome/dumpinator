'use strict';

const inspect = require('inspect.js');
const sinon = require('sinon');
const nock = require('nock');

inspect.useSinon(sinon);

const Test = require('../src/test');
const bananaResponse = require('./fixtures/v1/banana.json');

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

    before(() => {
      nock('https://api.github.com')
      .get('/users/maxdome/repos')
      .times(99)
      .reply(200, 'bananaResponse');
    });

    after(() => {
      nock.restore();
    });

    beforeEach(() => {
      test = new Test({
        left: {
          method: 'GET',
          url: 'https://api.github.com/users/maxdome/repos'
        },
        right: {
          method: 'GET',
          url: 'https://api.github.com/users/maxdome/repos'
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
          inspect(test.left.response.header).isEql(test.right.response.header);
          inspect(test.left.response.body).isEql(test.right.response.body);
        }

        inspect(test.state).isEql('passed');
      });
    });

    it('runs a test with a transform method', () => {
      const fn = sinon.spy((data) => {
        const transformed = data;
        transformed.body = '{"foo":"bla"}';
        return transformed;
      });
      test.left.transform = fn;

      const p = test.run();
      inspect(p).isPromise();
      return p.then(() => {
        if (test.state === 'failed') {
          inspect(test.left.response.header).isEql(test.right.response.header);
        }

        inspect(test.state).isEql('failed');
        inspect(fn).wasCalledOnce();
        inspect(test.left.response.body).isEql('{"foo":"bla"}');
      });
    });
  });
});
