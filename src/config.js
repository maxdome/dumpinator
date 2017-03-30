'use strict';

const lodash = require('lodash');
const path = require('path');

const defaultConfigs = ['./dumpinator.conf.js', './dumpinator.json'];

class Config {
  constructor(options) {
    options = options || {};
    this.routes = [];
    this.reporter = options.reporter || {
      cli: { noColor: options.noColor }
    };

    if (options.htmlReport) {
      this.reporter.html = {
        output: path.join(process.cwd(), 'dumpinator-report')
      };
    }

    if (!lodash.isUndefined(options.rateLimit)) {
      options.rateLimit = parseInt(options.rateLimit, 10);
      if (!lodash.isInteger(options.rateLimit) || options.rateLimit < 1) {
        throw new Error('Arguments invalid: [rateLimit] must be an integer > 0!');
      }
    }

    if (options.tag && !(lodash.isString(options.tag) || lodash.isNumber(options.tag))) {
      throw new Error('Arguments invalid: [tag] must be a string or number!');
    }

    this.rateLimit = options.rateLimit || 1;
    this.tag = options.tag || null;
    this.verbose = options.verbose || false;
    this.noColor = options.noColor || process.env.isTTY;
    this.gitTags = options.gitTags || null;
  }

  load(file) {
    // TODO: Rename file(name) related variables here
    let filenames = [];
    let conf;

    if (file) {
      filenames.push(file.substr(0, 1) === '/' ? file : path.join(process.cwd(), file));
    } else {
      filenames = defaultConfigs.map(defaultFile => path.join(process.cwd(), defaultFile));
    }

    filenames.some((configFile) => {
      try {
        conf = require(configFile); // eslint-disable-line global-require,import/no-dynamic-require
        return !!conf;
      } catch (e) {
        if (e.code === 'ENOENT' && e.path === configFile) {
          throw new Error(`Cannot find config "${configFile}"`);
        }

        throw new Error(`Parse error of config file: "${configFile}"\n${e.stack}`);
      }
    });

    this.parseJSON(conf);
  }

  parseJSON(input) {
    this.setDefaults(lodash.get(input, 'defaults'), {});
    const routes = lodash.get(input, 'routes', []);

    lodash.each(input, (val, key) => {
      if (!lodash.includes(['options', 'defaults', 'routes', 'before', 'after', 'beforeEach', 'afterEach', 'gitTags', 'transform'], key)) {
        throw new Error(`Config invalid: Key "${key}" is not allowed!`);
      }
    });

    if (!Array.isArray(routes)) {
      throw new Error('Config invalid: "routes" must be an array!');
    }

    routes.forEach((route, i) => {
      if (!lodash.isString(route) && !lodash.isObject(route)) {
        throw new Error(`Config invalid: "routes[${i}]" (${route.url || route}) must must be a string or an object!`);
      }

      if (lodash.isString(route)) {
        route = { left: { url: route }, right: { url: route } };
      }

      this.addRoute(route);
    });

    if (input.before) {
      this.before = input.before;
    }

    if (input.beforeEach) {
      this.beforeEach = input.beforeEach;
    }

    if (input.after) {
      this.after = input.after;
    }

    if (input.afterEach) {
      this.afterEach = input.afterEach;
    }
  }

  setDefaults(defaults) {
    if (defaults && !lodash.isObject(defaults)) {
      throw new Error('Config invalid: "defaults" must be an object!');
    }

    lodash.each(defaults, (val, key) => {
      if (!lodash.includes(['left', 'right', 'rateLimit', 'status', 'ignoreBody', 'ignoreHeader'], key)) {
        throw new Error(`Config invalid: Key "${key}" in "defaults" is not allowed!`);
      }
    });

    this.defaults = defaults;
  }

  getRoutes() {
    const routes = [];

    for (let i = 0; i < this.routes.length; i += 1) {
      routes.push({
        url: this.routes[i].left.url,
        id: this.routes[i].id,
        side: 'left',
        name: this.routes[i].name,
        header: this.routes[i].left.header,
        query: this.routes[i].left.query,
        ignoreBody: this.routes[i].left.ignoreBody,
        ignoreHeader: this.routes[i].left.ignoreHeader,
        status: this.routes[i].left.status
      }, {
        url: this.routes[i].right.url,
        id: this.routes[i].id,
        side: 'right',
        name: this.routes[i].name,
        header: this.routes[i].right.header,
        query: this.routes[i].right.query,
        ignoreBody: this.routes[i].right.ignoreBody,
        ignoreHeader: this.routes[i].right.ignoreHeader,
        status: this.routes[i].right.status
      });
    }

    return routes;
  }

  toJSON() {
    return this.routes;
  }

  validate(validateionData) {
    const ALLOWED_SITE_KEYS = [
      'method',
      'hostname', 'url', 'header',
      'query', 'body', 'status', 'transform'
    ];

    const ALLOWED_ROUTE_KEYS = [
      'name', 'tag', 'before', 'after', 'ignoreBody', 'ignoreHeader', 'transform'
    ];

    const ALLOWED_METHODS = [
      'GET', 'POST', 'PUT', 'DELETE',
      'HEAD', 'CHECKOUT', 'COPY',
      'LOCK', 'MERGE', 'MKACTIVITY',
      'MKCOL', 'MOVE', 'M-SEARCH',
      'NOTIFY', 'OPTIONS', 'PATCH',
      'PURGE', 'REPORT', 'SEARCH',
      'SUBSCRIBE', 'TRACE',
      'UNLOCK', 'UNSUBSCRIBE'
    ];

    const regAllowedSiteKeys = new RegExp(`^${ALLOWED_SITE_KEYS.join('|')}$`);
    const regAllowedRouteKeys = new RegExp(`^${ALLOWED_ROUTE_KEYS.concat(ALLOWED_SITE_KEYS).join('|')}$`);
    const regAllowedMethods = new RegExp(`^${ALLOWED_METHODS.join('|')}$`);

    const validate = (obj, level) => {
      Object.keys(obj).forEach((key) => {
        if ((key === 'left' || key === 'right') && !level) {
          validate(obj[key], key);
          return;
        }

        const reg = level ? regAllowedSiteKeys : regAllowedRouteKeys;
        if (!reg.test(key)) {
          throw new Error(`Invalid configuration! ${key} not allowed in ${level || 'base'} route`);
        }
      });
    };

    ['method', 'left.method', 'right.method'].forEach((key) => {
      const value = lodash.get(validateionData, key);
      if (value && !regAllowedMethods.test(value)) {
        throw new Error(`Invalid configuration! ${value} is not a valid method in ${key}`);
      }
    });

    validate(validateionData);
  }

  addRoute(route) {
    lodash.each(this.defaults, (value, key) => {
      if (key === 'left' || key === 'right') {
        route[key] = Object.assign({}, route[key], value);
        return;
      }

      if (!(key in route)) {
        route[key] = this.defaults[key];
      }
    });

    this.validate(route);

    const newRoute = {
      left: {
        url: this.getUrl(route, 'left'),
        method: this.getParam(route, 'left', 'method', 'GET')
      },
      right: {
        url: this.getUrl(route, 'right'),
        method: this.getParam(route, 'right', 'method', 'GET')
      }
    };

    // set optional test properties
    ['before', 'after', 'name', 'ignoreBody', 'ignoreHeader'].forEach((prop) => {
      if (prop in route) {
        newRoute[prop] = route[prop];
      }
    });

    // set optional site properties
    ['status', 'header', 'query', 'body', 'transform'].forEach((prop) => {
      if (!newRoute.left[prop]) {
        const param = this.getParam(route, 'left', prop);
        if (param) {
          newRoute.left[prop] = param;
        }
      }

      if (!newRoute.right[prop]) {
        const param = this.getParam(route, 'right', prop);
        if (param) {
          newRoute.right[prop] = param;
        }
      }
    });

    // set optional route only properties
    ['before', 'after'].forEach((prop) => {
      if (!newRoute.left[prop]) {
        const param = this.getSiteParam(route, 'left', prop);
        if (param) {
          newRoute.left[prop] = param;
        }
      }

      if (!newRoute.right[prop]) {
        const param = this.getSiteParam(route, 'right', prop);
        if (param) {
          newRoute.right[prop] = param;
        }
      }
    });

    this.routes.push(newRoute);

    return newRoute;
  }

  getParam(route, site, param, defaultValue) {
    if (route[site] && route[site][param]) {
      return route[site][param];
    }

    return route[param] || defaultValue;
  }

  getSiteParam(route, site, param, defaultValue) {
    if (route[site] && route[site][param]) {
      return route[site][param];
    }

    return defaultValue;
  }

  getUrl(route, site) {
    let routeHost;
    let routePath;

    if (route[site] && route[site].hostname) {
      routeHost = route[site].hostname.replace(/\/$/, '');
    } else if (route.hostname) {
      routeHost = route.hostname.replace(/\/$/, '');
    }

    if (route[site] && route[site].url) {
      routePath = route[site].url.replace(/^\//, '');
    } else {
      routePath = route.url.replace(/^\//, '');
    }

    return routeHost ? `${routeHost}/${routePath}` : routePath;
  }
}

module.exports = Config;
