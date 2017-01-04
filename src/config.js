'use strict';

const lodash = require('lodash');
const path = require('path');

const Route = require('./route');

const defaultConfigs = ['./dumpinator.conf.js', './dumpinator.json'];

class Config {
  constructor(options) {
    options = options || {};
    this.routes = [];
    this.reporter = options.reporter || {
      cli: { colors: true },
      html: { output: path.join(process.cwd(), 'dumpinator-report.html') }
    };

    if (!lodash.isUndefined(options.rateLimit) && (!lodash.isInteger(options.rateLimit) || options.rateLimit < 1)) {
      throw new Error('Arguments invalid: [rateLimit] must be an integer > 0!');
    }

    if (options.tag && !(lodash.isString(options.tag) || lodash.isNumber(options.tag))) {
      throw new Error('Arguments invalid: [tag] must be a string or number!');
    }

    this.rateLimit = options.rateLimit || 1;
    this.tag = options.tag || null;
    this.verbose = options.verbose || false;
    this.debug = options.debug || false;
    this.noColor = options.noColor || process.env.isTTY;
  }

  load(file) {
    // TODO: Rename file(name) related variables here
    let filenames = [];
    let conf;
    let error;

    if (file) {
      filenames.push(file.substr(0, 1) === '/' ? file : path.join(process.cwd(), file));
    } else {
      filenames = defaultConfigs.map(defaultFile => path.join(process.cwd(), defaultFile));
    }

    filenames.some((configFile) => {
      error = false;
      try {
        conf = require(configFile); // eslint-disable-line global-require,import/no-dynamic-require
        return !!conf;
      } catch (e) {
        error = new Error(`Cannot find config "${configFile}"`);
      }
      return error;
    });

    if (error) {
      throw error;
    }

    this.parseJSON(conf);
  }

  parseJSON(input) {
    this.setDefaults(lodash.get(input, 'defaults'), {});
    const routes = lodash.get(input, 'routes', []);

    lodash.each(input, (val, key) => {
      if (!lodash.includes(['options', 'defaults', 'routes', 'before', 'after'], key)) {
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

    if (input.after) {
      this.after = input.after;
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

    this.routes.push(new Route(route));
  }
}

module.exports = Config;
