#!/usr/bin/env node

'use strict';

const path = require('path');
const program = require('commander');
const promptly = require('promptly');

// const Dumpinator = require('../src/dumpinator');
const FileUtils = require('../src/utils/file-utils');
const CLIUtils = require('../src/utils/cli-utils');

function deleteFiles(files) {
  FileUtils.deleteFiles(files).then(() => {
    CLIUtils.generalSuccessHandler('All files deleded');
  });
}

program
  .option('-f, --force', 'clean all without prompting');

const options = program.parse(process.argv);

const tmpDir = options.args[0] || path.join(__dirname, '../tmp');
FileUtils.listFiles(tmpDir).then((files) => {
  if (files.length === 0) {
    CLIUtils.generalWarningHandler('Aww, no files found');
    return;
  }

  if (options.force) {
    deleteFiles(files);
    return;
  }

  promptly.confirm('Are you sure? Delete these files? [y]es [n]o').then((answer) => {
    if (answer) {
      deleteFiles(files, true);
    }
  });
});
