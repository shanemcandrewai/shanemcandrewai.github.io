import ControlView from '../js/controlview.js';
import DataView from '../js/dataview.js';

const controlview = new ControlView();
const dataview = new DataView(controlview);
controlview.dataview = dataview;

/* global suite, test, chai */

suite('ControlView', () => {
  test('instantiate', () => {
    chai.assert.equal(controlview.controls.get('uploadInput').get('event'), 'change');
  });
  test('insert disable when only ID filled', () => {
    controlview.dataview.data.get('id').get('elemID').value = '1';
    controlview.dataview.data.get('parent').set('elemID', { value: '' });
    controlview.dataview.data.get('created').set('elemID', { value: '' });
    controlview.dataview.data.get('priority').set('elemID', { value: '' });
    controlview.dataview.data.get('description').set('elemID', { value: '0-1' });
    controlview.dataview.data.get('due').set('elemID', { value: '' });
    chai.assert.equal(controlview.controls.get('uploadInput').get('event'), 'change');
  });
});
