#!/usr/bin/env node

'use strict';

const program = require('commander');

const Dumpinator = require('../src/dumpinator');
const Config = require('../src/config');
const CLIUtils = require('../src/utils/cli-utils');

program
  .usage('[options] [gitTag] [gitTag]')
  .option('-c, --config [config]', 'set a custom config')
  .option('-r, --rate [rateLimit]', 'rate limit for concurrent requests')
  .option('-t, --tag [tag]', 'only include routes with this tag')
  .option('-C, --no-color', 'disable cli colors')
  .option('-m, --html', 'write a html report')
  .option('-v, --verbose', 'be more verbose');

const options = program.parse(process.argv);

const config = new Config({
  rateLimit: program.rate,
  tag: program.tag,
  verbose: program.verbose,
  htmlReport: program.html,
  noColor: ('color' in options) ? !options.color : undefined
});

if (options.args.length) {
  config.gitTags = options.args;
}

config.timeout = 30000;

if (program.config) {
  config.load(program.config);
} else {
  config.load();
}

Dumpinator.run(config).then((allPassed) => {
  CLIUtils[allPassed ? 'generalSuccessHandler' : 'generalErrorHandler']();
}).catch((err) => {
  CLIUtils.generalExceptionHandler(err);
});
