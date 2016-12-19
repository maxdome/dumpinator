'use strict';

module.exports = {
  defaults: {
    left: {
      hostname: 'http://localhost:3333'
    },
    right: {
      hostname: 'http://localhost:3333'
    },
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
      url: '/v2/test.json'
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
