/* eslint strict: [2, global] */

'use strict';

const path = require('path');
const co = require('co');
const glob = require('glob');
const Request = require('./request');
const Stash = require('./stash');
const Notify = require('./notify');
const Diff = require('./diff');

class Dumpinator {
  static run(config) {
    const parallelRequests = 2;
    const jobs = [];
    const notify = new Notify();
    const routes = config.getRoutes();

    routes.forEach((test) => {
      if (config.options.debug) {
        console.log('[DEBUG] add route:', test); // eslint-disable-line no-console
      }

      notify.addTest(test);
      jobs.push(co(function* task() {
        const request = new Request();
        let response;
        try {
          response = yield request.load(test);
        } catch (err) {
          notify.setState(test, 'download-failed', err.message);
          return;
        }

        const stash = new Stash(path.join(__dirname, `../tmp/${test.id}-${test.side}.json`));
        yield stash.add(response);
        notify.setState(test, 'downloaded');

        if (test.status && test.status !== response.meta.status) {
          notify.setState(test, 'failed', `HTTP status code ${test.status} expected, but got ${response.meta.status}`);

          return;
        }

        if (notify.getState(test) === 'downloaded') {
          const testResult = yield Dumpinator.compare(test);
          if (testResult === null) {
            notify.setTestPassed(test);
          } else {
            notify.setTestFailed(test);
          }
        } else if (notify.getState(test) === 'download-failed') {
          notify.setTestFailed(test);
        }
      }));
    });

    this.parallelize(jobs, parallelRequests).then((res) => {
      notify.finish();
    }).catch((err) => {
      notify.error(err);
      throw err;
    });

    return notify;
  }

  /**
   *
   * Runs n promises in parallel
   *
   * @method parallelize
   *
   * @param  {array} jobs Promise queue. Must be an array of promises
   * @param  {number} numParallel Number of jobs in parallel
   *
   * @return {Object} Returns a promise after last job hast been done
   */
  static parallelize(jobs, numParallel) {
    numParallel = numParallel || 2;
    const slots = [];
    const results = [];
    const beer = 'full';

    for (let i = 0; i < numParallel; i += 1) {
      slots.push(co(function* slotGenerator() {
        while (beer !== 'empty') { // it never gets empty ;)
          const next = jobs.shift();
          if (!next) {
            return; // we're done. Lets have a coffee :)
          }

          const res = yield next;
          results.push(res);
        }
      }));
    }

    return Promise.all(slots).then(() => results);
  }

  static report(notify) {
    const Reporter = require('./reporter/cli-reporter'); // eslint-disable-line global-require
    const reporter = new Reporter();
    return reporter.report(notify);
  }

  static compare(test) {
    return Promise.all(['left', 'right'].map((side) => {
      const stash = new Stash(path.join(__dirname, `../tmp/${test.id}-${side}.json`));
      return stash.fetch();
    })).then((res) => {
      const diff = new Diff();
      const headerDiff = diff.compare(res[0].headers, res[1].headers, test.ignoreHeader, true);
      if (!headerDiff) {
        return 'Headers don\'t match';
      }

      const bodyDiff = diff.compare(res[0].body, res[1].body, test.ignoreBody);
      if (!bodyDiff) {
        return 'Bodies don\'t match';
      }

      return null;
    });
  }

  static diff(testId) {
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
          msg: 'Multiple tests found. Provide a unique id.',
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
        headerDiff: yield diff.diff(left.headers, right.headers)
      };
    });
  }

  static reportDiff(diff, options) {
    const Reporter = require('./reporter/cli-reporter'); // eslint-disable-line global-require
    const reporter = new Reporter(options);
    reporter.diff(diff);
  }
}

module.exports = Dumpinator;
