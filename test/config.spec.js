const inspect = require('inspect.js');
const Config = require('../src/config');

describe('Config', () => {
  describe('parse()', () => {
    const globalHeaders = {
      'content-type': 'application/json',
      'accept-language': 'en-US'
    };

    const globalQueries = {
      globalQuery: 123
    };

    it('fails if routes are invalid', () => {
      const config = new Config();
      const fn = () => config.parse({ routes: { foo: 'bar' } });
      inspect(fn).doesThrow('Config invalid: "routes" must be an array!');
    });

    it('fails if a route\'s method is invalid');

    it('fails if a route\'s url is invalid');

    it('fails if a route\'s name is invalid');

    it('fails if a route\'s tag is invalid');

    it('fails if either side\'s properties are invalid', () => {
      const config = new Config();
      const fn = () => config.parse({ left: { foo: 'bar' } });
      inspect(fn).doesThrow('Config invalid: "left.foo" is not allowed!');
    });

    it('fails if either side\'s hostname is invalid');

    it('fails if either side\'s header is invalid');

    it('fails if either side\'s query is invalid');

    it('accepts routes as strings', () => {
      const config = new Config();
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
      const config = new Config();
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
      const config = new Config();
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

    it('overrides global properties with local ones');

    it('spreads routes with multiple queries & headers');
  });
});
