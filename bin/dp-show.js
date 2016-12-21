#!/usr/bin/env node

'use strict';

const program = require('commander');

const Dumpinator = require('../src/dumpinator');
const CLIUtils = require('../src/utils/cli-utils');

program
  .option('-C, --no-color', 'disable cli colors')
  .option('-d, --debug', 'enable debug mode')
  .option('-F, --full', 'show the full diff')
  .option('-v, --verbose', 'be more verbose');

program
  .command('<id>', 'show a diff of the given id')
  .action((id, options) => {
    options = options || {};

    Dumpinator.diff(id).then((diff) => {
      Dumpinator.reportDiff(diff, {
        showFullDiff: !!options.full,
        noColor: !!options.noColor
      });
    }).catch((err) => {
      CLIUtils.generalExceptionHandler(err);
    });
  });

program.parse(process.argv);
