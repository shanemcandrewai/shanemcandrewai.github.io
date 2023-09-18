import './mocha.js';
import './chai.js';
import {
  empty, insertRec, updateRec, deleteRec, getRecDb, getArrayObjs,
} from '../js/model.js';
import { mapEncoder, mapDecoder, getExcel } from '../js/converters.js';

mocha.setup('tdd');
mocha.checkLeaks();

/* global suite, test, mocha, chai */

suite('Data conversions', () => {
  test('Map encoded to JSON', () => {
    const db = new Map([[1, new Map([['created', '2023-09-16']])]]);
    const encodedDb = JSON.stringify(db, mapEncoder);
    const expectText = '{"dataType":"Map","value":[[1,{"dataType":"Map","value":'
      + '[["created","2023-09-16"]]}]]}';
    chai.assert.equal(encodedDb, expectText);
  });
  test('JSON decoded to the Map', () => {
    const dbjson = '{"dataType":"Map","value":[[1,{"dataType":"Map","value":'
      + '[["created","2023-09-16"]]}]]}';
    const db = JSON.parse(dbjson, mapDecoder);
    chai.assert.equal(db.get(1).get('created'), '2023-09-16');
  });
});

suite('DB record operations', () => {
  test('empty', () => {
    const rec = JSON.parse('{"dataType":"Map","value":[["id",1],["created","2023-09-15"],'
    + '["priority",3],["description","aaa"],["due",""]]}', mapDecoder);
    chai.assert.equal(insertRec(rec), 'Record successfully inserted');
    chai.assert.equal(empty(), 'DB succesfully emptied');
  });
  test('insert', () => {
    empty();
    let rec = JSON.parse('{"dataType":"Map","value":[["id",1],["created","2023-09-15"],'
    + '["priority",3],["description","aaa"],["due",""]]}', mapDecoder);
    chai.assert.equal(insertRec(new Map(rec)), 'Record successfully inserted');
    rec = JSON.parse('{"dataType":"Map","value":[["id",3],["created","2023-09-15"],'
    + '["priority",3],["description","aaa"],["due",""]]}', mapDecoder);
    insertRec(rec);
    chai.assert.equal(getRecDb(3).get('priority'), 3);
  });
  test('insert resists duplicate keys', () => {
    empty();
    const rec = JSON.parse('{"dataType":"Map","value":[["id",3],["created","2023-09-15"],'
    + '["priority",3],["description","aaa"],["due",""]]}', mapDecoder);
    insertRec(new Map(rec));
    chai.assert.notEqual(insertRec(new Map(rec)), 'Record successfully inserted');
  });
  test('update', () => {
    empty();
    let rec = JSON.parse('{"dataType":"Map","value":[["id",3],["created","2023-09-15"],'
    + '["priority",3],["description","aaa"],["due",""]]}', mapDecoder);
    insertRec(rec);
    rec = JSON.parse('{"dataType":"Map","value":[["id",3],["created","2023-09-15"],'
    + '["priority",4],["description","aaa"],["due",""]]}', mapDecoder);
    updateRec(rec);
    chai.assert.equal(getRecDb(3).get('priority'), 4);
  });
  test('delete', () => {
    empty();
    const rec = JSON.parse('{"dataType":"Map","value":[["id",1],["created","2023-09-15"],'
    + '["priority",3],["description","aaa"],["due",""]]}', mapDecoder);
    chai.assert.equal(insertRec(rec), 'Record successfully inserted');
    chai.assert.equal(deleteRec(1), 'Record successfully deleted');
  });
});

suite('DB to Excel', () => {
  test('convert db to array of objects', () => {
    empty();
    let rec = JSON.parse(
      '{"dataType":"Map","value":[["id",1],["created",'
    + '"2023-09-15"],["priority",1],["description","aaa"],["due",""]]}',
      mapDecoder,
    );
    insertRec(rec);
    rec = JSON.parse(
      '{"dataType":"Map","value":[["id",2],["created",'
    + '"2023-09-15"],["priority",2],["description","bbb"],["due",""]]}',
      mapDecoder,
    );
    insertRec(rec);
    chai.assert.equal(getArrayObjs()[1].priority, 2);
  });
  test('convert db to workbook', () => {
    empty();
    let rec = JSON.parse(
      '{"dataType":"Map","value":[["id",1],["created",'
    + '"2023-09-15"],["priority",1],["description","aaa"],["due",""]]}',
      mapDecoder,
    );
    insertRec(rec);
    rec = JSON.parse(
      '{"dataType":"Map","value":[["id",2],["created",'
    + '"2023-09-15"],["priority",2],["description","bbb"],["due",""]]}',
      mapDecoder,
    );
    insertRec(rec);
    chai.assert.equal(getExcel().SheetNames[0], 'main');
  });
});

mocha.run();
