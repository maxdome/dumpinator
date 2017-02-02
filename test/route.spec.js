'use strict';

const inspect = require('inspect.js');

const Route = require('../src/route');

describe('Route', () => {
  describe('class', () => {
    it('instanciates a Route', () => {
      const route = new Route({});
      inspect(route).isObject();
    });
  });

  describe('load', () => {
    it('has a load() method', () => {
      const route = new Route({});
      inspect(route).hasMethod('load');
    });

    it('loads a route', () => {
      const route = new Route({
        method: 'GET',
        url: 'https://raw.githubusercontent.com/maxdome/dumpinator/develop/test/fixtures/v1/banana.json'
      });
      const p = route.load();
      inspect(p).isPromise();
      return p.then((res) => {
        inspect(res).isJSON();
        inspect(res).hasKey('body');
      });
    });
  });
});
