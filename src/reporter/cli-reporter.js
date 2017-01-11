'use strict';

const cf = require('colorfy');
const jsdiff = require('diff');

class CLIReporter {
  constructor(options) {
    options = options || {};
    this.colorsEnabled = options.noColor === undefined ? process.env.isTTY : !options.noColor;
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
          const time = test[side].responseTime;
          msg.grey(`${side}:`).llgrey('⌛').grey(`${time || 0}ms`);
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
    jsdiff.diffChars(line, line2).forEach((l) => {
      if (l.added || l.removed) {
        colored.txt(l.value, `${dark} trim`);
      } else {
        colored.txt(l.value, `${light} trim`);
      }
    });
  }

  diff(diff) {
    if (diff.type === 'error') {
      const colorized = cf();
      if (diff.msg) {
        colorized.txt(diff.msg, 'trim').nl();
      }


      if (diff.testFiles) {
        const highlightStr = diff.query.length;
        diff.testFiles.forEach((filename) => {
          colorized.yellow(filename.substr(0, highlightStr), 'bold').txt(filename.substr(highlightStr), 'trim').nl(); // eslint-disable-line no-console
        });
      }

      colorized.print(this.colorsEnabled);

      return;
    }

    this.drawDiff('header', diff.headerDiff);
    this.drawDiff('body', diff.bodyDiff);
    this.drawStatusDiff(diff.meta);
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
      if (line.added) {
        line.line.forEach((l, index, array) => {
          colored.txt('   ', 'ltrim').txt('|');
          colored.txt((`   ${lineNumbersRight}`).substr(-3, 3), 'ltrim').txt('|');
          this.drawInlineDiff(colored, l, line.prev[index] || '', 'bggreen', 'bgdgreen');
          colored.nl();
          lineNumbersRight += 1;
        });
      } else if (line.removed) {
        line.line.forEach((l, index, array) => {
          colored.txt((`   ${lineNumbersLeft}`).substr(-3, 3), 'ltrim').txt('|');
          colored.txt('   ', 'ltrim').txt('|');
          this.drawInlineDiff(colored, l, line.next[index] || '', 'bgred', 'bgdred');
          colored.nl();
          lineNumbersLeft += 1;
        });
      } else {
        line.line.forEach((l, index, array) => {
          if (!this.showFullDiff && index > 3 && index === array.length - 3) {
            colored.txt(('···'), 'ltrim').txt('|');
            colored.txt(('···'), 'ltrim').txt('|');
            colored.nl();
          }

          if (this.showFullDiff || (index < 3 || index > array.length - 4)) {
            colored.txt((`   ${lineNumbersLeft}`).substr(-3, 3), 'ltrim').txt('|');
            colored.txt((`   ${lineNumbersRight}`).substr(-3, 3), 'ltrim').txt('|');
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

    colored.print(this.colorsEnabled);
  }

  drawStatusDiff(meta) {
    const coloredStatus = cf();
    const coloredResponse = cf();
    ['left', 'right'].forEach((order) => {
      const expected = meta[order].expectedStatus;
      const status = meta[order].status;
      const time = meta[order].responseTime;

      if (status !== expected) {
        coloredStatus.red('❌').grey(`Status code check failed: ${order} expected ${expected} but got ${status}`).nl();
      }

      coloredResponse.txt('⌛').grey(`Response time of the ${order} route: ${time} ms`).nl();
    });

    coloredStatus.print();
    coloredResponse.print();
  }
}

module.exports = CLIReporter;
