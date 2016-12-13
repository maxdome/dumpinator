/* eslint strict: [2, global] */

'use strict';

const path = require('path');
const co = require('co');
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
      notify.addTest(test);
      jobs.push(co(function* task() {
        const request = new Request();
        let response;
        try {
          response = yield request.load(test);
        } catch (err) {
          if (err.status === 404) {
            notify.setState(test, 'download-failed', 'Not found');
            return;
          }

          throw err;
        }

        const stash = new Stash(path.join(__dirname, `../tmp/${test.id}-${test.order}.json`));
        yield stash.add(response);
        notify.setState(test, 'downloaded');

        if (notify.getState(test) === 'downloaded') {
          const testResult = yield Dumpinator.compare(test);
          if (testResult) {
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
      notify.emit('finish');
    }).catch((err) => {
      notify.emit('error', err);
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
            return; // we're finish now. Lets have a coffee :)
          }

          const res = yield next;
          results.push(res);
        }
      }));
    }

    return Promise.all(slots).then(() => results);
  }

  static report(notify) {
    const Reporter = require('./reporter/cli'); // eslint-disable-line
    return new Reporter(notify);
  }

  static compare(test) {
    return Promise.all(['left', 'right'].map((order) => {
      const stash = new Stash(path.join(__dirname, `../tmp/${test.id}-${order}.json`));
      return stash.fetch();
    })).then((res) => {
      const diff = new Diff();
      return diff.compare(res[0], res[1]);
    });
  }
}

module.exports = Dumpinator;
