'use strict';

const crypto = require('crypto');
const path = require('path');

const co = require('co');

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
    this.ignoreBody = conf.ignoreBody || null;
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
      yield this.callHook('before');

      for (const side of ['left', 'right']) {
        const response = yield this[side].load();
        this[side].response = response;

        if (this[side].state === 'download-failed') {
          this.state = 'failed';
          yield this.callHook('after');
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

      yield this.callHook('after');

      return this.state === 'passed';
    }.bind(this));
  }

  diff() {
    const diff = new Diff({
      ignoreHeader: this.ignoreHeader,
      ignoreBody: this.ignoreBody
    });

    return {
      type: 'diff',
      bodyDiff: diff.diff(this.left.response.body, this.right.response.body, this.ignoreBody),
      headerDiff: diff.diff(this.left.response.headers, this.right.response.headers, this.ignoreHeader, true),
      meta: {
        left: this.left.response.meta,
        right: this.right.response.meta
      }
    };
  }

  callHook(hook) {
    if (this[hook]) {
      if (this.verbose) {
        console.log(`[DEBUG] call ${hook} test callback`); // eslint-disable-line no-console
      }

      const p = this[hook](this);
      if (p) {
        return p;
      }
    }

    return Promise.resolve();
  }
}

module.exports = Test;
