import DataView from '../js/dataview.js';
import Db from '../js/db.js';

const dataview = new DataView();

/* global suite, test, chai */

suite('DataView', () => {
  test('instantiate', () => {
    chai.assert.equal(dataview.data.get('parent').get('event'), 'keyup');
  });
  test('insert', () => {
    const db = new Db();
    dataview.data.get('id').set('elemID', { value: '1' });
    dataview.data.get('parent').set('elemID', { value: '' });
    dataview.data.get('created').set('elemID', { value: '' });
    dataview.data.get('priority').set('elemID', { value: '' });
    dataview.data.get('description').set('elemID', { value: '0-1' });
    dataview.data.get('due').set('elemID', { value: '' });
    dataview.view2db(db);
    chai.assert.equal(db.db.get(1).get('description'), '0-1');
  });
});
