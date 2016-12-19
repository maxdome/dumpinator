#!/usr/bin/env node

'use strict';

const program = require('commander');
const pkg = require('../package.json');
const minimist = require('minimist');
const Config = require('../src/config');
const CLIUtils = require('../src/utils/cli-utils');

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


process.on('uncaughtException', (err) => {
  CLIUtils.generalErrorHandler(program.verbose ? err.message : err.stack || err.message);
  process.exit(1);
});

program.version(pkg.version);
program.option('-v, --verbose', 'be more verbose');

program
  .command('diff [left] [right]')
  .description('Compare the given routes')
  .option('-c, --config [config]', 'Set a custom config')
  .option('-H, --header [header]', 'Add a HTTP header to both sides')
  .option('-L, --header-left [headerLeft]', 'Add a HTTP header to left side')
  .option('-r, --rate [rateLimit]', 'Rate limit for concurrent requests')
  .option('-R, --header-right [headerRight]', 'Add a HTTP header to right side')
  .option('-t, --tag [tag]', 'Only include routes with this tag')
  .option('-d, --debug', 'Enables debug mode')
  .action((left, right, options) => {
    options = options || {};
    options.args = minimist(process.argv);
    const config = new Config();

    if (options.config) {
      if (left) {
        return handleResult('No arguments allowed when using "-c"!', 1);
      }
      config.parseOptions(options);
      config.load(options.config);
    } else if (!left) {
      config.parseOptions(options);
      config.load();
    } else {
      config.parseArguments(left, right, options);
    }

    const notify = Dumpinator.run(config);
    Dumpinator.report(notify);
    notify.on('finish', (allPassed) => {
      CLIUtils.generalSuccessHandler(allPassed ? 'Hell yeah, I\'m awesome!' : 'Geez, I fucked it up!');
    });

    notify.on('error', (err) => {
      CLIUtils.generalErrorHandler(program.verbose ? err.message : err.stack || err.message);
    });
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}
