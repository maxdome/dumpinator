'use strict';

class CLIReporter {
  constructor(notify) {
    this.report(notify);
  }

  report(notify) {
    notify.on('test.add', (test) => {
      console.log('Test add: ', test); // eslint-disable-line
    });

    notify.on('test.state', (test) => {
      console.log('Test state: ', test); // eslint-disable-line
    });

    notify.on('test.finish', (test) => {
      console.log(`Route test: ${test.name} ${test.state}`); // eslint-disable-line
    });

    notify.on('finish', () => {
      console.log('All tests done :D'); // eslint-disable-line
    });

    notify.on('error', (err) => {
      console.log('Something went wrong :( ', err); // eslint-disable-line
    });

    console.log('Start reporting:'); // eslint-disable-line
  }
}

module.exports = CLIReporter;
