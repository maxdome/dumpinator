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
  .option('-v, --verbose', 'be more verbose')
  .parse(process.argv);

const config = new Config();

config.parseOptions({ config: program.config, rate: program.rate, tag: program.tag });

if (program.config) {
  config.load(program.config);
} else {
  config.load();
}

const notify = Dumpinator.run(config);
Dumpinator.report(notify);
notify.on('finish', (allPassed) => {
  CLIUtils.generalSuccessHandler(allPassed ? 'Hell yeah, I\'m awesome!' : 'Geez, I fucked it up!');
});

notify.on('error', (err) => {
  CLIUtils.generalErrorHandler(program.verbose ? err.message : err.stack || err.message);
});
