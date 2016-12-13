'use strict';

const inspect = require('inspect.js');
const sinon = require('sinon');
const EventEmitter = require('events');

inspect.useSinon(sinon);

const Dumpinator = require('../src/dumpinator');
const Config = require('../src/config');

describe('Dumpinator', () => {
  describe('parallelize()', () => {
    it('runs n promises in parallel', () => {
      inspect(Dumpinator).hasMethod('parallelize');

      let resolve;
      const task1 = Promise.resolve('one');
      const task2 = new Promise((_resolve) => {
        resolve = _resolve;
      });
      const task3 = Promise.resolve('three');
      const task4 = Promise.resolve('four');
      const task5 = Promise.resolve('five');

      const parallelize = Dumpinator.parallelize([
        task1, task2, task3, task4, task5
      ], 2);

      inspect(parallelize).isPromise();
      parallelize.then((res) => {
        inspect(res).isEql(['one', 'three', 'four', 'five', 'two']);
      });

      setTimeout(() => resolve('two'));

      return parallelize;
    });
  });

  describe('run()', () => {
    let config;

    before(() => {
      config = new Config();
      config.routes = {
        left: [{ id: 'd6d13704ca7ddfdb095505bc6e1cec6d', method: 'GET', url: 'https://raw.githubusercontent.com/maxdome/dumpinator/develop/test/fixtures/v1/test.json', name: 'GET test' }],
        right: [{ id: 'd6d13704ca7ddfdb095505bc6e1cec6d', method: 'GET', url: 'https://raw.githubusercontent.com/maxdome/dumpinator/develop/test/fixtures/v1/test.json', name: 'GET test' }]
      };
    });

    it('crawls n pages in parallel', () => {
      inspect(Dumpinator).hasMethod('run');

      const parallelizeStub = sinon.spy(Dumpinator, 'parallelize');

      const result = Dumpinator.run(config);
      inspect(result).isInstanceOf(EventEmitter);
      inspect(parallelizeStub).wasCalledOnce();
    });
  });
});
