'use strict';

module.exports = {
  defaults: {
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
  },
  routes: [
    {
      url: '/v1/test.json',
      before() {
        console.log('Before first route');
      },
      after() {
        console.log('After first route');
      }
    }, {
      url: '/v2/test.json',
      status: 204
    }, {
      left: {
        url: '/v1/banana.json'
      },
      right: {
        url: '/v2/banana.json'
      }
    }
  ],
  before() {
    console.log('Before all');
  },
  after() {
    console.log('After all');
  }
};
