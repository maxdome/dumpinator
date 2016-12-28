'use strict';

const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');

class HTMLReporter {
  constructor(options) {
    options = options || {};

    this.output = options.output || path.join(process.cwd(), 'dumpinator-report.html');

    this.counter = {
      passed: 0,
      failed: 0,
      get total() {
        return this.passed + this.failed;
      }
    };

    this.tests = [];
  }

  report(notify) {
    notify.on('test.add', (test) => {
      this.tests.push(test);
    });

    notify.on('test.finish', (test) => {
      if (test.state === 'passed') {
        this.counter.passed += 1;
      } else {
        this.counter.failed += 1;
      }
    });

    notify.on('finish', () => {
      this.createReport(notify.session);
    });
  }

  createReport(data) {
    const html = handlebars.compile(fs.readFileSync(path.join(__dirname, '../../templates/html-report.hbs'), { encoding: 'utf8' }));
    fs.writeFileSync(this.output, html({
      tests: this.tests,
      counter: this.counter
    }));
  }

  diff(diff) {

  }
}

module.exports = HTMLReporter;
