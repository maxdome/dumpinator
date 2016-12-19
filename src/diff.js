'use strict';

const jsdiff = require('diff');
const lodash = require('lodash');
const sortify = require('json.sortify');

class Diff {
  diff(left, right) {
    return new Promise((resolve, reject) => {
      let diffResult;

      if (typeof left !== typeof right) {
        throw new Error('Cannot compare two different source types!');
      }

      if (typeof left === 'object') {
        diffResult = jsdiff.diffLines(sortify(left, null, '  '), sortify(right, null, '  '));
      } else {
        diffResult = jsdiff.diffLines(left, right);
      }

      resolve(diffResult);
    });
  }

  compare(left, right, ignore, lowerCaseKeys) {
    if (typeof left !== typeof right) {
      throw new Error('Cannot compare two different source types!');
    }

    if (ignore) {
      ignore.forEach(item => lodash.unset(left, item));
      ignore.forEach(item => lodash.unset(right, item));
    }

    let leftStr = left;
    let rightStr = right;

    if (lowerCaseKeys) {
      leftStr = this.lowerCaseKeysRecursive(leftStr);
      rightStr = this.lowerCaseKeysRecursive(rightStr);
    }

    if (typeof left === 'object') {
      leftStr = sortify(left);
      rightStr = sortify(right);
    }

    return leftStr === rightStr;
  }

  lowerCaseKeysRecursive(obj) {
    const lowercased = {};

    for (const key of Object.keys(obj)) {
      if (typeof obj[key] === 'object' && obj[key] !== null) {
        lowercased[key.toLowerCase()] = this.lowerCaseKeysRecursive(obj[key]);
      } else {
        lowercased[key.toLowerCase()] = obj[key];
      }
    }

    return lowercased;
  }
}

module.exports = Diff;
