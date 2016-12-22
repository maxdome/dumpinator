'use strict';

const program = require('commander');
const cowsay = require('cowsay');

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
  }

  static generalErrorHandler() {
    console.log(''); // eslint-disable-line no-console
    console.log(cowsay.think({ // eslint-disable-line no-console
      text: 'Geez, I fucked it up!',
      e: 'oO',
      T: 'U'
    }));
    console.log(''); // eslint-disable-line no-console
  }

  static generalSuccessHandler() {
    console.log(''); // eslint-disable-line no-console
    console.log(cowsay.think({ // eslint-disable-line no-console
      text: 'Hell yeah, I\'m awesome!',
      e: '-O'
    }));
    console.log(''); // eslint-disable-line no-console
  }
}

process.on('uncaughtException', (err) => {
  CLIUtils.generalExceptionHandler(err);
  process.exit(1);
});

module.exports = CLIUtils;
