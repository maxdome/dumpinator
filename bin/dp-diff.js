#!/usr/bin/env node

'use strict';

const program = require('commander');

const Dumpinator = require('../src/dumpinator');
const Config = require('../src/config');
const CLIUtils = require('../src/utils/cli-utils');

program
  .option('-C, --no-color', 'disable cli colors')
  .option('-F, --full', 'show the full diff')
  .option('-H, --header [header]', 'add a HTTP header to both sides')
  .option('-L, --header-left [headerLeft]', 'add a HTTP header to left side')
  .option('-R, --header-right [headerRight]', 'add a HTTP header to right side')
  .option('-v, --verbose', 'be more verbose')
  .option('-S, --show-ignored', 'Show ignored values in response');

program
  .command('diff <left> <right>', 'compare the given routes')
  .command('diff <id>', 'compare the given routes by a result id');

const options = program.parse(process.argv);

if (options.args.length === 2) {
  const config = new Config({
    noColor: ('color' in options) ? !options.color : undefined,
    showFullDiff: !!options.full,
    showIgnored: !!options.showIgnored,
    verbose: program.verbose
  });

  const routeConf = CLIUtils.parseRouteArguments(process.argv);
  config.addRoute(routeConf);

  Dumpinator.runDiff(config).then((allPassed) => {
    CLIUtils[allPassed ? 'generalSuccessHandler' : 'generalErrorHandler']();
  }).catch((err) => {
    CLIUtils.generalExceptionHandler(err);
  });
} else if (options.args.length === 1) {
  const resultId = options.args[0];

  Dumpinator.diff(resultId, {
    showIgnored: !!options.showIgnored
  }).then((diff) => {
    Dumpinator.reportDiff(diff, {
      showFullDiff: !!options.full,
      noColor: !options.color,
      showIgnored: !!options.showIgnored
    });
  }).catch((err) => {
    CLIUtils.generalExceptionHandler(err);
  });
}
