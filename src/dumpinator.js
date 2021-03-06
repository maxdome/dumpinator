/* eslint strict: [2, global] */

'use strict';

const path = require('path');
const co = require('co');
const glob = require('glob');
const Stash = require('./stash');
const Diff = require('./diff');
const Session = require('./session');
const Reporter = require('./reporter/cli-reporter');
const Utils = require('./utils/utils');

class Dumpinator extends Utils {
  static run(config) {
    // new fancy stuff
    const session = new Session(config);

    // load reporter
    this.loadReporter(config.reporter, session);

    return session.run();
  }

  static runDiff(config) {
    // new fancy stuff
    const session = new Session(config);

    // load reporter
    this.loadReporter(config.reporter, session);

    return co(function* runDiffGenerator() {
      const allPassed = yield session.run();
      if (!allPassed) {
        const test = session.tests[0];
        const reporter = new Reporter({
          noColor: config.noColor,
          showFullDiff: config.showFullDiff
        });
        reporter.diff(test.diff());
      }

      return allPassed;
    });
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

  static loadReporter(config, session) {
    Object.keys(config).forEach((reporterName) => {
      let ReporterModule;
      try {
        // eslint-disable-next-line import/no-dynamic-require, global-require
        ReporterModule = require(`./reporter/${reporterName}-reporter`);
      } catch (err) {
        // reporter not found
        throw new Error(`Reporter '${reporterName}' not found!`);
      }

      const reporter = new ReporterModule(config[reporterName]);
      reporter.report(session);
    });
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

  static diff(testId, options) {
    options = options || {};

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
        bodyDiff: yield diff.diff(left.body, right.body, options.showIgnored ? null : left.ignoreBody),
        headerDiff: yield diff.diff(left.headers, right.headers, options.showIgnored ? null : left.ignoreHeader),
        meta: {
          left: left.meta,
          right: right.meta
        }
      };
    });
  }

  static reportDiff(diff, options) {
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

  static show(testId, options) {
    return co(function*() {
      options = options || {};

      const stashDir = path.join(__dirname, '../tmp/');
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

      return {
        left,
        right
      }
    });
  }
}

module.exports = Dumpinator;
