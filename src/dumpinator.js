'use strict';

const co = require('co');
const config = {};

class Dumpinator {
  static run() {
    const tests = config.tests;

    return co(function *() {
      for (const test in tests || []) {
        const res = yield this.runOne(test);

      }
    });
  }

  runOne(test) {
    return co(function *() {

    });
  }
}

module.exports = Dumpinator;
