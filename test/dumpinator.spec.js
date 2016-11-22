'use strict';

const inspect = require('inspect.js');
const Dumpinator = require('../src/dumpinator');

describe('Dumpinator', function() {
  describe('paralize()', function() {
    it('runs n promises paralel', function() {
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
        inspect(res).hasSubset(['one', 'three', 'four', 'five', 'zwoa']);
      });

      setTimeout(() => resolve('two'));

      return paralize;
    });
  });

  describe('run()', function() {
    it('crawls n pages paralel', function() {
      inspect(Dumpinator).hasMethod('run');
    });
  });
});
