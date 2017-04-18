'use strict';

const inspect = require('inspect.js');
const sinon = require('sinon');
const nock = require('nock');
const Request = require('../src/request');
const bananaResponse = require('./fixtures/v1/banana.json');

inspect.useSinon(sinon);

describe('Request', () => {
  before(() => {
    nock('https://api.github.com')
    .get('/users/maxdome/repos')
    .reply(200, bananaResponse);
  });

  after(() => {
    nock.restore();
  });

  describe('load()', () => {
    it('returns a correct output', function () {
      this.timeout(5000);
      const req = new Request();
      const options = {
        url: 'https://api.github.com/users/maxdome/repos'
      };

      return req.load(options)
      .then((res) => {
        inspect(res).isObject();
        inspect(res).hasKeys(['header', 'body']);
        inspect(res.meta).hasKeys(['status']);
        inspect(res.body).isEql({
          kind: 'fruit',
          color: 'yellow',
          properties: {
            price: 1.5,
            age: '3 days'
          },
          pieceOfDataBetween: {
            one: 1,
            two: 2,
            three: 3,
            four: 4,
            five: 5,
            six: 6,
            seven: 7,
            eight: 8,
            nine: 9,
            ten: 10,
            eleven: 11
          }
        });
      });
    });
  });
});
