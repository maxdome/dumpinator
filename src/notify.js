'use strict';

const EventEmitter = require('events');

class Notify extends EventEmitter {
  constructor() {
    super();

    this.session = {};
  }

  addTest(test) {
    test.id = test.id || 'xxxxxxxx';
    if (!this.session[test.id]) {
      this.session[test.id] = {
        state: 'pending',
        name: test.name,
        id: test.id.substr(0, 8)
      };

      this.emit('test.add', this.session[test.id]);
    }

    this.session[test.id][test.side] = {
      state: 'pending'
    };
  }

  setState(test, status, reason) {
    this.session[test.id][test.side].state = status;
    if (reason) {
      this.session[test.id][test.side].reason = reason;
    }

    this.emit('test.state', status);

    if (status === 'downloaded') {
      const allDone = ['left', 'right'].every(side => /^downloaded$|^download-failed$/.test(this.session[test.id][side].state));
      if (allDone) {
        const allPassed = ['left', 'right'].every(side => /downloaded/.test(this.session[test.id][side].state));
        this.session[test.id].state = allPassed ? 'downloaded' : 'download-failed';
        this.emit('test.downloaded', this.session[test.id]);
      }
    } else {
      const allDone = ['left', 'right'].every(side => /^passed$|failed/.test(this.session[test.id][side].state));
      if (allDone) {
        const allPassed = ['left', 'right'].every(side => /passed/.test(this.session[test.id][side].state));
        this.session[test.id].state = allPassed ? 'passed' : 'failed';
        this.emit('test.finish', this.session[test.id]);
      }
    }
  }

  getState(test) {
    return this.session[test.id].state;
  }

  setTestPassed(test) {
    ['left', 'right'].forEach((side) => {
      this.session[test.id][side].state = 'passed';
    });

    this.session[test.id].state = 'passed';
    this.emit('test.finish', this.session[test.id]);
  }

  setTestFailed(test) {
    // ['left', 'right'].forEach((side) => {
    //   if (this.session[test.id][side].state.indexOf('failed') === -1) {
    //     this.session[test.id][side].state = 'failed';
    //   }
    // });

    this.session[test.id].state = 'failed';
    this.emit('test.finish', this.session[test.id]);
  }

  finish(state) {
    this.emit('finish', this.getSuiteState());
  }

  error(err) {
    this.emit('error', err);
  }

  getSuiteState() {
    /* eslint no-restricted-syntax: [0, 'ForInStatement'] */
    for (const key in this.session) {
      if (this.session.hasOwnProperty(key)) { // eslint-disable-line no-prototype-builtins
        if (this.session[key].state !== 'passed') {
          return false;
        }
      }
    }

    return true;
  }
}

module.exports = Notify;
