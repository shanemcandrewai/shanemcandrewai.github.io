import Xlsx from '../js/xlsx.js';

const xlsx = new Xlsx();

const dbTestRec1 = new Map([['created', '2023-10-01T09:08:46.606Z'], ['priority', 1], ['description', 'aaa'], ['due', '']]);
const dbTestRec2 = new Map([['created', '2023-10-01T09:09:46.606Z'], ['priority', 2], ['description', 'bbb'], ['due', '']]);

/* global suite, test, chai */

suite('Xlsx', () => {
  test('Blob encoder', () => {
    xlsx.arrobj.db.db.clear();
    xlsx.arrobj.db.db.set(1, dbTestRec1);
    xlsx.arrobj.db.db.set(2, dbTestRec2);
    const blob = xlsx.getBlob();
    chai.assert.equal(blob.size, 16309);
  });
  test('Blob decoder', async () => {
    xlsx.arrobj.db.db.clear();
    xlsx.arrobj.db.db.set(3, dbTestRec1);
    xlsx.arrobj.db.db.set(4, dbTestRec2);
    const blob = xlsx.getBlob();
    const dbfile = new File([blob], 'testfile', { type: 'application/vnd.ms-excel' });
    await xlsx.readFile(dbfile);
    chai.assert.equal(xlsx.arrobj.db.db.get(4).get('priority'), 2);
  });
});
