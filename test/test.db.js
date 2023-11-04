import Db from '../js/db.js';

const db = new Db();

/* global suite, test, chai */

suite('Db', () => {
  test('Set record', () => {
    db.db.clear();
    db.setRec(1, 'created', '2023-10-01T09:08:46.606Z');
    chai.assert.equal(db.db.get(1).get('created'), '2023-10-01T09:08:46.606Z');
  });
  test('Get record', () => {
    db.db.clear();
    db.setRec(3, 'priority', 2);
    chai.assert.equal(db.getRec(3).get('priority'), 2);
  });
});
