'use strict';

const EventEmitter = require('events');
const path = require('path');

const co = require('co');
const glob = require('glob');

const Test = require('./test');
const Stash = require('./stash');
const GitHelper = require('./git-helper');

class Session extends EventEmitter {
  constructor(conf) {
    conf = conf || {};
    super();

    this.verbose = conf.verbose || false;

    this.tests = [];
    this.num = 0;

    this.before = conf.before || null;
    this.beforeEach = conf.beforeEach || null;
    this.after = conf.after || null;
    this.afterEach = conf.afterEach || null;
    this.routes = conf.routes || [];
    this.parallelRequests = conf.parallelRequests || 2;
    this.gitTags = conf.gitTags || null;
  }

  addTests(routes) {
    routes.forEach((test) => {
      this.tests.push(new Test(test));

      if (this.verbose) {
        console.log('[DEBUG] add test:', test); // eslint-disable-line no-console
      }

      this.emit('test.add', test);
    });
  }

  run() {
    this.addTests(this.routes);
    return co(function* sessionRunner() {
      if (this.gitTags) {
        const git = new GitHelper();
        yield git.clone(this.gitTags);
      }

      if (this.before) {
        if (this.verbose) {
          console.log('[DEBUG] call before all callback'); // eslint-disable-line no-console
        }

        const p = this.before(this);
        if (p) {
          yield p;
        }
      }

      // run all tests
      yield this.parallelize(this.tests, this.parallelRequests);

      if (this.after) {
        if (this.verbose) {
          console.log('[DEBUG] call after all method'); // eslint-disable-line no-console
        }

        const p = this.after(this);
        if (p) {
          yield p;
        }
      }

      return this.getSessionState();
    }.bind(this)).then((state) => {
      this.emit('finish', state);
      return state;
    }).catch((err) => {
      this.emit('error', err);
    });
  }

  /**
   * Load session from stash
   */
  load(stashId) {
    const stashDir = path.join(__dirname, '../tmp/');
    return co(function* LoadGen() {
      const testFiles = glob.sync(`${stashId}*-left.json`, { cwd: stashDir });

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
          msg: 'Multiple tests found. Provide an unique id.',
          testFiles,
          query: stashId
        };
      }

      const leftStash = new Stash(path.join(stashDir, testFiles[0]));
      const left = yield leftStash.fetch();

      const rightStash = new Stash(path.join(stashDir, testFiles[0].replace('-left', '-right')));
      const right = yield rightStash.fetch();

      this.tests.push(new Test({
        left: left.test,
        right: right.test
      }));

      this.test.left.response = {
        headers: left.headers,
        body: left.body,
        meta: left.meta
      };

      this.test.right.response = {
        headers: right.headers,
        body: right.body,
        meta: right.meta
      };
    });
  }

  getSessionState() {
    /* eslint no-restricted-syntax: [0, 'ForInStatement'] */
    for (const key in this.tests) {
      if (this.tests.hasOwnProperty(key)) { // eslint-disable-line no-prototype-builtins
        if (this.tests[key].state !== 'passed') {
          return false;
        }
      }
    }

    return true;
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
  parallelize(jobs, numParallel) {
    numParallel = numParallel || 2;
    const slots = [];
    const results = [];
    const beer = 'full';
    let nextIndex = -1;

    for (let i = 0; i < numParallel; i += 1) {
      // eslint-disable-next-line no-loop-func
      slots.push(co(function* slotGenerator() {
        while (beer !== 'empty') { // it never gets empty ;)
          const next = jobs[nextIndex += 1];
          if (!next) {
            return; // we're done. Lets have a coffee :)
          }

          if (this.beforeEach) {
            if (this.verbose) {
              console.log('[DEBUG] call before each route callback'); // eslint-disable-line no-console
            }

            const p = this.beforeEach(next);
            if (p) {
              yield p;
            }
          }

          const res = yield next.run();
          this.emit(`test.${(res ? 'pass' : 'fail')}`, next);
          this.emit('test.finish', next);

          if (this.afterEach) {
            if (this.verbose) {
              console.log('[DEBUG] call after each callback'); // eslint-disable-line no-console
            }

            const p = this.afterEach(next, this);
            if (p) {
              yield p;
            }
          }

          results.push(res);
        }
      }.bind(this)));
    }

    return Promise.all(slots).then(() => results);
  }
}

module.exports = Session;
