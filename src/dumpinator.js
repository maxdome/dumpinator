/* eslint strict: [2, global] */

'use strict';

const path = require('path');
const co = require('co');
const Request = require('./request');
const Stash = require('./stash');
const Notify = require('./notify');


const headers = {
  accept: 'application/json'
};

class Dumpinator {
  static run(config) {
    console.log(config);

    const parallelRequests = 2;
    const jobs = [];
    const notify = new Notify();
    const routes = config.getRoutes();

    routes.forEach((test) => {
      notify.addTest(test);
      jobs.push(co(function* task() {
        const request = new Request();
        const response = yield request.load(test);

        const stash = new Stash(path.join(__dirname, `../tmp/${test.id}.json`));
        yield stash.add(response);
        notify.testLoaded(test, 'success');
      }));
    });

    this.parallelize(jobs, parallelRequests).then((res) => {
      console.log('Collect requests done!');
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
}

module.exports = Dumpinator;
