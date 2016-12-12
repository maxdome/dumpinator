'use strict';

const cf = require('colorfy');

class CLIReporter {
  constructor(notify) {
    this.report(notify);
    this.colorsEnabled = process.env.isTTY;
    this.counter = {
      passed: 0,
      failed: 0,
      get total() {
        return this.passed + this.failed;
      }
    };
  }

  report(notify) {
    notify.on('test.finish', (test) => {
      const msg = cf();
      if (test.state === 'passed') {
        this.counter.passed += 1;
        msg.green('✔');
      } else {
        this.counter.failed += 1;
        msg.red('❌');
      }

      msg.dgrey('Route').grey(`${test.name}`).txt('-');

      if (test.state === 'passed') {
        msg.green('passed');
      } else {
        msg.red('failed');
      }

      msg.print(this.colorsEnabled);
    });

    notify.on('finish', () => {
      cf().nl().azure(this.counter.total).grey(['test done', 'tests done', this.counter.total])
        .nl()
        .green(`${this.counter.passed}`)
        .grey(['test passed', 'tests passed', this.counter.passed])
        .nl()
        .red(`${this.counter.failed}`)
        .grey(['test failed', 'tests failed', this.counter.failed])
        .print(this.colorsEnabled);
    });

    notify.on('error', (err) => {
      cf().red('Something went wrong :(').nl().txt(err.stack || err.message).print();
    });
  }
}

module.exports = CLIReporter;
