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

  describe.only('run()', () => {
    let config;

    beforeEach(() => {
      config = new Config();
      config.routes = [
        {
          id: 'd6d13704ca7ddfdb095505bc6e1cec6d',
          left: {
            method: 'GET',
            url: 'https://raw.githubusercontent.com/maxdome/dumpinator/develop/test/fixtures/v1/test.json'
          },
          right: {
            method: 'GET',
            url: 'https://raw.githubusercontent.com/maxdome/dumpinator/develop/test/fixtures/v1/test.json'
          },
          name: 'GET test'
        }
      ];
    });

    it('crawls n pages in parallel', () => {
      inspect(Dumpinator).hasMethod('run');

      const parallelizeStub = sinon.spy(Dumpinator, 'parallelize');

      const result = Dumpinator.run(config);
      inspect(result).isInstanceOf(EventEmitter);
      inspect(result).hasMethod('then');
      inspect(parallelizeStub).wasCalledOnce();
    });

    it('calls before all and after all callbacks', () => {
      config.before = sinon.stub();
      config.after = sinon.stub();
      const result = Dumpinator.run(config);
      return result.then(() => {
        inspect(config.before).wasCalledOnce();
        inspect(config.after).wasCalledOnce();
      });
    });

    it('calls beforeEach and afterEach callbacks', () => {
      config.beforeEach = sinon.stub();
      config.afterEach = sinon.stub();
      const result = Dumpinator.run(config);
      return result.then(() => {
        inspect(config.beforeEach).wasCalledOnce();
        inspect(config.afterEach).wasCalledOnce();
      });
    });

    it('calls before route and after route callbacks', () => {
      config.routes[0].before = sinon.stub();
      config.routes[0].after = sinon.stub();
      const result = Dumpinator.run(config);
      return result.then(() => {
        inspect(config.routes[0].before).wasCalledOnce();
        inspect(config.routes[0].after).wasCalledOnce();
      });
    });
  });
});
