'use strict';

const jsdiff = require('diff');
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

  compare(left, right) {
    if (typeof left !== typeof right) {
      throw new Error('Cannot compare two different source types!');
    }

    let leftStr = left;
    let rightStr = right;

    if (typeof left === 'object') {
      leftStr = sortify(left);
      rightStr = sortify(right);
    }

    return leftStr === rightStr;
  }
}

module.exports = Diff;
