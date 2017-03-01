'use strict';

const path = require('path');
const spawn = require('child_process').spawn;
const exec = require('child_process').exec;
const mkdirp = require('mkdirp-then');

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

      // yield mkdirp(this.leftDir);
      // yield mkdirp(this.rightDir);
      // yield this.runShellTask('git', ['clone', gitUrl, '.'], {
      //   cwd: this.leftDir
      // });
      // yield this.gitCheckout(gitTags[0]);
      //
      // yield this.runShellTask('git', ['clone', gitUrl, '.'] || 'HEAD', {
      //   cwd: this.rightDir
      // });
      // yield this.gitCheckout(gitTags[1]);
    }.bind(this));

    // checkout left

    // checkout right

    // start left

    // start right
  }

  runShellTask(command, args, opts) {
    console.log(`[DP GIT RUN] ${command} ${args.join(' ')} in dir: (${opts.cwd})`);
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

  gitCheckout(tag) {
    return this.runShellTask('git', ['checkout', tag]);
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
}

module.exports = GitHelper;
