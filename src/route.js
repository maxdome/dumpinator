'use strict';

const crypto = require('crypto');

class Route {
  constructor(route) {
    this.route = {
      left: {
        url: this.getUrl(route, 'left'),
        method: this.getParam(route, 'left', 'method', 'GET')
      },
      right: {
        url: this.getUrl(route, 'right'),
        method: this.getParam(route, 'right', 'method', 'GET')
      },
      name: route.name || ''
    };

    this.createId();
    this.createName();
  }

  getParam(route, site, param, defaultValue) {
    if (route[site] && route[site][param]) {
      return route[site][param];
    }

    return route[param] || defaultValue;
  }

  getUrl(route, site) {
    if (route[site].hostname) {
      return `${route[site].hostname}/${route[site].url}`;
    }

    if (route.hostname) {
      return `${route.hostname}/${route[site].url}`;
    }

    return route[site].url;
  }

  createId() {
    this.route.id = crypto.createHash('md5').update(this.toString()).digest('hex');
  }

  createName() {
    if (!this.route.name) {
      const leftName = this.route.left.url.replace(/^http:\/\/.+?\//, '/');
      const rightName = this.route.right.url.replace(/^http:\/\/.+?\//, '/');
      const name = leftName === rightName ? leftName : `${leftName} <> ${rightName}`;
      this.route.name = `${this.route.left.method} ${name}`;
    }
  }

  toJSON() {
    return this.route;
  }

  toString() {
    return JSON.stringify(this.route);
  }
}

module.exports = Route;
