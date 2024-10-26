import Json from '../js/json.js';

const json = new Json();

const dbTestRec1 = new Map([['created', '2023-10-01T09:08:46.606Z'], ['priority', 1], ['description', 'aaa'], ['due', '']]);
const dbTestRec2 = new Map([['created', '2023-10-01T09:09:46.606Z'], ['priority', 2], ['description', 'bbb'], ['due', '']]);

/* global suite, test, chai */

suite('Json', () => {
  test('Blob encoder', () => {
    json.db.db.clear();
    json.db.db.set(1, dbTestRec1);
    json.db.db.set(2, dbTestRec2);
    const blob = json.getBlob();
    chai.assert.equal(blob.size, 234);
  });
  test('Blob decoder', async () => {
    json.db.db.clear();
    json.db.db.set(3, dbTestRec1);
    json.db.db.set(4, dbTestRec2);
    const blob = json.getBlob();
    const dbfile = new File([blob], 'testfile', { type: 'application/json' });
    await json.readFile(dbfile);
    chai.assert.equal(json.db.db.get(4).get('priority'), 2);
  });
});
