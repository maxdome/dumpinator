#!/usr/bin/env node

'use strict';

const program = require('commander');
const pkg = require('../package.json');

program
  .version(pkg.version)

  .allowUnknownOption()

  .command('diff <left> <right>', 'compare the given routes')
  .command('show <id>', 'show a diff of the given id')
  .command('run', 'run the diff suite', { isDefault: true })

  .parse(process.argv);
