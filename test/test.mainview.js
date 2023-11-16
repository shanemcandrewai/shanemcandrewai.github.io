import MainView from '../js/mainview.js';
import Json from '../js/json.js';
import Db from '../js/db.js';

let mainview;

/* global suite, test, setup, chai */

suite('MainView', () => {
  setup('some description', () => {
    mainview = new MainView();
  });
  test('instantiate controls', () => {
    chai.assert.equal(mainview.controlview.controls.get('uploadInput').get('event'), 'change');
  });
  test('instantiate data', () => {
    chai.assert.equal(mainview.dataview.data.get('priority').get('type'), Number);
  });
  test('insert priority 0', () => {
    mainview.controlview.db = new Json();
    mainview.dataview.data.get('id').get('elemID').value = 1;
    mainview.dataview.data.get('parent').get('elemID').value = '';
    mainview.dataview.data.get('created').get('elemID').value = '';
    mainview.dataview.data.get('priority').get('elemID').value = 0;
    mainview.dataview.data.get('description').get('elemID').value = '';
    mainview.dataview.data.get('due').get('elemID').value = '';
    mainview.controlview.insertListener();
    chai.assert.equal(mainview.controlview.db.getRec(1).get('priority'), 0);
  });
  test('Insert button disabled if no data values', () => {
    mainview.controlview.db = new Json();
    mainview.dataview.data.get('id').get('elemID').value = 5;
    mainview.dataview.data.get('parent').get('elemID').value = '';
    mainview.dataview.data.get('created').get('elemID').value = '';
    mainview.dataview.data.get('priority').get('elemID').value = '';
    mainview.dataview.data.get('description').get('elemID').value = '';
    mainview.dataview.data.get('due').get('elemID').value = '';
    mainview.controlview.updateControls();
    const insert = mainview.controlview.controls.get('insert').get('elemID');
    chai.assert.equal(insert.disabled, true);
  });
  test('load db.json', async () => {
    const dbmap = await import('./dbmap.js');
    mainview.controlview.db = new Json();
    const strObj = JSON.stringify(dbmap.default, mainview.controlview.db.mapEncoder);
    mainview.controlview.db.readText(strObj);
    const desc = mainview.controlview.db.getRec(2).get('description');
    chai.assert.equal(desc, 'Change tr');
  });
  test('load file with priority 0', async () => {
    const dbmap = await import('./dbmap.js');
    mainview.controlview.db = new Json();
    const strObj = JSON.stringify(dbmap.default, mainview.controlview.db.mapEncoder);
    mainview.controlview.db.readText(strObj);
    chai.assert.equal(mainview.controlview.db.getRec(11).get('priority'), 0);
  });
  test('empty string in file is not inserted into db', async () => {
    const dbmap = await import('./dbmap.js');
    mainview.controlview.db = new Json();
    const strObj = JSON.stringify(dbmap.default, mainview.controlview.db.mapEncoder);
    mainview.controlview.db.readText(strObj);
    chai.assert.equal(mainview.controlview.db.getRec(3).get('description'), undefined);
  });
  test('insert and update buttons are disabled after loading file', async () => {
    const dbmap = await import('./dbmap.js');
    mainview.controlview.db = new Json();
    const strObj = JSON.stringify(dbmap.default, mainview.controlview.db.mapEncoder);
    mainview.controlview.db.readText(strObj);
    mainview.dataview.db2view(mainview.controlview.db);
    mainview.controlview.updateControls();
    chai.assert.equal(mainview.controlview.controls.get('insert').get('elemID').disabled, true);
    chai.assert.equal(mainview.controlview.controls.get('update').get('elemID').disabled, true);
  });
  test('record with description can be inserted', () => {
    mainview.controlview.db = new Db();
    mainview.dataview.data.get('id').get('elemID').value = 1;
    mainview.dataview.data.get('parent').get('elemID').value = '';
    mainview.dataview.data.get('created').get('elemID').value = '';
    mainview.dataview.data.get('priority').get('elemID').value = '';
    mainview.dataview.data.get('description').get('elemID').value = 'aaa';
    mainview.dataview.data.get('due').get('elemID').value = '';
    mainview.controlview.insertListener();
    chai.assert.equal(mainview.controlview.db.getRec(1).get('description'), 'aaa');
  });
  test('records flagged canUpdate disable insert button', () => {
    mainview.controlview.db = new Db();
    mainview.dataview.data.get('id').get('elemID').value = 1;
    mainview.dataview.data.get('parent').get('elemID').value = '';
    mainview.dataview.data.get('created').get('elemID').value = '';
    mainview.dataview.data.get('priority').get('elemID').value = '';
    mainview.dataview.data.get('description').get('elemID').value = 'aaa';
    mainview.dataview.data.get('due').get('elemID').value = '';
    mainview.controlview.insertListener();
    mainview.dataview.data.get('description').get('elemID').value = 'bbb';
    mainview.controlview.updateControls();
    chai.assert.equal(mainview.controlview.controls.get('update').get('elemID').disabled, false);
    chai.assert.equal(mainview.controlview.controls.get('insert').get('elemID').disabled, true);
  });
  test('empty string descriptions can flag records canUpdate', () => {
    mainview.controlview.db = new Db();
    mainview.dataview.data.get('id').get('elemID').value = 1;
    mainview.dataview.data.get('parent').get('elemID').value = '';
    mainview.dataview.data.get('created').get('elemID').value = '';
    mainview.dataview.data.get('priority').get('elemID').value = '';
    mainview.dataview.data.get('description').get('elemID').value = 'aaa';
    mainview.dataview.data.get('due').get('elemID').value = '';
    mainview.controlview.insertListener();
    mainview.dataview.data.get('description').get('elemID').value = '';
    mainview.controlview.updateControls();
    chai.assert.equal(mainview.controlview.controls.get('update').get('elemID').disabled, false);
  });
  test('zero numeric fields can flag records canUpdate', () => {
    mainview.controlview.db = new Db();
    mainview.dataview.data.get('id').get('elemID').value = 1;
    mainview.dataview.data.get('parent').get('elemID').value = '';
    mainview.dataview.data.get('created').get('elemID').value = '';
    mainview.dataview.data.get('priority').get('elemID').value = 2;
    mainview.dataview.data.get('description').get('elemID').value = 'aaa';
    mainview.dataview.data.get('due').get('elemID').value = '';
    mainview.controlview.insertListener();
    mainview.dataview.data.get('priority').get('elemID').value = 0;
    mainview.controlview.updateControls();
    chai.assert.equal(mainview.controlview.controls.get('update').get('elemID').disabled, false);
  });
  test('children can be unlinked from parents', () => {
    mainview.controlview.db = new Db();
    mainview.dataview.data.get('id').get('elemID').value = 1;
    mainview.dataview.data.get('parent').get('elemID').value = '';
    mainview.dataview.data.get('created').get('elemID').value = '';
    mainview.dataview.data.get('priority').get('elemID').value = '';
    mainview.dataview.data.get('description').get('elemID').value = 'aaa';
    mainview.dataview.data.get('due').get('elemID').value = '';
    mainview.controlview.insertListener();
    mainview.controlview.newListener();
    mainview.dataview.data.get('parent').get('elemID').value = 1;
    mainview.controlview.insertListener();
    chai.assert.equal(mainview.controlview.db.getRec(2).get('parent'), 1);
    mainview.dataview.data.get('parent').get('elemID').value = '';
    mainview.controlview.updateListener();
    chai.assert.equal(mainview.controlview.db.getRec(2).get('parent'), undefined);
  });
  test('can delete records with children', async () => {
    mainview.controlview.db = new Db();
    mainview.dataview.data.get('id').get('elemID').value = 1;
    mainview.dataview.data.get('parent').get('elemID').value = '';
    mainview.dataview.data.get('created').get('elemID').value = '';
    mainview.dataview.data.get('priority').get('elemID').value = '';
    mainview.dataview.data.get('description').get('elemID').value = 'aaa';
    mainview.dataview.data.get('due').get('elemID').value = '';
    mainview.controlview.insertListener();
    mainview.dataview.data.get('id').get('elemID').value = 2;
    mainview.dataview.data.get('parent').get('elemID').value = '1';
    mainview.dataview.data.get('description').get('elemID').value = 'bbb';
    mainview.controlview.insertListener();
    mainview.dataview.data.get('id').get('elemID').value = 3;
    mainview.dataview.data.get('parent').get('elemID').value = '';
    mainview.dataview.data.get('description').get('elemID').value = 'ccc';
    mainview.controlview.insertListener();
    mainview.dataview.data.get('id').get('elemID').value = 1;
    mainview.controlview.deleteListener();
    mainview.controlview.updateControls();
    chai.assert.equal(mainview.controlview.db.getRec(1), undefined);
    chai.assert.equal(mainview.controlview.db.getRec(2).get('parent'), undefined);
  });
  test('can delete records with children and inherit parents parent', async () => {
    mainview.controlview.db = new Db();
    mainview.dataview.data.get('id').get('elemID').value = 1;
    mainview.dataview.data.get('parent').get('elemID').value = '';
    mainview.dataview.data.get('created').get('elemID').value = '';
    mainview.dataview.data.get('priority').get('elemID').value = '';
    mainview.dataview.data.get('description').get('elemID').value = 'aaa';
    mainview.dataview.data.get('due').get('elemID').value = '';
    mainview.controlview.insertListener();
    mainview.dataview.data.get('id').get('elemID').value = 2;
    mainview.dataview.data.get('parent').get('elemID').value = 1;
    mainview.dataview.data.get('description').get('elemID').value = 'bbb';
    mainview.controlview.insertListener();
    mainview.dataview.data.get('id').get('elemID').value = 3;
    mainview.dataview.data.get('parent').get('elemID').value = '2';
    mainview.dataview.data.get('description').get('elemID').value = 'ccc';
    mainview.controlview.insertListener();
    mainview.dataview.data.get('id').get('elemID').value = 2;
    mainview.controlview.deleteListener();
    mainview.controlview.updateControls();
    chai.assert.equal(mainview.controlview.db.getRec(2), undefined);
    chai.assert.equal(mainview.controlview.db.getRec(3).get('parent'), 1);
  });
  test('parent field value must be existing ID', async () => {
    mainview.controlview.db = new Db();
    mainview.dataview.data.get('id').get('elemID').value = 1;
    mainview.dataview.data.get('parent').get('elemID').value = '';
    mainview.dataview.data.get('created').get('elemID').value = '';
    mainview.dataview.data.get('priority').get('elemID').value = '';
    mainview.dataview.data.get('description').get('elemID').value = 'aaa';
    mainview.dataview.data.get('due').get('elemID').value = '';
    mainview.controlview.insertListener();
    mainview.dataview.data.get('id').get('elemID').value = 2;
    mainview.dataview.data.get('parent').get('elemID').value = 1;
    mainview.dataview.data.get('description').get('elemID').value = 'bbb';
    mainview.controlview.insertListener();
    mainview.dataview.data.get('id').get('elemID').value = 3;
    mainview.dataview.data.get('parent').get('elemID').value = 4;
    mainview.dataview.data.get('description').get('elemID').value = 'ccc';
    mainview.controlview.updateControls();
    chai.assert.equal(mainview.controlview.controls.get('insert').get('elemID').disabled, true);
  });
  test('new button fill first gap in IDs', async () => {
    mainview.controlview.db = new Db();
    mainview.dataview.data.get('id').get('elemID').value = 1;
    mainview.dataview.data.get('parent').get('elemID').value = '';
    mainview.dataview.data.get('created').get('elemID').value = '';
    mainview.dataview.data.get('priority').get('elemID').value = '';
    mainview.dataview.data.get('description').get('elemID').value = 'aaa';
    mainview.dataview.data.get('due').get('elemID').value = '';
    mainview.controlview.insertListener();
    mainview.dataview.data.get('id').get('elemID').value = 2;
    mainview.controlview.insertListener();
    mainview.dataview.data.get('id').get('elemID').value = 4;
    mainview.controlview.insertListener();
    mainview.dataview.data.get('id').get('elemID').value = 5;
    mainview.controlview.insertListener();
    mainview.controlview.newListener();
    chai.assert.equal(mainview.dataview.data.get('id').get('elemID').value, 3);
  });
  test('messages contains child', async () => {
    mainview.controlview.db = new Db();
    mainview.dataview.data.get('id').get('elemID').value = 1;
    mainview.dataview.data.get('parent').get('elemID').value = '';
    mainview.dataview.data.get('created').get('elemID').value = '';
    mainview.dataview.data.get('priority').get('elemID').value = '';
    mainview.dataview.data.get('description').get('elemID').value = 'aaa';
    mainview.dataview.data.get('due').get('elemID').value = '';
    mainview.controlview.insertListener();
    mainview.controlview.newListener();
    mainview.dataview.data.get('parent').get('elemID').value = 1;
    mainview.dataview.data.get('description').get('elemID').value = 'bbb';
    mainview.controlview.insertListener();
    mainview.controlview.upListener();
    chai.assert.equal(mainview.controlview.controls.get('messages').get('elemID').innerText, '2: bbb\n');
  });
});
