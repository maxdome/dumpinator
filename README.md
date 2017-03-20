```
   ____                        _             _
  |  _ \ _   _ _ __ ___  _ __ (_)_ __   __ _| |_ ___  _ __  TM
  | | | | | | | '_ ` _ \| '_ \| | '_ \ / _` | __/ _ \| '__|
  | |_| | |_| | | | | | | |_) | | | | | (_| | || (_) | |
  |____/ \__,_|_| |_| |_| .__/|_|_| |_|\__,_|\__\___/|_|
                        |_|
```
[![Travis Build Status](https://travis-ci.org/maxdome/dumpinator.svg?branch=develop)](https://travis-ci.org/maxdome/dumpinator)

Dumpinator is an automated QA tool for REST APIs. Its mission is to compare a list of HTTP Response Headers & Bodies in different environments & versions. The current version was developed as a development tool that quickly generates API response diffs that give an idea whether major refactorings work as expected. The goal is to develop Dumpinator as an independent, scriptable CLI tool that can be used for all sorts of REST APIs. It expects a main configuration file and spec files for each API endpoint that needs to be diff'ed. Each run writes the responses as JSON files in the given directory and outputs an easy-to-read HTML report of the diff. Used in combination with Jenkins, Dumpinator can be run in a CI pipeline but also be triggered manually by the QA team each time a new API release is about to be deployed as a replacement for tedious and time consuming regression tests.

> "With Dumpinator™, we are about to revolutionize the way we think about Heimdall testing and API testing in general."

_A. Heinkelein, CEO Heimdall Inc._

# Installation

Install Dumpinator™ globally using

    $ npm install -g dumpinator


# Using the CLI

    Synopsis: dp [options] [command]

    Commands:

      diff <left> <right>  compare the given routes
      diff <id>            compare the given routes by a result id
      show <id>            show a result of the given id
      run                  run the diff suite (default task)
      help [cmd]           display help for [cmd]

    Options:

      -h, --help     output usage information
      -V, --version  output the version number
      -v, --verbose  Be more verbose

## `run` Command

Can be used both with **config files** and **command line arguments**. Fetches the given routes and outputs a **run report** by comparing each left & right side response.
The `run` task is the default task an will be used if no task was added to the command.

    $ dp [options]

is the same as

    $ dp run [options]

### Using the default config

If no arguments are given, Dumpinator™ tries to find the default config in the current working directory. If `dumpinator.conf.js` is not found, it looks for `dumpinator.json` (CommonJS module) before giving up:

    $ dp run

### Using a custom config

A custom config can be provided via `-c` or `--config`:

    $ dp run -c /path/to/my/config.json  # or config.js (CommonJS module)

### Provding 2 routes directly (defaults to GET method)

    $ dp run http://localhost/v2/my-first-route http://myapi.com/v1/my-first-route

### Provding 2 routes directly with custom methods

    $ dp run "POST http://localhost/v2/my-first-route" "POST http://myapi.com/v1/my-first-route"

### Adding custom headers to both sides

    $ dp run <left> <right> -H "content-type:application/json" -H "language:en_US"  # or --header "..."

### Adding custom headers to left side only

    $ dp run <left> <right> -L "content-type:application/json" -L "language:en_US"  # or --header-left "..."

### Adding custom headers to both sides

    $ dp run <left> <right> -R "content-type:application/json" -R "language:en_US"  # or --header-right "..."

### Overriding the concurrency rate limit

    $ dp run -r 10  # or --rate ...

### Only include routes with a tag

    $ dp run -t "some-route-type"  # or --tag "..."


## `diff` Command

This command shows a diff of two given routes or a result id. It's ok to use only the first characters as long as a unique match is found.

    $ dp diff http://foo.com/my.json http://bar.com/my.json

or

    $ dp diff fe345dc  # or dp diff fe


# Config Files

Dumpinator™ accepts both **JSON** files and **CommonJS** modules which can be scripted for more flexibility.

## Basic example

The following config will fetch 2 routes `/my-first-route` and `/my-second-route` from both `http://localhost/v2/` and `http://myapi.com/v1/` and compare them.

### CommonJS

```javascript
module.exports = {
  defaults: {
    left: {
      hostname: 'http://localhost/v2/'
    },
    right: {
      hostname: 'http://myapi.com/v1/'
    }
  },
  routes: [
    {
      url: '/my-first-route'
    },
    {
      url: '/my-second-route'
    }
  ]
};
```

### JSON

```json
{
  "defaults": {
    "left": {
      "hostname": "http://localhost/v2/"
    },
    "right": {
      "hostname": "http://myapi.com/v1/"
    }
  },
  "routes": [
    {
      "url": "/my-first-route"
    },
    {
      "url": "/my-second-route"
    }
  ]
}
```

## Adding default headers

Additional headers can be added to the `defaults.left` and `defaults.right` sections where they get appended to each route:

### CommonJS

```javascript
module.exports = {
  defaults: {
    left: {
      hostname: 'http://localhost/v2/',
      header: {
        'content-type': 'application/json',
        // ...
      }
    },
    right: {
      hostname: 'http://myapi.com/v1/',
      header: {
        'content-type': 'application/json',
        'x-some-additional-header': 'that-is-only-relevant-on-this-host',
        // ...
      }
    }
  },
  routes: [
    // ...
  ]
};
```

### JSON

```json
{
  "defaults": {
    "left": {
      "hostname": "http://localhost/v2/",
      "header": {
        "content-type": "application/json",
        ...
      }
    },
    "right": {
      "hostname": "http://myapi.com/v1/",
      "header": {
        "content-type": "application/json",
        "x-some-additional-header": "that-is-only-relevant-on-this-host",
        ...
      }
    }
  },
  "routes": [
    ...
  ]
}
```

## Adding headers per route

Headers can be added to each route individually, extending & overriding default headers:

### CommonJS

```javascript
module.exports = {
  defaults: {
    // ...
  },
  routes: [
    {
      url: '/my-first-route',
      header: {
        'content-type': 'application/json',
        // ...
      }
    },
    // ...
  ]
};
```

### JSON

```json
{
  "defaults": {
    ...
  },
  "routes": [
    {
      "url": "/my-first-route",
      "header": {
        "content-type": "application/json",
        ...
      }
    },
    ...
  ]
}
```


## Adding default query parameters

Additional query parameters can be added to the `defaults.left` and `defaults.right` sections where they get appended to each route:

### CommonJS

```javascript
module.exports = {
  defaults: {
    left: {
      hostname: 'http://localhost/v2/',
      query: {
        defaultQuery: 'defaultValue',
        // ...
      }
    },
    right: {
      hostname: 'http://myapi.com/v1/',
      query: {
        defaultQuery: 'defaultValue',
        additionalQuery: 'thatIsOnlyRelevantOnThisHost',
        // ...
      }
    }
  },
  routes: [
    // ...
  ]
};
```

### JSON

```json
{
  "defaults": {
    "left": {
      "hostname": "http://localhost/v2/",
      "query": {
        "defaultQuery": "defaultValue",
        ...
      }
    },
    "right": {
      "hostname": "http://myapi.com/v1/",
      "query": {
        "defaultQuery": "defaultValue",
        "additionalQuery": "thatIsOnlyRelevantOnThisHost",
        ...
      }
    }
  },
  "routes": [
    ...
  ]
}
```


## Adding query parameters per route

Query parameters can be added to each route individually, extending & overriding default query parameters:

### CommonJS

```javascript
module.exports = {
  defaults: {
    // ...
  },
  routes: [
    {
      url: '/my-first-route',
      query: {
        defaultQuery: 'defaultValue',
        // ...
      }
    },
    // ...
  ]
};
```

### JSON

```json
{
  "defaults": {
    ...
  },
  "routes": [
    {
      "url": "/my-first-route",
      "query": {
        "defaultQuery": "defaultValue",
        ...
      }
    },
    ...
  ]
}
```

### Options

#### Status

Setting the `status` option makes a route test fail if the status code doesn't match.

```json
{
  "defaults": {
    ...
  },
  "routes": [
    {
      "url": "/my-first-route",
      "status": 204
    },
    ...
  ]
}
```

#### Method

The `method` option sets the HTTP send method which can be set in either level. `GET` is the default.  

Dumpinator supports these methods:  

`CHECKOUT` `COPY` `DELETE` `GET` `HEAD` `LOCK` `MERGE` `MKACTIVITY` `MKCOL` `MOVE` `M-SEARCH` `NOTIFY` `OPTIONS` `PATCH` `POST` `PURGE` `PUT` `REPORT` `SEARCH` `SUBSCRIBE` `TRACE` `UNLOCK` `UNSUBSCRIBE`

```json
{
  "defaults": {
    "method": "GET",
    ...
  },
  "routes": [
    {
      "url": "/my-first-route",
      "status": 204,
      "right": {
        "method": "POST"
      }
    },
    ...
  ]
}
```

#### Callbacks

Callbacks can be used as hooks on any level to add some before/after logic.

`before` on base level: Called before starting all tests
`beforeEach` on base level: Called before each route
`before` on route level: Called before a single route
`after` on route level: Called after a single route
`afterEach` on base level: Called after each route
`after` on base level: Called after completing all tests

Callbacks are simple functions and either sync or async. If you return a promise, the callback will be handled async, otherwise sync.

```javascript
module.exports = {
  defaults: {
    // ...
  },
  before: () => {
    console.log('All tests started');
    return Promise.resolve();
  },
  beforeEach: () => {
    console.log('Route started');
  },
  after: () => {
    console.log('All tests completed');
  }
  routes: [
    {
      url: '/my-first-route',
      before: () => {
        console.log('Individual route started');
        return Promise.resolve();
      },
      after: () => {
        console.log('Individual route completed');
        return Promise.resolve();
      }
    },
    // ...
  ]
};
```

#### Transformations

A `transform()` method can be used to transform the response before it gets stored or used for a diff. The transform method is a static method and contains the response object as first argument.

```js
module.exports = {
  defaults: {
    // ...
  },
  routes: [
    {
      url: '/my-first-route',
      left: {
        tranform(res) {
          // wrap a data level around body response
          res.body = JSON.stringify({ data: JSON.parse(res.body) });
          return res;
        }
      }
    },
    // ...
  ]
};
```

#### Ignoring properties

Sometimes, you don't care about certain header or body properties and want to ignore them. Use `ignoreHeader` and `ignoreBody` for that.

```json
{
  "defaults": {
    "ignoreBody": [
      "foo.bar",
      "customer.sessionId"
    ],
    "ignoreHeader": [
      "sessionid",
      "cookies"
    ]
  },
  "routes": [
    {
      "url": "/my-first-route",
      "query": {
        "defaultQuery": "defaultValue",
        ...
      }
    },
    ...
  ]
}
```


# Using the API

The API can be used directly, too.

```javascript
const dumpinator = require('dumpinator');
// TODO
```

## Methods

TODO


# License

Copyright &copy; 2016 [maxdome GmbH](https://github.com/maxdome)

Licensed under the [MIT license](http://opensource.org/licenses/MIT).
