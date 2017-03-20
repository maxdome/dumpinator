'use strict';

const inspect = require('inspect.js');
const Config = require('../src/config');

describe('Config', () => {
  let config;
  const globalHeaders = {
    'content-type': 'application/json',
    'accept-language': 'en-US'
  };
  const globalQueries = {
    globalQuery: 123
  };

  beforeEach(() => {
    config = new Config();
  });

  describe('parseJSON()', () => {
    it('fails if properties are invalid', () => {
      const fn = () => config.parseJSON({ foo: {} });
      inspect(fn).doesThrow('Config invalid: Key "foo" is not allowed!');
    });

    it('fails if defaults\'s properties are invalid', () => {
      const fn = () => config.parseJSON({ defaults: { foo: {} } });
      inspect(fn).doesThrow('Config invalid: Key "foo" in "defaults" is not allowed!');
    });

    it('accepts routes as strings', () => {
      config.parseJSON({
        routes: ['pages', 'assets', 'components']
      });
      const expectedResult = [
        {
          left: {
            url: 'pages',
            method: 'GET'
          },
          right: {
            url: 'pages',
            method: 'GET'
          }
        }, {
          left: {
            url: 'assets',
            method: 'GET'
          },
          right: {
            url: 'assets',
            method: 'GET'
          }
        }, {
          left: {
            url: 'components',
            method: 'GET'
          },
          right: {
            url: 'components',
            method: 'GET'
          }
        }
      ];

      inspect(config.routes[0]).hasProps(expectedResult[0]);
      inspect(config.routes[1]).hasProps(expectedResult[1]);
      inspect(config.routes[2]).hasProps(expectedResult[2]);
    });

    it('accepts routes as objects', () => {
      config.parseJSON({
        routes: [{ url: 'pages', status: 204 }, { url: 'assets', status: 204 }, { url: 'components', status: 204 }]
      });

      const expectedResult = [
        {
          left: {
            status: 204,
            url: 'pages',
            method: 'GET'
          },
          right: {
            status: 204,
            url: 'pages',
            method: 'GET'
          }
        },
        {
          left: {
            status: 204,
            url: 'assets',
            method: 'GET'
          },
          right: {
            status: 204,
            url: 'assets',
            method: 'GET'
          }
        },
        {
          left: {
            status: 204,
            url: 'components',
            method: 'GET'
          },
          right: {
            status: 204,
            url: 'components',
            method: 'GET'
          }
        }
      ];

      inspect(config.routes).isEql(expectedResult);
    });

    it('merges global data into the routes', () => {
      config.parseJSON({
        defaults: {
          left: { hostname: 'https://my.api.com/v1/', query: globalQueries, header: globalHeaders },
          right: { hostname: 'http://localhost/v1/', query: globalQueries, header: globalHeaders }
        },
        routes: ['pages', 'assets', 'components']
      });

      const expectedResult = [
        {
          left: {
            method: 'GET',
            url: 'https://my.api.com/v1/pages',
            query: globalQueries,
            header: globalHeaders
          },
          right: {
            method: 'GET',
            url: 'http://localhost/v1/pages',
            query: globalQueries,
            header: globalHeaders
          }
        }, {
          left: {
            method: 'GET',
            url: 'https://my.api.com/v1/assets',
            query: globalQueries,
            header: globalHeaders
          },
          right: {
            method: 'GET',
            url: 'http://localhost/v1/assets',
            query: globalQueries,
            header: globalHeaders
          }
        }, {
          left: {
            method: 'GET',
            url: 'https://my.api.com/v1/components',
            query: globalQueries,
            header: globalHeaders
          },
          right: {
            method: 'GET',
            url: 'http://localhost/v1/components',
            query: globalQueries,
            header: globalHeaders
          }
        }
      ];

      inspect(config.routes).isEql(expectedResult);
    });

    it('overrides global properties with local ones', () => {
      config.parseJSON({
        defaults: {
          left: { method: 'POST', query: globalQueries }
        },
        routes: [{ url: 'bundle', query: { globalQuery: 456 } }]
      });

      const expectedResult = [
        {
          left: {
            method: 'POST',
            url: 'bundle',
            query: {
              globalQuery: 123
            }
          },
          right: {
            method: 'GET',
            url: 'bundle',
            query: {
              globalQuery: 456
            }
          }
        }
      ];

      inspect(config.routes).isEql(expectedResult);
    });

    it('accepts a before callback', () => {
      const fn = () => {};

      config.parseJSON({
        defaults: {
          left: { method: 'GET', hostname: 'http://dumpi.rocks/' },
          right: { method: 'GET', hostname: 'http://dumpi.sucks/' }
        },
        routes: [{ url: 'ping' }],
        before: fn
      });

      inspect(config.before).isEql(fn);
    });

    it('accepts a after callback', () => {
      const fn = () => {};

      config.parseJSON({
        defaults: {
          left: { method: 'GET', hostname: 'http://dumpi.rocks/' },
          right: { method: 'GET', hostname: 'http://dumpi.sucks/' }
        },
        routes: [{ url: 'ping' }],
        after: fn
      });

      inspect(config.after).isEql(fn);
    });

    it('accepts a beforeEach callback', () => {
      const fn = () => {};

      config.parseJSON({
        defaults: {
          left: { method: 'GET', hostname: 'http://dumpi.rocks/' },
          right: { method: 'GET', hostname: 'http://dumpi.sucks/' }
        },
        routes: [{ url: 'ping' }],
        beforeEach: fn
      });

      inspect(config.beforeEach).isEql(fn);
    });

    it('accepts a afterEach callback', () => {
      const fn = () => {};

      config.parseJSON({
        defaults: {
          left: { method: 'GET', hostname: 'http://dumpi.rocks/' },
          right: { method: 'GET', hostname: 'http://dumpi.sucks/' }
        },
        routes: [{ url: 'ping' }],
        afterEach: fn
      });

      inspect(config.afterEach).isEql(fn);
    });

    it('accepts a before callback on route level', () => {
      const fn = () => {};

      config.parseJSON({
        defaults: {
          left: { method: 'GET', hostname: 'http://dumpi.rocks/' },
          right: { method: 'GET', hostname: 'http://dumpi.sucks/' }
        },
        routes: [{ url: 'ping', before: fn }]
      });

      inspect(config.routes).isEql([{
        left: { url: 'http://dumpi.rocks/ping', method: 'GET' },
        right: { url: 'http://dumpi.sucks/ping', method: 'GET' },
        before: fn
      }]);
    });

    it('accepts a after callback on route level', () => {
      const fn = () => {};

      config.parseJSON({
        defaults: {
          left: { method: 'GET', hostname: 'http://dumpi.rocks/' },
          right: { method: 'GET', hostname: 'http://dumpi.sucks/' }
        },
        routes: [{ url: 'ping', after: fn }]
      });

      inspect(config.routes).isEql([{
        left: { url: 'http://dumpi.rocks/ping', method: 'GET' },
        right: { url: 'http://dumpi.sucks/ping', method: 'GET' },
        after: fn
      }]);
    });
  });

  describe('getRoutes()', () => {
    const routesConfig = [
      {
        id: 'd6d13704ca7ddfdb095505bc6e1cec6d',
        left: {
          method: 'GET',
          url: 'https://my.api.com/v1/pages'
        },
        right: {
          method: 'GET',
          url: 'http://localhost/v1/pages'
        },
        name: 'GET pages' },
      {
        id: 'bf86b8e4d608bf45f86eeeaf2e5be950',
        left: {
          method: 'GET',
          url: 'https://my.api.com/v1/assets'
        },
        right: {
          method: 'GET',
          url: 'http://localhost/v1/assets'
        },
        name: 'GET assets' },
      {
        id: '894f1ac8202fa67e02135a415f391801',
        left: {
          method: 'GET',
          url: 'https://my.api.com/v1/components'
        },
        right: {
          method: 'GET',
          url: 'http://localhost/v1/components'
        },
        name: 'GET components' }

    ];

    it('Returns all routes', () => {
      const testConfig = new Config();
      testConfig.routes = routesConfig;

      const allRoutes = testConfig.getRoutes();
      inspect(allRoutes).isArray().hasLength(6);

      inspect(allRoutes[0]).hasProps({
        id: 'd6d13704ca7ddfdb095505bc6e1cec6d',
        url: 'https://my.api.com/v1/pages',
        side: 'left',
        name: 'GET pages'
      });

      inspect(allRoutes[1]).hasProps({
        id: 'd6d13704ca7ddfdb095505bc6e1cec6d',
        url: 'http://localhost/v1/pages',
        side: 'right',
        name: 'GET pages'
      });

      inspect(allRoutes[4]).hasProps({
        id: '894f1ac8202fa67e02135a415f391801',
        url: 'https://my.api.com/v1/components',
        side: 'left',
        name: 'GET components'
      });

      inspect(allRoutes[5]).hasProps({
        id: '894f1ac8202fa67e02135a415f391801',
        url: 'http://localhost/v1/components',
        side: 'right',
        name: 'GET components'
      });
    });
  });

  describe('addRoute', () => {
    it('creates a route object', () => {
      const route = config.addRoute({
        hostname: 'http://dumpi.rocks',
        left: { url: 'foo' },
        right: { url: 'bar' }
      });

      inspect(route).isEql({
        left: {
          url: 'http://dumpi.rocks/foo',
          method: 'GET'
        },
        right: {
          url: 'http://dumpi.rocks/bar',
          method: 'GET'
        }
      });
    });

    it('validate input parameters, all passed', () => {
      const route = config.addRoute({
        hostname: 'http://dumpi.rocks',
        left: { url: 'foo' },
        right: { url: 'bar' }
      });

      inspect(route).isEql({
        left: {
          url: 'http://dumpi.rocks/foo',
          method: 'GET'
        },
        right: {
          url: 'http://dumpi.rocks/bar',
          method: 'GET'
        }
      });
    });

    it('validate input parameters, should fail', () => {
      inspect(() => {
        const route = config.addRoute({ // eslint-disable-line no-unused-vars
          hustnam: 'http://dumpi.rocks',
          left: { url: 'foo' },
          right: { url: 'bar' }
        });
      }).doesThrow(/Invalid configuration/);
    });

    it('validate input parameters in left site, should fail', () => {
      inspect(() => {
        const route = config.addRoute({ // eslint-disable-line no-unused-vars
          hostname: 'http://dumpi.rocks',
          left: { url: 'foo', hustnam: 'http://nonsens.io' },
          right: { url: 'bar' }
        });
      }).doesThrow(/Invalid configuration/);
    });

    it('validate input parameters in right site, should fail', () => {
      inspect(() => {
        const route = config.addRoute({ // eslint-disable-line no-unused-vars
          hostname: 'http://dumpi.rocks',
          left: { url: 'foo' },
          right: { url: 'bar', hustnam: 'http://nonsens.io' }
        });
      }).doesThrow(/Invalid configuration/);
    });

    it('throws an error if method is not allowed', () => {
      inspect(() => {
        const route = config.addRoute({ // eslint-disable-line no-unused-vars
          method: 'GOT',
          left: { url: 'foo' },
          right: { url: 'bar' }
        });
      }).doesThrow(/Invalid configuration/);
    });

    it('throws an error if before is used in a side level', () => {
      inspect(() => {
        const route = config.addRoute({ // eslint-disable-line no-unused-vars
          method: 'GOT',
          left: { url: 'foo', before: 'foo' },
          right: { url: 'bar' }
        });
      }).doesThrow(/Invalid configuration/);
    });

    it('overwrites hostname', () => {
      const route = config.addRoute({
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

      inspect(route).hasProps({
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
      const route = config.addRoute({
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

      inspect(route).hasProps({
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
      const route = config.addRoute({
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

      inspect(route).hasProps({
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
      const route = config.addRoute({
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

      inspect(route).hasProps({
        left: {
          url: 'http://test.dumpi.rocks/foo',
          method: 'GET'
        },
        right: {
          url: 'http://stage.dumpi.rocks/bar',
          method: 'GET'
        },
        ignoreBody: ['foo']
      });
    });

    it('has a ignoreHeader property', () => {
      const route = config.addRoute({
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

      inspect(route).hasProps({
        left: {
          url: 'http://test.dumpi.rocks/foo',
          method: 'GET'
        },
        right: {
          url: 'http://stage.dumpi.rocks/bar',
          method: 'GET'
        },
        ignoreHeader: ['etag', 'x-dumpinator']
      });
    });

    it('has a global transform method', () => {
      const fn = () => {};
      const route = config.addRoute({
        hostname: 'http://dumpi.rocks',
        left: {
          hostname: 'http://test.dumpi.rocks',
          url: 'foo'
        },
        right: {
          hostname: 'http://stage.dumpi.rocks',
          url: 'bar'
        },
        transform: fn
      });

      inspect(route).hasProps({
        left: {
          url: 'http://test.dumpi.rocks/foo',
          method: 'GET',
          transform: fn
        },
        right: {
          url: 'http://stage.dumpi.rocks/bar',
          method: 'GET',
          transform: fn
        }
      });
    });

    it('has a route level transform method', () => {
      const fn = () => {};
      const route = config.addRoute({
        hostname: 'http://dumpi.rocks',
        left: {
          hostname: 'http://test.dumpi.rocks',
          url: 'foo'
        },
        right: {
          hostname: 'http://stage.dumpi.rocks',
          url: 'bar',
          transform: fn
        }
      });

      inspect(route).hasProps({
        left: {
          url: 'http://test.dumpi.rocks/foo',
          method: 'GET'
        },
        right: {
          url: 'http://stage.dumpi.rocks/bar',
          method: 'GET',
          transform: fn
        }
      });
    });
  });
});
