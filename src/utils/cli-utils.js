'use strict';

const cowsay = require('cowsay');

class CLIUtils {
  static generalErrorHandler(err) {
    console.log(cowsay.think({ // eslint-disable-line no-console
      text: 'Shit, something went wrong!',
      e: 'oO',
      T: '',
      f: 'head-in'
    }));

    console.log(''); // eslint-disable-line no-console
    console.log(err); // eslint-disable-line no-console
    console.log(''); // eslint-disable-line no-console
  }

  static generalSuccessHandler(msg) {
    console.log(''); // eslint-disable-line no-console
    console.log(cowsay.think({ // eslint-disable-line no-console
      text: msg,
      e: 'oO',
      T: 'U'
    }));
    console.log(''); // eslint-disable-line no-console
  }
}

module.exports = CLIUtils;
