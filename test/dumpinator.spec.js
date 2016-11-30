'use strict';

const inspect = require('inspect.js');
const sinon = require('sinon');

inspect.useSinon(sinon);

const Dumpinator = require('../src/dumpinator');

describe('Dumpinator', () => {
  describe('paralize()', () => {
    it('runs n promises parallel', () => {
      inspect(Dumpinator).hasMethod('paralize');

      let resolve;
      const task1 = Promise.resolve('one');
      const task2 = new Promise((_resolve) => {
        resolve = _resolve;
      });
      const task3 = Promise.resolve('three');
      const task4 = Promise.resolve('four');
      const task5 = Promise.resolve('five');

      const paralize = Dumpinator.paralize([
        task1, task2, task3, task4, task5
      ], 2);

      inspect(paralize).isPromise();
      paralize.then((res) => {
        inspect(res).isEql(['one', 'three', 'four', 'five', 'two']);
      });

      setTimeout(() => resolve('two'));

      return paralize;
    });
  });

  describe('run()', () => {
    it('crawls n pages parallel', () => {
      inspect(Dumpinator).hasMethod('run');

      const paralizeStub = sinon.spy(Dumpinator, 'paralize');

      const result = Dumpinator.run();
      inspect(result).isPromise();

      return result.then((res) => {
        inspect(paralizeStub).wasCalledOnce();
        inspect(res).isEql([]);
      });
    });
  });
});
