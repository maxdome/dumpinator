'use strict';

const DpTest = require('./dp-test');

class DpSession {
  constructor(conf) {
    this.tests = [];

    conf.forEach((test) => {
      this.tests.push(new DpTest(test));
    });
  }
}

module.exports = DpSession;
