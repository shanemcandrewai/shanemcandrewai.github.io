import './libs/mocha.js';
import './libs/chai.js';
import ControlView from '../js/controlview.js';

const controlview = new ControlView();

/* global suite, test, chai */

suite('ControlsView', () => {
  test('instantiate', () => {
    chai.assert.equal(controlview.controls.get('uploadInput').get('event'), 'change');
  });
});
