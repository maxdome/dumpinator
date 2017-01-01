'use strict';

const inspect = require('inspect.js');

const Route = require('../src/route');

describe('Route', () => {
  describe('class', () => {
    it('creates a route object', () => {
      const route = new Route({
        hostname: 'http://dumpi.rocks',
        left: { url: 'foo' },
        right: { url: 'bar' }
      });

      inspect(route.toJSON()).isEql({
        left: {
          url: 'http://dumpi.rocks/foo',
          method: 'GET'
        },
        right: {
          url: 'http://dumpi.rocks/bar',
          method: 'GET'
        },
        name: 'GET /foo <> /bar',
        id: '2ceac3e8d18e05a6e7a6cfabfcf1c6fe'
      });
    });
  });

  it('overwrites hostname', () => {
    const route = new Route({
      hostname: 'http://dumpi.rocks',
      left: {
        hostname: 'http://test.dumpi.rocks',
        url: 'foo'
      },
      right: {
        hostname: 'http://stage.dumpi.rocks',
        url: 'bar'
      }
    });

    inspect(route.toJSON()).hasProps({
      left: {
        url: 'http://test.dumpi.rocks/foo',
        method: 'GET'
      },
      right: {
        url: 'http://stage.dumpi.rocks/bar',
        method: 'GET'
      }
    });
  });
});
