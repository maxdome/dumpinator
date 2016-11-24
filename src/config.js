const lodash = require('lodash');
const crypto = require('crypto');

function parseSide(name, data) {
  if (data) {
    if (!lodash.isObject(data)) {
      throw new Error(`Config invalid: "${name}" must be an object!`);
    }
    lodash.each(data, (val, key) => {
      if (!lodash.includes(['hostname', 'header', 'query'], key)) {
        throw new Error(`Config invalid: "${name}.${key}" is not allowed!`);
      }
    });
  }
}

function extendRoute(side, route) {
  const out = Object.assign({}, side, route);
  if (lodash.get(side, 'hostname')) {
    out.url = side.hostname + route.url;
  }
  if (!route.method) {
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

    parseSide('left', left);
    parseSide('right', right);

    if (!Array.isArray(routes)) {
      throw new Error('Config invalid: "routes" must be an array!');
    }

    routes.forEach((route, i) => {
      if (!lodash.isString(route) && !lodash.isObject(route)) {
        throw new Error(`Config invalid: Route ${i + 1} (${route.url || route}) must must be a string or an object!`);
      }

      if (lodash.isString(route)) {
        route = { url: route };
      }

      if (!lodash.isString(route.url)) {
        throw new Error(`Config invalid: Route ${i} must contain a "url" (string)!`);
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
