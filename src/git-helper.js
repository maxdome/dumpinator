'use strict';

const path = require('path');
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const mkdirp = require('mkdirp-then');
const rmdir = require('rmdir');

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
      console.log('[DP GIT] Clone from:', gitUrl); // eslint-disable-line no-console

      yield this.clean();
      yield mkdirp(this.leftDir);
      yield mkdirp(this.rightDir);
      yield this.runShellTask('git', ['clone', gitUrl, '.'], {
        cwd: this.leftDir
      });
      yield this.gitCheckout(gitTags[0] || 'HEAD', {
        cwd: this.leftDir
      });

      yield this.runShellTask('git', ['clone', gitUrl, '.'], {
        cwd: this.rightDir
      });
      yield this.gitCheckout(gitTags[1] || 'HEAD', {
        cwd: this.rightDir
      });
    }.bind(this));
  }

  runShellTask(command, args, opts) {
    opts = opts || {};
    console.log(`[DP GIT RUN] ${command} ${args.join(' ')} in dir: (${opts.cwd})`);  // eslint-disable-line no-console
    return new Promise((resolve, reject) => {
      const cld = spawn(command, args, opts);

      cld.stdout.on('data', (data) => {
        console.log(`[DP GIT] ${data}`); // eslint-disable-line no-console
      });

      cld.stderr.on('data', (data) => {
        console.log(`[DP GIT ERROR] ${data}`); // eslint-disable-line no-console
      });

      cld.on('close', (code) => {
        if (code) {
          return reject(code);
        }

        return resolve(code);
      });
    });
  }

  gitCheckout(tag, opts) {
    return this.runShellTask('git', ['checkout', tag], opts);
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
