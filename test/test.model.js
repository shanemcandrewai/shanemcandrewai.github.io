import './mocha.js';
import './chai.js';
import * as model from '../js/model.js';

// const dbTest = new Map([[1, new Map([['created', '2023-09-15'], ['priority', 1],
// ['description', 'aaa'], ['due', '']])], [2, new Map([['created', '2023-09-16'],
// ['priority', 2], ['description', 'bbb'], ['due', '']])]]);

const dbTestInsert1 = new Map([['id', 1], ['created', '2023-09-15'], ['priority', 1], ['description', 'aaa'], ['due', '']]);
const dbTestInsert2 = new Map([['id', 2], ['created', '2023-09-16'], ['priority', 2], ['description', 'bbb'], ['due', '']]);

/* global suite, test, chai */

suite('DB record operations', () => {
  test('empty', () => {
    chai.assert.equal(model.insertRec(new Map(dbTestInsert1)), 'Record successfully inserted');
    chai.assert.equal(model.empty(), 'DB succesfully emptied');
  });
  test('insert', () => {
    model.empty();
    model.insertRec(new Map(dbTestInsert1));
    model.insertRec(new Map(dbTestInsert2));
    chai.assert.equal(model.getRecDb(2).get('priority'), 2);
  });
  test('insert resists duplicate keys', () => {
    model.empty();
    model.insertRec(new Map(dbTestInsert1));
    chai.assert.notEqual(model.insertRec(dbTestInsert1), 'Record successfully inserted');
  });
  test('update', () => {
    model.empty();
    model.insertRec(new Map(dbTestInsert1));
    model.insertRec(new Map(dbTestInsert2));
    const updated = new Map(dbTestInsert2);
    updated.set('priority', 4);
    model.updateRec(updated);
    chai.assert.equal(model.getRecDb(2).get('priority'), 4);
  });
  test('delete', () => {
    model.empty();
    chai.assert.equal(model.insertRec(new Map(dbTestInsert1)), 'Record successfully inserted');
    chai.assert.equal(model.deleteRec(1), 'Record successfully deleted');
  });
  test('get max id', () => {
    model.empty();
    chai.assert.equal(model.insertRec(new Map(dbTestInsert2)), 'Record successfully inserted');
    chai.assert.equal(model.insertRec(new Map(dbTestInsert1)), 'Record successfully inserted');
    chai.assert.equal(model.getMaxID(), 2);
  });
});
