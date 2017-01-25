'use strict';

const crypto = require('crypto');
const path = require('path');

const co = require('co');
const glob = require('glob');

const DpRoute = require('./dp-route');
const Stash = require('./stash');
const Diff = require('./diff');

class DpTest {
  constructor(conf) {
    this.left = new DpRoute(conf.left);
    this.right = new DpRoute(conf.right);

    this.createId(conf);
    this.createName();

    this.before = conf.before || null;
    this.after = conf.after || null;
  }

  createId(conf) {
    this.id = crypto.createHash('md5').update(JSON.stringify(conf)).digest('hex');
  }

  createName() {
    if (!this.name) {
      const leftName = this.left.url.replace(/^https?:\/\/.+?(\/)+/, '/');
      const rightName = this.right.url.replace(/^https?:\/\/.+?(\/)+/, '/');
      const name = leftName === rightName ? leftName : `${leftName} ↔ ${rightName}`;
      this.name = `${this.left.method} ${name}`;
    }
  }

  diff() {
    const testId = this.id;
    const stashDir = path.join(__dirname, '../tmp/');
    return co(function* dumpinatorDiff() {
      const testFiles = glob.sync(`${testId}*-left.json`, { cwd: stashDir });

      if (testFiles.length === 0) {
        return {
          type: 'error',
          code: 1001,
          msg: 'No tests found. Check the id.'
        };
      } else if (testFiles.length > 1) {
        return {
          type: 'error',
          code: 1002,
          msg: 'Multiple tests found. Provide an unique id.',
          testFiles,
          query: testId
        };
      }

      const leftStash = new Stash(path.join(stashDir, testFiles[0]));
      const left = yield leftStash.fetch();

      const rightStash = new Stash(path.join(stashDir, testFiles[0].replace('-left', '-right')));
      const right = yield rightStash.fetch();

      const diff = new Diff();
      return {
        type: 'diff',
        bodyDiff: yield diff.diff(left.body, right.body),
        headerDiff: yield diff.diff(left.headers, right.headers),
        meta: {
          left: left.meta,
          right: right.meta
        }
      };
    });
  }
}

module.exports = DpTest;
