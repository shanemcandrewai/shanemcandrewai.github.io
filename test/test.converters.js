import './mocha.js';
import './chai.js';
import * as model from '../js/model.js';
import { mapEncoder, mapDecoder, getExcel } from '../js/converters.js';

const dbTestInsert1 = new Map([['id', 1], ['created', '2023-09-15'], ['priority', 1], ['description', 'aaa'], ['due', '']]);
const dbTestInsert2 = new Map([['id', 2], ['created', '2023-09-16'], ['priority', 2], ['description', 'bbb'], ['due', '']]);

/* global suite, test, chai */

suite('Data conversions', () => {
  test('Map encoded to JSON', () => {
    const testMap = new Map([[1, new Map([['created', '2023-09-16']])]]);
    const encodedDb = JSON.stringify(testMap, mapEncoder);
    const expectText = '{"dataType":"Map","value":[[1,{"dataType":"Map","value":'
      + '[["created","2023-09-16"]]}]]}';
    chai.assert.equal(encodedDb, expectText);
  });
  test('JSON decoded to Map', () => {
    const dbjson = '{"dataType":"Map","value":[[1,{"dataType":"Map","value":'
      + '[["created","2023-09-16"]]}]]}';
    const testMap = JSON.parse(dbjson, mapDecoder);
    chai.assert.equal(testMap.get(1).get('created'), '2023-09-16');
  });
});

suite('DB to Excel', () => {
  test('convert db to array of objects', () => {
    model.empty();
    model.insertRec(new Map(dbTestInsert1));
    model.insertRec(new Map(dbTestInsert2));
    chai.assert.equal(model.getArrayObjs()[1].priority, 2);
  });
  test('convert db to workbook', () => {
    model.empty();
    model.insertRec(new Map(dbTestInsert1));
    model.insertRec(new Map(dbTestInsert2));
    chai.assert.equal(getExcel().SheetNames[0], 'main');
  });
});
