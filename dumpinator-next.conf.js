'use strict';

module.exports = function (dumpinator) {
  dumpinator.setDefaults({
    left: {
      hostname: 'http://localhost:3333'
    },
    right: {
      hostname: 'http://localhost:3333'
    },
    status: 200,
    ignoreBody: [
      'properties.price',
      'properties.age'
    ],
    ignoreHeader: [
    ]
  });

  dumpinator.before(() => {
    console.log('Before all');
  });

  dumpinator.after(() => {
    console.log('After all');
  });

  dumpinator.route({
    url: '/v1/test.json'
  }).before(() => {
    console.log('Before first route');
  }).after(() => {
    console.log('After first route');
  });

  dumpinator.route({
    url: '/v2/test.json',
    status: 204
  });

  dumpinator.route([{
    left: {
      url: '/v1/banana.json'
    },
    right: {
      url: '/v2/banana.json'
    }
  }]);
};

const newConfig = {
  routes: [{
    left: {
      url: 'http://left',
      headers: {
        accept: 'application/json'
      }
    },
    right: {
      url: 'http://left'
    },
    before: () => {},
    after: () => {}
  }]
};
