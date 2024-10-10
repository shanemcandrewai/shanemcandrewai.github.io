import Json from './json.js';
import Xlsx from './xlsx.js';
import Local from './local.js';
import Dropbox from './dropbox.js';
import Messages from './messages.js';
import Db from './db.js';

export default class ControlView {
  static maxRows = 9;

  static lastKeyClick = 0;

  uploadInputChange = (event) => {
    const file = event.target.files[0];
    this.storage = new Local(file);
    const dbMap = this.db.getMap();
    if (file.name.split('.').pop() === 'xlsx') this.db = new Xlsx(dbMap);
    else {
      this.db = new Json(dbMap);
    }
    if (!dbMap.size) this.loadClick();
    else this.setCache('load', 'disabled', false);
    this.writeCache();
  };

  codeTokenInputChange = (event) => {
    this.setCache('codeTokenInput', 'value', event.target.value);
    this.storage = new Dropbox();
    const dbMap = this.db.getMap();
    this.db = new Json(dbMap);
    if (!dbMap.size) this.loadClick();
    else this.setCache('load', 'disabled', false);
    this.writeCache();
  };

  loadClick = async () => {
    // this.setLoad(true);
    this.writeCache();
    const messages = new Map();
    try {
      messages.set('load', await this.storage.load(
        this.db,
        'db.json',
        this.controls.get('codeTokenInput').get('properties').get('value').get('cache'),
      ));
      this.db2view();
    } catch (readFileError) {
      messages.set('readFileError', readFileError);
    }
    this.postLoad();
    this.writeCache();
  };

  getAncestor = (selectNumber, level) => {
    if (this.controls.get(`key_${selectNumber}`).has('ancestors')) {
      if (this.controls.get(`key_${selectNumber}`).get('ancestors').has(level)) {
        return this.controls.get(`key_${selectNumber}`).get('ancestors').get(level);
      }
    }
    return new Map([['container', this.db.getMap()]]);
  };

  getAncestorContainer = (selectNumber, level) => this.getAncestor(selectNumber, level).get('container');

  getAncestorValue = (selectNumber, level, key) => {
    const container = this.getAncestor(selectNumber, level).get('container');
    if (container instanceof Map) return this.getAncestor(selectNumber, level).get('container').get(key);
    if (Array.isArray(container)) return this.getAncestor(selectNumber, level).get('container')[key];
    return undefined;
  };

  static getContainerCount = (container) => {
    if (container instanceof Map) return container.size;
    if (Array.isArray(container)) return container.length;
    return undefined;
  };

  db2view = (selectNums = Array.from(Array(ControlView.maxRows + 1).keys())) => {
    const entries = this.db.getMap().entries();
    let currentSelect = 0;
    while (this.controls.has(`key_${currentSelect}`)) {
      const entry = entries.next();
      if (!entry.done) {
        if (selectNums.includes(currentSelect)) {
          const [nextKey, nextValue] = entry.value;
          this.setCacheSelect(currentSelect, 0, nextKey, nextValue);
        }
      } else break;
      currentSelect += 1;
    }
  };

  keyInput = (event) => {
    const selectNumber = event.target.id.slice(4);
    const level = this.controls.get(`level_${selectNumber}`).get('properties').get('value').get('cache');
    const value = this.controls.get(`value_${selectNumber}`).get('properties').get('value').get('cache');
    const parent = this.getAncestorContainer(selectNumber, level);
    const oldKey = this.controls.get(event.target.id).get('properties').get('value').get('cache');
    if (parent instanceof Map) {
      if (parent.has(event.target.value)) {
        this.controls.get(event.target.id).get('elemID').classList.add('text-bg-danger');
        return;
      }
    } else if (Array.isArray(parent)) {
      if (parent.includes(event.target.value)) {
        this.controls.get(event.target.id).get('elemID').classList.add('text-bg-danger');
        return;
      }
    }

    this.controls.get(event.target.id).get('properties').get('value').set('cache', event.target.value);
    this.db.deleteRec(oldKey, parent);
    this.db.setRec(event.target.value, value, parent);
    this.controls.get(event.target.id).get('elemID').classList.remove('text-bg-danger');
    if (!this.controls.get(`key_${Number(selectNumber) + 1}`).get('properties').get('value').get('cache')) {
      this.setCache(`level_${Number(selectNumber) + 1}`, 'value', level);
      if (this.controls.get(`key_${selectNumber}`).has('ancestors')) {
        this.controls.get(`key_${Number(selectNumber) + 1}`).set(
          'ancestors',
          this.controls.get(`key_${selectNumber}`).get('ancestors'),
        );
      }
    }
  };

  valueInput = (event) => {
    const selectNumber = event.target.id.slice(6);
    const level = this.controls.get(`level_${selectNumber}`).get('properties').get('value').get('cache');
    this.controls.get(event.target.id).get('properties').get('value').set('cache', event.target.value);
    const key = this.controls.get(`key_${selectNumber}`).get('properties').get('value').get('cache');
    const ancestors = this.controls.get(`key_${selectNumber}`).get('ancestors');
    const parent = this.getAncestorContainer(selectNumber, level);
    if (parent instanceof Map) this.db.setRec(key, event.target.value, parent);
    else if (Array.isArray(parent)) {
      parent[Number(key)] = event.target.value;
      if (!this.controls.get(`key_${Number(selectNumber) + 1}`).get('properties').get('value').get('cache')) {
        this.setCache(`level_${Number(selectNumber) + 1}`, 'value', level);
        if (this.controls.get(`key_${selectNumber}`).has('ancestors')) {
          this.setCache(`key_${Number(selectNumber) + 1}`, 'value', parent.length);
          this.controls.get(`key_${Number(selectNumber) + 1}`).set('ancestors', ancestors);
        }
      }
    }
  };

  copySelect = (selectFrom, selectTo) => {
    for (const elemType of ['level', 'key', 'value']) {
      const propsFrom = this.controls.get(`${elemType}_${selectFrom}`).get('properties');
      const propsTo = this.controls.get(`${elemType}_${selectTo}`).get('properties');
      for (const [propName, propContainer] of propsFrom) {
        if (propsTo.has(propName)) {
          this.setCache(`${elemType}_${selectTo}`, propName, propContainer.get('cache'));
        } else {
          propsTo.set(propName, new Map());
          propsTo.get(propName).set('cache', propContainer.get('cache'));
          propsTo.get(propName).set('write', true);
        }
      }
    }
    const ancestorsFrom = this.controls.get(`key_${selectFrom}`).get('ancestors');
    if (ancestorsFrom) this.controls.get(`key_${selectTo}`).set('ancestors', ancestorsFrom);
    else this.controls.get(`key_${selectTo}`).delete('ancestors');
  };

  setCacheSelect = (selectNumber = 0, level = 0, key = '', value = '') => {
    this.setCache(`level_${selectNumber}`, 'value', level);
    this.setCache(`key_${selectNumber}`, 'value', key);
    if (Array.isArray(this.getAncestor(selectNumber, level))) {
      this.setCache(`key_${selectNumber}`, 'readOnly', true);
    }
    if (typeof value === 'string' || typeof value === 'number') {
      this.setCache(`value_${selectNumber}`, 'value', value);
      this.setCache(`value_${selectNumber}`, 'readOnly', false);
    } else if (value instanceof Map) {
      this.setCache(`value_${selectNumber}`, 'value', '<>');
      this.setCache(`value_${selectNumber}`, 'readOnly', true);
    } else if (Array.isArray(value)) {
      this.setCache(`value_${selectNumber}`, 'value', '[]');
      this.setCache(`value_${selectNumber}`, 'readOnly', true);
    } else if (value instanceof Object) {
      this.setCache(`value_${selectNumber}`, 'value', '{}');
      this.setCache(`value_${selectNumber}`, 'readOnly', true);
    } else if (value === undefined) {
      this.setCache(`value_${selectNumber}`, 'value', '');
      this.setCache(`value_${selectNumber}`, 'readOnly', false);
    }
  };

  setCache = (elemName, propName, value) => {
    if (this.controls.get(elemName).get('properties').get(propName).get('cache') !== value) {
      this.controls.get(elemName).get('properties').get(propName).set('cache', value);
      this.controls.get(elemName).get('properties').get(propName).set('write', true);
    }
    if (this.writeCacheImmediately) {
      this.writeCache();
    }
  };

  writeCache = () => {
    for (const elemRec of this.controls.values()) {
      for (const [propName, propRec] of elemRec.get('properties')) {
        if (propRec.get('write')) {
          elemRec.get('elemID')[propName] = propRec.get('cache');
          propRec.set('write', false);
        }
      }
    }
  };

  genericListener = (event) => {
    if (event.target.id === 'codeTokenInput' && event.target.value.slice(0, 1) === 't') return;
    const targetID = this.controls.get(event.target.id);
    const elemType = targetID.get('elemID').type;

    if ((event.type === 'click' && (elemType === 'radio' || elemType === 'checkbox'))) {
      this.controls.get(event.target.id).get('properties').get('checked').set('cache', event.target.checked);
    }

    const eventType = targetID.get('events').get(event.type);
    if (eventType.has('listener')) eventType.get('listener')(event);

    for (const [recalcElemName, recalcPropName] of eventType.get('recalculate')) {
      const calculatorFunc = this.controls.get(recalcElemName).get('properties').get(recalcPropName).get('calculator');
      if (this[calculatorFunc]) calculatorFunc(event);
    }
    this.writeCache();
  };

  downClick = () => {
    let selectNumber = 0;
    let lastEmpty = 0;
    while (this.controls.has(`select_${selectNumber}`)) {
      if (this.controls.get(`key_${selectNumber}`).get('properties').get('value').get('cache') === '') {
        if (selectNumber === lastEmpty + 1) return;
        lastEmpty = selectNumber;
      }
      selectNumber += 1;
    }
    selectNumber = 0;

    while (this.controls.has(`select_${selectNumber + 1}`)) {
      this.copySelect(selectNumber + 1, selectNumber);
      selectNumber += 1;
    }
    const key = this.controls.get(`key_${selectNumber}`).get('properties').get('value').get('cache');
    const value = this.controls.get(`value_${selectNumber}`).get('properties').get('value').get('cache');
    if (key !== '' || value !== '') {
      const level = this.controls.get(`level_${selectNumber}`).get('properties').get('value').get('cache');
      const previousEntry = this.getNext(selectNumber - 1, level);
      if (previousEntry) {
        this.setCacheSelect(
          selectNumber,
          previousEntry.level,
          previousEntry.key,
          previousEntry.value,
        );
      } else {
        this.setCacheSelect(selectNumber);
      }
    }
  };

  upClick = () => {
    const level = this.controls.get('level_0').get('properties').get('value').get('cache');
    const previousEntry = this.getPrevious(0, level);
    if (previousEntry !== undefined) {
      let selectNumber = ControlView.maxRows - 1;
      while (selectNumber + 1) {
        this.copySelect(selectNumber, selectNumber + 1);
        selectNumber -= 1;
      }
      this.setCacheSelect(
        selectNumber + 1,
        previousEntry.level,
        previousEntry.key,
        previousEntry.value,
      );
    }
  };

  getNext = (selectNumber, level) => {
    const selectKey = this.controls.get(`key_${selectNumber}`);
    const selectLevel = this.controls.get(`level_${selectNumber}`).get('properties').get('value').get('cache');
    let key = selectKey.get('properties').get('value').get('cache');
    if (!level && selectLevel && this.getAncestor(selectNumber, 1).has('key')) {
      key = this.getAncestor(selectNumber, 1).get('key');
    }
    const parentEntries = this.getAncestor(selectNumber, level).get('container').entries();
    let parentEntry = parentEntries.next();
    let adjacentEntry = key;
    while (!parentEntry.done && parentEntry.value[0] !== key) {
      [adjacentEntry] = parentEntry.value;
      parentEntry = parentEntries.next();
    }
    parentEntry = parentEntries.next();
    if (parentEntry.done) {
      if (!level) return undefined;
      return this.getNext(selectNumber, level - 1);
    }
    [adjacentEntry] = parentEntry.value;

    return {
      key: adjacentEntry,
      level,
      value: this.getAncestorValue(selectNumber, level, adjacentEntry),
    };
  };

  getPrevious = (selectNumber, level) => {
    const selectKey = this.controls.get(`key_${selectNumber}`);
    const selectLevel = this.controls.get(`level_${selectNumber}`).get('properties').get('value').get('cache');
    let key = selectKey.get('properties').get('value').get('cache');
    if (!level && selectLevel && this.getAncestor(selectNumber, 1).has('key')) {
      key = this.getAncestor(selectNumber, 1).get('key');
      return {
        key,
        level,
        value: this.getAncestorValue(selectNumber, level, key),
      };
    }
    const parentEntries = this.getAncestor(selectNumber, level).get('container').entries();
    let parentEntry = parentEntries.next();
    let adjacentEntry = key;
    while (!parentEntry.done && parentEntry.value[0] !== key) {
      [adjacentEntry] = parentEntry.value;
      parentEntry = parentEntries.next();
    }
    if ((parentEntry.done || adjacentEntry === parentEntry.value[0])) {
      if (level) return this.getPrevious(selectNumber, level - 1);
      if (!selectLevel) return undefined;
    }
    return {
      key: adjacentEntry,
      level,
      value: this.getAncestorValue(selectNumber, level, adjacentEntry),
    };
  };

  insertClick = () => {
    let selectNumber = ControlView.lastKeyClick;
    let copyFrom = ControlView.maxRows - 1;
    // shift down rows leaving gap for expanded map
    while (copyFrom >= selectNumber) {
      this.copySelect(copyFrom, copyFrom + 1);
      copyFrom -= 1;
    }
    const selectLevel = this.controls.get(`level_${selectNumber}`).get('properties').get('value').get('cache');
    const ancestor = this.getAncestorContainer(selectNumber, selectLevel);
    this.setCache(`value_${selectNumber}`, 'value', '');
    if (ancestor instanceof Map) this.db.setRec('', '', ancestor);
    else {
      let key = Number(this.controls.get(`key_${selectNumber}`).get('properties').get('value').get('cache'));
      this.db.setRec(key, '', ancestor);
      selectNumber += 1;
      while (selectNumber < ControlView.maxRows) {
        const level = this.controls.get(`level_${selectNumber}`).get('properties').get('value').get('cache');
        if (level === selectLevel) {
          this.setCache(`key_${selectNumber}`, 'value', key + 1);
          selectNumber += 1;
          key += 1;
        } else break;
      }
    } this.setCache(`key_${selectNumber}`, 'value', '');
    this.writeCache();
  };

  mapClick = () => {
    const selectNumber = ControlView.lastKeyClick;
    const level = this.controls.get(`level_${selectNumber}`).get('properties').get('value').get('cache');
    const nextLevel = level + 1;
    const key = this.controls.get(`key_${selectNumber}`).get('properties').get('value').get('cache');
    const value = this.controls.get(`value_${selectNumber}`).get('properties').get('value').get('cache');
    this.setCache(`value_${selectNumber}`, 'value', '<>');
    this.setCache(`value_${selectNumber}`, 'readOnly', true);
    this.setCache(`level_${selectNumber + 1}`, 'value', nextLevel);
    const ancestor = this.getAncestorContainer(selectNumber, level);
    this.db.setRec(key, new Map(), ancestor);
    let ancestorCopy;
    if (this.controls.get(`key_${selectNumber}`).has('ancestors')) {
      ancestorCopy = this.controls.get(`key_${selectNumber}`).get('ancestors');
    } else ancestorCopy = new Map();
    ancestorCopy.set(nextLevel, new Map());
    ancestorCopy.get(nextLevel).set('key', key);
    if (ancestor instanceof Map) ancestorCopy.get(nextLevel).set('container', ancestor.get(key));
    else ancestorCopy.get(nextLevel).set('container', ancestor[key]);
    const nextSelect = selectNumber + 1;
    this.controls.get(`key_${nextSelect}`).set('ancestors', ancestorCopy);
    this.setCache(`key_${nextSelect}`, 'value', value);
    this.setCache(`key_${nextSelect}`, 'readOnly', false);
    this.setCache(`level_${nextSelect}`, 'value', nextLevel);
    this.db.setRec(value, '', ancestorCopy.get(nextLevel).get('container'));
  };

  arrayClick = () => {
    const selectNumber = ControlView.lastKeyClick;
    const level = this.controls.get(`level_${selectNumber}`).get('properties').get('value').get('cache');
    const key = this.controls.get(`key_${selectNumber}`).get('properties').get('value').get('cache');
    const nextLevel = level + 1;
    const nextKey = '0';
    const value = this.controls.get(`value_${selectNumber}`).get('properties').get('value').get('cache');
    this.setCache(`value_${selectNumber}`, 'value', '[]');
    this.setCache(`value_${selectNumber}`, 'readOnly', true);
    this.setCache(`level_${selectNumber + 1}`, 'value', nextLevel);
    this.setCache(`key_${selectNumber + 1}`, 'value', nextKey);
    const ancestor = this.getAncestorContainer(selectNumber, level);
    this.db.setRec(key, [], ancestor);
    let ancestorCopy;
    if (this.controls.get(`key_${selectNumber}`).get('properties').has('ancestors')) {
      ancestorCopy = new Map(this.controls.get(`key_${selectNumber}`).get('ancestors'));
    } else ancestorCopy = new Map();
    ancestorCopy.set(nextLevel, new Map());
    ancestorCopy.get(nextLevel).set('key', key);
    if (ancestor instanceof Map) ancestorCopy.get(nextLevel).set('container', ancestor.get(key));
    else ancestorCopy.get(nextLevel).set('container', ancestor[key]);
    this.controls.get(`key_${selectNumber + 1}`).set('ancestors', ancestorCopy);
    this.setCache(`value_${selectNumber + 1}`, 'value', value);
    this.setCache(`key_${selectNumber + 1}`, 'readOnly', true);
    this.setCache(`level_${selectNumber + 1}`, 'value', nextLevel);
    this.db.setRec(nextKey, value, ancestorCopy.get(nextLevel).get('container'));
  };

  deleteClick = () => {
    let selectNumber = 0;
    while (this.controls.has(`select_${selectNumber}`)) {
      if (this.controls.get(`select_${selectNumber}`).get('properties').get('checked').get('cache')) {
        const key = this.controls.get(`key_${selectNumber}`).get('properties').get('value').get('cache');
        const level = this.controls.get(`level_${selectNumber}`).get('properties').get('value').get('cache');
        const parent = this.getAncestorContainer(selectNumber, level);
        this.db.deleteRec(key, parent);
        this.setCache(`key_${selectNumber}`, 'value', '');
        this.setCache(`value_${selectNumber}`, 'value', '');
        this.setCache(`select_${selectNumber}`, 'checked', false);
      }
      selectNumber += 1;
    }
    this.db2view();
  };

  static keyClick = (event) => {
    ControlView.lastKeyClick = Number(event.target.id.slice(4));
  };

  valueClick = (event) => {
    const selectNumber = Number(event.target.id.slice(6));
    const level = this.controls.get(`level_${selectNumber}`).get('properties').get('value').get('cache');
    const key = this.controls.get(`key_${selectNumber}`).get('properties').get('value').get('cache');
    const value = this.getAncestorValue(selectNumber, level, key);
    if (typeof value !== 'string' && value !== undefined) {
      const selectNext = selectNumber + 1;
      if (this.controls.has(`level_${selectNext}`)) {
        const levelNext = this.controls.get(`level_${selectNext}`).get('properties').get('value').get('cache');
        if (levelNext === level + 1) this.collapse(event);
        else this.expand(event);
      }
    }
  };

  expand = (event) => {
    const selectNumber = Number(event.target.id.slice(6));
    const key = this.controls.get(`key_${selectNumber}`).get('properties').get('value').get('cache');
    const level = this.controls.get(`level_${selectNumber}`).get('properties').get('value').get('cache');
    const value = this.getAncestorValue(selectNumber, level, key);
    let innerSize;
    if (value instanceof Map) innerSize = value.size;
    else if (Array.isArray(value)) innerSize = value.length;
    let maxCopyRow = ControlView.maxRows - innerSize;
    // shift down rows leaving gap for expanded map
    while (maxCopyRow) {
      const setRow = maxCopyRow + innerSize;
      if (setRow <= ControlView.maxRows && setRow > selectNumber + innerSize) {
        this.copySelect(maxCopyRow, setRow);
      }
      maxCopyRow -= 1;
    }
    this.insertExpanded(selectNumber, key, value);
  };

  insertExpanded = (selectNumber, selectKey, selectValue) => {
    const level = this.controls.get(`level_${selectNumber}`).get('properties').get('value').get('cache');
    const nextLevel = level + 1;
    let nextSelectNumber = selectNumber + 1;

    let ancestorsInner = new Map(); // key without ancestors
    if (this.controls.get(`key_${selectNumber}`).has('ancestors')) {
      ancestorsInner = this.controls.get(`key_${selectNumber}`).get('ancestors');
    }

    ancestorsInner.set(nextLevel, new Map());
    ancestorsInner.get(nextLevel).set('key', selectKey);
    ancestorsInner.get(nextLevel).set('container', selectValue);

    let values = selectValue; // selectValue instanceof Map
    if (Array.isArray(selectValue)) {
      values = selectValue.entries();
    }
    for (const [key, val] of values) {
      if (nextSelectNumber <= ControlView.maxRows) {
        this.controls.get(`key_${nextSelectNumber}`).set('ancestors', ancestorsInner);
        this.setCacheSelect(nextSelectNumber, nextLevel, key, val);
      }
      nextSelectNumber += 1;
    }
  };

  getInnerSize = (selectNumber) => {
    const selectLevel = this.controls.get(`level_${selectNumber}`).get('properties').get('value').get('cache');
    let count = 0;
    while (selectNumber <= ControlView.maxRows - count - 1) {
      if (selectLevel >= this.controls.get(`level_${selectNumber + count + 1}`).get('properties').get('value').get('cache')) {
        break;
      }
      count += 1;
    }
    return count;
  };

  collapse = (event) => {
    const selectNumber = Number(event.target.id.slice(6));
    if (selectNumber === ControlView.maxRows - 1) {
      this.fillGap(selectNumber);
      return;
    }
    // const innerContainer = this.getAncestorContainer(selectNumber, level).get(key);
    // const containerSize = ControlView.getContainerCount(innerContainer);
    const containerSize = this.getInnerSize(selectNumber);
    const maxCopyFrom = selectNumber + 1 + containerSize;
    if (maxCopyFrom > ControlView.maxRows) {
      this.fillGap(selectNumber);
    } else {
      let setRow;
      for (const fromRow of Array.from(
        { length: (ControlView.maxRows - maxCopyFrom + 1) },
        (_, i) => maxCopyFrom + i,
      )) {
        setRow = fromRow - containerSize;
        this.copySelect(fromRow, setRow);
      }
      this.fillGap(setRow);
    }
  };

  fillGap = (selectNumber, levelp) => {
    let level = this.controls.get(`level_${selectNumber}`).get('properties').get('value').get('cache');
    if (levelp !== undefined) level = levelp;

    const selectKey = this.controls.get(`key_${selectNumber}`);
    let key = selectKey.get('properties').get('value').get('cache');
    if (levelp === 0) key = this.getAncestor(selectNumber, level + 1).get('key');
    const parentEntries = this.getAncestor(selectNumber, level).get('container').entries();
    let parentEntry = parentEntries.next();
    while (!parentEntry.done && parentEntry.value[0] !== key) {
      parentEntry = parentEntries.next();
    }
    let fillRow = selectNumber + 1;
    while (fillRow <= ControlView.maxRows) {
      parentEntry = parentEntries.next();
      const fillRowKey = this.controls.get(`key_${fillRow}`);
      if (!parentEntry.done) {
        const [nextKey, nextValue] = parentEntry.value;
        if (selectKey.has('ancestors')) fillRowKey.set('ancestors', selectKey.get('ancestors'));
        else fillRowKey.delete('ancestors');
        this.setCacheSelect(fillRow, level, nextKey, nextValue);
      } else if (level && (fillRow !== ControlView.maxRows)) {
        this.fillGap(fillRow - 1, level - 1);
        return;
      } else {
        this.setCacheSelect(fillRow, 0, '', '');
        fillRowKey.delete('ancestors');
      }

      fillRow += 1;
    }
  };

  saveClick = async () => {
    // this.setSave(true);
    // this.writeCache();
    // const keys = new Uint32Array([...this.db.getMap().keys()]).sort();
    // const dbSorted = new Map();
    // for (const key of keys) dbSorted.set(key, this.db.getRec(key));
    // this.db = new Json(dbSorted);
    this.controls.get('messages').set('innerHTML', '');
    try {
      const messages = await this.storage.save(
        new Json(this.db.getMap()),
        'db.json',
        this.controls.get('codeTokenInput').get('properties').get('value').get('cache'),
      );
      if (messages instanceof Map && messages.has('display')) {
        this.controls.get('messages').set('innerHTML', messages.getDisplay());
      }
    } catch (readFileError) {
      this.controls.get('messages').set('innerHTML', readFileError);
    }
  };

  postLoad = () => {
    // this.setCache('insert', 'disabled', true);
    this.setCache('update', 'disabled', true);
    this.setCache('delete', 'disabled', false);
  };

  setUploadInput(loadVal) {
    this.setCache('load', 'disabled', loadVal);
  }

  setCodeToken(code) {
    this.setCache('codeTokenInput', 'value', code);
  }

  setLoad(loadVal) {
    this.setCache('load', 'disabled', loadVal);
    // this.setCache('messages', 'disabled', messagesVal);
  }

  setSave(saveVal) {
    this.setCache('save', 'disabled', saveVal);
  }

  butRadCheck = (element, properties, events) => {
    if ((element.type === 'button')) {
      if (!properties.has('disabled')) properties.set('disabled', new Map());
      if (this[`${element.id}Disabled`] && (!properties.get('disabled').has('calculator'))) {
        properties.get('disabled').set('calculator', `${element.id}Disabled`);
      }
    } else if (element.type === 'radio' || element.type === 'checkbox') {
      if (!properties.has('checked')) properties.set('checked', new Map());
      if (this[`${element.id}Checked`] && !properties.get('checked').has('calculator')) {
        properties.get('checked').set('calculator', `${element.id}Checked`);
      }
      if (!properties.has('disabled')) properties.set('disabled', new Map());
      if (this[`${element.id}Disabled`] && !properties.get('disabled').has('calculator')) {
        properties.get('disabled').set('calculator', `${element.id}Disabled`);
      }
    }

    if (!events.has('click')) events.set('click', new Map());
    if (!events.get('click').has('recalculate')) events.get('click').set('recalculate', new Map());

    if (!events.get('click').has('listener')) {
      if (element.type === 'checkbox' && element.id.slice(0, 6) === 'select' && this.selectClick) {
        events.get('click').set('listener', 'selectClick');
      } else if (this[`${element.id}Click`]) events.get('click').set('listener', `${element.id}Click`);
    }
  };

  filePassText = (element, properties, events) => {
    if (!properties.has('value')) properties.set('value', new Map());
    if (this[`${element.id}Value`] && !properties.get('value').has('calculator')) {
      properties.get('value').set('calculator', `${element.id}Value`);
    }
    if (!properties.has('disabled')) properties.set('disabled', new Map());
    if (this[`${element.id}Disabled`] && !properties.get('disabled').has('calculator')) {
      properties.get('disabled').set('calculator', `${element.id}Disabled`);
    }
    if (!properties.has('readOnly')) properties.set('readOnly', new Map());
    if (this[`${element.id}Readonly`] && !properties.get('readOnly').has('calculator')) {
      properties.get('readOnly').set('calculator', `${element.id}Readonly`);
    }

    if ((element.type === 'file' || element.type === 'password')) {
      if (!events.has('change')) events.set('change', new Map());
      if (!events.get('change').has('recalculate')) events.get('change').set('recalculate', new Map());
      if (this[`${element.id}Change`] && !events.get('change').has('listener')) {
        events.get('change').set('listener', `${element.id}Change`);
      }
    } else if (element.type === 'text') {
      if (!events.has('input')) events.set('input', new Map());
      if (!events.get('input').has('recalculate')) events.get('input').set('recalculate', new Map());
      if (!events.get('input').has('listener')) {
        if (this[`${element.id}Input`]) {
          events.get('input').set('listener', `${element.id}Input`);
        } else if (this.keyInput && element.id.slice(0, 3) === 'key') {
          events.get('input').set('listener', 'keyInput');
        } else if (this.valueInput && element.id.slice(0, 5) === 'value') {
          events.get('input').set('listener', 'valueInput');
        }
      }
      if (!events.has('click')) events.set('click', new Map());
      if (!events.get('click').has('recalculate')) events.get('click').set('recalculate', new Map());
      if (!events.get('click').has('listener')) {
        if (this[`${element.id}Click`]) {
          events.get('click').set('listener', `${element.id}Click`);
        } else if (ControlView.keyClick && element.id.slice(0, 3) === 'key') {
          events.get('click').set('listener', 'keyClick');
        } else if (this.valueClick && element.id.slice(0, 5) === 'value') {
          events.get('click').set('listener', 'valueClick');
        }
      }
    }
  };

  calcListAddEvent = (element) => {
    const elemID = document.getElementById(element.id);
    const elemRec = this.controls.get(element.id);
    elemRec.set('elemID', elemID);
    for (const [propName, propRec] of elemRec.get('properties')) {
      if (propName in elemID) {
        if (element.type === 'checkbox' && propName === 'checked' && element.id.slice(0, 6) === 'select') {
          propRec.set('cache', false);
          propRec.set('write', true);
        } else if (propName === 'value') {
          if (element.id.slice(0, 5) === 'level') {
            propRec.set('cache', 0);
            propRec.set('write', true);
          } else if (element.id.slice(0, 3) === 'key' || element.id.slice(0, 5) === 'value') {
            propRec.set('cache', '');
            propRec.set('write', true);
          }
        } else {
          propRec.set('cache', elemID[propName]);
          propRec.set('write', false);
        }
      }
      const calculatorFunc = this[propRec.get('calculator')];
      if (calculatorFunc) propRec.set('calculator', calculatorFunc);
    }
    for (const [eventName, eventRec] of elemRec.get('events')) {
      let listenerFunc = this[eventRec.get('listener')];
      if (listenerFunc) eventRec.set('listener', listenerFunc);
      else {
        listenerFunc = ControlView[eventRec.get('listener')];
        if (listenerFunc) eventRec.set('listener', listenerFunc);
      }
      elemID.addEventListener(eventName, this.genericListener);
    }
  };

  initElem = (element) => {
    const hasElement = this.controls.has(element.id);
    if (!hasElement) this.controls.set(element.id, new Map());
    const elemRec = this.controls.get(element.id);

    const hasProperties = elemRec.has('properties');
    if (!hasProperties) elemRec.set('properties', new Map());
    const properties = elemRec.get('properties');

    const hasEvents = elemRec.has('events');
    if (!hasEvents) elemRec.set('events', new Map());
    const events = elemRec.get('events');

    if (element.type === 'button' || element.type === 'radio' || element.type === 'checkbox') {
      this.butRadCheck(element, properties, events);
    } else if ((element.type === 'file' || element.type === 'password' || element.type === 'text')) {
      this.filePassText(element, properties, events);
    }
    this.calcListAddEvent(element);
  };

  static multiplySelectRows = (max) => {
    for (const selectNumber of Array.from({ length: max }, (_, i) => 1 + i)) {
      const prevRowElem = document.getElementById(`row_${selectNumber - 1}`);
      const rowElem = document.getElementById(`row_${selectNumber}`);
      if (!rowElem) {
        const newRow = prevRowElem.cloneNode(true);
        newRow.id = `row_${selectNumber}`;
        newRow.children[0].children[0].id = `select_${selectNumber}`;
        newRow.children[1].children[0].id = `level_${selectNumber}`;
        newRow.children[2].children[0].id = `key_${selectNumber}`;
        newRow.children[2].children[0].placeholder = `key_${selectNumber}`;
        newRow.children[3].children[0].id = `value_${selectNumber}`;
        newRow.children[3].children[0].placeholder = `value_${selectNumber}`;
        prevRowElem.insertAdjacentElement('afterend', newRow);
      }
    }
  };

  constructor(controls, writeCacheImmediately) {
    this.writeCacheImmediately = writeCacheImmediately || false;
    this.controls = controls;
    this.db = new Db();
    this.messages = new Messages();
    ControlView.multiplySelectRows(ControlView.maxRows);

    this.controls.set('messages', new Map());
    this.controls.get('messages').set('properties', new Map());
    this.controls.get('messages').set('events', new Map());

    for (const element of document.querySelectorAll('button, input')) this.initElem(element);
    const sorted = [...this.controls.entries()].sort();
    this.controls.clear();
    sorted.map((entry) => this.controls.set(entry[0], entry[1]));
    this.writeCache();
  }
}
