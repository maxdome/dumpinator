'use strict';

const path = require('path');
const co = require('co');
const Request = require('./request');
const Stash = require('./stash');

const config = {};

const headers = {
  accept: 'application/json',
  platform: 'web',
  device_type: 'webportal',
  client: 'mxd_package',
  language: 'de_DE'
};

class Dumpinator {
  static run() {
    const tests = [
      { url: 'http://localhost:3000/api/v1/assets/1629266', headers, slug: 'assets-left' },
      { url: 'http://localhost:3000/api/v1/assets/1629266', headers, slug: 'assets-right' }
    ];
    const paralelRequests = 2;
    const jobs = [];

    tests.forEach((test) => {
      jobs.push(co(function* task() {
        const request = new Request();
        const response = yield request.load(test);

        const stash = new Stash(path.join(__dirname, `../tmp/${test.slug}.json`));
        yield stash.add(response);
      }));
    });

    const p = this.paralize(jobs, paralelRequests);
    return p;
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

    for (let i = 0; i < numParalel; i += 1) {
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
}

module.exports = Dumpinator;
