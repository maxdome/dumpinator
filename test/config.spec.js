'use strict';

const inspect = require('inspect.js');
const Config = require('../src/config');

describe('Config', () => {
  describe('parse()', () => {
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

    it('fails if either side\'s properties are invalid', () => {
      const fn = () => config.parse({ left: { foo: 'bar' } });
      inspect(fn).doesThrow('Config invalid: Key "foo" in "left" is not allowed!');
    });

    it('fails if either side\'s method is invalid', () => {
      const fn = () => config.parse({ right: { method: 'BAR' } });
      inspect(fn).doesThrow('Config invalid: Method "BAR" in "right.method" is invalid!');
    });

    it('fails if either side\'s hostname is invalid', () => {
      const fn = () => config.parse({ right: { hostname: 'htp://foo.com' } });
      inspect(fn).doesThrow('Config invalid: Hostname "htp://foo.com" in "right.hostname" is invalid!');
    });

    it('fails if either side\'s header is invalid', () => {
      const fn = () => config.parse({ left: { header: 'foo' } });
      inspect(fn).doesThrow('Config invalid: "left.header" is invalid!');
    });

    it('fails if either side\'s query is invalid', () => {
      const fn = () => config.parse({ left: { query: 'foo' } });
      inspect(fn).doesThrow('Config invalid: "left.query" is invalid!');
    });

    it('fails if routes are invalid', () => {
      const fn = () => config.parse({ routes: { foo: 'bar' } });
      inspect(fn).doesThrow('Config invalid: "routes" must be an array!');
    });

    it('fails if a route\'s properties are invalid', () => {
      const fn = () => config.parse({ routes: [{ foo: 'bar' }] });
      inspect(fn).doesThrow('Config invalid: Key "foo" in "routes[0]" is not allowed!');
      // inspect(fn).doesThrow('Config invalid: "routes" must be an array!');
    });

    it('fails if a route\'s url is invalid', () => {
      const fn = () => config.parse({ routes: [{}] });
      inspect(fn).doesThrow('Config invalid: "routes[0]" must contain a "url" (string)!');
    });

    it('fails if a route\'s method is invalid', () => {
      const fn = () => config.parse({ routes: [{ url: '/foo', method: 'FOO' }] });
      inspect(fn).doesThrow('Config invalid: Method "FOO" in "routes[0]" (/foo) is invalid!');
    });

    it('fails if a route\'s name is invalid', () => {
      const fn = () => config.parse({ routes: [{ url: '/', name: [] }] });
      inspect(fn).doesThrow('Config invalid: Name in "routes[0]" (/) is invalid!');
    });

    it('fails if a route\'s tag is invalid', () => {
      const fn = () => config.parse({ routes: [{ url: '/', tag: {} }] });
      inspect(fn).doesThrow('Config invalid: Tag in "routes[0]" (/) is invalid!');
    });

    it('counts the routes correctly', () => {
      const fn = () => config.parse({ routes: ['/1', '/2', '/3', {}] });
      inspect(fn).doesThrow('Config invalid: "routes[3]" must contain a "url" (string)!');
    });

    it('accepts routes as strings', () => {
      config.parse({
        routes: ['pages', 'assets', 'components']
      });
      const expectedResult = {
        left: [
          { id: 'fbdbddef6cc3d049e64b1dd538a2a4dc', method: 'GET', url: 'pages', name: 'GET pages' },
          { id: '45cb486c66193bc3520b234dcf3d105a', method: 'GET', url: 'assets', name: 'GET assets' },
          { id: 'd74631ef5e46a1d2e10e4249bd6eb3bb', method: 'GET', url: 'components', name: 'GET components' }
        ],
        right: [
          { id: 'fbdbddef6cc3d049e64b1dd538a2a4dc', method: 'GET', url: 'pages', name: 'GET pages' },
          { id: '45cb486c66193bc3520b234dcf3d105a', method: 'GET', url: 'assets', name: 'GET assets' },
          { id: 'd74631ef5e46a1d2e10e4249bd6eb3bb', method: 'GET', url: 'components', name: 'GET components' }
        ]
      };
      inspect(config.routes).isEql(expectedResult);
    });

    it('accepts routes as objects', () => {
      config.parse({
        routes: [{ url: 'pages' }, { url: 'assets' }, { url: 'components' }]
      });
      const expectedResult = {
        left: [
          { id: 'fbdbddef6cc3d049e64b1dd538a2a4dc', method: 'GET', url: 'pages', name: 'GET pages' },
          { id: '45cb486c66193bc3520b234dcf3d105a', method: 'GET', url: 'assets', name: 'GET assets' },
          { id: 'd74631ef5e46a1d2e10e4249bd6eb3bb', method: 'GET', url: 'components', name: 'GET components' }
        ],
        right: [
          { id: 'fbdbddef6cc3d049e64b1dd538a2a4dc', method: 'GET', url: 'pages', name: 'GET pages' },
          { id: '45cb486c66193bc3520b234dcf3d105a', method: 'GET', url: 'assets', name: 'GET assets' },
          { id: 'd74631ef5e46a1d2e10e4249bd6eb3bb', method: 'GET', url: 'components', name: 'GET components' }
        ]
      };
      inspect(config.routes).isEql(expectedResult);
    });

    it('merges global data into the routes', () => {
      config.parse({
        left: { hostname: 'https://my.api.com/v1/', query: globalQueries, header: globalHeaders },
        right: { hostname: 'http://localhost/v1/', query: globalQueries, header: globalHeaders },
        routes: ['pages', 'assets', 'components']
      });
      const expectedResult = {
        left: [
          { id: 'd6d13704ca7ddfdb095505bc6e1cec6d', method: 'GET', url: 'https://my.api.com/v1/pages', name: 'GET pages', query: globalQueries, header: globalHeaders },
          { id: 'bf86b8e4d608bf45f86eeeaf2e5be950', method: 'GET', url: 'https://my.api.com/v1/assets', name: 'GET assets', query: globalQueries, header: globalHeaders },
          { id: '894f1ac8202fa67e02135a415f391801', method: 'GET', url: 'https://my.api.com/v1/components', name: 'GET components', query: globalQueries, header: globalHeaders }
        ],
        right: [
          { id: 'd6d13704ca7ddfdb095505bc6e1cec6d', method: 'GET', url: 'http://localhost/v1/pages', name: 'GET pages', query: globalQueries, header: globalHeaders },
          { id: 'bf86b8e4d608bf45f86eeeaf2e5be950', method: 'GET', url: 'http://localhost/v1/assets', name: 'GET assets', query: globalQueries, header: globalHeaders },
          { id: '894f1ac8202fa67e02135a415f391801', method: 'GET', url: 'http://localhost/v1/components', name: 'GET components', query: globalQueries, header: globalHeaders }
        ]
      };
      inspect(config.routes).isEql(expectedResult);
    });

    it('overrides global properties with local ones', () => {
      config.parse({
        left: { method: 'POST', query: globalQueries },
        routes: [{ url: 'bundle', query: { globalQuery: 456 } }]
      });
      const expectedResult = {
        left: [
          { id: 'd0d1703fba4845f9208efdfbbf2d6bbd', method: 'POST', url: 'bundle', name: 'POST bundle', query: { globalQuery: 456 } }
        ],
        right: [
          { id: 'd0d1703fba4845f9208efdfbbf2d6bbd', method: 'GET', url: 'bundle', name: 'GET bundle', query: { globalQuery: 456 } }
        ]
      };
      inspect(config.routes).isEql(expectedResult);
    });

    it('spreads routes with multiple methods, queries & headers'); // Feature idea: Using an array in the route's method, url or query duplicates the route for each value for convenience
  });
});
