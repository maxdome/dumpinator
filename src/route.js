'use strict';

const crypto = require('crypto');

class Route {
  constructor(route) {
    this.validate(route);

    this.left = {
      url: this.getUrl(route, 'left'),
      method: this.getParam(route, 'left', 'method', 'GET')
    };

    this.right = {
      url: this.getUrl(route, 'right'),
      method: this.getParam(route, 'right', 'method', 'GET')
    };

    // set optional test properties
    ['before', 'after', 'name'].forEach((prop) => {
      if (prop in route) {
        this[prop] = route[prop];
      }
    });

    // set optional site properties
    ['ignoreBody', 'ignoreHeader', 'status', 'header', 'query'].forEach((prop) => {
      if (!this.left[prop]) {
        const param = this.getParam(route, 'left', prop);
        if (param) {
          this.left[prop] = param;
        }
      }

      if (!this.right[prop]) {
        const param = this.getParam(route, 'right', prop);
        if (param) {
          this.right[prop] = param;
        }
      }
    });

    this.createId();
    this.createName();
  }

  validate(validateionData) {
    const ALLOWED_ROUTE_KEYS = [
      'name', 'tag', 'method',
      'hostname', 'url', 'header',
      'query', 'ignoreBody',
      'ignoreHeader', 'status',
      'before', 'after'];

    const reg = new RegExp(`^${ALLOWED_ROUTE_KEYS.join('|')}$`);

    const validate = (obj, level) => {
      Object.keys(obj).forEach((key) => {
        if ((key === 'left' || key === 'right') && !level) {
          validate(obj[key], key);
          return;
        }

        if (!reg.test(key)) {
          throw new Error(`Invalid configuration! ${key} not allowed in ${level || 'base'} route`);
        }
      });
    };

    validate(validateionData);
  }

  getParam(route, site, param, defaultValue) {
    if (route[site] && route[site][param]) {
      return route[site][param];
    }

    return route[param] || defaultValue;
  }

  getUrl(route, site) {
    if (route[site] && route[site].hostname) {
      const hostname = route[site].hostname.replace(/\/$/, '');
      return `${hostname}/${route[site].url || route.url}`;
    }

    if (route.hostname) {
      const hostname = route.hostname.replace(/\/$/, '');
      return `${hostname}/${route[site].url || route.url}`;
    }

    return route[site] && route[site].url ? route[site].url : route.url;
  }

  createId() {
    this.id = crypto.createHash('md5').update(this.toString()).digest('hex');
  }

  createName() {
    if (!this.name) {
      const leftName = this.left.url.replace(/^https?:\/\/.+?\//, '/');
      const rightName = this.right.url.replace(/^https?:\/\/.+?\//, '/');
      const name = leftName === rightName ? leftName : `${leftName} <> ${rightName}`;
      this.name = `${this.left.method} ${name}`;
    }
  }

  toJSON() {
    return this;
  }

  toString() {
    return JSON.stringify(this);
  }
}

module.exports = Route;
