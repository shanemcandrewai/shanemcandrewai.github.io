import MainView from '../js/mainview.js';
import Json from '../js/json.js';

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
  test('set priority to number 0', () => {
    mainview.dataview.data.get('id').get('elemID').value = 1;
    mainview.dataview.data.get('parent').get('elemID').value = '';
    mainview.dataview.data.get('created').get('elemID').value = '';
    mainview.dataview.data.get('priority').get('elemID').value = 0;
    mainview.dataview.data.get('description').get('elemID').value = '';
    mainview.dataview.data.get('due').get('elemID').value = '';
    mainview.controlview.insertListener();
    mainview.dataview.db2view(mainview.controlview.db, 1);
    chai.assert.equal(mainview.controlview.db.getRec(1).get('priority'), 0);
  });
  test('Insert button disabled if no data values', () => {
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
  test('load priority 0', async () => {
    const dbmap = await import('./dbmap.js');
    mainview.controlview.db = new Json();
    const strObj = JSON.stringify(dbmap.default, mainview.controlview.db.mapEncoder);
    mainview.controlview.db.readText(strObj);
    chai.assert.equal(mainview.controlview.db.getRec(11).get('priority'), 0);
  });
  test('empty string not inserted into db', async () => {
    const dbmap = await import('./dbmap.js');
    mainview.controlview.db = new Json();
    const strObj = JSON.stringify(dbmap.default, mainview.controlview.db.mapEncoder);
    mainview.controlview.db.readText(strObj);
    chai.assert.equal(mainview.controlview.db.getRec(3).get('description'), undefined);
  });
});
