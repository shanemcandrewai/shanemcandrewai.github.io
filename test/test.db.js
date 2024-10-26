import Db from '../js/db.js';

const db = new Db();

/* global suite, test, chai */

suite('Db', () => {
  test('Set record', () => {
    db.db.clear();
    db.setRec('created', '2023-10-01T09:08:46.606Z');
    chai.assert.equal(db.db.get('created'), '2023-10-01T09:08:46.606Z');
  });
  test('Get record', () => {
    db.db.clear();
    db.setRec('priority', 2);
    chai.assert.equal(db.getRec('priority'), 2);
  });
});
