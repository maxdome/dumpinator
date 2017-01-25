'use strict';

class CLIReporter {
  constructor(notify) {
    this.report(notify);
  }

  report(notify) {
    notify.on('test.add', (test) => {
      console.log('Test add: ', test); // eslint-disable-line no-console
    });

    notify.on('test.state', (test) => {
      console.log('Test state: ', test); // eslint-disable-line no-console
    });

    notify.on('test.finish', (test) => {
      console.log(`Route test: ${test.name} ${test.state}`); // eslint-disable-line no-console
    });

    notify.on('finish', () => {
      console.log('All tests done :D'); // eslint-disable-line no-console
    });

    notify.on('error', (err) => {
      console.log('Something went wrong :( ', err); // eslint-disable-line no-console
    });

    console.log('Start reporting:'); // eslint-disable-line no-console
  }
}

module.exports = CLIReporter;
