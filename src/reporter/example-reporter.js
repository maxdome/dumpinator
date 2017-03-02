'use strict';

class CLIReporter {
  constructor(options) {
    options = options || {};
  }

  report(session) {
    session.on('test.add', (test) => {
      console.log('Test add: ', test); // eslint-disable-line no-console
    });

    session.on('test.pass', (test) => {
      console.log('Test passed: ', test); // eslint-disable-line no-console
    });

    session.on('test.fail', (test) => {
      console.log('Test failed: ', test); // eslint-disable-line no-console
    });

    session.on('test.finish', (test) => {
      console.log(`Test finished: ${test.name} ${test.state}`); // eslint-disable-line no-console
    });

    session.on('finish', () => {
      console.log('All tests done :D'); // eslint-disable-line no-console
    });

    session.on('error', (err) => {
      console.log('Something went wrong :( ', err); // eslint-disable-line no-console
    });

    console.log('Start reporting:'); // eslint-disable-line no-console
  }
}

module.exports = CLIReporter;
