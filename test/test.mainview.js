import MainView from '../js/mainview.js';

const mainview = new MainView();

/* global suite, test, chai */

suite('MainView', () => {
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
    const prio = mainview.dataview.data.get('priority').get('elemID');
    prio.value = 0;
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
});
