import { mapDecoder } from '../js/model.js';

const dbdiv = document.getElementById('db');
dbdiv.dbtext = '{"dataType":"Map","value":[[1,{"dataType":"Map","value":[["created","2023-09-15"],["priority",1],["description","aaa"],["due",""]]}],[2,{"dataType":"Map","value":[["created","2023-09-15"],["priority",2],["description","bbb"],["due",""]]}]]}';
const dbmap = JSON.parse(dbdiv.dbtext, mapDecoder);

mocha.setup({
  ui: 'bdd',
  rootHooks: {
    beforeEach(done) {
      dbdiv.db = dbmap;
      done();
    },
  },
});
mocha.checkLeaks();
