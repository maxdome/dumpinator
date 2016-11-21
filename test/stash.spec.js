'use strict';

const path = require('path');
const fs = require('fs');
const inspect = require('inspect.js');

const Stash = require('../src/stash');

describe('Stash', function() {
  before((done) => {
    try {
      fs.unlink(path.join(__dirname, 'tmp/left.json'), done);
    } catch (err) {
      // nothing to do here
    }
  });

  describe('add()', function() {
    it('adds a file into the stash', function() {
      const data = { a: 'b' };
      const stashFile = path.join(__dirname, 'tmp/left.json');

      const stash = new Stash(stashFile);
      const writtenFile = stash.add(typeof data === 'string' ? data : JSON.stringify(data));
      inspect(writtenFile).isPromise();

      return writtenFile.then(() => {
        inspect(fs.accessSync).withArgs(stashFile).doesNotThrow(Error);
      });
    });
  });

  describe('fetch()', function() {
    it('fetchs a file from stash', function() {
      const data = { a: 'b' };
      const stashFile = path.join(__dirname, 'tmp/left.json');

      const stash = new Stash(stashFile);
      const fetchedFile = stash.fetch(data);
      inspect(fetchedFile).isPromise();

      return fetchedFile.then((content) => {
        inspect(content).isEql(data);
      });
    });
  });
});
