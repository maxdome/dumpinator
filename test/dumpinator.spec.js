'use strict';

const inspect = require('inspect.js');
const sinon = require('sinon');

inspect.useSinon(sinon);

const Dumpinator = require('../src/dumpinator');

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
    it('crawls n pages in parallel', () => {
      inspect(Dumpinator).hasMethod('run');

      const parallelizeStub = sinon.spy(Dumpinator, 'parallelize');

      const result = Dumpinator.run();
      inspect(result).isPromise();

      return result.then((res) => {
        inspect(parallelizeStub).wasCalledOnce();
        inspect(res).isEql([]);
      });
    });
  });
});
