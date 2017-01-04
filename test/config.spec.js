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
          id: '31e709c7ae486e2990f47c9d73a8beca',
          left: {
            url: 'pages',
            method: 'GET'
          },
          right: {
            url: 'pages',
            method: 'GET'
          },
          name: 'GET pages'
        }, {
          id: '74d26cd23c19e21ce8226d5e43a30e8b',
          left: {
            url: 'assets',
            method: 'GET'
          },
          right: {
            url: 'assets',
            method: 'GET'
          },
          name: 'GET assets'
        }, {
          id: 'ae88ff63663432c8aa737a2924f7c14c',
          left: {
            url: 'components',
            method: 'GET'
          },
          right: {
            url: 'components',
            method: 'GET'
          },
          name: 'GET components'
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
          id: '946042516abd8c77b7e2d3792b6b4659',
          left: {
            status: 204,
            url: 'pages',
            method: 'GET'
          },
          right: {
            status: 204,
            url: 'pages',
            method: 'GET'
          },
          name: 'GET pages' },
        {
          id: 'd5f6d895ae39795d0b30b749ea919c76',
          left: {
            status: 204,
            url: 'assets',
            method: 'GET'
          },
          right: {
            status: 204,
            url: 'assets',
            method: 'GET'
          },
          name: 'GET assets' },
        {
          id: '8d36737c118e495e4a2d3854c8f40368',
          left: {
            status: 204,
            url: 'components',
            method: 'GET'
          },
          right: {
            status: 204,
            url: 'components',
            method: 'GET'
          },
          name: 'GET components' }

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
          id: 'de111c99b7146239bc4b62c03a36e18b',
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
          },
          name: 'GET /v1/pages'
        }, {
          id: '69da42f4f6bf88d08c680cc940677f62',
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
          },
          name: 'GET /v1/assets'
        }, {
          id: '237aada82c3418942cc861e0b2ac4536',
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
          },
          name: 'GET /v1/components' }
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
          id: 'f3130fa2c71c816a6a7ee9a35b8bbe7f',
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
          },
          name: 'POST bundle'
        }
      ];

      inspect(config.routes).isEql(expectedResult);
    });

    it('accepts a before method', () => {
      const fn = () => {};

      config.parseJSON({
        defaults: {
          left: { method: 'GET', hostname: 'http://dumpi.rocks/' },
          right: { method: 'GET', hostname: 'http://dumpi.sucks/' }
        },
        routes: [{ url: 'ping', before: fn }]
      });

      inspect(config.routes).isEql([{
        id: '2e2b8e3461e5aed3f0c28071828a17e9',
        left: { url: 'http://dumpi.rocks/ping', method: 'GET' },
        right: { url: 'http://dumpi.sucks/ping', method: 'GET' },
        name: 'GET /ping',
        before: fn
      }]);
    });

    it('accepts a after method', () => {
      const fn = () => {};

      config.parseJSON({
        defaults: {
          left: { method: 'GET', hostname: 'http://dumpi.rocks/' },
          right: { method: 'GET', hostname: 'http://dumpi.sucks/' }
        },
        routes: [{ url: 'ping', after: fn }]
      });

      inspect(config.routes).isEql([{
        id: '2e2b8e3461e5aed3f0c28071828a17e9',
        left: { url: 'http://dumpi.rocks/ping', method: 'GET' },
        right: { url: 'http://dumpi.sucks/ping', method: 'GET' },
        name: 'GET /ping',
        after: fn
      }]);
    });

    it('accepts a before method on route level', () => {
      const fn = () => {};
      const fn2 = () => {};
      const fn3 = () => {};

      config.parseJSON({
        defaults: {
          left: { method: 'GET', hostname: 'http://dumpi.rocks/', before: fn2 },
          right: { method: 'GET', hostname: 'http://dumpi.sucks/', before: fn3 }
        },
        routes: [{ url: 'ping', before: fn }]
      });

      inspect(config.routes).isEql([{
        id: '2e2b8e3461e5aed3f0c28071828a17e9',
        left: { url: 'http://dumpi.rocks/ping', method: 'GET', before: fn2 },
        right: { url: 'http://dumpi.sucks/ping', method: 'GET', before: fn3 },
        name: 'GET /ping',
        before: fn
      }]);
    });

    it('accepts a after method on route level', () => {
      const fn = () => {};
      const fn2 = () => {};
      const fn3 = () => {};

      config.parseJSON({
        defaults: {
          left: { method: 'GET', hostname: 'http://dumpi.rocks/', after: fn2 },
          right: { method: 'GET', hostname: 'http://dumpi.sucks/', after: fn3 }
        },
        routes: [{ url: 'ping', after: fn }]
      });

      inspect(config.routes).isEql([{
        id: '2e2b8e3461e5aed3f0c28071828a17e9',
        left: { url: 'http://dumpi.rocks/ping', method: 'GET', after: fn2 },
        right: { url: 'http://dumpi.sucks/ping', method: 'GET', after: fn3 },
        name: 'GET /ping',
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
});
