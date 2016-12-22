#!/usr/bin/env node

'use strict';

const program = require('commander');

// const Dumpinator = require('../src/dumpinator');
// const CLIUtils = require('../src/utils/cli-utils');

program
  .option('-C, --no-color', 'disable cli colors')
  .option('-d, --debug', 'enable debug mode')
  .option('-F, --full', 'show the full diff')
  .option('-v, --verbose', 'be more verbose');

program
  .command('<id>', 'show a result of the given id');

// const options = program.parse(process.argv);

console.log('No sorry, I can\'t show your the result. Nobody has implemented it yet.'); // eslint-disable-line no-console
console.log('Will you implement it? Would be nice :D'); // eslint-disable-line no-console
