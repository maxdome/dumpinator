'use strict';

const program = require('commander');
const cowsay = require('cowsay');
const minimist = require('minimist');
const lodash = require('lodash');

class CLIUtils {
  static generalExceptionHandler(err) {
    console.log(cowsay.think({ // eslint-disable-line no-console
      text: 'Shit, something went wrong!',
      e: 'oO',
      T: '',
      f: 'head-in'
    }));

    console.log(''); // eslint-disable-line no-console
    console.log(program.verbose ? err.stack : err.message || err.message); // eslint-disable-line no-console
    console.log(''); // eslint-disable-line no-console
    process.exit(1);
  }

  static generalErrorHandler() {
    console.log(''); // eslint-disable-line no-console
    console.log(cowsay.think({ // eslint-disable-line no-console
      text: 'Geez, I fucked it up!',
      e: 'oO',
      T: 'U'
    }));
    console.log(''); // eslint-disable-line no-console
    process.exit(1);
  }

  static generalSuccessHandler(msg) {
    console.log(''); // eslint-disable-line no-console

    if (msg) {
      console.log(cowsay.say({ // eslint-disable-line no-console
        text: msg,
        e: 'oO'
      }));
    } else {
      console.log(cowsay.think({ // eslint-disable-line no-console
        text: 'Hell yeah, I\'m awesome!',
        e: '-O'
      }));
    }

    console.log(''); // eslint-disable-line no-console
  }

  static generalWarningHandler(msg) {
    console.log(''); // eslint-disable-line no-console

    if (msg) {
      console.log(cowsay.say({ // eslint-disable-line no-console
        text: msg,
        e: 'o-',
        T: 'U'
      }));
    } else {
      console.log(cowsay.think({ // eslint-disable-line no-console
        text: 'Am I crazy???',
        e: 'o-',
        T: 'U'
      }));
    }

    console.log(''); // eslint-disable-line no-console
  }

  static parseRouteArguments(rawArgs) {
    const args = minimist(rawArgs);

    const header = lodash.unionWith(
      lodash.castArray(lodash.get(args, 'H', [])),
      lodash.castArray(lodash.get(args, 'header', []))
    );

    const headerLeft = lodash.unionWith(
      lodash.castArray(lodash.get(args, 'L', [])),
      lodash.castArray(lodash.get(args, 'header-left', []))
    );

    const headerRight = lodash.unionWith(
      lodash.castArray(lodash.get(args, 'R', [])),
      lodash.castArray(lodash.get(args, 'header-right', []))
    );

    const routeConf = {
      left: {
        url: rawArgs[2],
        header: this.extendHeaders(header.concat(headerLeft))
      },
      right: {
        url: rawArgs[3],
        header: this.extendHeaders(header.concat(headerRight))
      }
    };

    return routeConf;
  }

  static extendHeaders(headers) {
    const extendedHeader = {};

    if (headers.length) {
      let keyValue;
      headers.forEach((val) => {
        keyValue = val.split(':');

        if (keyValue.length < 2) {
          throw new Error(`Arguments invalid: "${val}" does not seems to be a valid header!`);
        }

        keyValue[0] = keyValue[0].trim();
        keyValue[1] = keyValue[1].trim();

        extendedHeader[keyValue[0]] = keyValue[1];
      });
    }

    return extendedHeader;
  }
}

process.on('uncaughtException', (err) => {
  CLIUtils.generalExceptionHandler(err);
  process.exit(1);
});

module.exports = CLIUtils;
