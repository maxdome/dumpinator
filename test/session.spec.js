'use strict';

const inspect = require('inspect.js');
const sinon = require('sinon');

inspect.useSinon(sinon);

const Session = require('../src/session');

describe('Session', () => {
  describe('class', () => {
    it('instanciates a Session', () => {
      const session = new Session([]);
      inspect(session).isObject();
      inspect(session.tests).isArray();
    });

    it('calls a test.add event on each added test', (done) => {
      const testOne = {
        left: { url: '/foo' },
        right: { url: '/foo' }
      };

      const testTwo = {
        left: { url: '/foo' },
        right: { url: '/foo' }
      };

      const stub = sinon.stub();

      const session = new Session();
      session.on('test.add', stub);
      session.addTests([testOne, testTwo]);
      inspect(session).isObject();
      inspect(session.tests).isArray();

      setTimeout(() => {
        inspect(stub).wasCalledTwice();
        inspect(stub).wasCalledWith(testOne);
        inspect(stub).wasCalledWith(testTwo);
        done();
      });
    });
  });

  describe('run', () => {
    it('returns a promise', () => {
      const session = new Session();
      const p = session.run();
      inspect(p).isPromise();
      return p;
    });

    it('calls before all and after all callbacks', () => {
      const session = new Session();
      session.before = sinon.stub();
      session.after = sinon.stub();

      return session.run().then(() => {
        inspect(session.before).wasCalledOnce();
        inspect(session.before).wasCalledWith(session);
        inspect(session.after).wasCalledOnce();
        inspect(session.after).wasCalledWith(session);
      });
    });

    it('runs all tests', () => {
      const stub = sinon.stub();
      stub.returns(Promise.resolve());

      const session = new Session();
      session.tests = [{
        run: stub
      }, {
        run: stub
      }, {
        run: stub
      }, {
        run: stub
      }];

      return session.run().then(() => {
        inspect(stub).hasCallCount(4);
      });
    });

    it('triggers a test.pass event when a test passes', () => {
      const stub = sinon.stub();
      const onStub = sinon.stub();
      stub.returns(Promise.resolve(true));

      const session = new Session();
      session.on('test.pass', onStub);
      session.tests = [{
        run: stub
      }, {
        run: stub
      }, {
        run: stub
      }, {
        run: stub
      }];

      return session.run().then(() => {
        inspect(stub).hasCallCount(4);
        inspect(onStub).hasCallCount(4);
        inspect(onStub).wasCalledWith(session.tests[0]);
        inspect(onStub).wasCalledWith(session.tests[1]);
        inspect(onStub).wasCalledWith(session.tests[2]);
        inspect(onStub).wasCalledWith(session.tests[3]);
      });
    });

    it('triggers a test.fail event when a test failes', () => {
      const stub = sinon.stub();
      const onStub = sinon.stub();
      stub.returns(Promise.resolve(false));

      const session = new Session();
      session.on('test.fail', onStub);
      session.tests = [{
        run: stub
      }, {
        run: stub
      }, {
        run: stub
      }, {
        run: stub
      }];

      return session.run().then(() => {
        inspect(stub).hasCallCount(4);
        inspect(onStub).hasCallCount(4);
        inspect(onStub).wasCalledWith(session.tests[0]);
        inspect(onStub).wasCalledWith(session.tests[1]);
        inspect(onStub).wasCalledWith(session.tests[2]);
        inspect(onStub).wasCalledWith(session.tests[3]);
      });
    });

    it('triggers a test.finish event when a test finishes', () => {
      const stub = sinon.stub();
      const onStub = sinon.stub();
      stub.returns(Promise.resolve(false));

      const session = new Session();
      session.on('test.finish', onStub);
      session.tests = [{
        run: stub
      }, {
        run: stub
      }, {
        run: stub
      }, {
        run: stub
      }];

      return session.run().then(() => {
        inspect(stub).hasCallCount(4);
        inspect(onStub).hasCallCount(4);
        inspect(onStub).wasCalledWith(session.tests[0]);
        inspect(onStub).wasCalledWith(session.tests[1]);
        inspect(onStub).wasCalledWith(session.tests[2]);
        inspect(onStub).wasCalledWith(session.tests[3]);
      });
    });

    it('crawls n pages in parallel', () => {
      const session = new Session();
      inspect(session).hasMethod('run');

      const parallelizeStub = sinon.spy(session, 'parallelize');

      const result = session.run();
      inspect(result).hasMethod('then');
      inspect(parallelizeStub).wasCalledOnce();
      return result;
    });
  });

  describe('parallelize()', () => {
    it('runs n promises in parallel', () => {
      const session = new Session();
      inspect(session).hasMethod('parallelize');

      let resolve;
      const task1 = Promise.resolve('one');
      const task2 = new Promise((_resolve) => {
        resolve = _resolve;
      });
      const task3 = Promise.resolve('three');
      const task4 = Promise.resolve('four');
      const task5 = Promise.resolve('five');

      const parallelize = session.parallelize([
        { run() { return task1; } },
        { run() { return task2; } },
        { run() { return task3; } },
        { run() { return task4; } },
        { run() { return task5; } }
      ], 2);

      inspect(parallelize).isPromise();
      parallelize.then((res) => {
        inspect(res).isEql(['one', 'three', 'four', 'five', 'two']);
      });

      setTimeout(() => resolve('two'));

      return parallelize;
    });
  });
});
