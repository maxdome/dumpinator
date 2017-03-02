'use strict';

const inspect = require('inspect.js');
const sinon = require('sinon');

inspect.useSinon(sinon);

const Dumpinator = require('../src/dumpinator');
const Config = require('../src/config');

describe('Dumpinator', () => {
  describe('run()', () => {
    let config;

    beforeEach(() => {
      config = new Config({
        reporter: {}
      });
      config.routes = [
        {
          id: 'd6d13704ca7ddfdb095505bc6e1cec6d',
          left: {
            method: 'GET',
            url: 'https://raw.githubusercontent.com/maxdome/dumpinator/develop/test/fixtures/v1/test.json'
          },
          right: {
            method: 'GET',
            url: 'https://raw.githubusercontent.com/maxdome/dumpinator/develop/test/fixtures/v1/test.json'
          },
          name: 'GET test'
        }
      ];
    });

    it('calls beforeEach and afterEach callbacks', () => {
      config.beforeEach = sinon.stub();
      config.afterEach = sinon.stub();
      const result = Dumpinator.run(config);
      return result.then(() => {
        inspect(config.beforeEach).wasCalledOnce();
        inspect(config.afterEach).wasCalledOnce();
      });
    });

    it('calls before route and after route callbacks', () => {
      config.routes[0].before = sinon.stub();
      config.routes[0].after = sinon.stub();
      const result = Dumpinator.run(config);
      return result.then(() => {
        inspect(config.routes[0].before).wasCalledOnce();
        inspect(config.routes[0].after).wasCalledOnce();
      });
    });
  });
});
