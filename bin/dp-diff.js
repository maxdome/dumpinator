#!/usr/bin/env node

'use strict';

const program = require('commander');
const pkg = require('../package.json');
const cf = require('colorfy');
const cowsay = require('cowsay');

const Dumpinator = require('../src/dumpinator');

function msg() {
  console.log.apply(null, arguments); // eslint-disable-line no-console,prefer-rest-params
}

function handleResult(text, code) {
  code = code || 0;

  if (text) {
    msg(text);
  }

  process.exit(code);
}

function printDiff(diff) {
  let num = 1;
  const colored = cf();

  diff.forEach((line) => {
    if (line.removed) {
      line.value.replace(/^\n$/, '').split(/\n/g).forEach((l, index, array) => {
        colored.txt(('  ' + num).substr(-2, 2), 'ltrim').txt('|');
        colored.txt(l.replace(/\n$/, ''), 'bgred trim').nl();
      });
    } else if (line.added) {
      line.value.replace(/^\n$/, '').split(/\n/g).forEach((l, index, array) => {
        colored.txt(('  ' + num).substr(-2, 2), 'ltrim').txt('|');
        colored.txt(l.replace(/\n$/, ''), 'bggreen trim').nl();
      });
    } else {
      line.value.replace(/^\n$/, '').split(/\n/g).forEach((l, index, array) => {
        colored.txt(('  ' + num).substr(-2, 2), 'ltrim').txt('|');
        colored.txt(l.replace(/\n$/, ''), 'trim').nl();

        num += 1;
      });
    }
  });

  colored.print();
}

function generalErrorHandler(err) {
  console.log(cowsay.think({ // eslint-disable-line
    text: 'Shit, something went wrong!',
    e: 'oO',
    T: '',
    f: 'head-in'
  }));

  console.log(''); // eslint-disable-line
  console.log(program.verbose ? err.message : err.stack || err.message); // eslint-disable-line
  console.log(''); // eslint-disable-line
}

process.on('uncaughtException', (err) => {
  generalErrorHandler(err);
  process.exit(1);
});

program.version(pkg.version);
program.option('-v, --verbose', 'be more verbose');

program
  .usage('[test id]')
  .description('Shows a diff of the given test')
  .action((testId, options) => {
    options = options || {};

    Dumpinator.diff(testId).then((diff) => {
      printDiff(diff);
    }).catch((err) => {
      generalErrorHandler(err);
    });
  });

program.parse(process.argv);
