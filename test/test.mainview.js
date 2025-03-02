import MainView from '../js/mainview.js';
import ControlView from '../js/controlview.js';
import Json from '../js/json.js';
import TestUtilities from './testutilities.js';

let mainview;
let testUtilities;

/* global suite, test, setup, chai */
//
suite('MainView', () => {
  setup('setup', () => {
    for (let selectNumber = 0; selectNumber < ControlView.maxRows; selectNumber += 1) {
      document.getElementById(`key_${selectNumber}`).removeAttribute('readOnly');
      document.getElementById(`key_${selectNumber}`).classList.remove('text-bg-danger');
      document.getElementById(`value_${selectNumber}`).removeAttribute('readOnly');
      document.getElementById(`key_${selectNumber}`).style.background = 'white';
      document.getElementById(`value_${selectNumber}`).style.background = 'white';
    }
    mainview = new MainView(true);
    testUtilities = new TestUtilities(mainview);
  });
  test('expand map, click first member and append', async () => {
    await testUtilities.loadSampleJson('wl_updated.js');
    mainview.controlView.genericListener({ target: { id: 'value_3', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_4', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'append', type: 'button' }, type: 'click' });
    const parentEntries = mainview.controlView.getAncestor(5, 1).get('container').entries();
    let parentEntry = parentEntries.next();
    chai.assert.equal(parentEntry.value[0], 'mk0');
    parentEntry = parentEntries.next();
    chai.assert.equal(parentEntry.value[0], '');
    parentEntry = parentEntries.next();
    chai.assert.equal(parentEntry.value[0], 'arr1');
  });
  test('bug level 0 elements appended in the middle of row are appended as last entry in top map', async () => {
    testUtilities.setControlEvent('key_0', 'value', 'k0', 'input');
    testUtilities.setControlEvent('key_1', 'value', 'k1', 'input');
    mainview.controlView.genericListener({ target: { id: 'key_0', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'append', type: 'button' }, type: 'click' });
    testUtilities.setControlEvent('key_1', 'value', 'k1-2', 'input');
    const parentEntries = mainview.controlView.getAncestor(0, 0).get('container').entries();
    let parentEntry = parentEntries.next();
    chai.assert.equal(parentEntry.value[0], 'k0');
    parentEntry = parentEntries.next();
    chai.assert.equal(parentEntry.value[0], 'k1-2');
    parentEntry = parentEntries.next();
    chai.assert.equal(parentEntry.value[0], 'k1');
  });
  test('array, append bug', async () => {
    mainview.controlView.genericListener({ target: { id: 'array', type: 'button' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'key_1', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'append', type: 'button' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'append', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_2').get('properties').get('value').get('cache'), '1');
    chai.assert.equal(mainview.controls.get('key_3').get('properties').get('value').get('cache'), '2');
  });
  test('correct order to map member insertions', async () => {
    testUtilities.setControlEvent('key_0', 'value', 'k0', 'input');
    mainview.controlView.genericListener({ target: { id: 'map', type: 'button' }, type: 'click' });
    testUtilities.setControlEvent('key_1', 'value', 'm1', 'input');
    mainview.controlView.genericListener({ target: { id: 'insert', type: 'button' }, type: 'click' });
    testUtilities.setControlEvent('key_1', 'value', 'm2', 'input');
    mainview.controlView.genericListener({ target: { id: 'value_0', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_0', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controlView.db.getRec('k0').has('m2'), true);
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('value').get('cache'), 'm2');
    chai.assert.equal(mainview.controls.get('key_2').get('properties').get('value').get('cache'), 'm1');
  });
  test('add multiple root members', async () => {
    testUtilities.setControlEvent('key_0', 'value', 'k0', 'input');
    testUtilities.setControlEvent('key_1', 'value', 'k1', 'input');
    chai.assert.equal(mainview.controlView.db.getRec('k0'), '');
    chai.assert.equal(mainview.controlView.db.getRec('k1'), '');
  });
  test('array inside array callapse and expand', async () => {
    testUtilities.setControlEvent('key_0', 'value', 'k0', 'input');
    mainview.controlView.genericListener({ target: { id: 'array', type: 'button' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'key_1', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'array', type: 'button' }, type: 'click' });
    testUtilities.setControlEvent('value_2', 'value', 'v2', 'input');
    mainview.controlView.genericListener({ target: { id: 'value_0', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_0', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_1', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_2').get('properties').get('value').get('cache'), '0');
    chai.assert.equal(mainview.controls.get('value_2').get('properties').get('value').get('cache'), 'v2');
  });
  test('expand insert value in key_9', async () => {
    await testUtilities.loadSampleJson('wl_updated.js');
    mainview.controlView.genericListener({ target: { id: 'value_4', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_6', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_5', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_3', type: 'text' }, type: 'click' });
    testUtilities.setControlEvent('key_9', 'value', '11', 'input');
    chai.assert.equal(mainview.controls.get('key_9').get('properties').get('value').get('cache'), '11');
    chai.assert.equal(mainview.controlView.db.getRec('bmap').get('bmk0').get('11'), 'bvv1');
  });
  test('expand over ControlView.maxRows then down', async () => {
    await testUtilities.loadSampleJson('wl_updated.js');
    mainview.controlView.genericListener({ target: { id: 'value_4', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_6', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_5', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_3', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'key_4', type: 'text' }, type: 'click' });
    for (let i = 9; i < ControlView.maxRows; i += 1) {
      mainview.controlView.genericListener({ target: { id: 'insert', type: 'button' }, type: 'click' });
      testUtilities.setControlEvent('key_4', 'value', i, 'input');
    }
    mainview.controlView.genericListener({ target: { id: 'down', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_9').get('properties').get('value').get('cache'), 'arr1');
    mainview.controlView.genericListener({ target: { id: 'down', type: 'button' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_8', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'up', type: 'button' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'up', type: 'button' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'down', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_9').get('properties').get('value').get('cache'), 'arr1');
  });
  test('long list bug', async () => {
    await testUtilities.loadSampleJson('small.js');
    mainview.controlView.genericListener({ target: { id: 'value_3', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_5', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_6', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'append', type: 'button' }, type: 'click' });
    testUtilities.setControlEvent('value_7', 'value', '11', 'input');
    testUtilities.setControlEvent('value_8', 'value', '22', 'input');
    chai.assert.equal(mainview.controlView.db.getRec('bmap').get('arr1')[2], '22');
    for (let i = 9; i < ControlView.maxRows; i += 1) {
      mainview.controlView.genericListener({ target: { id: 'insert', type: 'button' }, type: 'click' });
    }
    mainview.controlView.genericListener({ target: { id: 'down', type: 'button' }, type: 'click' });
    testUtilities.setControlEvent('value_8', 'value', '33', 'input');
    testUtilities.setControlEvent('value_9', 'value', '44', 'input');
    mainview.controlView.genericListener({ target: { id: 'value_4', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'up', type: 'button' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_5', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'down', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('value_9').get('properties').get('value').get('cache'), '44');
    chai.assert.equal(mainview.controlView.db.getRec('bmap').get('arr1')[4], '44');
  });
  test('close branch bug', async () => {
    await testUtilities.loadSampleJson('wl_updated.js');
    mainview.controlView.genericListener({ target: { id: 'value_1', type: 'text' }, type: 'click' });
    testUtilities.setControlEvent('value_2', 'value', 'a', 'input');
    chai.assert.equal(mainview.controls.get('value_2').get('properties').get('value').get('cache'), 'a');
    chai.assert.equal(mainview.controlView.db.getRec('shopping')[0], 'a');
  });
  test('wl_updated key input', async () => {
    await testUtilities.loadSampleJson('wl_updated.js');
    const stringifiedDb = mainview.controlView.db.getString(null);
    mainview.controlView.db.readText(stringifiedDb);
    testUtilities.setControlEvent('key_2', 'value', 'k1', 'input');
    const now = new Date();
    const nowIso = now.toISOString();
    chai.assert.equal(mainview.controlView.db.getRec('wl_updated').substring(0, 20), nowIso.substring(0, 20));
  });
  test('wl_updated value input', async () => {
    await testUtilities.loadSampleJson('wl_updated.js');
    const stringifiedDb = mainview.controlView.db.getString(null);
    mainview.controlView.db.readText(stringifiedDb);
    testUtilities.setControlEvent('value_1', 'value', 'shopping2', 'input');
    const now = new Date();
    const nowIso = now.toISOString();
    chai.assert.equal(mainview.controlView.db.getRec('wl_updated').substring(0, 20), nowIso.substring(0, 20));
  });
  test('bug click map clobbers next key', async () => {
    testUtilities.setControlEvent('key_0', 'value', 'k0', 'input');
    testUtilities.setControlEvent('key_1', 'value', 'k1', 'input');
    mainview.controlView.genericListener({ target: { id: 'key_0', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'map', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('value').get('cache'), 'k1');
  });
  test('insert read only value field bug', async () => {
    await testUtilities.loadSampleJson('small.js');
    mainview.controlView.genericListener({ target: { id: 'value_2', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_2', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'insert', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('value_2').get('properties').get('readOnly').get('cache'), false);
    chai.assert.equal(mainview.controls.get('value_2').get('elemID').readOnly, false);
  });
  test('append read only value field bug', async () => {
    await testUtilities.loadSampleJson('small.js');
    mainview.controlView.genericListener({ target: { id: 'value_2', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_2', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'append', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('value_3').get('properties').get('readOnly').get('cache'), false);
    chai.assert.equal(mainview.controls.get('value_3').get('elemID').readOnly, false);
  });
  test('length button', async () => {
    await testUtilities.loadSampleJson('small.js');
    mainview.controlView.genericListener({ target: { id: 'value_1', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'length', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('value_1').get('properties').get('value').get('cache'), '251');
  });
  test('number value bug', async () => {
    testUtilities.setControlEvent('key_0', 'value', 'm1', 'input');
    mainview.controlView.genericListener({ target: { id: 'map', type: 'button' }, type: 'click' });
    testUtilities.setControlEvent('key_1', 'value', 'k1', 'input');
    testUtilities.setControlEvent('value_1', 'value', '777', 'input');
    mainview.controlView.genericListener({ target: { id: 'value_1', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_2').get('properties').get('value').get('cache'), '');
    chai.assert.equal(mainview.controls.get('value_2').get('properties').get('value').get('cache'), '');
    chai.assert.equal(mainview.controlView.db.getRec('m1').get('k1'), 777);
    chai.assert.equal(mainview.controlView.db.size(), 1);
  });
  test('load small file click value_0, click click value_2, append', async () => {
    await testUtilities.loadSampleJson('small.js');
    mainview.controlView.genericListener({ target: { id: 'value_0', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_2', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'append', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('level_3').get('properties').get('value').get('cache'), '1');
    chai.assert.equal(mainview.controls.get('key_3').get('properties').get('value').get('cache'), '2');
    chai.assert.equal(mainview.controls.get('value_3').get('properties').get('value').get('cache'), '');
    chai.assert.equal(mainview.controls.get('key_3').has('ancestors'), true);
    chai.assert.equal(mainview.controlView.db.getRec('shopping')[2], '');
    chai.assert.equal(mainview.controlView.db.getRec('shopping')[2], '');
    chai.assert.equal(mainview.controlView.db.size(), 4);
  });
  test('insert timestamp, edit time, check ISO', async () => {
    testUtilities.setControlEvent('key_0', 'value', 'time', 'input');
    mainview.controlView.genericListener({ target: { id: 'array', type: 'button' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_1', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'timestamp', type: 'button' }, type: 'click' });
    chai.assert.equal(ControlView.isISO(mainview.controlView.db.getRec('time')[0]), true);
    testUtilities.setControlEvent('value_1', 'value', '2024-10-26 16:00', 'input');
    chai.assert.equal(mainview.controls.get('level_0').get('properties').get('value').get('cache'), '0');
    chai.assert.equal(mainview.controlView.db.getRec('time')[0], '2024-10-26T14:00:00.000Z');
    chai.assert.equal(ControlView.isISO(mainview.controls.get('value_1').get('properties').get('value').get('cache')), true);
    chai.assert.equal(mainview.controls.get('value_1').get('properties').get('value').get('cache'), '2024-10-26T14:00:00.000Z');
  });
  test('insert timestamp in map key, edit time, check ISO', async () => {
    testUtilities.setControlEvent('key_0', 'value', 'time', 'input');
    mainview.controlView.genericListener({ target: { id: 'map', type: 'button' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'key_1', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'timestamp', type: 'button' }, type: 'click' });
    chai.assert.equal(ControlView.isISO(mainview.controlView.db.getRec('time').keys().toArray()[0]), true);
    chai.assert.equal(ControlView.isISO(mainview.controls.get('key_1').get('properties').get('value').get('cache')), true);
    testUtilities.setControlEvent('key_1', 'value', '2024-10-26 16:00', 'input');
    chai.assert.equal(mainview.controls.get('level_0').get('properties').get('value').get('cache'), '0');
    chai.assert.equal(mainview.controlView.db.getRec('time').keys().toArray()[0], '2024-10-26T14:00:00.000Z');
    chai.assert.equal(ControlView.isISO(mainview.controls.get('key_1').get('properties').get('value').get('cache')), true);
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('value').get('cache'), '2024-10-26T14:00:00.000Z');
  });
  test('load small update key_1', async () => {
    await testUtilities.loadSampleJson('small.js');
    testUtilities.setControlEvent('key_1', 'value', 'mk-sim2', 'input');
    chai.assert.equal(mainview.controls.get('level_1').get('properties').get('value').get('cache'), '0');
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('value').get('cache'), 'mk-sim2');
    chai.assert.equal(mainview.controls.get('value_1').get('properties').get('value').get('cache'), 'vk-sim');
    chai.assert.equal(mainview.controls.get('key_1').has('ancestors'), false);
    chai.assert.equal(mainview.controlView.db.getRec('mk-sim'), undefined);
    chai.assert.equal(mainview.controlView.db.getRec('mk-sim'), undefined);
    chai.assert.equal(mainview.controlView.db.size(), 4);
  });
  test('obj2Map', async () => {
    const objInput = { a: 1, b: { c: 2, d: { e: 3 } }, f: [4, { g: 5 }] };
    const nestedMap = ControlView.obj2Map(objInput);
    chai.assert.equal(nestedMap instanceof Map, true);
    chai.assert.equal(nestedMap.get('a'), 1);
    chai.assert.equal(nestedMap.get('b').get('c'), 2);
    chai.assert.equal(nestedMap.get('b').size, 2);
    chai.assert.equal(nestedMap.get('b').get('d').get('e'), 3);
    chai.assert.equal(nestedMap.has('f'), true);
    chai.assert.equal(Array.isArray(nestedMap.get('f')), true);
    chai.assert.equal(nestedMap.get('f')[0], 4);
    chai.assert.equal(nestedMap.get('f')[1].get('g'), 5);
  });
  test('load small file click value 0, delete', async () => {
    await testUtilities.loadSampleJson('small.js');
    mainview.controlView.genericListener({ target: { id: 'value_0', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('level_1').get('properties').get('value').get('cache'), '1');
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('value').get('cache'), '0');
    chai.assert.equal(mainview.controls.get('value_1').get('properties').get('value').get('cache'), 'bread');
    chai.assert.equal(mainview.controls.get('key_1').has('ancestors'), true);
    mainview.controlView.genericListener({ target: { id: 'delete', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('level_1').get('properties').get('value').get('cache'), '0');
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('value').get('cache'), 'amap');
    chai.assert.equal(mainview.controls.get('value_1').get('properties').get('value').get('cache'), '<>');
    chai.assert.equal(mainview.controls.get('key_1').has('ancestors'), false);
    chai.assert.equal(mainview.controlView.db.getRec('shopping'), undefined);
    chai.assert.equal(mainview.controlView.db.getRec('shopping'), undefined);
    chai.assert.equal(mainview.controlView.db.size(), 3);
  });
  test('load small file click key 1, delete', async () => {
    await testUtilities.loadSampleJson('small.js');
    mainview.controlView.genericListener({ target: { id: 'key_1', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'delete', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('level_1').get('properties').get('value').get('cache'), '0');
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('value').get('cache'), 'amap');
    chai.assert.equal(mainview.controls.get('value_1').get('properties').get('value').get('cache'), '<>');
    chai.assert.equal(mainview.controls.get('key_1').has('ancestors'), false);
    chai.assert.equal(mainview.controlView.db.getRec('mk-sim'), undefined);
    chai.assert.equal(mainview.controlView.db.getRec('mk-sim'), undefined);
    chai.assert.equal(mainview.controlView.db.size(), 3);
    mainview.controlView.genericListener({ target: { id: 'value_0', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'key_1', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'delete', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('level_1').get('properties').get('value').get('cache'), '1');
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('value').get('cache'), '0');
    chai.assert.equal(mainview.controls.get('value_1').get('properties').get('value').get('cache'), 'cheese');
    chai.assert.equal(mainview.controlView.db.getRec('shopping').length, 1);
    chai.assert.equal(mainview.controlView.db.getRec('shopping')[0], 'cheese');
  });
  test('load small file click key 1, insert', async () => {
    await testUtilities.loadSampleJson('small.js');
    mainview.controlView.genericListener({ target: { id: 'key_1', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'insert', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('level_1').get('properties').get('value').get('cache'), '0');
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('value').get('cache'), '');
    chai.assert.equal(mainview.controls.get('value_1').get('properties').get('value').get('cache'), '');
    chai.assert.equal(mainview.controls.get('key_1').has('ancestors'), false);
    chai.assert.equal(mainview.controlView.db.getRec(''), '');
    chai.assert.equal(mainview.controlView.db.getRec(''), '');
    chai.assert.equal(mainview.controlView.db.size(), 5);
    mainview.controlView.genericListener({ target: { id: 'value_0', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'key_2', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'insert', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('level_2').get('properties').get('value').get('cache'), '1');
    chai.assert.equal(mainview.controls.get('key_2').get('properties').get('value').get('cache'), '1');
    chai.assert.equal(mainview.controls.get('value_2').get('properties').get('value').get('cache'), '');
    chai.assert.equal(mainview.controlView.db.getRec('shopping').length, 3);
    chai.assert.equal(mainview.controlView.db.getRec('shopping')[1], '');
    chai.assert.equal(mainview.controlView.db.getRec('shopping')[2], 'cheese');
  });
  test('id : [ priority ]', () => {
    mainview.controlView.db = new Json();
    testUtilities.setControlEvent('key_0', 'value', 'id', 'input');
    mainview.controlView.genericListener({ target: { id: 'array', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controlView.db.getRec('id') instanceof Array, true);
    chai.assert.equal(mainview.controlView.db.getRec('id').length, 1);
    chai.assert.equal(mainview.controlView.db.db.db.get('id')
      === mainview.controlView.db.getRec('id'), true);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').size, 1);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).get('key'), 'id');
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).get('container').length, 1);
    chai.assert.equal(mainview.controls.get('level_1').get('properties').get('value').get('cache'), 1);
    chai.assert.equal(mainview.controls.get('value_0').get('properties').get('value').get('cache'), '[]');
    chai.assert.equal(mainview.controls.get('value_0').get('properties').get('readOnly').get('cache'), true);
    testUtilities.setControlEvent('value_1', 'value', 'priority', 'input');
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors') instanceof Map, true);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').size, 1);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').has(1), true);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).size, 2);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).get('key'), 'id');
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).has('container'), true);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).get('container') instanceof Array, true);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).get('container')
      .includes('priority'), true);
    chai.assert.equal(mainview.controlView.db.getRec('id').includes('priority'), true);
    chai.assert.equal(mainview.controlView.db.getRec('id').priority
      === mainview.controlView.db.db.db.get('id').priority, true);
    chai.assert.equal(mainview.controlView.db.getRec('id') instanceof Array, true);
    chai.assert.equal(mainview.controlView.db.getRec('id').length, 2);
    chai.assert.equal(mainview.controlView.db.getRec('id')[0], 'priority');
  });
  test('array, click 2, array, click 1, insert', async () => {
    testUtilities.setControlEvent('key_0', 'value', 'ddd', 'input');
    mainview.controlView.genericListener({ target: { id: 'array', type: 'button' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'key_1', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'map', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('level_1').get('properties').get('value').get('cache'), '1');
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('value').get('cache'), '0');
    chai.assert.equal(mainview.controls.get('value_1').get('properties').get('value').get('cache'), '<>');
    mainview.controlView.genericListener({ target: { id: 'insert', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('level_1').get('properties').get('value').get('cache'), '1');
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('value').get('cache'), '0');
    chai.assert.equal(mainview.controls.get('value_1').get('properties').get('value').get('cache'), '');
    chai.assert.equal(mainview.controls.get('level_2').get('properties').get('value').get('cache'), '1');
    chai.assert.equal(mainview.controls.get('key_2').get('properties').get('value').get('cache'), '1');
    chai.assert.equal(mainview.controls.get('value_2').get('properties').get('value').get('cache'), '<>');
  });
  test('load small file click value 3, 5, 4, 2, down', async () => {
    await testUtilities.loadSampleJson('small.js');
    mainview.controlView.genericListener({ target: { id: 'value_3', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_5', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_4', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_2', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'key_3', type: 'text' }, type: 'click' });
    for (let i = 9; i < ControlView.maxRows; i += 1) {
      mainview.controlView.genericListener({ target: { id: 'insert', type: 'button' }, type: 'click' });
      testUtilities.setControlEvent('key_3', 'value', i, 'input');
    }
    mainview.controlView.genericListener({ target: { id: 'down', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get(`level_${ControlView.maxRows}`).get('properties').get('value').get('cache'), '0');
    chai.assert.equal(mainview.controls.get(`key_${ControlView.maxRows}`).get('properties').get('value').get('cache'), '');
    chai.assert.equal(mainview.controls.get(`value_${ControlView.maxRows}`).get('properties').get('value').get('cache'), '');
  });
  test('load small file click value 4, 5, 4', async () => {
    await testUtilities.loadSampleJson('small.js');
    mainview.controlView.genericListener({ target: { id: 'value_3', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_4', type: 'text' }, type: 'click' });
    mainview.controlView.genericListener({ target: { id: 'value_3', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('level_4').get('properties').get('value').get('cache'), '0');
    chai.assert.equal(mainview.controls.get('key_4').get('properties').get('value').get('cache'), '');
    chai.assert.equal(mainview.controls.get('value_4').get('properties').get('value').get('cache'), '');
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
    chai.assert.equal(mainview.controls.get('level_7').get('properties').get('value').get('cache'), '1');
    chai.assert.equal(mainview.controls.get('key_7').get('properties').get('value').get('cache'), 'arr1');
    chai.assert.equal(mainview.controls.get('value_7').get('properties').get('value').get('cache'), '[]');
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
    chai.assert.equal(mainview.controls.get('key_0').get('properties').get('value').get('cache'), 'shopping');
    chai.assert.equal(mainview.controls.get('value_0').get('properties').get('value').get('cache'), '[]');
    chai.assert.equal(mainview.controls.get('key_2').get('properties').get('value').get('cache'), 'amap');
    chai.assert.equal(mainview.controls.get('value_2').get('properties').get('value').get('cache'), '<>');
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
    mainview.controlView.genericListener({ target: { id: 'array', type: 'button' }, type: 'click' });
    testUtilities.setControlEvent('value_1', 'value', 'v2', 'input');
    chai.assert.equal(mainview.controlView.db.getRec('m1')[0], 'v2');
  });
  test('map m1, map m2, m3', () => {
    testUtilities.setControlEvent('key_0', 'value', 'm1', 'input');
    mainview.controlView.genericListener({ target: { id: 'map', type: 'button' }, type: 'click' });
    testUtilities.setControlEvent('key_1', 'value', 'm2', 'input');
    mainview.controlView.genericListener({ target: { id: 'map', type: 'button' }, type: 'click' });
    testUtilities.setControlEvent('key_2', 'value', 'm3', 'input');
    testUtilities.setControlEvent('value_2', 'value', 'v2', 'input');
    chai.assert.equal(mainview.controlView.db.getRec('m1').get('m2').get('m3'), 'v2');
  });
  test('map dd, map dd, dd no red', () => {
    testUtilities.setControlEvent('key_0', 'value', 'dd', 'input');
    mainview.controlView.genericListener({ target: { id: 'map', type: 'button' }, type: 'click' });
    testUtilities.setControlEvent('key_1', 'value', 'dd', 'input');
    mainview.controlView.genericListener({ target: { id: 'map', type: 'button' }, type: 'click' });
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
    chai.assert.equal(mainview.controlView.db.size(), 2);
    chai.assert.equal(mainview.controlView.db.getRec('ddd'), 1);
  });
  test('enter key_0, Array, key_1 = 0 and readonly, enter value_1, key_2 = 0', () => {
    testUtilities.setControlEvent('key_0', 'value', 'numbered list', 'input');
    mainview.controlView.genericListener({ target: { id: 'array', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('value').get('cache'), '0');
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('readOnly').get('cache'), true);
    testUtilities.setControlEvent('value_1', 'value', 'dd', 'input');
    chai.assert.equal(mainview.controls.get('key_2').get('properties').get('value').get('cache'), '1');
  });
  test('enter key_0, Map, key_1 is not readonly', () => {
    testUtilities.setControlEvent('key_0', 'value', '1', 'input');
    mainview.controlView.genericListener({ target: { id: 'map', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('readOnly').get('cache'), false);
  });
  test('enter key_0, Map, enter key_1, key_2 writable at level 2', () => {
    mainview.controlView.genericListener({ target: { id: 'map', type: 'button' }, type: 'click' });
    testUtilities.setControlEvent('key_1', 'value', '2', 'input');
    chai.assert.equal(mainview.controls.get('key_2').get('properties').get('readOnly').get('cache'), false);
    chai.assert.equal(mainview.controls.get('level_2').get('properties').get('value').get('cache'), 1);
  });
  test('enter key_0, Map, enter key_1, key_2 = key_1 not red', () => {
    testUtilities.setControlEvent('key_0', 'value', 'dd', 'input');
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
    chai.assert.equal(mainview.controls.get('key_0').has('ancestors'), false);
    mainview.controlView.genericListener({ target: { id: 'map', type: 'button' }, type: 'click' });
    chai.assert.equal(mainview.controlView.db.getRec('id') instanceof Map, true);
    chai.assert.equal(mainview.controlView.db.getRec('id').size, 1);
    chai.assert.equal(mainview.controlView.db.getRec('id')
      === mainview.controlView.db.db.db.get('id'), true);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').size, 1);
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).get('key'), 'id');
    chai.assert.equal(mainview.controls.get('key_1').get('ancestors').get(1).get('container').size, 1);
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
  test('check select rows are reset', () => {
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
  test('compare small.json and stringified DB with amap key deleted', async () => {
    const strObj = await testUtilities.loadSampleJson('small.js');
    const strWithoutRecord3 = strObj.slice(0, 49) + strObj.slice(84);
    mainview.controlView.genericListener({ target: { id: 'key_2', type: 'text' }, type: 'click' });
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
  test('load wl.json and check', async () => {
    await testUtilities.loadSampleJson();
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
    chai.assert.equal(mainview.controls.get('key_1').get('properties').get('value').get('cache'), 'created');
    chai.assert.equal(mainview.controls.get('key_4').get('properties').get('value').get('cache'), 3);
    chai.assert.equal(mainview.controlView.db.getRec(1).has('description'), true);
    chai.assert.equal(mainview.controlView.db.getRec(1).get('description')
      === mainview.controlView.db.getRec('1').get('description'), true);
    chai.assert.equal(mainview.controlView.db.getRec(1) instanceof Map, true);
    chai.assert.equal(mainview.controlView.db.getRec(1).size, 2);
    chai.assert.equal(mainview.controls.get('value_2').get('properties').get('value').get('cache'), 'Log');
    testUtilities.setControlEvent('value_2', 'value', 'Log updated', 'input');
    chai.assert.equal(mainview.controlView.db.getRec(1).get('description'), 'Log updated');
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
    chai.assert.equal(mainview.controls.get('key_9').get('ancestors').get(1).get('container') === mainview.controlView.db.getRec('7'), true);
    chai.assert.equal(mainview.controls.get('key_9').get('ancestors').get(1).get('container')
      .has('description'), true);
    mainview.controlView.genericListener({ target: { id: 'value_5', type: 'text' }, type: 'click' });
    chai.assert.equal(mainview.controls.get('key_7').get('ancestors') instanceof Map, true);
    chai.assert.equal(mainview.controls.get('key_7').get('ancestors').size, 1);
    chai.assert.equal(mainview.controls.get('key_7').get('ancestors').has(1), true);
    chai.assert.equal(mainview.controls.get('key_7').get('ancestors').get(1).size, 2);
    chai.assert.equal(mainview.controls.get('key_7').get('ancestors').get(1).get('key'), 7);
    chai.assert.equal(mainview.controls.get('key_7').get('ancestors').get(1).get('container') === mainview.controlView.db.getRec('7'), true);
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
  test('record with description can be inserted', () => {
    testUtilities.setControlEvent('key_0', 'value', '1', 'input');
    mainview.controlView.genericListener({ target: { id: 'map', type: 'button' }, type: 'click' });
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
