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
    if (!lodash.includes(['name', 'tag', 'method', 'hostname', 'url', 'header', 'query', 'ignoreBody', 'ignoreHeader', 'status', 'left', 'right'], key)) {
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
  if (!lodash.isString(data.url) && !lodash.has(data, 'left.url') && !lodash.has(data, 'right.url')) {
    throw new Error(`Config invalid: "routes[${i}]" must contain a "url" (string)!`);
  }
  if (lodash.get(data, 'method')) {
    if (!lodash.includes(validMethods, data.method)) {
      throw new Error(`Config invalid: Method "${data.method}" in "routes[${i}]"${url} is invalid!`);
    }
  }
}

function extendHeaders(self, type, header) {
  if (header.length) {
    let keyValue;
    header.forEach((val) => {
      val = val.toString();
      keyValue = val.split(':');

      if (keyValue.length < 2) {
        throw new Error(`Arguments invalid: [${type}] (${val}) does not contain a ":"!`);
      }

      keyValue[0] = keyValue[0].trim();
      keyValue[1] = keyValue[1].trim();

      if (lodash.includes(['header', 'header-left'], type)) {
        self.routes.left[0].header = self.routes.left[0].header || {};
        self.routes.left[0].header[keyValue[0]] = keyValue[1];
      }

      if (lodash.includes(['header', 'header-right'], type)) {
        self.routes.right[0].header = self.routes.right[0].header || {};
        self.routes.right[0].header[keyValue[0]] = keyValue[1];
      }
    });
  }
}

function extendRoute(side, route, defaults) {
  defaults = defaults || {};
  const out = Object.assign({}, side, route);
  if (lodash.get(side, 'hostname')) {
    out.url = side.hostname + route.url;
  }
  if (!out.method) {
    out.method = 'GET';
  }

  if (!out.status && defaults.status) {
    out.status = defaults.status;
  }

  out.name = `${out.method} ${route.name || route.url}`;
  delete out.hostname;
  return out;
}

function parseRoute(type, url) {
  const components = url.split(' ');
  let method = 'GET';
  if (components.length > 1) {
    if (!lodash.includes(validMethods, components[0])) {
      throw new Error(`Arguments invalid: Method "${components[0]}" in [${type}] is invalid!`);
    }
    method = components[0];
    url = components[1];
  }
  return { method, url };
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
      if (!lodash.includes(['options', 'defaults', 'routes'], key)) {
        throw new Error(`Config invalid: Key "${key}" is not allowed!`);
      }
    });

    if (defaults && !lodash.isObject(defaults)) {
      throw new Error('Config invalid: "defaults" must be an object!');
    }

    lodash.each(defaults, (val, key) => {
      if (!lodash.includes(['left', 'right', 'rateLimit', 'status', 'ignoreBody', 'ignoreHeader'], key)) {
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

      let leftRoute;
      let rightRoute;
      if (lodash.has(route, 'left.url') && lodash.has(route, 'right.url')) {
        leftRoute = extendRoute(left, {
          url: lodash.get(route, 'left.url')
        });
        rightRoute = extendRoute(right, {
          url: lodash.get(route, 'right.url')
        });
      } else {
        leftRoute = extendRoute(left, lodash.clone(route));
        rightRoute = extendRoute(right, lodash.clone(route));
      }

      const routeHash = crypto.createHash('md5').update(JSON.stringify(leftRoute)).digest('hex');

      leftRoute.id = routeHash;
      rightRoute.id = routeHash;

      ['ignoreBody', 'ignoreHeader'].forEach((prop) => {
        if (lodash.has(defaults, prop)) {
          if (!lodash.has(leftRoute, prop)) {
            leftRoute[prop] = defaults[prop];
          }

          if (!lodash.has(rightRoute, prop)) {
            rightRoute[prop] = defaults[prop];
          }
        }
      });


      this.routes.left.push(leftRoute);
      this.routes.right.push(rightRoute);
    });
  }

  parseOptions(options) {
    options = options || {};
    const rate = lodash.get(options.args, 'r') || lodash.get(options.args, 'rate');
    const tag = lodash.get(options.args, 't') || lodash.get(options.args, 'tag');
    const debug = lodash.get(options.args, 'd') || lodash.get(options.args, 'debug');
    const header = lodash.unionWith(
      lodash.castArray(lodash.get(options.args, 'H', [])),
      lodash.castArray(lodash.get(options.args, 'header', []))
    );
    const headerLeft = lodash.unionWith(
      lodash.castArray(lodash.get(options.args, 'L', [])),
      lodash.castArray(lodash.get(options.args, 'header-left', []))
    );
    const headerRight = lodash.unionWith(
      lodash.castArray(lodash.get(options.args, 'R', [])),
      lodash.castArray(lodash.get(options.args, 'header-right', []))
    );

    if (!lodash.isUndefined(rate) && (!lodash.isInteger(rate) || rate < 1)) {
      throw new Error('Arguments invalid: [rate] must be an integer > 0!');
    }

    if (tag && !(lodash.isString(tag) || lodash.isNumber(tag))) {
      throw new Error('Arguments invalid: [tag] must be a string or number!');
    }

    if (tag) {
      this.options.tag = tag;
    }
    if (rate) {
      this.options.rateLimit = rate;
    }
    if (debug) {
      this.options.debug = true;
    }

    extendHeaders(this, 'header', header);
    extendHeaders(this, 'header-left', headerLeft);
    extendHeaders(this, 'header-right', headerRight);
  }

  parseArguments(left, right, options) {
    if (!left) {
      throw new Error('Arguments invalid: [left] missing!');
    }
    if (!right) {
      throw new Error('Arguments invalid: [right] missing!');
    }

    this.routes.left.push(parseRoute('left', left));
    this.routes.right.push(parseRoute('right', right));

    this.parseOptions(options);
  }

  getRoutes() {
    const routes = [];

    for (let i = 0; i < this.routes.left.length; i += 1) {
      routes.push({
        url: this.routes.left[i].url,
        id: this.routes.left[i].id,
        side: 'left',
        name: this.routes.left[i].name,
        header: this.routes.left[i].header,
        query: this.routes.left[i].query,
        ignoreBody: this.routes.left[i].ignoreBody,
        ignoreHeader: this.routes.left[i].ignoreHeader,
        status: this.routes.left[i].status
      }, {
        url: this.routes.right[i].url,
        id: this.routes.right[i].id,
        side: 'right',
        name: this.routes.right[i].name,
        header: this.routes.right[i].header,
        query: this.routes.right[i].query,
        ignoreBody: this.routes.right[i].ignoreBody,
        ignoreHeader: this.routes.right[i].ignoreHeader,
        status: this.routes.right[i].status
      });
    }

    return routes;
  }

  addRoute(left, right) {
    this.parseJSON({
      routes: [{
        left,
        right
      }]
    });
  }
}

module.exports = Config;
