import './libs/mocha.js';
import './libs/chai.js';
import ControlsView from '../js/controlsview.js';

const controlsview = new ControlsView();

/* global suite, test, chai */

suite('ControlsView', () => {
  test('instantiate', () => {
    chai.assert.equal(controlsview.controls.get('uploadInput').get('event'), 'change');
  });
});
