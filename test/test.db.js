import './libs/mocha.js';
import './libs/chai.js';
import Db from '../js/db.js';

const db = new Db();

/* global suite, test, chai */

suite('Db', () => {
  test('Set record', () => {
    db.db.clear();
    db.setRec(1, 'a', 3);
    chai.assert.equal(db.db.get(1).get('a'), 3);
  });
  test('Get record', () => {
    db.db.clear();
    db.setRec(1, 'a', 4);
    chai.assert.equal(db.getRec(1).get('a'), 4);
  });
});
