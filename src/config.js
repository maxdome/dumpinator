'use strict';

const lodash = require('lodash');
const crypto = require('crypto');
const path = require('path');

const validMethods = ['OPTIONS', 'GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'TRACE', 'CONNECT'];
const defaultConfigs = ['./dumpinator.conf.js', './dumpinator.json'];

function validateSide(name, data) {
  if (data) {
    if (!lodash.isObject(data)) {
      throw new Error(`Config invalid: "${name}" must be an object!`);
    }
    lodash.each(data, (val, key) => {
      if (!lodash.includes(['method', 'hostname', 'header', 'query'], key)) {
        throw new Error(`Config invalid: Key "${key}" in "${name}" is not allowed!`);
      }
    });
    if (lodash.get(data, 'method')) {
      if (!lodash.includes(validMethods, data.method)) {
        throw new Error(`Config invalid: Method "${data.method}" in "${name}.method" is invalid!`);
      }
    }
    if (lodash.get(data, 'hostname')) {
      if (!data.hostname.match(/^https?:\/\//)) {
        throw new Error(`Config invalid: Hostname "${data.hostname}" in "${name}.hostname" is invalid!`);
      }
    }
    if (lodash.get(data, 'header')) {
      if (!lodash.isObject(data.header)) {
        throw new Error(`Config invalid: "${name}.header" is invalid!`);
      }
    }
    if (lodash.get(data, 'query')) {
      if (!lodash.isObject(data.query)) {
        throw new Error(`Config invalid: "${name}.query" is invalid!`);
      }
    }
  }
}

function validateRoute(data, i) {
  const url = lodash.has(data, 'url') ? ` (${data.url})` : '';
  lodash.each(data, (val, key) => {
    if (!lodash.includes(['name', 'tag', 'method', 'hostname', 'url', 'header', 'query'], key)) {
      throw new Error(`Config invalid: Key "${key}" in "routes[${i}]" is not allowed!`);
    }
  });
  if (lodash.get(data, 'name')) {
    if (!lodash.isString(data.name) && !lodash.isNumber(data.name)) {
      throw new Error(`Config invalid: Name in "routes[${i}]"${url} is invalid!`);
    }
  }
  if (lodash.get(data, 'tag')) {
    if (!lodash.isString(data.tag) && !lodash.isNumber(data.tag)) {
      throw new Error(`Config invalid: Tag in "routes[${i}]"${url} is invalid!`);
    }
  }
  if (!lodash.isString(data.url)) {
    throw new Error(`Config invalid: "routes[${i}]" must contain a "url" (string)!`);
  }
  if (lodash.get(data, 'method')) {
    if (!lodash.includes(validMethods, data.method)) {
      throw new Error(`Config invalid: Method "${data.method}" in "routes[${i}]"${url} is invalid!`);
    }
  }
}

function validateHeaderOptions(args) {
  if (lodash.has(args, 'H') || lodash.has(args, 'header')) {
    throw new Error('[header] not implemented yet!');
  }

  if (lodash.has(args, 'L') || lodash.has(args, 'header-left')) {
    throw new Error('[header-left] not implemented yet!');
  }

  if (lodash.has(args, 'R') || lodash.has(args, 'header-right')) {
    throw new Error('[header-right] not implemented yet!');
  }
}

function extendRoute(side, route) {
  const out = Object.assign({}, side, route);
  if (lodash.get(side, 'hostname')) {
    out.url = side.hostname + route.url;
  }
  if (!out.method) {
    out.method = 'GET';
  }
  out.name = `${out.method} ${route.name || route.url}`;
  delete out.hostname;
  return out;
}

class Config {
  constructor(options) {
    this.options = options || {};
    this.routes = { left: [], right: [] };
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
    const defaults = lodash.get(input, 'defaults');
    const routes = lodash.get(input, 'routes');
    const left = lodash.get(defaults, 'left');
    const right = lodash.get(defaults, 'right');

    lodash.each(input, (val, key) => {
      if (!lodash.includes(['defaults', 'routes'], key)) {
        throw new Error(`Config invalid: Key "${key}" is not allowed!`);
      }
    });

    if (defaults && !lodash.isObject(defaults)) {
      throw new Error('Config invalid: "defaults" must be an object!');
    }

    lodash.each(defaults, (val, key) => {
      if (!lodash.includes(['left', 'right', 'rateLimit'], key)) {
        throw new Error(`Config invalid: Key "${key}" in "defaults" is not allowed!`);
      }
    });

    validateSide('left', left);
    validateSide('right', right);

    if (!Array.isArray(routes)) {
      throw new Error('Config invalid: "routes" must be an array!');
    }

    routes.forEach((route, i) => {
      if (!lodash.isString(route) && !lodash.isObject(route)) {
        throw new Error(`Config invalid: "routes[${i}]" (${route.url || route}) must must be a string or an object!`);
      }

      if (lodash.isObject(route)) {
        validateRoute(route, i);
      }

      if (lodash.isString(route)) {
        route = { url: route };
      }

      const leftRoute = extendRoute(left, lodash.clone(route));
      const rightRoute = extendRoute(right, lodash.clone(route));
      const routeHash = crypto.createHash('md5').update(JSON.stringify(leftRoute)).digest('hex');

      leftRoute.id = routeHash;
      rightRoute.id = routeHash;

      this.routes.left.push(leftRoute);
      this.routes.right.push(rightRoute);
    });
  }

  parseArguments(left, right, options) {
    if (!left) {
      throw new Error('Arguments invalid: [left] missing!');
    }
    if (!right) {
      throw new Error('Arguments invalid: [right] missing!');
    }

    validateHeaderOptions(options.args);

    if (lodash.has(options.args, 'r') || lodash.has(options.args, 'rate')) {
      throw new Error('[rate] not implemented yet!');
    }

    if (lodash.has(options.args, 't') || lodash.has(options.args, 'tag')) {
      throw new Error('[tag] not implemented yet!');
    }

    this.routes.left.push(left);
    this.routes.right.push(right);
  }
}

module.exports = Config;
