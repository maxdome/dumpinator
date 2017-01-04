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
        id: 'd12681f36b140d6c1ba74c4813f4b6d7'
      });
    });

    it('validate input parameters, all passed', () => {
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
        id: 'd12681f36b140d6c1ba74c4813f4b6d7'
      });
    });

    it('validate input parameters, should fail', () => {
      inspect(() => {
        const route = new Route({ // eslint-disable-line no-unused-vars
          hustnam: 'http://dumpi.rocks',
          left: { url: 'foo' },
          right: { url: 'bar' }
        });
      }).doesThrow(/Invalid configuration/);
    });

    it('validate input parameters in left site, should fail', () => {
      inspect(() => {
        const route = new Route({ // eslint-disable-line no-unused-vars
          hostname: 'http://dumpi.rocks',
          left: { url: 'foo', hustnam: 'http://nonsens.io' },
          right: { url: 'bar' }
        });
      }).doesThrow(/Invalid configuration/);
    });

    it('validate input parameters in right site, should fail', () => {
      inspect(() => {
        const route = new Route({ // eslint-disable-line no-unused-vars
          hostname: 'http://dumpi.rocks',
          left: { url: 'foo' },
          right: { url: 'bar', hustnam: 'http://nonsens.io' }
        });
      }).doesThrow(/Invalid configuration/);
    });

    it('throws an error if method is not allowed', () => {
      inspect(() => {
        const route = new Route({ // eslint-disable-line no-unused-vars
          method: 'GOT',
          left: { url: 'foo' },
          right: { url: 'bar' }
        });
      }).doesThrow(/Invalid configuration/);
    });

    it('throws an error if before is used in a side level', () => {
      inspect(() => {
        const route = new Route({ // eslint-disable-line no-unused-vars
          method: 'GOT',
          left: { url: 'foo', before: 'foo' },
          right: { url: 'bar' }
        });
      }).doesThrow(/Invalid configuration/);
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

    it('has a before callback', () => {
      const fn = () => {};
      const route = new Route({
        hostname: 'http://dumpi.rocks',
        left: {
          hostname: 'http://test.dumpi.rocks',
          url: 'foo'
        },
        right: {
          hostname: 'http://stage.dumpi.rocks',
          url: 'bar'
        },
        before: fn
      });

      inspect(route.toJSON()).hasProps({
        left: {
          url: 'http://test.dumpi.rocks/foo',
          method: 'GET'
        },
        right: {
          url: 'http://stage.dumpi.rocks/bar',
          method: 'GET'
        },
        before: fn
      });
    });

    it('has a after callback', () => {
      const fn = () => {};
      const route = new Route({
        hostname: 'http://dumpi.rocks',
        left: {
          hostname: 'http://test.dumpi.rocks',
          url: 'foo'
        },
        right: {
          hostname: 'http://stage.dumpi.rocks',
          url: 'bar'
        },
        after: fn
      });

      inspect(route.toJSON()).hasProps({
        left: {
          url: 'http://test.dumpi.rocks/foo',
          method: 'GET'
        },
        right: {
          url: 'http://stage.dumpi.rocks/bar',
          method: 'GET'
        },
        after: fn
      });
    });

    it('has a ignoreBody property', () => {
      const route = new Route({
        hostname: 'http://dumpi.rocks',
        left: {
          hostname: 'http://test.dumpi.rocks',
          url: 'foo'
        },
        right: {
          hostname: 'http://stage.dumpi.rocks',
          url: 'bar'
        },
        ignoreBody: ['foo']
      });

      inspect(route.toJSON()).hasProps({
        left: {
          url: 'http://test.dumpi.rocks/foo',
          method: 'GET',
          ignoreBody: ['foo']
        },
        right: {
          url: 'http://stage.dumpi.rocks/bar',
          method: 'GET',
          ignoreBody: ['foo']
        }
      });
    });

    it('has a ignoreHeader property', () => {
      const route = new Route({
        hostname: 'http://dumpi.rocks',
        left: {
          hostname: 'http://test.dumpi.rocks',
          url: 'foo'
        },
        right: {
          hostname: 'http://stage.dumpi.rocks',
          url: 'bar'
        },
        ignoreHeader: ['etag', 'x-dumpinator']
      });

      inspect(route.toJSON()).hasProps({
        left: {
          url: 'http://test.dumpi.rocks/foo',
          method: 'GET',
          ignoreHeader: ['etag', 'x-dumpinator']
        },
        right: {
          url: 'http://stage.dumpi.rocks/bar',
          method: 'GET',
          ignoreHeader: ['etag', 'x-dumpinator']
        }
      });
    });
  });
});
