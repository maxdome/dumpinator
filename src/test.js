'use strict';

const crypto = require('crypto');
const path = require('path');

const co = require('co');
const glob = require('glob');

const Route = require('./route');
const Stash = require('./stash');
const Diff = require('./diff');

class Test {
  constructor(conf) {
    this.left = new Route(conf.left);
    this.right = new Route(conf.right);
    this.state = 'pending';

    this.createId(conf);
    this.createName();

    this.before = conf.before || null;
    this.after = conf.after || null;
    this.ignoreHeader = conf.ignoreHeader || null;
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

  run() {
    return co(function* runGen() {
      if (this.before) {
        if (this.verbose) {
          console.log('[DEBUG] call before this callback'); // eslint-disable-line no-console
        }

        const p = this.before(this);
        if (p) {
          yield p;
        }
      }

      for (const side of ['left', 'right']) {
        const response = yield this[side].load();
        this[side].response = response;

        if (this[side].state === 'download-failed') {
          this.state = 'failed';
          return;
        }

        this.state = this[side].state;

        if (response) {
          const stash = new Stash(path.join(__dirname, `../tmp/${this.id}-${side}.json`));
          yield stash.add(response);
        }
      }

      // compare results

      this.state = 'passed';
      const diff = new Diff();
      const headerDiff = diff.compare(this.left.response.headers, this.right.response.headers, this.ignoreHeader, true);
      if (!headerDiff) {
        this.state = 'failed';
        this.message = 'Headers don\'t match';
      }

      const bodyDiff = diff.compare(this.left.response.body, this.right.response.body, this.ignoreBody);
      if (!bodyDiff) {
        this.state = 'failed';
        this.message = 'Bodies don\'t match';
      }

      if (this.after) {
        if (this.verbose) {
          console.log('[DEBUG] call after test callback'); // eslint-disable-line no-console
        }

        const p = this.after(this);
        if (p) {
          yield p;
        }
      }

      return this.state === 'passed';
    }.bind(this));
  }

  diff() {
    const diff = new Diff();
    return {
      type: 'diff',
      bodyDiff: diff.diff(this.left.response.body, this.right.response.body),
      headerDiff: diff.diff(this.left.response.headers, this.right.response.headers),
      meta: {
        left: this.left.response.meta,
        right: this.right.response.meta
      }
    };
  }
}

module.exports = Test;
