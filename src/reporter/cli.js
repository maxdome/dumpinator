'use strict';

class CLIReporter {
  constructor(notify) {
    this.report(notify);
  }

  report(notify) {
    notify.on('test.add', (test) => {
      console.log('Test add: ', test);
    });

    notify.on('test.state', (test) => {
      console.log('Test state: ', test);
    });

    notify.on('test.finish', (test) => {
      console.log(`Route test: ${test.name} ${test.state}`);
    });

    notify.on('finish', () => {
      console.log('All tests done :D');
    });

    notify.on('error', (err) => {
      console.log('Something went wrong :( ', err);
    });

    console.log('Start reporting:');
  }
}

module.exports = CLIReporter;
