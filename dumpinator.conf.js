'use strict';

module.exports = {
  defaults: {
    left: {
      hostname: 'http://localhost:3333'
    },
    right: {
      hostname: 'http://localhost:3333'
    },
    status: 200
  },
  routes: [
    {
      url: '/v1/test.json'
    }, {
      url: '/v2/test.json',
      status: 204
    }
  ]
};
