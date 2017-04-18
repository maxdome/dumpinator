'use strict';

const inspect = require('inspect.js');
const sinon = require('sinon');
const ContractRequest = require('../src/contract-request');

inspect.useSinon(sinon);

describe('ContractRequest', () => {
  describe('load()', () => {
    it('returns a contract response', function () {
      this.timeout(5000);
      const req = new ContractRequest();
      const options = {
        contractFile: '../test/contracts/v1/banana.json'
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
