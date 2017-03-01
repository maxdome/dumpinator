'use strict';

const inspect = require('inspect.js');

const CLIUtils = require('../src/utils/cli-utils');

describe('CLIUtils', () => {
  describe('extendHeader', () => {
    it('parse and extends headers', () => {
      const raw = [
        'accept: application/json',
        'accept-language: en_US',
        'basic-auth: RHVtcGluYXRvcmlzdGdlaWwh'
      ];

      inspect(CLIUtils.extendHeaders(raw)).isEql({
        accept: 'application/json',
        'accept-language': 'en_US',
        'basic-auth': 'RHVtcGluYXRvcmlzdGdlaWwh'
      });
    });
  });

  describe('parseRouteArguments', () => {
    it('returns a route config object, using urls', () => {
      const args = [
        '/home/dumpi/Applications/nvm/versions/node/v4.2.3/bin/node',
        '/home/dumpi/Applications/nvm/versions/node/v4.2.3/lib/node_modules/dumpinator/bin/dp-diff',
        'http://dumpi.rocks/v1/ping',
        'http://dumpi.sucks/v1/ping',
        '-H',
        'accept: application/json',
        '-H',
        'accept-language: en_US',
        '-R',
        'basic-auth: RHVtcGluYXRvcmlzdGdlaWwh'
      ];

      const routeConfig = CLIUtils.parseRouteArguments(args);
      inspect(routeConfig).isEql({
        left: {
          url: 'http://dumpi.rocks/v1/ping',
          header: {
            accept: 'application/json',
            'accept-language': 'en_US'
          }
        },
        right: {
          url: 'http://dumpi.sucks/v1/ping',
          header: {
            accept: 'application/json',
            'accept-language': 'en_US',
            'basic-auth': 'RHVtcGluYXRvcmlzdGdlaWwh'
          }
        }
      });
    });

    it('returns a route config object, using git tags', () => {
      const args = [
        '/home/dumpi/Applications/nvm/versions/node/v4.2.3/bin/node',
        '/home/dumpi/Applications/nvm/versions/node/v4.2.3/lib/node_modules/dumpinator/bin/dp-diff',
        'v1.13.4',
        'v1.14.0'
      ];

      const routeConfig = CLIUtils.parseRouteArguments(args);
      inspect(routeConfig).isEql({
        gitTags: ['v1.13.4', 'v1.14.0']
      });
    });

    it('overwrites existing options', () => {
      const args = [
        '/home/dumpi/Applications/nvm/versions/node/v4.2.3/bin/node',
        '/home/dumpi/Applications/nvm/versions/node/v4.2.3/lib/node_modules/dumpinator/bin/dp-diff',
        'http://dumpi.rocks/v1/ping',
        'http://dumpi.sucks/v1/ping',
        '-H',
        'accept: application/json',
        '-H',
        'accept-language: en_US',
        '-L',
        'accept-language: de_AT',
        '-L',
        'accept-language: de_DE',
        '-R',
        'basic-auth: RHVtcGluYXRvcmlzdGdlaWwh'
      ];

      const routeConfig = CLIUtils.parseRouteArguments(args);
      inspect(routeConfig).isEql({
        left: {
          url: 'http://dumpi.rocks/v1/ping',
          header: {
            accept: 'application/json',
            'accept-language': 'de_DE'
          }
        },
        right: {
          url: 'http://dumpi.sucks/v1/ping',
          header: {
            accept: 'application/json',
            'accept-language': 'en_US',
            'basic-auth': 'RHVtcGluYXRvcmlzdGdlaWwh'
          }
        }
      });
    });
  });
});
