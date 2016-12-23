#!/usr/bin/env node

'use strict';

const program = require('commander');
const pkg = require('../package.json');

program
  .version(pkg.version)

  .allowUnknownOption()

  .command('diff <left> <right>', 'compare the given routes')
  .command('diff <id>', 'compare the given routes by a result id')
  .command('show <id>', 'show a result of the given id')
  .command('run', 'run the diff suite', { isDefault: true })
  .command('clean [dir]', 'remove all tmp files')

  .parse(process.argv);
