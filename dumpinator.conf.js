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
      'x-api-version',
      'x-date',
      'etag',
      'last-modified'
    ]
  },
  routes: [
    {
      url: '/v1/test.json'
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
  ]
};
