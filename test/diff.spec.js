'use strict';

const path = require('path');
const fs = require('fs');
const inspect = require('inspect.js');

const Diff = require('../src/diff');

describe('Diff', () => {
  before((done) => {
    fs.unlink(path.join(__dirname, 'tmp', 'left.json'), () => done());
  });

  describe('compare()', () => {
    it('checks whether two json objects are equal or not (passes)', () => {
      const left = { name: 'Andi', coolness: '100%' };
      const right = { name: 'Andi', coolness: '100%' };

      const diff = new Diff();
      const diffResult = diff.compare(left, right);

      inspect(diffResult).isTrue();
    });

    it('checks whether two json objects are equal or not (fails)', () => {
      const left = { name: 'Andi', coolness: '100%' };
      const right = { name: 'Chrissn', coolness: '100%' };

      const diff = new Diff();
      const diffResult = diff.compare(left, right);

      inspect(diffResult).isFalse();
    });

    it('checks whether two arrays are equal or not (passes)', () => {
      const left = ['Beer', 'Coffee'];
      const right = ['Beer', 'Coffee'];

      const diff = new Diff();
      const diffResult = diff.compare(left, right);

      inspect(diffResult).isTrue();
    });

    it('checks whether two arrays are equal or not (fails)', () => {
      const left = ['Beer', 'Coffee'];
      const right = ['Beer', 'Tea'];

      const diff = new Diff();
      const diffResult = diff.compare(left, right);

      inspect(diffResult).isFalse();
    });

    it('checks whether two strings are equal or not (passes)', () => {
      const left = '{ name: \'Andi\', coolness: \'100%\' }';
      const right = '{ name: \'Andi\', coolness: \'100%\' }';

      const diff = new Diff();
      const diffResult = diff.compare(left, right);

      inspect(diffResult).isTrue();
    });

    it('checks whether two strings are equal or not (fails)', () => {
      const left = '{ name: \'Andi\', coolness: \'100%\' }';
      const right = '{ name: \'Chrissn\', coolness: \'100%\' }';

      const diff = new Diff();
      const diffResult = diff.compare(left, right);

      inspect(diffResult).isFalse();
    });
  });


  describe('diff()', () => {
    it('diffs two json objects', () => {
      const left = { name: 'Andi', coolness: '100%' };
      const right = { name: 'Chrissn', coolness: '100%' };

      const diff = new Diff();
      const diffResult = diff.diff(left, right);

      inspect(diffResult).isArray();
    });
  });

  describe('lowerCaseKeysRecursive()', () => {
    it('lower case all object keys', () => {
      const obj = {
        Foo: 'bar',
        'UPPER-CASED': {
          Sub1: {
            Sub2: 'OK'
          }
        },
        lowercased: null,
        NoBody: undefined
      };

      const diff = new Diff();
      inspect(diff.lowerCaseKeysRecursive(obj)).isEql({
        foo: 'bar',
        'upper-cased': {
          sub1: {
            sub2: 'OK'
          }
        },
        lowercased: null,
        nobody: undefined
      });
    });
  });
});
