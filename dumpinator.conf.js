'use strict';

const path = require('path');
const co = require('co');
const colorfy = require('colorfy');

const Dumpinator = require('./src/dumpinator');

let ps1;
let ps2;

function startApp(cwd, port) {
  colorfy()
  .yellow('dp start app at port')
  .lgrey(port)
  .txt('in dir')
  .azure(cwd)
  .print();

  const env = process.env;
  env.PORT = port;

  return Dumpinator.runShellTask('node', ['examples/server.js'], {
    cwd,
    env,
    listenFor: [
      'Server listen at port'
    ]
  }).then((ps) => {
    colorfy()
    .yellow(' ... started with pid')
    .lgrey(ps.pid)
    .print();
    return ps;
  });
}

function installApp(cwd) {
  return Dumpinator.runShellTask('npm', ['install'], {
    cwd
  });
}

function killProcess(ps) {
  colorfy()
  .yellow('dp kill process')
  .lgrey(ps.pid)
  .print();

  ps.kill();
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
    killProcess(ps1);
    killProcess(ps2);
  },
  beforeEach() {
    console.log('Before each');  // eslint-disable-line no-console
  },
  afterEach() {
    console.log('After each');  // eslint-disable-line no-console
  },
  transform(data) {
    return data;
  }
};
