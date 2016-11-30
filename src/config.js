'use strict';

const lodash = require('lodash');
const crypto = require('crypto');

const validMethods = ['OPTIONS', 'GET', 'HEAD', 'POST', 'PUT', 'DELETE', 'TRACE', 'CONNECT'];

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

  parse(input) {
    const routes = lodash.get(input, 'routes');
    const left = lodash.get(input, 'left');
    const right = lodash.get(input, 'right');

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

      const leftRoute = extendRoute(input.left, lodash.clone(route));
      const rightRoute = extendRoute(input.right, lodash.clone(route));
      const routeHash = crypto.createHash('md5').update(JSON.stringify(leftRoute)).digest('hex');

      leftRoute.id = routeHash;
      rightRoute.id = routeHash;

      this.routes.left.push(leftRoute);
      this.routes.right.push(rightRoute);
    });
  }
}

module.exports = Config;
