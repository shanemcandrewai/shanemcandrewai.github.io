import ArrObj from '../js/arrobj.js';

const arrobj = new ArrObj();

const dbTestRec1 = {
  id: 1,
  created: '2023-10-01T09:09:46.606Z',
  priority: 1,
  description: 'aaa',
  due: '',
};
const dbTestRec2 = {
  id: 2,
  created: '2023-10-01T09:09:56.606Z',
  priority: 2,
  description: 'bbb',
  due: '',
};

/* global suite, test, chai */

suite('ArrObj', () => {
  test('clear', () => {
    arrobj.db.db.clear();
    chai.assert.equal(arrobj.db.db.size, 0);
  });
  test('setArrObj, getArrObj', () => {
    arrobj.db.db.clear();
    arrobj.setArrObj([dbTestRec1]);
    arrobj.setArrObj([dbTestRec2]);
    chai.assert.equal(arrobj.db.db.size, 2);
    chai.assert.equal(arrobj.getArrObj(1).created, '2023-10-01 11:09');
    chai.assert.equal(arrobj.getArrObj(2).priority, 2);
  });
  test('getArrObj max id', () => {
    arrobj.db.db.clear();
    arrobj.setArrObj([dbTestRec1]);
    const dbTestRec3 = JSON.parse(JSON.stringify(dbTestRec2));
    dbTestRec3.id = 6;
    arrobj.setArrObj([dbTestRec3]);
    chai.assert.equal(Math.max(...arrobj.db.db.keys()), 6);
  });
});
