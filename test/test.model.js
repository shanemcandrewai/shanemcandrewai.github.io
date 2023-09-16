import * as model from '../js/model.js';

const dbdiv = document.getElementById('db');

describe('Model.js tests', () => {
  describe('The test db', () => {
    it('Static text can be encoded to JSON', () => {
      const db = new Map([[1, new Map([['created', '2023-09-16']])]]);
      const encodedDb = JSON.stringify(db, model.mapEncoder);
      const expectText = '{"dataType":"Map","value":[[1,{"dataType":"Map","value":[["created","2023-09-16"]]}]]}';
      chai.assert.equal(encodedDb, expectText);
    });
    it('Hook text can be encoded to JSON', () => {
      const encodedDb = JSON.stringify(dbdiv.db, model.mapEncoder);
      const expectText = '{"dataType":"Map","value":[[1,{"dataType":"Map","value":[["created","2023-09-15"],["priority",1],["description","aaa"],["due",""]]}],[2,{"dataType":"Map","value":[["created","2023-09-15"],["priority",2],["description","bbb"],["due",""]]}]]}';
      chai.assert.equal(encodedDb, expectText);
    });
    it('Hook text can be decoded to Map', () => {
      const db = JSON.parse(dbdiv.dbtext, model.mapDecoder);
      chai.assert.equal(db.get(2).get('description'), 'bbb');
    });
    it('Record can be inserted', () => {
      const rec = JSON.parse('{"dataType":"Map","value":[["id",3],["created","2023-09-15"],["priority",3],["description","aaa"],["due",""]]}', model.mapDecoder);
      model.insertRec(rec);
      chai.assert.equal(model.getRec(3).get('priority'), 3);
    });
    it('Record can be updated', () => {
      const rec = JSON.parse('{"dataType":"Map","value":[["id",3],["created","2023-09-15"],["priority",4],["description","aaa"],["due",""]]}', model.mapDecoder);
      model.updateRec(rec);
      chai.assert.equal(model.getRec(3).get('priority'), 4);
    });
  });
});
