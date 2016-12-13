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
        name: test.name,
        id: test.id.substr(0, 8)
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

    if (status === 'downloaded') {
      const allDone = ['left', 'right'].every(order => /^downloaded$|^download-failed$/.test(this.session[test.id][order].state));
      if (allDone) {
        const allPassed = ['left', 'right'].every(order => /downloaded/.test(this.session[test.id][order].state));
        this.session[test.id].state = allPassed ? 'downloaded' : 'download-failed';
        this.emit('test.downloaded', this.session[test.id]);
      }
    } else {
      const allDone = ['left', 'right'].every(order => /^passed$|failed/.test(this.session[test.id][order].state));
      if (allDone) {
        const allPassed = ['left', 'right'].every(order => /passed/.test(this.session[test.id][order].state));
        this.session[test.id].state = allPassed ? 'passed' : 'failed';
        this.emit('test.finish', this.session[test.id]);
      }
    }
  }

  getState(test) {
    return this.session[test.id].state;
  }

  setTestPassed(test) {
    ['left', 'right'].forEach((order) => {
      this.session[test.id][order].state = 'passed';
    });

    this.session[test.id].state = 'passed';
    this.emit('test.finish', this.session[test.id]);
  }

  setTestFailed(test) {
    // ['left', 'right'].forEach((order) => {
    //   if (this.session[test.id][order].state.indexOf('failed') === -1) {
    //     this.session[test.id][order].state = 'failed';
    //   }
    // });

    this.session[test.id].state = 'failed';
    this.emit('test.finish', this.session[test.id]);
  }
}

module.exports = Notify;