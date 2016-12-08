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
    
      diff [options] [left] [right]  Compare the given routes
    
    Options:
    
      -h, --help     output usage information
      -V, --version  output the version number
      -v, --verbose  Be more verbose

## `diff` Command

Can be used both with **config files** and **command line arguments**. Fetches the given routes and outputs a **diff report** by comparing each left & right side response. 

### Using the default config

If no arguments are given, Dumpinator™ tries to find the default config in the current working directory. If `dumpinator.conf.js` is not found, it looks for `dumpinator.json` (CommonJS module) before giving up:

    $ dp diff 
    
### Using a custom config

A custom config can be provided via `-c` or `--config`:

    $ dp diff -c /path/to/my/config.json  # or config.js (CommonJS module)

### Provding 2 routes directly (defaults to GET method) 

    $ dp diff http://localhost/v2/my-first-route http://myapi.com/v1/my-first-route

### Provding 2 routes directly with custom methods 

    $ dp diff "POST http://localhost/v2/my-first-route" "POST http://myapi.com/v1/my-first-route"

### Adding custom headers to both sides

    $ dp diff <left> <right> -H "content-type:application/json" -H "language:en_US"  # or --header "..."

### Adding custom headers to left side only

    $ dp diff <left> <right> -L "content-type:application/json" -L "language:en_US"  # or --header-left "..."

### Adding custom headers to both sides

    $ dp diff <left> <right> -R "content-type:application/json" -R "language:en_US"  # or --header-right "..."

### Overriding the concurrency rate limit

    $ dp diff -r 10  # or --rate ...

### Only include routes with a tag

    $ dp diff -t "some-route-type"  # or --tag "..."


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
