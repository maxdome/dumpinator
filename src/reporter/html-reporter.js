'use strict';

const path = require('path');
const fs = require('fs');
const handlebars = require('handlebars');
const mkdirp = require('mkdirp');

class HTMLReporter {
  constructor(options) {
    options = options || {};

    this.output = options.output || path.join(process.cwd(), 'dumpinator-report');

    this.counter = {
      passed: 0,
      failed: 0,
      get total() {
        return this.passed + this.failed;
      }
    };

    this.tests = [];
  }

  report(session) {
    session.on('test.add', (test) => {
      this.tests.push(test);
    });

    session.on('test.finish', (test) => {
      if (test.state === 'passed') {
        this.counter.passed += 1;
      } else {
        this.counter.failed += 1;
      }
    });

    session.on('finish', () => {
      this.createReport(session);
      this.createDiffReport(session);
    });
  }

  createReport(session) {
    const html = handlebars.compile(fs.readFileSync(path.join(__dirname, '../../templates/html-report.hbs'), { encoding: 'utf8' }));

    const outputDir = this.output;
    try {
      mkdirp.sync(outputDir, 0o755);
    } catch (err) {
      // file exists, thats fine
    }

    const tests = session.tests.map((test) => {
      test.shortId = test.id.substr(0, 8);

      return test;
    });

    fs.writeFileSync(path.join(this.output, 'index.html'), html({
      tests,
      counter: this.counter
    }));
  }

  createDiffReport(session) {
    const html = handlebars.compile(fs.readFileSync(path.join(__dirname, '../../templates/html-diff.hbs'), { encoding: 'utf8' }));

    const outputDir = path.join(this.output, 'diff');
    try {
      mkdirp.sync(outputDir, 0o755);
    } catch (err) {
      // file exists, thats fine
    }

    for (const test of session.tests) {
      if (this.verbose) {
        console.log('[DEBUG] create diff report for item ', test.id); // eslint-disable-line no-console
      }

      const diffResult = test.diff();

      fs.writeFileSync(path.join(this.output, `diff-${test.id}.html`), html(Object.assign({
        headerDiff: this.getDiffArray(diffResult.headerDiff),
        bodyDiff: this.getDiffArray(diffResult.bodyDiff),
        isFailed: test.status === 'failed'
      }, test)));
    }
  }

  diff(diff) {
    // do nothing
  }

  getDiffArray(diff) {
    const diffArray = [];
    let lineNum = 0;

    for (const part of diff) {
      const lines = part.value.replace(/\n$/, '').split('\n');
      for (const line of lines) {
        let cssClass = '';
        if (part.added) {
          cssClass = 'added';
        } else if (part.removed) {
          cssClass = 'removed';
        }

        diffArray.push({
          value: line,
          cssClass,
          number: (lineNum += 1)
        });
      }
    }

    // console.log(diffArray);
    return diffArray;
  }
}

module.exports = HTMLReporter;
