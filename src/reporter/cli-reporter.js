'use strict';

const cf = require('colorfy');
const jsdiff = require('diff');

class CLIReporter {
  constructor(options) {
    options = options || {};
    this.colorsEnabled = options.noColors === undefined ? process.env.isTTY : !options.noColors;
    this.showFullDiff = options.showFullDiff;
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

      const extended = true;
      if (extended) {
        msg.nl().txt(' ');
        ['left', 'right'].forEach((side) => {
          const time = test.responseTime;
          msg.grey(`${side}:`).llgrey('⌛').grey(`${time}ms`);
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

  drawInlineDiff(colored, line, line2, light, dark) {
    // console.log('DIFF', line, line2)
    jsdiff.diffChars(line, line2).forEach((l) => {
      if (l.added || l.removed) {
        colored.txt(l.value, `${dark} trim`);
      } else {
        colored.txt(l.value, `${light} trim`);
      }
    });

    // colored.nl();
  }

  diff(diff) {
    if (diff.type === 'error') {
      if (diff.testFiles) {
        console.log(diff.testFiles.join('\n')); // eslint-disable-line no-console
      }

      return;
    }

    this.drawDiff('header', diff.headerDiff);
    this.drawDiff('body', diff.bodyDiff);
  }

  log(msg) {
    console.log(msg); // eslint-disable-line no-console
  }

  drawDiff(type, diff) {
    let lineNumbersLeft = 1;
    let lineNumbersRight = 1;
    const colored = cf();
    const title = type === 'body' ? '[ BODY ]' : '[ HEAD ]';

    colored.txt(`${title}`).nl();

    const diffMap = diff.map((line, index, arr) => {
      line.prev = index ? arr[index - 1].line : [];
      line.next = index < (arr.length - 1) ? arr[index + 1].value.replace(/\n$/, '').split(/\n/g) : [];
      line.line = line.value.replace(/\n$/, '').split(/\n/g);

      return line;
    });

    diffMap.forEach((line) => {
      // console.log('LINE', line)
      if (line.added) {
        line.line.forEach((l, index, array) => {
          colored.txt('  ', 'ltrim').txt('|');
          colored.txt((`  ${lineNumbersRight}`).substr(-2, 2), 'ltrim').txt('|');
          this.drawInlineDiff(colored, l, line.prev[index] || '', 'bglime', 'bggreen');
          colored.nl();
          lineNumbersRight += 1;
        });
      } else if (line.removed) {
        line.line.forEach((l, index, array) => {
          colored.txt((`  ${lineNumbersLeft}`).substr(-2, 2), 'ltrim').txt('|');
          colored.txt('  ', 'ltrim').txt('|');
          this.drawInlineDiff(colored, l, line.next[index] || '', 'bgfire', 'bgred');
          colored.nl();
          lineNumbersLeft += 1;
        });
      } else {
        line.line.forEach((l, index, array) => {
          if (!this.showFullDiff && index > 3 && index === array.length - 3) {
            colored.txt(('··'), 'ltrim').txt('|');
            colored.txt(('··'), 'ltrim').txt('|');
            colored.nl();
          }

          if (this.showFullDiff || (index < 3 || index > array.length - 4)) {
            colored.txt((`  ${lineNumbersLeft}`).substr(-2, 2), 'ltrim').txt('|');
            colored.txt((`  ${lineNumbersRight}`).substr(-2, 2), 'ltrim').txt('|');
            colored.txt(l, 'trim').nl();
          }

          lineNumbersLeft += 1;
          lineNumbersRight += 1;
        });
      }
    });

    if (diffMap.length === 1 && !diffMap.added && !diffMap.removed) {
      colored.nl().green(' ✔').grey('both responses are the same').nl();
    } else {
      let numDifferences = 0;
      diffMap.forEach((line) => {
        if (line.added) {
          numDifferences += 1;
        }
      });
      colored.nl().red(' ❌').grey([`${numDifferences} difference in the ${type} found`, `${numDifferences} differences in the ${type} found`, numDifferences]).nl();
    }

    colored.print();
  }
}

module.exports = CLIReporter;
