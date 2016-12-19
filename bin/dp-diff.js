#!/usr/bin/env node

'use strict';

const program = require('commander');
const pkg = require('../package.json');

const Dumpinator = require('../src/dumpinator');
const CLIUtil = require('../src/utils/cli-utils');

process.on('uncaughtException', (err) => {
  CLIUtil.generalErrorHandler(program.verbose ? err.message : err.stack || err.message);
  process.exit(1);
});

program.version(pkg.version);
program.option('-v, --verbose', 'be more verbose');
program.option('-F, --full', 'show the full diff');
program.option('-C, --no-color', 'disable cli colors');

program
  .usage('[test id]')
  .description('Shows a diff of the given test')
  .action((testId, options) => {
    options = options || {};

    Dumpinator.diff(testId).then((diff) => {
      Dumpinator.reportDiff(diff, {
        showFullDiff: !!options.full,
        noColor: !options.color
      });
    }).catch((err) => {
      CLIUtil.generalErrorHandler(program.verbose ? err.message : err.stack || err.message);
    });
  });

program.parse(process.argv);
