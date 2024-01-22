import MainView from '../js/mainview.js';
import Json from '../js/json.js';

let mainview;

/* global suite, test, setup, teardown, chai */

suite('MainView', () => {
  setup('setup', () => {
    mainview = new MainView();
  });
  test('instantiate controls', () => {
    chai.assert.equal(mainview.controls.get('uploadInput').get('event'), 'change');
    chai.assert.equal(mainview.controls.get('insert').get('elemID').disabled, true);
  });
  test('instantiate read inputs', () => {
    chai.assert.equal(mainview.controls.get('new').get('cache'), false);
    chai.assert.equal(mainview.controls.get('insert').get('cache'), true);
    chai.assert.equal(mainview.controls.get('id').get('cache'), '');
  });
  test('instantiate data', () => {
    chai.assert.equal(mainview.controls.get('priority').get('type'), Number);
  });
  test('insert priority 0', () => {
    mainview.controlView.modelController.db = new Json();
    mainview.controls.get('id').get('elemID').value = 1;
    mainview.controls.get('priority').get('elemID').value = 0;
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'priority', value: mainview.controls.get('priority').get('elemID').value } });
    mainview.controlView.insertListener();
    chai.assert.equal(mainview.controlView.modelController.db.getRec(1).get('priority'), 0);
  });
  test('Insert button disabled if no data values', () => {
    mainview.controlView.modelController.db = new Json();
    mainview.controls.get('id').get('elemID').value = 5;
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    const insert = mainview.controls.get('insert').get('elemID');
    chai.assert.equal(insert.disabled, true);
  });
  test('load db.json', async () => {
    const dbmap = await import('./dbmap.js');
    mainview.controlView.modelController.db = new Json();
    const strObj = JSON.stringify(
      dbmap.default,
      mainview.controlView.modelController.db.mapEncoder,
    );
    mainview.controlView.modelController.db.readText(strObj);
    const desc = mainview.controlView.modelController.db.getRec(2).get('description');
    chai.assert.equal(desc, 'Change tr');
  });
  test('compare db.json with stringified DB', async () => {
    const dbmap = await import('./dbmap.js');
    mainview.controlView.modelController.db = new Json();
    const strObj = JSON.stringify(
      dbmap.default,
      mainview.controlView.modelController.db.mapEncoder,
    );
    mainview.controlView.modelController.db.readText(strObj);
    const strWithoutEmpty = strObj.slice(0, 315) + strObj.slice(334);
    const stringifiedDb = mainview.controlView.modelController.db.getString(null);
    chai.assert.equal(strWithoutEmpty, stringifiedDb);
  });
  test('compare db.json and stringified DB with deleted record', async () => {
    const dbmap = await import('./dbmap.js');
    mainview.controlView.modelController.db = new Json();
    const strObj = JSON.stringify(
      dbmap.default,
      mainview.controlView.modelController.db.mapEncoder,
    );
    mainview.controlView.modelController.db.readText(strObj);
    const strWithoutRecord3 = strObj.slice(0, 234) + strObj.slice(338);
    mainview.controls.get('id').get('elemID').value = 3;
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.deleteListener();
    const stringifiedDb = mainview.controlView.modelController.db.getString(null);
    chai.assert.equal(strWithoutRecord3, stringifiedDb);
  });
  test('message property not saved in file', async () => {
    const dbmap = await import('./dbmap.js');
    mainview.controlView.modelController.db = new Json();
    const strObj = JSON.stringify(
      dbmap.default,
      mainview.controlView.modelController.db.mapEncoder,
    );
    mainview.controlView.modelController.db.readText(strObj);
    const strWithoutEmpty = strObj.slice(0, 315) + strObj.slice(334);
    mainview.controls.get('description').get('elemID').value = 'Log updated';
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.updateListener();
    mainview.controls.get('description').get('elemID').value = 'Log';
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.updateListener();
    const stringifiedDb = mainview.controlView.modelController.db.getString(null);
    chai.assert.equal(strWithoutEmpty, stringifiedDb);
  });
  test('load file with priority 0', async () => {
    const dbmap = await import('./dbmap.js');
    mainview.controlView.modelController.db = new Json();
    const strObj = JSON.stringify(
      dbmap.default,
      mainview.controlView.modelController.db.mapEncoder,
    );
    mainview.controlView.modelController.db.readText(strObj);
    chai.assert.equal(mainview.controlView.modelController.db.getRec(11).get('priority'), 0);
  });
  test('empty string in file is not inserted into db', async () => {
    const dbmap = await import('./dbmap.js');
    mainview.controlView.modelController.db = new Json();
    const strObj = JSON.stringify(
      dbmap.default,
      mainview.controlView.modelController.db.mapEncoder,
    );
    mainview.controlView.modelController.db.readText(strObj);
    chai.assert.equal(mainview.controlView.modelController.db.getRec(3).get('description'), undefined);
  });
  test('insert and update buttons are disabled after loading file', async () => {
    const dbmap = await import('./dbmap.js');
    mainview.controlView.modelController.db = new Json();
    const strObj = JSON.stringify(
      dbmap.default,
      mainview.controlView.modelController.db.mapEncoder,
    );
    mainview.controlView.modelController.db.readText(strObj);
    mainview.controlView.modelController.db2view();
    mainview.controlView.modelController.postLoad();
    mainview.controlView.writeCache();
    chai.assert.equal(mainview.controls.get('insert').get('elemID').disabled, true);
    chai.assert.equal(mainview.controls.get('update').get('elemID').disabled, true);
  });
  test('correct enablement of previous and next button after 2 new', async () => {
    mainview.controlView.newListener();
    mainview.controlView.insertListener();
    mainview.controlView.newListener();
    chai.assert.equal(mainview.controls.get('previous').get('elemID').disabled, false);
    chai.assert.equal(mainview.controls.get('next').get('elemID').disabled, true);
  });
  test('record with description can be inserted', () => {
    mainview.controls.get('id').get('elemID').value = 1;
    mainview.controls.get('description').get('elemID').value = 'aaa';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.insertListener();
    chai.assert.equal(mainview.controlView.modelController.db.getRec(1).get('description'), 'aaa');
  });
  test('records flagged can update disable insert button', () => {
    mainview.controls.get('id').get('elemID').value = 1;
    mainview.controls.get('description').get('elemID').value = 'aaa';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controls.get('description').get('elemID').value = 'bbb';
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    chai.assert.equal(mainview.controls.get('update').get('elemID').disabled, false);
    chai.assert.equal(mainview.controls.get('insert').get('elemID').disabled, true);
  });
  test('update button disabled after update', () => {
    mainview.controlView.newListener();
    mainview.controlView.insertListener();
    mainview.controls.get('description').get('elemID').value = 'aaa';
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.updateListener();
    chai.assert.equal(mainview.controls.get('update').get('elemID').disabled, true);
    chai.assert.equal(mainview.controls.get('insert').get('elemID').disabled, true);
  });
  test('empty string descriptions can flag records canUpdate', () => {
    mainview.controls.get('id').get('elemID').value = 1;
    mainview.controls.get('description').get('elemID').value = 'aaa';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    chai.assert.equal(mainview.controls.get('update').get('elemID').disabled, false);
  });
  test('zero numeric fields can flag records canUpdate', () => {
    mainview.controls.get('id').get('elemID').value = 1;
    mainview.controls.get('priority').get('elemID').value = 2;
    mainview.controls.get('description').get('elemID').value = 'aaa';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controls.get('priority').get('elemID').value = 0;
    mainview.controlView.dataListener({ target: { id: 'priority', value: mainview.controls.get('priority').get('elemID').value } });
    chai.assert.equal(mainview.controls.get('update').get('elemID').disabled, false);
  });
  test('next and previous buttons correctly enabled after loading file', async () => {
    const dbmap = await import('./dbmap.js');
    mainview.controlView.modelController.db = new Json();
    const strObj = JSON.stringify(
      dbmap.default,
      mainview.controlView.modelController.db.mapEncoder,
    );
    mainview.controlView.modelController.db.readText(strObj);
    mainview.controlView.modelController.db2view();
    mainview.controlView.modelController.postLoad();
    mainview.controlView.writeCache();
    chai.assert.equal(mainview.controls.get('previous').get('elemID').disabled, true);
    chai.assert.equal(mainview.controls.get('next').get('elemID').disabled, false);
  });
  test('children can be unlinked from parents', () => {
    mainview.controls.get('id').get('elemID').value = 1;
    mainview.controls.get('description').get('elemID').value = 'aaa';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controlView.newListener();
    mainview.controls.get('parent').get('elemID').value = 1;
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.parentListener({ target: { id: 'parent', value: mainview.controls.get('parent').get('elemID').value } });
    mainview.controlView.insertListener();
    chai.assert.equal(mainview.controlView.modelController.db.getRec(2).get('parent'), 1);
    mainview.controls.get('parent').get('elemID').value = '';
    mainview.controlView.parentListener({ target: { id: 'parent', value: mainview.controls.get('parent').get('elemID').value } });
    mainview.controlView.updateListener();
    chai.assert.equal(mainview.controlView.modelController.db.getRec(2).get('parent'), undefined);
  });
  test('insert button enabled after adding description after new button', () => {
    mainview.controlView.newListener();
    mainview.controls.get('description').get('elemID').value = 'aaa';
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    chai.assert.equal(mainview.controls.get('insert').get('elemID').value, false);
  });
  test('can delete records with children', () => {
    mainview.controls.get('id').get('elemID').value = 1;
    mainview.controls.get('description').get('elemID').value = 'aaa';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controls.get('id').get('elemID').value = 2;
    mainview.controls.get('parent').get('elemID').value = '1';
    mainview.controls.get('description').get('elemID').value = 'bbb';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.parentListener({ target: { id: 'parent', value: mainview.controls.get('parent').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controls.get('id').get('elemID').value = 3;
    mainview.controls.get('description').get('elemID').value = 'ccc';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.parentListener({ target: { id: 'parent', value: mainview.controls.get('parent').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controls.get('id').get('elemID').value = 1;
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.deleteListener();
    chai.assert.equal(mainview.controlView.modelController.db.getRec(1), undefined);
    chai.assert.equal(mainview.controlView.modelController.db.getRec(2).get('parent'), undefined);
    chai.assert.equal(mainview.controlView.modelController.db.getRec(3).get('description'), 'ccc');
  });
  test('can delete records with children and inherit parents parent', () => {
    mainview.controls.get('id').get('elemID').value = 1;
    mainview.controls.get('description').get('elemID').value = 'aaa';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controls.get('id').get('elemID').value = 2;
    mainview.controls.get('parent').get('elemID').value = 1;
    mainview.controls.get('description').get('elemID').value = 'bbb';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.parentListener({ target: { id: 'parent', value: mainview.controls.get('parent').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controls.get('id').get('elemID').value = 3;
    mainview.controls.get('parent').get('elemID').value = '2';
    mainview.controls.get('description').get('elemID').value = 'ccc';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.parentListener({ target: { id: 'parent', value: mainview.controls.get('parent').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controls.get('id').get('elemID').value = 2;
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.deleteListener();
    chai.assert.equal(mainview.controlView.modelController.db.getRec(2), undefined);
    chai.assert.equal(mainview.controlView.modelController.db.getRec(3).get('parent'), 1);
  });
  test('up button must be enabled in child', () => {
    mainview.controls.get('id').get('elemID').value = 1;
    mainview.controls.get('description').get('elemID').value = 'aaa';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controls.get('id').get('elemID').value = 2;
    mainview.controls.get('parent').get('elemID').value = 1;
    mainview.controls.get('description').get('elemID').value = 'bbb';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.parentListener({ target: { id: 'parent', value: mainview.controls.get('parent').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.insertListener();
    chai.assert.equal(mainview.controls.get('up').get('elemID').disabled, false);
  });
  test('parent field value must be existing ID', () => {
    mainview.controls.get('id').get('elemID').value = 1;
    mainview.controls.get('description').get('elemID').value = 'aaa';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controls.get('id').get('elemID').value = 2;
    mainview.controls.get('parent').get('elemID').value = 1;
    mainview.controls.get('description').get('elemID').value = 'bbb';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.parentListener({ target: { id: 'parent', value: mainview.controls.get('parent').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controls.get('id').get('elemID').value = 3;
    mainview.controls.get('parent').get('elemID').value = 4;
    mainview.controls.get('description').get('elemID').value = 'ccc';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.parentListener({ target: { id: 'parent', value: mainview.controls.get('parent').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    chai.assert.equal(mainview.controls.get('insert').get('elemID').disabled, true);
  });
  test('new button fill first gap in IDs', () => {
    mainview.controls.get('id').get('elemID').value = 1;
    mainview.controls.get('description').get('elemID').value = 'aaa';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controls.get('id').get('elemID').value = 2;
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controls.get('id').get('elemID').value = 4;
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controls.get('id').get('elemID').value = 5;
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controlView.newListener();
    chai.assert.equal(mainview.controls.get('id').get('elemID').value, 3);
  });
  test('messages contains child', () => {
    mainview.controls.get('id').get('elemID').value = 1;
    mainview.controls.get('description').get('elemID').value = 'aaa';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controlView.newListener();
    mainview.controls.get('parent').get('elemID').value = 1;
    mainview.controls.get('description').get('elemID').value = 'bbb';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.parentListener({ target: { id: 'parent', value: mainview.controls.get('parent').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controlView.upListener();
    chai.assert.equal(mainview.controls.get('messages').get('elemID').innerText, '2: bbb\n');
  });
  test('archive single log', () => {
    mainview.controlView.newListener();
    mainview.controls.get('description').get('elemID').value = 'log';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.parentListener({ target: { id: 'parent', value: mainview.controls.get('parent').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'priority', value: mainview.controls.get('priority').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'due', value: mainview.controls.get('due').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controlView.newListener();
    mainview.controls.get('description').get('elemID').value = 'archive';
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controlView.newListener();
    mainview.controls.get('parent').get('elemID').value = 1;
    mainview.controls.get('description').get('elemID').value = 'log1';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.parentListener({ target: { id: 'parent', value: mainview.controls.get('parent').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controlView.archiveListener();
    mainview.controlView.upListener();
    chai.assert.equal(mainview.controls.get('id').get('elemID').value, 100000);
    chai.assert.equal(mainview.controls.get('description').get('elemID').value, 'log');
    mainview.controlView.downListener();
    chai.assert.equal(mainview.controls.get('id').get('elemID').value, 100001);
    chai.assert.equal(mainview.controls.get('description').get('elemID').value, 'log1');
    chai.assert.equal(mainview.controlView.modelController.db.getRec(3), undefined);
  });
  test('archive 2 logs', () => {
    mainview.controlView.newListener();
    mainview.controls.get('description').get('elemID').value = 'log';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.parentListener({ target: { id: 'parent', value: mainview.controls.get('parent').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'priority', value: mainview.controls.get('priority').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'due', value: mainview.controls.get('due').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controlView.newListener();
    mainview.controls.get('description').get('elemID').value = 'archive';
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controlView.newListener();
    mainview.controls.get('parent').get('elemID').value = 1;
    mainview.controls.get('description').get('elemID').value = 'log1';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.parentListener({ target: { id: 'parent', value: mainview.controls.get('parent').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controlView.newListener();
    mainview.controls.get('description').get('elemID').value = 'log2';
    mainview.controlView.dataListener({ target: { id: 'id', value: mainview.controls.get('id').get('elemID').value } });
    mainview.controlView.dataListener({ target: { id: 'description', value: mainview.controls.get('description').get('elemID').value } });
    mainview.controlView.insertListener();
    mainview.controlView.nextprevListener({ target: { id: 'previous' } });
    mainview.controlView.archiveListener();
    chai.assert.equal(mainview.controls.get('id').get('elemID').value, 100001);
    chai.assert.equal(mainview.controls.get('description').get('elemID').value, 'log1');
    mainview.controlView.upListener();
    chai.assert.equal(mainview.controls.get('id').get('elemID').value, 100000);
    chai.assert.equal(mainview.controls.get('description').get('elemID').value, 'log');
    chai.assert.equal(mainview.controlView.modelController.db.getRec(3), undefined);
    chai.assert.equal(mainview.controlView.modelController.db.getRec(4).get('description'), 'log2');
  });
  teardown('teardown', () => {
    mainview.controls.get('id').get('elemID').value = '';
    mainview.controls.get('parent').get('elemID').value = '';
    mainview.controls.get('created').get('elemID').value = '';
    mainview.controls.get('priority').get('elemID').value = '';
    mainview.controls.get('description').get('elemID').value = '';
    mainview.controls.get('due').get('elemID').value = '';
    mainview.controls.get('messages').get('elemID').innerText = '';
  });
});
