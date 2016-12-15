'use strict';

const cf = require('colorfy');

class CLIReporter {
  constructor() {
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

      msg.dgrey('Route').grey(`${test.name}`).grey(`(${test.id})`).txt('-');

      if (test.state === 'passed') {
        msg.green('passed');
      } else {
        msg.red('failed');

        ['left', 'right'].forEach((side) => {
          if (test[side].state.indexOf('failed') !== -1) {
            msg.nl().txt('  ').grey(`- ${side} failed with:`).red(test[side].state);
            if (test[side].reason) {
              msg.txt(`(${test[side].reason})`);
            }
          }
        });
      }

      msg.print(this.colorsEnabled);
    });

    notify.on('finish', () => {
      cf().nl().azure(`${this.counter.total}`).grey(['test done', 'tests done', this.counter.total])
        .nl()
        .green(`${this.counter.passed}`)
        .grey(['test passed', 'tests passed', this.counter.passed])
        .nl()
        .red(`${this.counter.failed}`)
        .grey(['test failed', 'tests failed', this.counter.failed])
        .print(this.colorsEnabled);
    });
  }

  diff(diffMap) {
    if (diffMap.type === 'error') {
      if (diffMap.testFiles) {
        console.log(diffMap.testFiles.join('\n')); // eslint-disable-line no-console
      }

      return;
    }
    let lineNumbersLeft = 1;
    let lineNumbersRight = 1;
    const colored = cf();

    diffMap.diff.forEach((line) => {
      const value = line.value.replace(/\n$/, '');

      if (line.removed) {
        value.split(/\n/g).forEach((l, index, array) => {
          colored.txt((`  ${lineNumbersLeft}`).substr(-2, 2), 'ltrim').txt('|');
          colored.txt('  ', 'ltrim').txt('|');
          colored.txt(l.replace(/\n$/, ''), 'bgred trim').nl();
        });
        lineNumbersLeft += 1;
      } else if (line.added) {
        value.split(/\n/g).forEach((l, index, array) => {
          colored.txt('  ', 'ltrim').txt('|');
          colored.txt((`  ${lineNumbersRight}`).substr(-2, 2), 'ltrim').txt('|');
          colored.txt(l.replace(/\n$/, ''), 'bggreen trim').nl();
        });
        lineNumbersRight += 1;
      } else {
        value.split(/\n/g).forEach((l, index, array) => {
          colored.txt((`  ${lineNumbersLeft}`).substr(-2, 2), 'ltrim').txt('|');
          colored.txt((`  ${lineNumbersRight}`).substr(-2, 2), 'ltrim').txt('|');
          colored.txt(l.replace(/\n$/, ''), 'trim').nl();

          lineNumbersLeft += 1;
          lineNumbersRight += 1;
        });
      }
    });

    if (diffMap.diff.length === 1 && !diffMap.diff.added && !diffMap.diff.removed) {
      colored.nl().green(' ✔').grey('both responses are the same').nl();
    } else {
      let numDifferences = 0;
      diffMap.diff.forEach((line) => {
        if (line.added) {
          numDifferences += 1;
        }
      });
      colored.nl().red(' ❌').grey([`There are ${numDifferences} difference in the response`, `There are ${numDifferences} differences in the response`, numDifferences]).nl();
    }

    colored.print();
  }

  log(msg) {
    console.log(msg); // eslint-disable-line no-console
  }
}

module.exports = CLIReporter;
