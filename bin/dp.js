#!/usr/bin/env node

const program = require('commander');
const pkg = require('../package.json');

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

program.version(pkg.version);

program
  .command('diff <left> <right>')
  .description('Diff 2 URLs')
  .option('-c, --config [config]', 'Set a custom config')
  .action((left, right, options) => {
    options = options || {};
    handleResult('Not implemented', 1);
  });

program.parse(process.argv);

if (!process.argv.slice(2).length) {
  program.help();
}
