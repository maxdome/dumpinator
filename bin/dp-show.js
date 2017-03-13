#!/usr/bin/env node

'use strict';

const program = require('commander');

const Dumpinator = require('../src/dumpinator');
const CLIUtils = require('../src/utils/cli-utils');

program
  .option('-C, --no-color', 'disable cli colors')
  .option('-F, --full', 'show the full diff')
  .option('-v, --verbose', 'be more verbose');

program
  .command('<id>', 'show a result of the given id');

const options = program.parse(process.argv);
const resultId = options.args[0];

if (!resultId) {
  console.log('Give me a result id or go away!'); // eslint-disable-line no-console
  process.exit(1);
}

Dumpinator.show(resultId, {
  noColor: !program.color,
  fullResponse: program.full,
  verbose: program.verbose
}).then((res) => {
  CLIUtils.printResponse(res);
}).catch((err) => {
  CLIUtils.generalExceptionHandler(err);
});
