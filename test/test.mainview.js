import MainView from '../js/mainview.js';
import ControlView from '../js/controlview.js';
import Json from '../js/json.js';
import TestUtilities from './testutilities.js';

let mainview;
let testUtilities;

/* global suite, test, setup, chai */

suite('MainView', () => {
  setup('setup', () => {
    for (const selectNumber of Array.from({ length: ControlView.maxRows }, (_, i) => i)) {
      document.getElementById(`key_${selectNumber}`).removeAttribute('readOnly');
      document.getElementById(`key_${selectNumber}`).classList.remove('text-bg-danger');
      document.getElementById(`value_${selectNumber}`).removeAttribute('readOnly');
    }
    mainview = new MainView(true);
    testUtilities = new TestUtilities(mainview);
  });
  test('load file expand 2, down 2 times, up', async () => {
    await testUtilities.loadSampleJson();
    mainview.controlView.genericListener({ target: { id: 'value_1', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'down', type: 'button' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'down', type: 'button' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'up', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('level_0').get('properties').get('value').get('cache'), '0');
    chai.assert.equal(mainview.controls.get('key_0').get('properties').get('value').get('cache'), '2');
    chai.assert.equal(mainview.controls.get('value_0').get('properties').get('value').get('cache'), '<>');
    mainview.controlView.genericListener({ target: { id: 'up', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('level_0').get('properties').get('value').get('cache'), '0');
    chai.assert.equal(mainview.controls.get('key_0').get('properties').get('value').get('cache'), '1');
    chai.assert.equal(mainview.controls.get('value_0').get('properties').get('value').get('cache'), '<>');
  });
  test('load small file up', async () => {
    await testUtilities.loadSampleJson('small.js');
    mainview.controlView.genericListener({ target: { id: 'up', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('level_0').get('properties').get('value').get('cache'), '0');
    chai.assert.equal(mainview.controls.get('key_0').get('properties').get('value').get('cache'), 'shopping');
    chai.assert.equal(mainview.controls.get('value_0').get('properties').get('value').get('cache'), '[]');
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('value').get('cache'), 'mk-sim');
    chai.assert.equal(mainview.controls.get('value_1').get('properties').get('value').get('cache'), 'vk-sim');
    chai.assert.equal(mainview.controls.get('level_9').get('properties').get('value').get('cache'), '0');
    chai.assert.equal(mainview.controls.get('key_9').get('properties').get('value').get('cache'), '');
    chai.assert.equal(mainview.controls.get('value_9').get('properties').get('value').get('cache'), '');
  });
  test('load small file 3 ,2, 0, 0', async () => {
    await testUtilities.loadSampleJson('small.js');
    mainview.controlView.genericListener({ target: { id: 'value_3', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_2', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_0', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_0', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'down', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('level_7').get('properties').get('value').get('cache'), '0');
    chai.assert.equal(mainview.controls.get('key_7').get('properties').get('value').get('cache'), '');
    chai.assert.equal(mainview.controls.get('value_7').get('properties').get('value').get('cache'), '');
    chai.assert.equal(mainview.controls.get('level_9').get('properties').get('value').get('cache'), '0');
    chai.assert.equal(mainview.controls.get('key_9').get('properties').get('value').get('cache'), '');
    chai.assert.equal(mainview.controls.get('value_9').get('properties').get('value').get('cache'), '');
  });
  test('load db file expand down button, check row 9, up', async () => {
    await testUtilities.loadSampleJson('wlorig.js');
    mainview.controlView.genericListener({ target: { id: 'value_2', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_1', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_0', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'down', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_9').get('properties').get('value').get('cache'), '4');
    chai.assert.equal(mainview.controls.get('value_9').get('properties').get('value').get('cache'), '<>');
    mainview.controlView.genericListener({ target: { id: 'up', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_9').get('properties').get('value').get('cache'), 'created');
    chai.assert.equal(mainview.controls.get('value_9').get('properties').get('value').get('cache'), '2023-10-31T06:56:00.000Z');
    chai.assert.equal(mainview.controls.get('key_0').get('properties').get('value').get('cache'), '1');
    chai.assert.equal(mainview.controls.get('value_0').get('properties').get('value').get('cache'), '<>');
  });
  test('load db file down button', async () => {
    await testUtilities.loadSampleJson('wlorig.js');
    mainview.controlView.genericListener({ target: { id: 'value_2', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'down', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_0').get('properties').get('value').get('cache'), '2');
    chai.assert.equal(mainview.controls.get('value_0').get('properties').get('value').get('cache'), '<>');
    chai.assert.equal(mainview.controls.get('key_2').get('properties').get('value').get('cache'), 'parent');
    chai.assert.equal(mainview.controls.get('value_2').get('properties').get('value').get('cache'), '1');
    chai.assert.equal(mainview.controls.get('key_9').get('properties').get('value').get('cache'), '9');
  });
  test('load small file down button', async () => {
    await testUtilities.loadSampleJson('small.js');
    mainview.controlView.genericListener({ target: { id: 'value_2', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'down', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_0').get('properties').get('value').get('cache'), 'mk-sim');
    chai.assert.equal(mainview.controls.get('value_0').get('properties').get('value').get('cache'), 'vk-sim');
    chai.assert.equal(mainview.controls.get('key_2').get('properties').get('value').get('cache'), 'mk0');
    chai.assert.equal(mainview.controls.get('value_2').get('properties').get('value').get('cache'), 'mv0');
  });
  test('load small json, check display and db', async () => {
    await testUtilities.loadSampleJson('small.js');
    chai.assert.equal(mainview.controls.get('key_0').get('properties').get('value').get('cache'), 'shopping');
    chai.assert.equal(mainview.controls.get('value_0').get('properties').get('value').get('cache'), '[]');
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('value').get('cache'), 'mk-sim');
    chai.assert.equal(mainview.controls.get('value_1').get('properties').get('value').get('cache'), 'vk-sim');
    chai.assert.equal(mainview.controls.get('key_2').get('properties').get('value').get('cache'), 'amap');
    chai.assert.equal(mainview.controls.get('value_2').get('properties').get('value').get('cache'), '<>');

    chai.assert.equal(mainview.controls.get('key_0').get('properties').has('ancestors'), false);

    chai.assert.equal(mainview.controlView.db.getRec('shopping')[0], 'bread');
    chai.assert.equal(mainview.controlView.db.getRec('shopping')[1], 'cheese');
    chai.assert.equal(mainview.controlView.db.getRec('mk-sim'), 'vk-sim');
    chai.assert.equal(mainview.controlView.db.getRec('amap').get('arr1')[0], 'e0');

    mainview.controlView.genericListener({ target: { id: 'value_0', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('value').get('cache'), '0');
    chai.assert.equal(mainview.controls.get('value_1').get('properties').get('value').get('cache'), 'bread');
    chai.assert.equal(mainview.controls.get('value_1').get('properties').get('readOnly').get('cache'), false);
    chai.assert.equal(mainview.controls.get('key_2').get('properties').get('value').get('cache'), '1');
    chai.assert.equal(mainview.controls.get('value_2').get('properties').get('value').get('cache'), 'cheese');
    chai.assert.equal(mainview.controls.get('value_4').get('properties').get('value').get('cache'), '<>');
    chai.assert.equal(mainview.controls.get('value_4').get('properties').get('readOnly').get('cache'), true);

    mainview.controlView.genericListener({ target: { id: 'value_0', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('value').get('cache'), 'mk-sim');
    chai.assert.equal(mainview.controls.get('value_4').get('properties').get('value').get('cache'), '');
    mainview.controlView.genericListener({ target: { id: 'value_0', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_1', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('value').get('cache'), '0');
  });
  test('1 array, enter aa', () => {
    testUtilities.setControlEvent('key_0', 'value', 'm1', 'input');
    testUtilities.setControlEvent('select_0', 'checked', true, 'click');
    mainview.controlView.genericListener({ target: { id: 'array', type: 'text' }, type: 'click' });
    testUtilities.setControlEvent('value_1', 'value', 'v2', 'input');
    chai.assert.equal(mainview.controlView.db.getRec('m1')[0], 'v2');
  });
  test('map m1, map m2, m3', () => {
    testUtilities.setControlEvent('key_0', 'value', 'm1', 'input');
    testUtilities.setControlEvent('select_0', 'checked', true, 'click');
    mainview.controlView.genericListener({ target: { id: 'map', type: 'text' }, type: 'click' });
    testUtilities.setControlEvent('select_0', 'checked', false, 'click');
    testUtilities.setControlEvent('key_1', 'value', 'm2', 'input');
    testUtilities.setControlEvent('select_1', 'checked', true, 'click');
    mainview.controlView.genericListener({ target: { id: 'map', type: 'text' }, type: 'click' });
    testUtilities.setControlEvent('key_2', 'value', 'm3', 'input');
    testUtilities.setControlEvent('value_2', 'value', 'v2', 'input');
    chai.assert.equal(mainview.controlView.db.getRec('m1').get('m2').get('m3'), 'v2');
  });
  test('map dd, map dd, dd no red', () => {
    testUtilities.setControlEvent('key_0', 'value', 'dd', 'input');
    testUtilities.setControlEvent('select_0', 'checked', true, 'click');
    mainview.controlView.genericListener({ target: { id: 'map', type: 'text' }, type: 'click' });
    testUtilities.setControlEvent('select_0', 'checked', false, 'click');
    testUtilities.setControlEvent('key_1', 'value', 'dd', 'input');
    testUtilities.setControlEvent('select_1', 'checked', true, 'click');
    mainview.controlView.genericListener({ target: { id: 'map', type: 'text' }, type: 'click' });
    testUtilities.setControlEvent('key_2', 'value', 'dd', 'input');
    testUtilities.setControlEvent('value_2', 'value', 'ddd', 'input');
    chai.assert.equal(mainview.controls.get('key_2').get('elemID').classList.contains('text-bg-danger'), false);
    chai.assert.equal(mainview.controlView.db.getRec('dd').get('dd').get('dd'), 'ddd');
  });
  test('load json, click 7, 7, 8', async () => {
    await testUtilities.loadSampleJson();
    mainview.controlView.genericListener({ target: { id: 'value_6', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_6', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_7', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_7').has('ancestors'), false);
    chai.assert.equal(mainview.controls.get('key_8').get('properties').get('value').get('cache'), 'parent');
  });
  test('load json, click 2, 2, 2, 2', async () => {
    await testUtilities.loadSampleJson();
    mainview.controlView.genericListener({ target: { id: 'value_1', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_1', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_1', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_1', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_7').has('ancestors'), false);
    chai.assert.equal(mainview.controls.get('key_2').get('properties').get('value').get('cache'), '3');
    chai.assert.equal(mainview.controls.get('key_9').get('properties').get('value').get('cache'), '10');
  });
  test('load json, click 3, 6, 3', async () => {
    await testUtilities.loadSampleJson();
    mainview.controlView.genericListener({ target: { id: 'value_2', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_3').get('ancestors').get(1).get('key'), 3);
    mainview.controlView.genericListener({ target: { id: 'value_7', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_2', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_7').has('ancestors'), true);
    chai.assert.equal(mainview.controls.get('key_5').get('properties').get('value').get('cache'), '6');
    chai.assert.equal(mainview.controls.get('key_9').get('properties').get('value').get('cache'), '8');
  });
  test('load json, click 1, 1, 2', async () => {
    await testUtilities.loadSampleJson();
    mainview.controlView.genericListener({ target: { id: 'value_0', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_0', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_1', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_2').get('properties').get('value').get('cache'), 'parent');
  });
  test('enter key_0, duplicate key_1 verify one in db', () => {
    testUtilities.setControlEvent('key_0', 'value', 'ddd', 'input');
    testUtilities.setControlEvent('value_0', 'value', '1', 'input');
    testUtilities.setControlEvent('key_1', 'value', 'ddd', 'input');
    testUtilities.setControlEvent('value_1', 'value', '2', 'input');
    testUtilities.setControlEvent('select_0', 'checked', true, 'click');
    chai.assert.equal(mainview.controlView.db.db.size, 2);
    chai.assert.equal(mainview.controlView.db.db.get('ddd'), 1);
  });
  test('enter key_0, select_0, Array, key_1 = 0 and readonly, enter value_1, key_2 = 0', () => {
    testUtilities.setControlEvent('key_0', 'value', 'numbered list', 'input');
    testUtilities.setControlEvent('select_0', 'checked', true, 'click');
    mainview.controlView.genericListener({ target: { id: 'array', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('value').get('cache'), '0');
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('readOnly').get('cache'), true);
    testUtilities.setControlEvent('value_1', 'value', 'dd', 'input');
    chai.assert.equal(mainview.controls.get('key_2').get('properties').get('value').get('cache'), '1');
  });
  test('enter key_0, select_0, Map, key_1 is not readonly', () => {
    testUtilities.setControlEvent('key_0', 'value', '1', 'input');
    testUtilities.setControlEvent('select_0', 'checked', true, 'click');
    mainview.controlView.genericListener({ target: { id: 'map', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('readOnly').get('cache'), false);
  });
  test('enter key_0, select_0, Map, enter key_1, key_2 writable at level 2', () => {
    testUtilities.setControlEvent('key_0', 'value', '1', 'input');
    testUtilities.setControlEvent('select_0', 'checked', true, 'click');
    mainview.controlView.genericListener({ target: { id: 'map', type: 'button' }, type: 'click' });
    testUtilities.setControlEvent('key_1', 'value', '2', 'input');
    chai.assert.equal(mainview.controls.get('key_2').get('properties').get('readOnly').get('cache'), false);
    chai.assert.equal(mainview.controls.get('level_2').get('properties').get('value').get('cache'), 1);
  });
  test('enter key_0, select_0, Map, enter key_1, key_2 = key_1 not red', () => {
    testUtilities.setControlEvent('key_0', 'value', 'dd', 'input');
    testUtilities.setControlEvent('select_0', 'checked', true, 'click');
    mainview.controlView.genericListener({ target: { id: 'map', type: 'button' }, type: 'click' });
    testUtilities.setControlEvent('key_1', 'value', 'ddd', 'input');
    testUtilities.setControlEvent('key_2', 'value', 'dd', 'input');
    chai.assert.equal(mainview.controls.get('key_2').get('elemID').classList.contains('text-bg-danger'), false);
  });
  test('check events and element property', () => {
    chai.assert.equal(mainview.controls.get('uploadInput').get('events').keys().next().value, 'change');
  });
  test('check default cache values', () => {
    chai.assert.equal(mainview.controls.get('map').get('properties').get('disabled').get('cache'), false);
    chai.assert.equal(mainview.controls.get('value_0').get('properties').get('value').get('cache'), '');
  });
  test('check element type', () => {
    chai.assert.equal(mainview.controls.get('value_0').get('elemID').type, 'text');
  });
  test('insert id : 1', () => {
    chai.assert.equal(mainview.controls.get('value_0').get('properties').get('readOnly').get('cache'), false);
    mainview.controlView.db = new Json();
    testUtilities.setControlEvent('key_0', 'value', 'id', 'input');
    chai.assert.equal(mainview.controls.get('value_0').get('properties').get('readOnly').get('cache'), false);
    chai.assert.equal(mainview.controlView.db.getRec('id'), '');
    chai.assert.equal(mainview.controlView.db.getRec('idxxx'), undefined);
    testUtilities.setControlEvent('value_0', 'value', '1', 'input');
    chai.assert.equal(mainview.controlView.db.getRec('id'), 1);
  });
  test('duplicate keys cannot be inserted in db', () => {
    mainview.controlView.db = new Json();
    testUtilities.setControlEvent('key_0', 'value', 'id', 'input');
    testUtilities.setControlEvent('value_0', 'value', '1', 'input');
    chai.assert.equal(mainview.controls.get('key_1').has('ancestors'), false);
    testUtilities.setControlEvent('key_1', 'value', 'id', 'input');
    testUtilities.setControlEvent('value_1', 'value', '2', 'input');
    chai.assert.equal(mainview.controls.get('key_1').get('elemID').classList.contains('text-bg-danger'), true);
    chai.assert.equal(mainview.controlView.db.getRec('id'), '1');
  });
  test('insert id : { priority : 0 }', () => {
    mainview.controlView.db = new Json();
    testUtilities.setControlEvent('key_0', 'value', 'id', 'input');
    chai.assert.equal(mainview.controlView.db.getRec('id') === '', true);
    chai.assert.equal(typeof mainview.controlView.db.getRec('id') === 'string', true);
    chai.assert.equal(mainview.controls.get('key_0').has('ancestors'), false);
    testUtilities.setControlEvent('select_0', 'checked', true, 'click');
    chai.assert.equal(mainview.controls.get('key_0').has('ancestors'), false);
    mainview.controlView.genericListener({ target: { id: 'map', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controlView.db.getRec('id') instanceof Map, true);
    chai.assert.equal(mainview.controlView.db.getRec('id').size, 0);
    chai.assert.equal(mainview.controlView.db.getRec('id')
      === mainview.controlView.db.db.db.get('id'), true);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').size, 1);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).get('key'), 'id');
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).get('container').size, 0);
    chai.assert.equal(mainview.controls.get('level_1').get('properties').get('value').get('cache'), 1);
    chai.assert.equal(mainview.controls.get('value_0').get('properties').get('value').get('cache'), '<>');
    chai.assert.equal(mainview.controls.get('value_0').get('properties').get('readOnly').get('cache'), true);
    testUtilities.setControlEvent('key_1', 'value', 'priority', 'input');
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors') instanceof Map, true);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').size, 1);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').has(1), true);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).size, 2);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).get('key'), 'id');
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).has('container'), true);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).get('container') instanceof Map, true);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).get('container')
      .has('priority'), true);
    chai.assert.equal(mainview.controlView.db.getRec('id').has('priority'), true);
    chai.assert.equal(mainview.controlView.db.getRec('id').get('priority')
      === mainview.controlView.db.db.db.get('id').get('priority'), true);
    chai.assert.equal(mainview.controlView.db.getRec('id') instanceof Map, true);
    chai.assert.equal(mainview.controlView.db.getRec('id').size, 1);
    testUtilities.setControlEvent('value_1', 'value', '0', 'input');
    chai.assert.equal(mainview.controlView.db.getRec('id').get('priority'), '0');
  });
  test('insert id : [ priority ]', () => {
    mainview.controlView.db = new Json();
    testUtilities.setControlEvent('key_0', 'value', 'id', 'input');
    testUtilities.setControlEvent('select_0', 'checked', true, 'click');
    mainview.controlView.genericListener({ target: { id: 'array', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controlView.db.getRec('id') instanceof Array, true);
    chai.assert.equal(mainview.controlView.db.getRec('id').length, 0);
    chai.assert.equal(mainview.controlView.db.getRec('id')
      === mainview.controlView.db.db.db.get('id'), true);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').size, 1);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).get('key'), '0');
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).get('container').length, 0);
    chai.assert.equal(mainview.controls.get('level_1').get('properties').get('value').get('cache'), 1);
    chai.assert.equal(mainview.controls.get('value_0').get('properties').get('value').get('cache'), '[]');
    chai.assert.equal(mainview.controls.get('value_0').get('properties').get('readOnly').get('cache'), true);
    testUtilities.setControlEvent('value_1', 'value', 'priority', 'input');
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors') instanceof Map, true);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').size, 1);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').has(1), true);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).size, 2);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).get('key'), '0');
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).has('container'), true);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).get('container') instanceof Array, true);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).get('container')
      .includes('priority'), true);
    chai.assert.equal(mainview.controlView.db.getRec('id').includes('priority'), true);
    chai.assert.equal(mainview.controlView.db.getRec('id').priority
      === mainview.controlView.db.db.db.get('id').priority, true);
    chai.assert.equal(mainview.controlView.db.getRec('id') instanceof Array, true);
    chai.assert.equal(mainview.controlView.db.getRec('id').length, 1);
    testUtilities.setControlEvent('value_1', 'value', 'priority', 'input');
    chai.assert.equal(mainview.controlView.db.getRec('id')[0], 'priority');
  });
  test('check select rows are reset', () => {
    chai.assert.equal(mainview.controls.get('select_0').get('properties').get('checked').get('cache'), false);
    chai.assert.equal(mainview.controls.get('select_1').get('properties').get('checked').get('cache'), false);
    chai.assert.equal(mainview.controls.get('level_0').get('properties').get('value').get('cache'), 0);
    chai.assert.equal(mainview.controls.get('level_1').get('properties').get('value').get('cache'), 0);
    chai.assert.equal(mainview.controls.get('key_0').get('properties').get('value').get('cache'), '');
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('value').get('cache'), '');
    chai.assert.equal(mainview.controls.get('key_3').get('properties').get('value').get('cache'), '');
    chai.assert.equal(mainview.controls.get('value_0').get('properties').get('value').get('cache'), '');
    chai.assert.equal(mainview.controls.get('value_0').get('properties').get('readOnly').get('cache'), false);
    chai.assert.equal(mainview.controls.get('value_1').get('properties').get('value').get('cache'), '');
    chai.assert.equal(mainview.controls.get('value_1').get('properties').get('readOnly').get('cache'), false);
  });
  test('load wlorig.json', async () => {
    await testUtilities.loadSampleJson();
    const desc = mainview.controlView.db.getRec(2).get('description');
    chai.assert.equal(desc, 'Change tr');
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('value').get('cache'), 2);
    chai.assert.equal(mainview.controls.get('key_2').get('properties').get('value').get('cache'), 3);
  });
  test('compare wlorig.json with stringified DB', async () => {
    const strObj = await testUtilities.loadSampleJson();
    const strWithoutEmpty = strObj.slice(0, 315) + strObj.slice(334);
    const stringifiedDb = mainview.controlView.db.getString(null);
    chai.assert.equal(strWithoutEmpty, stringifiedDb);
  });
  test('compare wlorig.json and stringified DB with record3 deleted', async () => {
    const strObj = await testUtilities.loadSampleJson();
    const strWithoutRecord3 = strObj.slice(0, 234) + strObj.slice(338);
    testUtilities.setControlEvent('select_2', 'checked', true, 'click');
    mainview.controlView.genericListener({ target: { id: 'delete', type: 'button' }, type: 'click' });
    const stringifiedDb = mainview.controlView.db.getString(null);
    chai.assert.equal(strWithoutRecord3, stringifiedDb);
  });
  test('load file with priority 0', async () => {
    await testUtilities.loadSampleJson();
    chai.assert.equal(mainview.controlView.db.getRec(11).get('priority'), 0);
  });
  test('empty string in file is not inserted into db', async () => {
    await testUtilities.loadSampleJson();
    chai.assert.equal(mainview.controlView.db.getRec(3).get('description'), undefined);
  });
  test('message property not saved in file, click row 0', async () => {
    const strObj = await testUtilities.loadSampleJson();
    const strWithoutEmpty = strObj.slice(0, 315) + strObj.slice(334);
    mainview.controlView.genericListener({ target: { id: 'value_0', type: 'text' }, type: 'click' });

    chai.assert.equal(mainview.controls.get('key_1').get('ancestors') instanceof Map, true);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').size, 1);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').has(1), true);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).size, 2);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).get('key'), '1');
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).has('container'), true);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).get('container') instanceof Map, true);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).get('container')
      .has('description'), true);
    chai.assert.equal(mainview.controlView.db.getRec(1).has('description'), true);
    chai.assert.equal(mainview.controlView.db.getRec(1).get('description')
      === mainview.controlView.db.db.db.get(1).get('description'), true);
    chai.assert.equal(mainview.controlView.db.getRec(1) instanceof Map, true);
    chai.assert.equal(mainview.controlView.db.getRec(1).size, 2);
    chai.assert.equal(mainview.controls.get('value_2').get('properties').get('value').get('cache'), 'Log');

    testUtilities.setControlEvent('value_2', 'value', 'Log updated', 'input');
    chai.assert.equal(mainview.controlView.db.getRec(1).get('description'), 'Log updated');
    testUtilities.setControlEvent('value_2', 'value', 'Log', 'input');
    const stringifiedDb = mainview.controlView.db.getString(null);
    chai.assert.equal(strWithoutEmpty, stringifiedDb);
  });
  test('message property not saved in file, click row 2', async () => {
    const strObj = await testUtilities.loadSampleJson();
    const strWithoutEmpty = strObj.slice(0, 315) + strObj.slice(334);
    mainview.controlView.genericListener({ target: { id: 'value_2', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('value').get('cache'), 2);
    chai.assert.equal(mainview.controls.get('value_4').get('properties').get('value').get('cache'), '2023-10-31T06:56:00.000Z');
    testUtilities.setControlEvent('value_4', 'value', 'Log updated', 'input');
    chai.assert.equal(mainview.controlView.db.getRec(3).get('created'), 'Log updated');
    testUtilities.setControlEvent('value_4', 'value', '2023-10-31T06:56:00.000Z', 'input');
    const stringifiedDb = mainview.controlView.db.getString(null);
    chai.assert.equal(strWithoutEmpty, stringifiedDb);
  });
  test('click map 3, then map 4', async () => {
    await testUtilities.loadSampleJson();
    mainview.controlView.genericListener({ target: { id: 'value_2', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_5', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_4').get('properties').get('value').get('cache'), 'created');
    chai.assert.equal(mainview.controls.get('key_5').get('properties').get('value').get('cache'), 4);
    chai.assert.equal(mainview.controls.get('key_2').has('ancestors'), false);
    chai.assert.equal(mainview.controls.get('key_3').get('ancestors').get(1).get('key'), 3);
  });
  test('load Json, click map 3, then again to callapse', async () => {
    await testUtilities.loadSampleJson();
    mainview.controlView.genericListener({ target: { id: 'value_2', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_2', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_3').get('properties').get('value').get('cache'), 4);
    chai.assert.equal(mainview.controls.get('key_4').get('properties').get('value').get('cache'), 5);
    chai.assert.equal(mainview.controls.get('key_8').get('properties').get('value').get('cache'), 9);
  });
  test('load Json, click values 7, 6, 6', async () => {
    await testUtilities.loadSampleJson();
    mainview.controlView.genericListener({ target: { id: 'value_6', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_5', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_9').get('ancestors') instanceof Map, true);
    chai.assert.equal(mainview.controls.get('key_9').get('ancestors').size, 1);
    chai.assert.equal(mainview.controls.get('key_9').get('ancestors').has(1), true);
    chai.assert.equal(mainview.controls.get('key_9').get('ancestors').get(1).size, 2);
    chai.assert.equal(mainview.controls.get('key_9').get('ancestors').get(1).get('key'), 7);
    chai.assert.equal(mainview.controls.get('key_9').get('ancestors').get(1).get('container') === mainview.controlView.db.db.db.get(7), true);
    chai.assert.equal(mainview.controls.get('key_9').get('ancestors').get(1).get('container')
      .has('description'), true);
    mainview.controlView.genericListener({ target: { id: 'value_5', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_7').get('ancestors') instanceof Map, true);
    chai.assert.equal(mainview.controls.get('key_7').get('ancestors').size, 1);
    chai.assert.equal(mainview.controls.get('key_7').get('ancestors').has(1), true);
    chai.assert.equal(mainview.controls.get('key_7').get('ancestors').get(1).size, 2);
    chai.assert.equal(mainview.controls.get('key_7').get('ancestors').get(1).get('key'), 7);
    chai.assert.equal(mainview.controls.get('key_7').get('ancestors').get(1).get('container') === mainview.controlView.db.db.db.get(7), true);
    chai.assert.equal(mainview.controls.get('key_7').get('ancestors').get(1).get('container')
      .has('description'), true);
    chai.assert.equal(mainview.controls.get('level_8').get('properties').get('value').get('cache'), 1);
    chai.assert.equal(mainview.controls.get('key_8').get('properties').get('value').get('cache'), 'created');
    chai.assert.equal(mainview.controls.get('value_8').get('properties').get('value').get('cache'), '2023-10-31T07:33:00.000Z');
    chai.assert.equal(mainview.controls.get('level_9').get('properties').get('value').get('cache'), 1);
    chai.assert.equal(mainview.controls.get('value_9').get('properties').get('value').get('cache'), 'Button NEW');
  });
  test('load Json, click values 6, 5, 5, 6', async () => {
    await testUtilities.loadSampleJson();
    mainview.controlView.genericListener({ target: { id: 'value_5', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_4', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_4', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('value_7').get('properties').get('value').get('cache'), 'wl plan');
    chai.assert.equal(mainview.controls.get('key_8').get('properties').get('value').get('cache'), 7);
    chai.assert.equal(mainview.controls.get('value_8').get('properties').get('value').get('cache'), '<>');
    chai.assert.equal(mainview.controls.get('value_9').get('properties').get('value').get('cache'), '<>');
    mainview.controlView.genericListener({ target: { id: 'value_5', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('level_8').get('properties').get('value').get('cache'), 0);
  });
  test('load Json, click values 7, 7', async () => {
    await testUtilities.loadSampleJson();
    mainview.controlView.genericListener({ target: { id: 'value_6', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_6', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_7').get('properties').get('value').get('cache'), 8);
  });
  test('load Json, click values 2, 5, 2, 5, 2, 5', async () => {
    await testUtilities.loadSampleJson();
    mainview.controlView.genericListener({ target: { id: 'value_1', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_7', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_1', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_4', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_1', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_7', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_8').get('properties').get('value').get('cache'), 'parent');
  });
  test('load Json, click values 7, 6, 7', async () => {
    await testUtilities.loadSampleJson();
    mainview.controlView.genericListener({ target: { id: 'value_6', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_5', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_8', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_9').get('properties').get('value').get('cache'), 8);
  });
  test('load Json, insert and update buttons are disabled', async () => {
    await testUtilities.loadSampleJson();
    chai.assert.equal(mainview.controls.get('update').get('elemID').disabled, true);
    chai.assert.equal(mainview.controls.get('insert').get('elemID').disabled, true);
  });
  test('record with description can be inserted', () => {
    testUtilities.setControlEvent('key_0', 'value', '1', 'input');
    testUtilities.setControlEvent('select_0', 'checked', true, 'click');
    mainview.controlView.genericListener({ target: { id: 'map', type: 'text' }, type: 'click' });
    testUtilities.setControlEvent('key_1', 'value', 'description', 'input');
    testUtilities.setControlEvent('value_1', 'value', 'aaa', 'input');
    chai.assert.equal(mainview.controlView.db.getRec('1').get('description'), 'aaa');
  });
  test('changed key replaces old key in db', () => {
    testUtilities.setControlEvent('key_0', 'value', 'id', 'input');
    testUtilities.setControlEvent('value_0', 'value', '1', 'input');
    chai.assert.equal(mainview.controlView.db.getRec('id'), '1');
    testUtilities.setControlEvent('key_0', 'value', 'id2', 'input');
    chai.assert.equal(mainview.controlView.db.getRec('id'), undefined);
    chai.assert.equal(mainview.controlView.db.getRec('id2'), '1');
  });
});
