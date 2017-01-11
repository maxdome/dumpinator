#!/usr/bin/env node

'use strict';

const program = require('commander');

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
  .command('diff <id>', 'compare the given routes by a result id');

const options = program.parse(process.argv);

if (options.args.length === 2) {
  const config = new Config({
    debug: options.debug,
    noColor: ('color' in options) ? !options.color : undefined,
    full: options.full
  });

  const routeConf = CLIUtils.parseRouteArguments(process.argv);
  config.addRoute(routeConf);

  const notify = Dumpinator.run(config);

  notify.on('error', (err) => {
    CLIUtils.generalExceptionHandler(err);
  });

  notify.on('finish', (result) => {
    if (result) {
      CLIUtils.generalSuccessHandler();
      return;
    }


    Dumpinator.diff(Object.keys(notify.session)[0]).then((diff) => {
      Dumpinator.reportDiff(diff, {
        showFullDiff: !!options.full,
        noColor: !options.color
      });
    }).catch((err) => {
      CLIUtils.generalExceptionHandler(err);
    });
  });
} else if (options.args.length === 1) {
  const resultId = options.args[0];

  Dumpinator.diff(resultId).then((diff) => {
    Dumpinator.reportDiff(diff, {
      showFullDiff: !!options.full,
      noColor: !options.color
    });
  }).catch((err) => {
    CLIUtils.generalExceptionHandler(err);
  });
}
