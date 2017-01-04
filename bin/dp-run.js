#!/usr/bin/env node

'use strict';

const program = require('commander');

const Dumpinator = require('../src/dumpinator');
const Config = require('../src/config');
const CLIUtils = require('../src/utils/cli-utils');

program
  .option('-c, --config [config]', 'set a custom config')
  .option('-r, --rate [rateLimit]', 'rate limit for concurrent requests')
  .option('-t, --tag [tag]', 'only include routes with this tag')
  .option('-C, --no-color', 'disable cli colors')
  .option('-d, --debug', 'enable debug mode')
  .option('-v, --verbose', 'be more verbose');

const options = program.parse(process.argv);

const config = new Config({
  rateLimit: program.rate,
  tag: program.tag,
  verbose: program.verbose,
  debug: program.debug,
  noColor: ('color' in options) ? !options.color : undefined
});

if (program.config) {
  config.load(program.config);
} else {
  config.load();
}

const notify = Dumpinator.run(config);
notify.on('finish', (allPassed) => {
  CLIUtils[allPassed ? 'generalSuccessHandler' : 'generalErrorHandler']();
});

notify.on('error', (err) => {
  CLIUtils.generalExceptionHandler(err);
});
