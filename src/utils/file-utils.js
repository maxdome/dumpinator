'use strict';

const glob = require('glob');
const fs = require('fs');
const path = require('path');

class FileUtils {
  static listFiles(dir) {
    return new Promise((resolve, reject) => {
      glob('*-+(left|right).json', { cwd: dir }, (err, files) => {
        if (err) {
          return reject(err);
        }

        resolve(files.map(file => path.join(dir, file)));
      });
    });
  }

  static deleteFiles(files) {
    return Promise.all(files.map(file => new Promise((resolve, reject) => {
      fs.unlink(file, (err) => {
        if (err) {
          return reject(err);
        }

        resolve(true);
      });
    })));
  }
}

module.exports = FileUtils;
