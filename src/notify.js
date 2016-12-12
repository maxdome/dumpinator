'use strict';

const EventEmitter = require('events');

class Notify extends EventEmitter {
  addTest(test) {
    this.emit('test.add', test);
  }

  testLoaded(test, status) {
    this.emit('test.status', status);
  }
}

module.exports = Notify;
