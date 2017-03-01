'use strict';

const spawn = require('child_process').spawn;
// const exec = require('child_process').exec;
const colorfy = require('colorfy');

class Utils {
  static runShellTask(command, args, opts) {
    opts = opts || {};

    colorfy()
    .yellow('dp run command')
    .txt('in dir')
    .azure(`${opts.cwd}`)
    .nl()
    .yellow('>')
    .azure(`${command} ${args.join(' ')}`)
    .print();

    const listenFor = opts.listenFor ? new RegExp(opts.listenFor.join('|')) : null;
    return new Promise((resolve, reject) => {
      const cld = spawn(command, args, opts);

      cld.stdout.on('data', (data) => {
        if (listenFor && listenFor.test(data)) {
          return resolve(cld);
        }
        // console.log(`[DP GIT] ${data}`); // eslint-disable-line no-console
      });

      cld.stderr.on('data', (data) => {
        console.log(`[DP GIT ERROR] ${data}`); // eslint-disable-line no-console
      });

      cld.on('close', (code) => {
        if (code) {
          return reject(code);
        }

        return resolve(cld);
      });
    });
  }
}

module.exports = Utils;
