import Json from './json.js';
import Xlsx from './xlsx.js';
import Local from './local.js';
import Dropbox from './dropbox.js';
import Db from './db.js';

export default class ControlView {
  static maxRows = 14;

  static isISO = (input) => {
    if (!/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z/.test(input)) return false;
    const d = new Date(input);
    if (!Number.isNaN(d.getTime()) && d.toISOString() === input) {
      return true;
    }
    return false;
  };

  static isoToLocal = (input) => {
    if (!ControlView.isISO(input)) return input;
    const d = new Date(input);
    return `${d.toISOString().split('T')[0]} ${d.toLocaleTimeString('NL')}`;
  };

  static localToISO = (input) => {
    const newDate = new Date(input);
    let ret;
    try { ret = newDate.toISOString(); } catch (error) { return input; }
    return ret;
  };

  static obj2Map = (obj, map = new Map()) => Db.obj2Map(obj, map);

  static replaceKey = (mapToUpdate, keyOld, keyNew, valNew) => {
    const mapToUpdateCopy = new Map(mapToUpdate);
    mapToUpdate.clear();
    if (!mapToUpdateCopy.size) {
      mapToUpdate.set(keyNew, valNew);
    } else if (mapToUpdateCopy.has(keyOld)) {
      for (const [key, val] of mapToUpdateCopy) {
        if (key === keyOld) mapToUpdate.set(keyNew, valNew);
        else mapToUpdate.set(key, val);
      }
    } else {
      for (const [key, val] of mapToUpdateCopy) mapToUpdate.set(key, val);
      mapToUpdate.set(keyNew, valNew);
    }
  };

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
    this.writeCache();
    try {
      await this.storage.load(
        this.db,
        'db.json',
        this.controls.get('codeTokenInput').get('properties').get('value').get('cache'),
      );
      this.db2view();
    } catch (readFileError) {
      this.setCache('messages', 'innerHTML', readFileError);
    }
    this.writeCache();
  };

  getAncestor = (selectNumber, level) => {
    if (level > 0 && this.controls.get(`key_${selectNumber}`).has('ancestors')) {
      if (this.controls.get(`key_${selectNumber}`).get('ancestors').has(level)) {
        return this.controls.get(`key_${selectNumber}`).get('ancestors').get(level);
      }
      return new Map([['key', this.controls.get(`key_${selectNumber}`).get('ancestors').get(level + 1).get('key')],
        ['container', this.db.getMap()]]);
    }
    return new Map([['container', this.db.getMap()]]);
  };

  getAncestorValue = (selectNumber, level, key) => {
    const container = this.getAncestor(selectNumber, level).get('container');
    if (container instanceof Map && container.has(key)) return container.get(key);
    if (Array.isArray(container)) return container[key];
    return '';
  };

  db2view = () => {
    const entries = this.db.getMap().entries();
    for (let currentSelect = 0; currentSelect < ControlView.maxRows; currentSelect += 1) {
      const entry = entries.next();
      if (!entry.done) {
        const [nextKey, nextValue] = entry.value;
        this.setCacheRow(currentSelect, 0, nextKey, nextValue);
      } else break;
    }
  };

  setDuplicateColour = (id, parent, inputKey) => {
    if (parent instanceof Map) {
      if (parent.has(inputKey)) {
        this.controls.get(id).get('elemID').classList.add('text-bg-danger');
        return -1;
      }
    } else if (Array.isArray(parent)) {
      if (parent.includes(inputKey)) {
        this.controls.get(id).get('elemID').classList.add('text-bg-danger');
        return -1;
      }
    }
    return 0;
  };

  keyInput = (event) => {
    const selectNumber = event.target.id.slice(4);
    let inputKey = event.target.value;
    const [level, cacheKey] = this.getProps(selectNumber);
    const value = this.getAncestorValue(selectNumber, level, cacheKey);
    if (ControlView.isISO(cacheKey)) inputKey = ControlView.localToISO(inputKey);
    const parent = this.getAncestor(selectNumber, level).get('container');
    if (this.setDuplicateColour(event.target.id, parent, inputKey) < 0) return;

    ControlView.replaceKey(parent, cacheKey, inputKey, value);
    this.controls.get(event.target.id).get('properties').get('value').set('cache', inputKey);
    this.controls.get(event.target.id).get('elemID').classList.remove('text-bg-danger');
    if (this.controls.has(`key_${Number(selectNumber) + 1}`)) {
      this.setCache(`level_${Number(selectNumber) + 1}`, 'value', level);
      if (this.controls.get(`key_${selectNumber}`).has('ancestors')) {
        this.controls.get(`key_${Number(selectNumber) + 1}`).set(
          'ancestors',
          this.controls.get(`key_${selectNumber}`).get('ancestors'),
        );
      }
    }
    this.activeElementID = inputKey;
    this.wlUpdate();
  };

  wlUpdate = () => {
    if (this.db.hasRec('wl_updated')) {
      const now = new Date();
      const nowISO = now.toISOString();
      this.db.setRec('wl_updated', nowISO);
      let selectNumber;
      for (selectNumber = 0; selectNumber < ControlView.maxRows; selectNumber += 1) {
        const key = this.getProps(selectNumber)[1];
        if (key === 'wl_updated') {
          break;
        }
      }
      this.setCacheRow(selectNumber, 0, 'wl_updated', nowISO);
      this.writeCache();
    }
  };

  getProps = (row) => [
    this.controls.get(`level_${row}`).get('properties').get('value').get('cache'),
    this.controls.get(`key_${row}`).get('properties').get('value').get('cache'),
    this.controls.get(`value_${row}`).get('properties').get('value').get('cache'),
  ];

  valueInput = (event) => {
    const selectNumber = event.target.id.slice(6);
    const inputValue = event.target.value;
    const [level, key, cacheValue] = this.getProps(selectNumber);
    const nextKey = this.getProps(Number(selectNumber) + 1)[1];
    let calcValue = inputValue;
    if (ControlView.isISO(cacheValue)) calcValue = ControlView.localToISO(inputValue);
    if (!Number.isNaN(Number(calcValue))) calcValue = Number(calcValue);
    const parent = this.getAncestor(selectNumber, level).get('container');
    this.db.setRec(key, calcValue, parent);
    this.setCache(`value_${selectNumber}`, 'value', calcValue);
    if (Array.isArray(parent) && selectNumber < ControlView.maxRows) {
      if (!nextKey) {
        this.setCache(`level_${Number(selectNumber) + 1}`, 'value', level);
        this.setCache(`key_${Number(selectNumber) + 1}`, 'value', Number(key) + 1);
        this.db.setRec(Number(key) + 1, '', parent);
        const ancestors = this.controls.get(`key_${selectNumber}`).get('ancestors');
        if (ancestors) {
          this.controls.get(`key_${Number(selectNumber) + 1}`).set('ancestors', ancestors);
        }
      }
    }
    this.wlUpdate();
  };

  copyRow = (selectFrom, selectTo) => {
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

  setCacheRow = (selectNumber = 0, level = 0, key = '', value = '') => {
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
    let elemPropName = this.controls.get(elemName).get('properties').get(propName);
    if (!elemPropName) {
      elemPropName = new Map();
      this.controls.get(elemName).get('properties').set(propName, elemPropName);
    }
    if (elemPropName.get('cache') !== value) {
      elemPropName.set('cache', value);
      elemPropName.set('write', true);
    }
    if (this.writeCacheImmediately) {
      this.writeCache();
    }
  };

  setLevelColors = () => {
    for (let rowNum = 0; rowNum < ControlView.maxRows; rowNum += 1) {
      const level = this.getProps(rowNum)[0];
      const colorFlag = level % 4;
      const keyRow = this.controls.get(`key_${rowNum}`);
      const valueRow = this.controls.get(`value_${rowNum}`);
      const keyStyle = keyRow.get('properties').get('style');
      const valueStyle = valueRow.get('properties').get('style');
      let keyBackground;
      let valueBackground;
      if (keyStyle instanceof Map) keyBackground = keyStyle.get('background');
      if (valueStyle instanceof Map) valueBackground = valueStyle.get('background');
      let keyCache;
      let valueCache;
      if (keyBackground instanceof Map) keyCache = keyBackground.get('cache');
      if (valueBackground instanceof Map) valueCache = valueBackground.get('cache');

      let calcBackground;
      switch (colorFlag) {
        case 3:
          calcBackground = 'lightcyan';
          break;
        case 2:
          calcBackground = 'honeydew';
          break;
        case 1:
          calcBackground = 'lavenderblush';
          break;
        default:
          calcBackground = 'white';
      }
      if ((keyCache !== undefined || colorFlag) && calcBackground !== keyCache) {
        if (!keyStyle) keyRow.get('properties').set('style', new Map());
        if (!keyBackground) keyRow.get('properties').get('style').set('background', new Map());
        keyRow.get('properties').get('style').get('background').set('cache', calcBackground);
        keyRow.get('properties').get('style').get('background').set('write', true);
      }
      if ((valueCache !== undefined || colorFlag) && calcBackground !== valueCache) {
        if (!valueStyle) valueRow.get('properties').set('style', new Map());
        if (!valueBackground) valueRow.get('properties').get('style').set('background', new Map());
        valueRow.get('properties').get('style').get('background').set('cache', calcBackground);
        valueRow.get('properties').get('style').get('background').set('write', true);
      }
    }
  };

  writeCache = () => {
    this.setLevelColors();
    for (const elemRec of this.controls.values()) {
      for (const [propName, propRec] of elemRec.get('properties')) {
        for (const [propNameLower, propLower] of propRec) {
          if (propNameLower === 'write') {
            if (propLower) {
              elemRec.get('elemID')[propName] = ControlView.isoToLocal(propRec.get('cache'));
              propRec.set('write', false);
            }
          } else if (!['cache'].includes(propNameLower)) {
            elemRec.get('elemID')[propName][propNameLower] = propLower.get('cache');
            propLower.set('write', false);
          }
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
    let lastEmpty = 0;
    for (let selectNumber = 0; selectNumber < ControlView.maxRows; selectNumber += 1) {
      if (this.getProps(selectNumber)[1] === '') {
        if (selectNumber === lastEmpty + 1) return;
        lastEmpty = selectNumber;
      }
    }

    for (let selectNumber = 0; selectNumber < ControlView.maxRows; selectNumber += 1) {
      this.copyRow(selectNumber + 1, selectNumber);
    }
    const [level, key, value] = this.getProps(ControlView.maxRows);
    const ancestors = this.controls.get(`key_${ControlView.maxRows}`).get('ancestors');
    if (key !== '' || value !== '') {
      const nextEntry = this.getNext(ControlView.maxRows - 1, level, ancestors);
      if (nextEntry) {
        this.controls.get(`key_${ControlView.maxRows}`).set('ancestors', nextEntry.ancestors);
        this.setCacheRow(
          ControlView.maxRows,
          nextEntry.level,
          nextEntry.key,
          nextEntry.value,
        );
      } else {
        this.setCacheRow(ControlView.maxRows);
        this.controls.get(`key_${ControlView.maxRows}`).delete('ancestors');
      }
    }
  };

  upClick = () => {
    const level = this.getProps(0)[0];
    const previousEntry = this.getPrevious(0, level);
    if (previousEntry !== undefined) {
      let selectNumber;
      for (selectNumber = ControlView.maxRows - 1; selectNumber + 1; selectNumber -= 1) {
        this.copyRow(selectNumber, selectNumber + 1);
      }
      this.setCacheRow(
        selectNumber + 1,
        previousEntry.level,
        previousEntry.key,
        previousEntry.value,
      );
    }
  };

  getNext = (selectNumber, level, ancestors) => {
    const [selectLevel, selectKey] = this.getProps(selectNumber);
    let key = selectKey;
    let selectAncestors;
    if (ancestors) selectAncestors = ancestors;
    else selectAncestors = this.controls.get(`key_${selectNumber}`).get('ancestors');
    if (selectLevel !== level) key = this.getAncestor(selectNumber, selectLevel).get('key');
    const parentEntries = this.getAncestor(selectNumber, level).get('container').entries();
    let parentEntry = parentEntries.next();
    for (;!parentEntry.done && parentEntry.value[0] !== key;) {
      parentEntry = parentEntries.next();
    }
    parentEntry = parentEntries.next();
    if (parentEntry.done) {
      if (!level) return undefined;
      return this.getNext(selectNumber, level - 1, selectAncestors);
    }
    const [nextKey, nextValue] = parentEntry.value;
    return {
      key: nextKey, level, value: nextValue, ancestors,
    };
  };

  getPrevious = (selectNumber, level) => {
    const [selectLevel, selectKey] = this.getProps(selectNumber);
    let key = selectKey;
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
    for (adjacentEntry; !parentEntry.done && parentEntry.value[0] !== key;) {
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
    let selectNumber = this.lastLineClick;
    for (let copyFrom = ControlView.maxRows - 1; copyFrom >= selectNumber; copyFrom -= 1) {
      this.copyRow(copyFrom, copyFrom + 1);
    }
    const [selectLevel, selectKey] = this.getProps(selectNumber);
    const container = this.getAncestor(selectNumber, selectLevel).get('container');
    this.setCache(`value_${selectNumber}`, 'value', '');
    this.setCache(`value_${selectNumber}`, 'readOnly', false);
    if (container instanceof Map) {
      const containerCopy = new Map(container);
      container.clear();
      const containerEntries = containerCopy.entries();
      for (let containerEntry = containerEntries.next(); !containerEntry.done;) {
        if (containerEntry.value[0] === selectKey) container.set('', '');
        container.set(containerEntry.value[0], containerEntry.value[1]);
        containerEntry = containerEntries.next();
      }
      this.setCache(`key_${selectNumber}`, 'value', '');
    } else if (Array.isArray(container)) {
      let key = Number(this.getProps(selectNumber)[1]);
      container.splice(key, 0, '');
      selectNumber += 1;
      for (selectNumber; selectNumber <= ControlView.maxRows; selectNumber += 1) {
        const level = this.getProps(selectNumber)[0];
        if (level === selectLevel) {
          this.setCache(`key_${selectNumber}`, 'value', key + 1);
          key += 1;
        } else break;
      }
    }
    this.writeCache();
  };

  appendClick = () => {
    let nextRow = this.lastLineClick + 1;
    for (let copyFrom = ControlView.maxRows - 1; copyFrom >= nextRow; copyFrom -= 1) {
      this.copyRow(copyFrom, copyFrom + 1);
    }
    const [thisLevel, thisKey] = this.getProps(this.lastLineClick);
    const ancestors = this.getAncestor(this.lastLineClick, thisLevel);
    this.setCache(`level_${nextRow}`, 'value', thisLevel);
    this.setCache(`value_${nextRow}`, 'value', '');
    this.setCache(`value_${nextRow}`, 'readOnly', false);
    const key = this.controls.get(`key_${this.lastLineClick}`);
    if (key.has('ancestors')) {
      this.controls.get(`key_${nextRow}`).set('ancestors', key.get('ancestors'));
    }
    const container = ancestors.get('container');
    if (container instanceof Map) {
      this.db.setRec('', '', container, thisKey);
      this.setCache(`key_${nextRow}`, 'value', '');
    } else if (Array.isArray(container)) {
      container.splice(Number(thisKey) + 1, 0, '');
      for (let index = Number(thisKey) + 1; index < container.length; index += 1) {
        this.setCache(`key_${nextRow}`, 'value', index);
        nextRow += 1;
      }
    }
    this.writeCache();
  };

  mapClick = () => {
    const selectNumber = this.lastLineClick;
    const [level, key, value] = this.getProps(selectNumber);
    const nextLevel = level + 1;
    this.setCache(`value_${selectNumber}`, 'value', '<>');
    this.setCache(`value_${selectNumber}`, 'readOnly', true);
    this.setCache(`level_${selectNumber + 1}`, 'value', nextLevel);
    const ancestors = this.getAncestor(selectNumber, level).get('container');
    this.db.setRec(key, new Map(), ancestors);
    let ancestorCopy;
    if (this.controls.get(`key_${selectNumber}`).has('ancestors')) {
      ancestorCopy = this.controls.get(`key_${selectNumber}`).get('ancestors');
    } else ancestorCopy = new Map();
    ancestorCopy.set(nextLevel, new Map());
    ancestorCopy.get(nextLevel).set('key', key);
    if (ancestors instanceof Map) ancestorCopy.get(nextLevel).set('container', ancestors.get(key));
    else ancestorCopy.get(nextLevel).set('container', ancestors[key]);
    const nextSelect = selectNumber + 1;
    const [, keyCache, valueCache] = this.getProps(nextSelect);
    if (keyCache === '' && valueCache === '') {
      this.controls.get(`key_${nextSelect}`).set('ancestors', ancestorCopy);
      this.setCache(`key_${nextSelect}`, 'value', value);
      this.setCache(`key_${nextSelect}`, 'readOnly', false);
      this.setCache(`level_${nextSelect}`, 'value', nextLevel);
      this.db.setRec(value, '', ancestorCopy.get(nextLevel).get('container'));
    }
  };

  arrayClick = () => {
    const selectNumber = this.lastLineClick;
    const [level, key, value] = this.getProps(selectNumber);
    const nextLevel = level + 1;
    const nextKey = '0';
    this.setCache(`value_${selectNumber}`, 'value', '[]');
    this.setCache(`value_${selectNumber}`, 'readOnly', true);
    this.setCache(`level_${selectNumber + 1}`, 'value', nextLevel);
    this.setCache(`key_${selectNumber + 1}`, 'value', nextKey);
    const ancestors = this.getAncestor(selectNumber, level).get('container');
    this.db.setRec(key, [], ancestors);
    let ancestorCopy;
    if (this.controls.get(`key_${selectNumber}`).get('properties').has('ancestors')) {
      ancestorCopy = new Map(this.controls.get(`key_${selectNumber}`).get('ancestors'));
    } else ancestorCopy = new Map();
    ancestorCopy.set(nextLevel, new Map());
    ancestorCopy.get(nextLevel).set('key', key);
    if (ancestors instanceof Map) ancestorCopy.get(nextLevel).set('container', ancestors.get(key));
    else ancestorCopy.get(nextLevel).set('container', ancestors[key]);
    this.controls.get(`key_${selectNumber + 1}`).set('ancestors', ancestorCopy);
    this.setCache(`value_${selectNumber + 1}`, 'value', value);
    this.setCache(`key_${selectNumber + 1}`, 'readOnly', true);
    this.setCache(`level_${selectNumber + 1}`, 'value', nextLevel);
    this.db.setRec(nextKey, value, ancestorCopy.get(nextLevel).get('container'));
  };

  timestampClick = () => {
    const now = new Date();
    const nowISO = now.toISOString();
    const selectNumber = this.lastLineClick;
    const [level, cacheKey, cacheValue] = this.getProps(selectNumber);
    let key = cacheKey;
    let value = cacheValue;
    this.setCache(this.activeElementID, 'value', `${nowISO}`);
    const ancestors = this.getAncestor(selectNumber, level).get('container');
    if (this.activeElementID.slice(0, 3) === 'key') {
      this.db.deleteRec(key, ancestors);
      key = nowISO;
    } else value = nowISO;
    this.db.setRec(key, value, ancestors);
  };

  lengthClick = () => {
    const { length } = this.db.getString();
    const selectNumber = this.lastLineClick;
    const [level, cacheKey, cacheValue] = this.getProps(selectNumber);
    let key = cacheKey;
    let value = cacheValue;
    this.setCache(this.activeElementID, 'value', length);
    const ancestors = this.getAncestor(selectNumber, level).get('container');
    if (this.activeElementID.slice(0, 3) === 'key') {
      this.db.deleteRec(key, ancestors);
      key = length;
    } else value = length;
    this.db.setRec(key, value, ancestors);
  };

  deleteClick = () => {
    const selectNumber = this.lastLineClick;
    const [selectLevel, cacheKey] = this.getProps(selectNumber);
    const containerSize = this.getInnerSize(selectNumber);
    const parent = this.getAncestor(selectNumber, selectLevel).get('container');

    this.db.deleteRec(cacheKey, parent);
    const maxCopyFrom = selectNumber + 1 + containerSize;
    if (maxCopyFrom > ControlView.maxRows) {
      this.fillGap(selectNumber);
    } else {
      let setRow;
      for (let fromRow = maxCopyFrom; fromRow < ControlView.maxRows + 1; fromRow += 1) {
        setRow = fromRow - containerSize - 1;
        this.copyRow(fromRow, setRow);
      }

      if (Array.isArray(parent)) {
        let key = cacheKey;
        for (let row = selectNumber;
          row < ControlView.maxRows && selectNumber < ControlView.maxRows;
          row += 1) {
          const level = this.getProps(row)[0];
          if (level === selectLevel) {
            this.setCache(`key_${row}`, 'value', key);
            key += 1;
          } else break;
        }
      }
      this.fillGap(setRow);
    }
  };

  keyClick = (event) => {
    this.lastLineClick = Number(event.target.id.slice(4));
    this.activeElementID = event.target.id;
  };

  valueClick = (event) => {
    this.lastLineClick = Number(event.target.id.slice(6));
    this.activeElementID = event.target.id;
    const selectNumber = Number(event.target.id.slice(6));
    const [level, key] = this.getProps(selectNumber);
    const value = this.getAncestorValue(selectNumber, level, key);
    if (typeof value === 'object') {
      const selectNext = selectNumber + 1;
      if (this.controls.has(`level_${selectNext}`)) {
        const levelNext = this.getProps(selectNext)[0];
        if (levelNext === level + 1) this.collapse(event);
        else this.expand(event);
      }
    }
  };

  expand = (event) => {
    const selectNumber = Number(event.target.id.slice(6));
    const [level, key] = this.getProps(selectNumber);
    const value = this.getAncestorValue(selectNumber, level, key);
    let innerSize;
    if (value instanceof Map) innerSize = value.size;
    else if (Array.isArray(value)) innerSize = value.length;
    for (let maxCopyRow = ControlView.maxRows - innerSize; maxCopyRow > 0; maxCopyRow -= 1) {
      const setRow = maxCopyRow + innerSize;
      if (setRow <= ControlView.maxRows && setRow > selectNumber + innerSize) {
        this.copyRow(maxCopyRow, setRow);
      }
    }
    this.insertExpanded(selectNumber, key, value);
  };

  insertExpanded = (selectNumber, selectKey, selectValue) => {
    const level = this.getProps(selectNumber)[0];
    const nextLevel = level + 1;
    let nextSelectNumber = selectNumber + 1;

    let ancestorsInner = new Map(); // key without ancestors
    if (this.controls.get(`key_${selectNumber}`).has('ancestors')) {
      ancestorsInner = new Map(this.controls.get(`key_${selectNumber}`).get('ancestors'));
    }

    ancestorsInner.set(nextLevel, new Map());
    ancestorsInner.get(nextLevel).set('key', selectKey);
    ancestorsInner.get(nextLevel).set('container', selectValue);

    if (typeof selectValue === 'string' || typeof selectValue === 'number') {
      this.setCacheRow(
        nextSelectNumber,
        nextLevel,
        selectKey,
        selectValue,
      );
    } else {
      let values = selectValue; // selectValue instanceof Map
      if (Array.isArray(selectValue)) {
        values = selectValue.entries();
      }
      for (const [key, val] of values) {
        if (nextSelectNumber <= ControlView.maxRows) {
          this.controls.get(`key_${nextSelectNumber}`).set('ancestors', ancestorsInner);
          this.setCacheRow(
            nextSelectNumber,
            nextLevel,
            key,
            val,
          );
        }
        nextSelectNumber += 1;
      }
    }
  };

  getInnerSize = (selectNumber) => {
    const selectLevel = this.getProps(selectNumber)[0];
    for (let count = 0; count <= ControlView.maxRows - selectNumber - 1; count += 1) {
      const level = this.getProps(selectNumber + count + 1)[0];
      if (selectLevel >= level) return count;
    }
    return 0;
  };

  collapse = (event) => {
    const selectNumber = Number(event.target.id.slice(6));
    if (selectNumber === ControlView.maxRows - 1) {
      this.fillGap(selectNumber);
      return;
    }
    const containerSize = this.getInnerSize(selectNumber);
    const maxCopyFrom = selectNumber + 1 + containerSize;
    if (maxCopyFrom > ControlView.maxRows) {
      this.fillGap(selectNumber);
    } else {
      let setRow;
      for (let fromRow = maxCopyFrom; fromRow < ControlView.maxRows + 1; fromRow += 1) {
        setRow = fromRow - containerSize;
        this.copyRow(fromRow, setRow);
      }
      this.fillGap(setRow);
    }
  };

  fillGap = (selectNumber, levelp) => {
    let [level, key] = this.getProps(selectNumber);
    if (levelp !== undefined) level = levelp;
    const selectKey = this.controls.get(`key_${selectNumber}`);
    if (levelp === 0) key = this.getAncestor(selectNumber, level + 1).get('key');
    const parentEntries = this.getAncestor(selectNumber, level).get('container').entries();
    let parentEntry = parentEntries.next();
    for (parentEntry; !parentEntry.done && parentEntry.value[0] !== key;) {
      parentEntry = parentEntries.next();
    }

    for (let fillRow = selectNumber + 1; fillRow <= ControlView.maxRows; fillRow += 1) {
      parentEntry = parentEntries.next();
      const fillRowKey = this.controls.get(`key_${fillRow}`);
      if (!parentEntry.done) {
        const [nextKey, nextValue] = parentEntry.value;
        if (selectKey.has('ancestors')) fillRowKey.set('ancestors', selectKey.get('ancestors'));
        else fillRowKey.delete('ancestors');
        this.setCacheRow(fillRow, level, nextKey, nextValue);
      } else if (level && (fillRow !== ControlView.maxRows)) {
        this.fillGap(fillRow - 1, level - 1);
        return;
      } else {
        this.setCacheRow(fillRow);
        fillRowKey.delete('ancestors');
      }
    }
  };

  saveClick = async () => {
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

  setUploadInput(loadVal) {
    this.setCache('load', 'disabled', loadVal);
  }

  setCodeToken(code) {
    this.setCache('codeTokenInput', 'value', code);
  }

  setLoad(loadVal) {
    this.setCache('load', 'disabled', loadVal);
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

  messages = (element, properties) => {
    if (!properties.has('innerHTML')) properties.set('innerHTML', new Map());
    if (this[`${element.id}InnerHTML`] && !properties.get('innerHTML').has('calculator')) {
      properties.get('innerHTML').set('calculator', `${element.id}InnerHTML`);
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
        } else if (this.keyClick && element.id.slice(0, 3) === 'key') {
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
    } else if (element.id === 'messages') {
      this.messages(element, properties);
    }
    this.calcListAddEvent(element);
  };

  static multiplySelectRows = (max) => {
    for (let selectNumber = 0; selectNumber < max; selectNumber += 1) {
      const prevRowElem = document.getElementById(`row_${selectNumber}`);
      const nextRow = selectNumber + 1;
      const rowElem = document.getElementById(`row_${nextRow}`);
      if (!rowElem) {
        const newRow = prevRowElem.cloneNode(true);
        newRow.id = `row_${nextRow}`;
        newRow.children[0].children[0].id = `level_${nextRow}`;
        newRow.children[1].children[0].id = `key_${nextRow}`;
        newRow.children[1].children[0].placeholder = `key_${nextRow}`;
        newRow.children[2].children[0].id = `value_${nextRow}`;
        newRow.children[2].children[0].placeholder = `value_${nextRow}`;
        prevRowElem.insertAdjacentElement('afterend', newRow);
      }
    }
  };

  constructor(controls, writeCacheImmediately) {
    this.lastLineClick = 0;
    this.activeElementID = 'value_0';

    this.writeCacheImmediately = writeCacheImmediately || false;
    this.controls = controls;
    this.db = new Db();
    ControlView.multiplySelectRows(ControlView.maxRows);

    this.controls.set('messages', new Map());
    this.controls.get('messages').set('properties', new Map());
    this.controls.get('messages').set('events', new Map());

    for (const element of document.querySelectorAll('button, input, div#messages')) this.initElem(element);
    const sorted = [...this.controls.entries()].sort();
    this.controls.clear();
    sorted.map((entry) => this.controls.set(entry[0], entry[1]));
    this.writeCache();
  }
}
