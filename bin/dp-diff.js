#!/usr/bin/env node

'use strict';

const program = require('commander');
const minimist = require('minimist');

const Dumpinator = require('../src/dumpinator');
const Config = require('../src/config');
const CLIUtils = require('../src/utils/cli-utils');

program
  .option('-C, --no-color', 'disable cli colors')
  .option('-d, --debug', 'enable debug mode')
  .option('-F, --full', 'show the full diff')
  .option('-H, --header [header]', 'add a HTTP header to both sides')
  .option('-L, --header-left [headerLeft]', 'add a HTTP header to left side')
  .option('-R, --header-right [headerRight]', 'add a HTTP header to right side')
  .option('-v, --verbose', 'be more verbose');

program
  .command('diff <left> <right>', 'compare the given routes')
  .action((left, right, options) => {
    options = options || {};
    options.args = minimist(process.argv);
    const config = new Config();

    config.parseArguments(left, right, options);

    const notify = Dumpinator.run(config);
    Dumpinator.report(notify);

    notify.on('error', (err) => {
      CLIUtils.generalExceptionHandler(err);
    });
  });

program.parse(process.argv);
