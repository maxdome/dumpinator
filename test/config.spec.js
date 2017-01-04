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

  describe('load()', () => {
    it('fails if no config was found');
    it('loads a custom config with -c');
    it('loads a default dumpinator.conf.js');
    it('loads a default dumpinator.json');
  });

  describe('parseJSON()', () => {
    it.skip('fails if properties are invalid', () => {
      const fn = () => config.parseJSON({ foo: {} });
      inspect(fn).doesThrow('Config invalid: Key "foo" is not allowed!');
    });

    it.skip('fails if defaults\'s properties are invalid', () => {
      const fn = () => config.parseJSON({ defaults: { foo: {} } });
      inspect(fn).doesThrow('Config invalid: Key "foo" in "defaults" is not allowed!');
    });

    it.skip('fails if either side\'s properties are invalid', () => {
      const fn = () => config.parseJSON({ defaults: { left: { foo: 'bar' } } });
      inspect(fn).doesThrow('Config invalid: Key "foo" in "left" is not allowed!');
    });

    it.skip('fails if either side\'s method is invalid', () => {
      const fn = () => config.parseJSON({ defaults: { right: { method: 'BAR' } } });
      inspect(fn).doesThrow('Config invalid: Method "BAR" in "right.method" is invalid!');
    });

    it.skip('fails if either side\'s hostname is invalid', () => {
      const fn = () => config.parseJSON({ defaults: { right: { hostname: 'htp://foo.com' } } });
      inspect(fn).doesThrow('Config invalid: Hostname "htp://foo.com" in "right.hostname" is invalid!');
    });

    it.skip('fails if either side\'s header is invalid', () => {
      const fn = () => config.parseJSON({ defaults: { left: { header: 'foo' } } });
      inspect(fn).doesThrow('Config invalid: "left.header" is invalid!');
    });

    it.skip('fails if either side\'s query is invalid', () => {
      const fn = () => config.parseJSON({ defaults: { left: { query: 'foo' } } });
      inspect(fn).doesThrow('Config invalid: "left.query" is invalid!');
    });

    it.skip('fails if routes are invalid', () => {
      const fn = () => config.parseJSON({ routes: { foo: 'bar' } });
      inspect(fn).doesThrow('Config invalid: "routes" must be an array!');
    });

    it.skip('fails if a route\'s properties are invalid', () => {
      const fn = () => config.parseJSON({ routes: [{ foo: 'bar' }] });
      inspect(fn).doesThrow('Config invalid: Key "foo" in "routes[0]" is not allowed!');
      // inspect(fn).doesThrow('Config invalid: "routes" must be an array!');
    });

    it.skip('fails if a route\'s url is invalid', () => {
      const fn = () => config.parseJSON({ routes: [{}] });
      inspect(fn).doesThrow('Config invalid: "routes[0]" must contain a "url" (string)!');
    });

    it.skip('fails if a route\'s method is invalid', () => {
      const fn = () => config.parseJSON({ routes: [{ url: '/foo', method: 'FOO' }] });
      inspect(fn).doesThrow('Config invalid: Method "FOO" in "routes[0]" (/foo) is invalid!');
    });

    it.skip('fails if a route\'s name is invalid', () => {
      const fn = () => config.parseJSON({ routes: [{ url: '/', name: [] }] });
      inspect(fn).doesThrow('Config invalid: Name in "routes[0]" (/) is invalid!');
    });

    it.skip('fails if a route\'s tag is invalid', () => {
      const fn = () => config.parseJSON({ routes: [{ url: '/', tag: {} }] });
      inspect(fn).doesThrow('Config invalid: Tag in "routes[0]" (/) is invalid!');
    });

    it.skip('counts the routes correctly', () => {
      const fn = () => config.parseJSON({ routes: ['/1', '/2', '/3', {}] });
      inspect(fn).doesThrow('Config invalid: "routes[3]" must contain a "url" (string)!');
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

    it.skip('accepts a before method', () => {
      const fn = () => {};

      config.parseJSON({
        defaults: {
          left: { method: 'GET', hostname: 'http://dumpi.rocks/' },
          right: { method: 'GET', hostname: 'http://dumpi.sucks/' }
        },
        routes: [{ url: 'ping', before: fn }]
      });

      inspect(config.routes).isEql({
        left: { url: 'http://dumpi.rocks/ping' },
        right: { url: 'http://dumpi.sucks/ping' },
        before: fn
      });
    });
  });

  describe('parseArguments()', () => {
    it('fails if right side is missing', () => {
      const fn = () => config.parseArguments('http://a.b/left');
      inspect(fn).doesThrow('Arguments invalid: [right] missing!');
    });

    it('fails if header is invalid', () => {
      const fn = () => config.parseArguments('http://a.b/left', 'http://a.b/right', { args: { header: 'foo' } });
      inspect(fn).doesThrow('Arguments invalid: [header] (foo) does not contain a ":"!');
    });
    it('fails if rate is no integer', () => {
      const fn = () => config.parseArguments('http://a.b/left', 'http://a.b/right', { args: { rate: 'bar' } });
      inspect(fn).doesThrow('Arguments invalid: [rate] must be an integer > 0!');
    });
    it('fails if rate is too small', () => {
      const fn = () => config.parseArguments('http://a.b/left', 'http://a.b/right', { args: { rate: 0 } });
      inspect(fn).doesThrow('Arguments invalid: [rate] must be an integer > 0!');
    });
    it('fails if tag is invalid', () => {
      const fn = () => config.parseArguments('http://a.b/left', 'http://a.b/right', { args: { tag: {} } });
      inspect(fn).doesThrow('Arguments invalid: [tag] must be a string or number!');
    });
    it('accepts valid "simple" routes', () => {
      const expectedResult = {
        left: [
          { method: 'GET', url: 'http://a.b/left' }
        ],
        right: [
          { method: 'GET', url: 'http://a.b/right' }
        ]
      };
      config.parseArguments('http://a.b/left', 'http://a.b/right');
      inspect(config.routes).isEql(expectedResult);
    });
    it('accepts valid "extended" routes', () => {
      const expectedResult = {
        left: [
          { method: 'POST', url: 'http://a.b/left' }
        ],
        right: [
          { method: 'DELETE', url: 'http://a.b/right' }
        ]
      };
      config.parseArguments('POST http://a.b/left', 'DELETE http://a.b/right');
      inspect(config.routes).isEql(expectedResult);
    });
    it('accepts a single header', () => {
      const expectedResult = {
        left: [
          { id: '3cf4489ed60cf005557795effe296aee', method: 'GET', url: 'http://a.b/left', header: { foo: 'bar' }, name: 'GET http://a.b/left' }
        ],
        right: [
          { id: '3cf4489ed60cf005557795effe296aee', method: 'GET', url: 'http://a.b/right', header: { foo: 'bar' }, name: 'GET http://a.b/right' }
        ]
      };
      config.parseArguments('http://a.b/left', 'http://a.b/right', { args: { H: 'foo:bar' } });
      inspect(config.routes).isEql(expectedResult);
    });
    it('accepts multiple headers', () => {
      const expectedResult = {
        left: [
          { id: 'd8de1e85601e0f9967c5a1a118b40a78', method: 'GET', url: 'http://a.b/left', header: { foo: 'bar', baz: 'bez' }, name: 'GET http://a.b/left' }
        ],
        right: [
          { id: 'd8de1e85601e0f9967c5a1a118b40a78', method: 'GET', url: 'http://a.b/right', header: { foo: 'bar', baz: 'bez' }, name: 'GET http://a.b/right' }
        ]
      };
      config.parseArguments('http://a.b/left', 'http://a.b/right', { args: { H: ['foo:bar', 'baz:bez'] } });
      inspect(config.routes).isEql(expectedResult);
    });
    it('accepts a single header-left', () => {
      const expectedResult = {
        left: [
          { id: '3cf4489ed60cf005557795effe296aee', method: 'GET', url: 'http://a.b/left', header: { foo: 'bar' }, name: 'GET http://a.b/left' }
        ],
        right: [
          { id: '3cf4489ed60cf005557795effe296aee', method: 'GET', url: 'http://a.b/right', name: 'GET http://a.b/right' }
        ]
      };
      config.parseArguments('http://a.b/left', 'http://a.b/right', { args: { L: 'foo:bar' } });
      inspect(config.routes).isEql(expectedResult);
    });
    it('accepts multiple header-left', () => {
      const expectedResult = {
        left: [
          { id: 'd8de1e85601e0f9967c5a1a118b40a78', method: 'GET', url: 'http://a.b/left', header: { foo: 'bar', baz: 'bez' }, name: 'GET http://a.b/left' }
        ],
        right: [
          { id: 'd8de1e85601e0f9967c5a1a118b40a78', method: 'GET', url: 'http://a.b/right', name: 'GET http://a.b/right' }
        ]
      };
      config.parseArguments('http://a.b/left', 'http://a.b/right', { args: { L: ['foo:bar', 'baz:bez'] } });
      inspect(config.routes).isEql(expectedResult);
    });
    it('accepts a single header-right', () => {
      const expectedResult = {
        left: [
          { id: 'd845daa63d9c7ff67f5ec4dd29adca3b', method: 'GET', url: 'http://a.b/left', name: 'GET http://a.b/left' }
        ],
        right: [
          { id: 'd845daa63d9c7ff67f5ec4dd29adca3b', method: 'GET', url: 'http://a.b/right', header: { foo: 'bar' }, name: 'GET http://a.b/right' }
        ]
      };
      config.parseArguments('http://a.b/left', 'http://a.b/right', { args: { R: 'foo:bar' }, name: 'GET http://a.b/right' });
      inspect(config.routes).isEql(expectedResult);
    });
    it('accepts multiple header-right', () => {
      const expectedResult = {
        left: [
          { id: 'd845daa63d9c7ff67f5ec4dd29adca3b', method: 'GET', url: 'http://a.b/left', name: 'GET http://a.b/left' }
        ],
        right: [
          { id: 'd845daa63d9c7ff67f5ec4dd29adca3b', method: 'GET', url: 'http://a.b/right', header: { foo: 'bar', baz: 'bez' }, name: 'GET http://a.b/right' }
        ]
      };
      config.parseArguments('http://a.b/left', 'http://a.b/right', { args: { R: ['foo:bar', 'baz:bez'] } });
      inspect(config.routes).isEql(expectedResult);
    });

    it('accepts multiple types of headers', () => {
      const expectedResult = {
        left: [
          { id: '23b4d6c11ecaae3453e9ffeaaae37240', method: 'GET', url: 'http://a.b/left', header: { H: 'val1', header1: 'val2', header2: 'val3', L1: 'val4', L2: 'val5', left: 'val6' }, name: 'GET http://a.b/left' }
        ],
        right: [
          { id: '23b4d6c11ecaae3453e9ffeaaae37240', method: 'GET', url: 'http://a.b/right', header: { H: 'val1', header1: 'val2', header2: 'val3', R1: 'val7', R2: 'val8', right: 'val9' }, name: 'GET http://a.b/right' }
        ]
      };
      config.parseArguments('http://a.b/left', 'http://a.b/right', { args: { H: 'H:val1', header: ['header1:val2', 'header2:val3'], L: ['L1:val4', 'L2:val5'], 'header-left': 'left:val6', R: ['R1:val7', 'R2:val8'], 'header-right': 'right:val9' } });
      inspect(config.routes).isEql(expectedResult);
    });

    it('accepts a tag of type string', () => {
      config.parseArguments('http://a.b/left', 'http://a.b/right', { args: { tag: 'foo' } });
      inspect(config.options).isEql({ tag: 'foo' });
    });

    it('accepts a tag of type integer', () => {
      config.parseArguments('http://a.b/left', 'http://a.b/right', { args: { tag: 123 } });
      inspect(config.options).isEql({ tag: 123 });
    });

    it('accepts a valid rate', () => {
      config.parseArguments('http://a.b/left', 'http://a.b/right', { args: { rate: 1 } });
      inspect(config.options).isEql({ rateLimit: 1 });
    });
  });

  describe('getRoutes()', () => {
    const routesConfig = {
      left: [
        { id: 'd6d13704ca7ddfdb095505bc6e1cec6d', method: 'GET', url: 'https://my.api.com/v1/pages', name: 'GET pages' },
        { id: 'bf86b8e4d608bf45f86eeeaf2e5be950', method: 'GET', url: 'https://my.api.com/v1/assets', name: 'GET assets' },
        { id: '894f1ac8202fa67e02135a415f391801', method: 'GET', url: 'https://my.api.com/v1/components', name: 'GET components' }
      ],
      right: [
        { id: 'd6d13704ca7ddfdb095505bc6e1cec6d', method: 'GET', url: 'http://localhost/v1/pages', name: 'GET pages' },
        { id: 'bf86b8e4d608bf45f86eeeaf2e5be950', method: 'GET', url: 'http://localhost/v1/assets', name: 'GET assets' },
        { id: '894f1ac8202fa67e02135a415f391801', method: 'GET', url: 'http://localhost/v1/components', name: 'GET components' }
      ]
    };

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
