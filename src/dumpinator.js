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
    const routes = config.routes;

    this.loadReporter(config.reporter, notify);

    co(function* runner() {
      if (config.before) {
        if (config.debug) {
          console.log('[DEBUG] call before all callback'); // eslint-disable-line no-console
        }

        const p = config.before(notify);
        if (p) {
          yield p;
        }
      }

      for (const route of routes) {
        if (config.debug) {
          console.log('[DEBUG] add route:', route); // eslint-disable-line no-console
        }

        notify.addTest(route);

        jobs.push(co(function* task() {
          for (const side of ['left', 'right']) {
            const test = Dumpinator.createTest(route, side);

            if (config.beforeEach) {
              if (config.debug) {
                console.log('[DEBUG] call before each route callback'); // eslint-disable-line no-console
              }

              const p = config.beforeEach(notify);
              if (p) {
                yield p;
              }
            }

            if (route.before) {
              if (config.debug) {
                console.log('[DEBUG] call before route callback'); // eslint-disable-line no-console
              }

              const p = route.before(notify);
              if (p) {
                yield p;
              }
            }

            const request = new Request();
            let response;
            let finish = false;
            try {
              response = yield request.load(test);
            } catch (err) {
              notify.setState(test, 'download-failed', err.message);
              finish = true;
            }

            if (!finish) {
              const stash = new Stash(path.join(__dirname, `../tmp/${test.id}-${test.side}.json`));
              yield stash.add(Dumpinator.extendResponse(response, test));
              notify.setState(test, 'downloaded');
              notify.setData(test, 'responseTime', response.meta.responseTime);

              if (test.status && test.status !== response.meta.status) {
                notify.setState(test, 'failed', `HTTP status code ${test.status} expected, but got ${response.meta.status}`);

                finish = true;
              }
            }

            if (!finish) {
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
            }

            if (route.after) {
              if (config.debug) {
                console.log('[DEBUG] call after route callback'); // eslint-disable-line no-console
              }

              const p = route.after(notify);
              if (p) {
                yield p;
              }
            }

            if (config.afterEach) {
              if (config.debug) {
                console.log('[DEBUG] call after each callback'); // eslint-disable-line no-console
              }

              const p = config.afterEach(notify);
              if (p) {
                yield p;
              }
            }
          }
        }));
      }

      yield this.parallelize(jobs, parallelRequests);

      if (config.after) {
        if (config.debug) {
          console.log('[DEBUG] call after all method'); // eslint-disable-line no-console
        }

        const p = config.after(notify);
        if (p) {
          yield p;
        }
      }
    }.bind(this)).then((res) => {
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

  static loadReporter(config, notify) {
    if (config.cli) {
      const CLIReporter = require('./reporter/cli-reporter'); // eslint-disable-line global-require
      const cliReporter = new CLIReporter(config.cli);
      cliReporter.report(notify);
    }

    if (config.html) {
      const HTMLReporter = require('./reporter/html-reporter'); // eslint-disable-line global-require
      const htmlReporter = new HTMLReporter(config.html);
      htmlReporter.report(notify);
    }
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
          msg: 'Multiple tests found. Provide an unique id.',
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
        headerDiff: yield diff.diff(left.headers, right.headers),
        meta: {
          left: left.meta,
          right: right.meta
        }
      };
    });
  }

  static reportDiff(diff, options) {
    const Reporter = require('./reporter/cli-reporter'); // eslint-disable-line global-require
    const reporter = new Reporter(options);
    reporter.diff(diff);
  }

  static extendResponse(response, test) {
    response.meta.expectedStatus = test.status;
    return response;
  }

  static createTest(route, side) {
    return Object.assign({
      side,
      id: route.id,
      name: route.name
    }, route[side]);
  }
}

module.exports = Dumpinator;
