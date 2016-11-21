'use strict';

const fs = require('fs');
const path = require('path');
const mkdirp = require('mkdirp');

class Stash {
  constructor(stashFile) {
    this.stashFile = stashFile;
  }

  add(content) {
    const dir = path.dirname(this.stashFile);

    return new Promise((resolve, reject) => {
      mkdirp(dir, () => {
        fs.writeFile(this.stashFile, content, (err, stat) => {
          resolve();
        });
      });
    });
  }

  fetch() {
    return new Promise((resolve, reject) => {
      fs.readFile(this.stashFile, { encoding: 'utf8' }, (err, content) => {
        if (err) {
          return reject(err);
        }

        resolve(content);
      });
    });
  }
}

module.exports = Stash;
