'use strict';

const path = require('path');
const spawn = require('child_process').spawn;

const co = require('co');

const Dumpinator = require('./src/dumpinator');

let ps1;
let ps2;

function startApp(cwd, port) {
  console.log('[START] Start app at port', port, 'in dir', cwd); // eslint-disable-line no-console

  const env = process.env;
  env.PORT = port;

  return Dumpinator.runShellTask('node', ['examples/server.js'], {
    cwd,
    env,
    listenFor: [
      'Server listen at port'
    ]
  });
}

function installApp(cwd) {
  return Dumpinator.runShellTask('npm', ['install'], {
    cwd
  });
}

module.exports = {
  defaults: {
    left: {
      hostname: 'http://localhost:3100'
    },
    right: {
      hostname: 'http://localhost:3200'
    },
    status: 200,
    ignoreBody: [
      'properties.price',
      'properties.age'
    ],
    ignoreHeader: [
      'etag',
      'last-modified',
      'date',
      'x-date'
    ]
  },
  routes: [
    {
      url: '/v1/test.json',
      tag: 'test',
      before() {

      },
      after() {

      }
    }, {
      url: '/v2/test.json',
      tag: 'test',
      status: 204
    }, {
      tag: 'banana',
      left: {
        url: '/v1/banana.json'
      },
      right: {
        url: '/v2/banana.json'
      }
    }
  ],
  before() {
    return co(function* g() {
      yield installApp(path.join(process.cwd(), '.dumpinator-tmp/left/'));
      yield installApp(path.join(process.cwd(), '.dumpinator-tmp/right/'));
      ps1 = yield startApp(path.join(process.cwd(), '.dumpinator-tmp/left/'), 3100);
      ps2 = yield startApp(path.join(process.cwd(), '.dumpinator-tmp/right/'), 3200);
    });
  },
  after() {
    console.log('[KILL] left process');  // eslint-disable-line no-console
    ps1.kill();
    console.log('[KILL] right process');  // eslint-disable-line no-console
    ps2.kill();
  },
  beforeEach() {
    console.log('Before each');  // eslint-disable-line no-console
  },
  afterEach() {
    console.log('After each');  // eslint-disable-line no-console
  }
};
