'use strict';

const path = require('path');
const exec = require('child_process').exec;
const mkdirp = require('mkdirp-then');
const rmdir = require('rmdir');
const utils = require('./utils/utils');
const co = require('co');

class GitHelper {
  constructor(conf) {
    conf = conf || {};
    this.gitUrl = conf.gitUrl;
    this.tmpDir = conf.tmpDir || path.join(process.cwd(), '.dumpinator-tmp/');
    this.leftDir = path.join(this.tmpDir, 'left');
    this.rightDir = path.join(this.tmpDir, 'right');
    this.verbose = true;
  }

  clone(gitTags) {
    return co(function* g() {
      let gitUrl = this.gitUrl;
      if (!gitUrl) {
        gitUrl = yield this.getGitUrl();
      }

      if (this.verbose) {
        console.log('[DP GIT] Clone from:', gitUrl); // eslint-disable-line no-console
      }

      yield this.clean();
      yield mkdirp(this.leftDir);
      yield mkdirp(this.rightDir);
      yield this.gitClone(gitUrl, {
        cwd: this.leftDir
      });
      yield this.gitCheckout(gitTags[0] || 'HEAD', {
        cwd: this.leftDir
      });
      yield this.gitClone(gitUrl, {
        cwd: this.rightDir
      });
      yield this.gitCheckout(gitTags[1] || 'HEAD', {
        cwd: this.rightDir
      });
    }.bind(this));
  }

  gitClone(url, opts) {
    return utils.runShellTask('git', ['clone', '-q', url, '.'], opts);
  }

  gitCheckout(tag, opts) {
    return utils.runShellTask('git', ['checkout', '-q', tag], opts);
  }

  getGitUrl() {
    return new Promise((resolve, reject) => {
      exec('git remote get-url origin', (err, stdout, stderr) => {
        if (err || stderr) {
          return reject(err || stderr);
        }

        resolve(stdout.trim());
      });
    });
  }

  clean() {
    return new Promise((resolve, reject) => {
      rmdir(this.tmpDir, (err) => {
        if (err) {
          // return reject(err);
        }

        resolve();
      });
    });
  }
}

module.exports = GitHelper;
