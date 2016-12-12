'use strict';

class CLIReporter {
  constructor(notify) {
    this.report(notify);
  }

  report(notify) {
    notify.on('test.add', (test) => {
      console.log('Test: ', test);
    });
  }
}

module.exports = CLIReporter;
