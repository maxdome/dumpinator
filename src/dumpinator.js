'use strict';

const co = require('co');
const config = {};

class Dumpinator {
  static run() {
    const tests = config.tests;
    const paralelRequests = 2;

    return co(function *() {
      const jobs = [];
      for (const i = 0; i < paralelRequests; i++) {
        jobs.push(new Promise((resolve, reject) => {
          const test = tests.shift();
          if (!test) {
            resolve();
          }
        }));
      }

      yield Promise.all(jobs);
    });
  }

  runOne(test) {
    return co(function *() {

    });
  }

  /**
   *
   * Runs n promises paralel
   *
   * @method paralize
   *
   * @param  {array} jobs Promise queue. Must be an array of promises
   * @param  {number} numParalel Number of paralel jobs
   *
   * @return {Object} Returns a promise after last job hast been done
   */
  static paralize(jobs, numParalel) {
    numParalel = numParalel || 2;
    const slots = [];
    const results = [];
    const beer = 'full';

    for (let i = 0; i < numParalel; i++) {
      slots.push(co(function *() {
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

    return Promise.all(slots).then((r) => {
      return results;
    });
  }
}

module.exports = Dumpinator;
