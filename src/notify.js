'use strict';

const EventEmitter = require('events');

class Notify extends EventEmitter {
  constructor() {
    super();

    this.session = {};
  }

  addTest(test) {
    if (!this.session[test.id]) {
      this.session[test.id] = {
        state: 'pending',
        name: test.name
      };

      this.emit('test.add', this.session[test.id]);
    }

    this.session[test.id][test.order] = {
      state: 'pending'
    };
  }

  setState(test, status) {
    this.session[test.id][test.order].state = status;
    this.emit('test.state', status);

    if (state === 'downloaded')

    const allDone = ['left', 'right'].every(order => /passed|failed/.test(this.session[test.id][order].state));
    if (allDone) {
      const allPassed = ['left', 'right'].every(order => /passed/.test(this.session[test.id][order].state));
      this.session[test.id].state = allPassed ? 'passed' : 'failed';
      this.emit('test.finish', this.session[test.id]);
    }
  }
}

module.exports = Notify;
