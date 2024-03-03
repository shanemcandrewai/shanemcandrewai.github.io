import Messages from './messages.js';
import Db from './db.js';
import UtcConv from './utcconv.js';

export default class ModelController {
  setCache(property, value) {
    if (!this.controls.get(property)) {
      this.controls.set(property, new Map([['cache', value]]));
      this.controls.get(property).set('write', true);
    } else if (this.controls.get(property).get('cache') !== value) {
      this.controls.get(property).set('cache', value);
      this.controls.get(property).set('write', true);
    }
  }

  view2db() {
    const rec = new Map();
    for (const [elemName, elemRec] of this.controls) {
      if (elemRec.has('type')) {
        rec.set(elemName, elemRec.get('cache'));
      }
    }
    this.rec2db(rec);
  }

  rec2db(rec) {
    const recID = Number(rec.get('id'));
    if (recID) {
      for (const [elemName, elemRec] of this.controls) {
        if (elemName !== 'id' && elemRec.has('type')) {
          const recValue = rec.get(elemName);
          if (recValue) {
            const type = elemRec.get('type');
            if (type === Number) {
              this.db.setRec(
                recID,
                elemName,
                Number(recValue),
              );
            } else if (type === 'datetime-local') {
              this.db.setRec(
                recID,
                elemName,
                UtcConv.getUTCDateTime(recValue),
              );
            } else {
              this.db.setRec(recID, elemName, recValue);
            }
          } else if (this.db.hasID(recID)) { this.db.deleteField(recID, elemName); }
        }
      }
    }
  }

  canUpdate(viewID) {
    const dbRec = this.db.getRec(viewID);
    if (dbRec === undefined) return false;
    for (const [elemName, elemRec] of this.controls) {
      if (elemName !== 'id') {
        const valueView = elemRec.get('cache');
        const type = elemRec.get('type');
        const valueDB = dbRec.get(elemName);
        if (valueView) {
          if (type === Number) {
            if (valueDB !== Number(valueView)) return true;
          } else if (type === 'datetime-local') {
            if (valueDB !== UtcConv.getUTCDateTime(valueView)) return true;
          } else if (valueDB !== valueView) return true;
        } else if (valueDB) return true;
      }
    }
    return false;
  }

  canInsert(viewID) {
    if (!viewID) return false;

    let filled = false;
    for (const [elemName, elemRec] of this.controls) {
      if (elemName !== 'id' && elemRec.has('type')
        && elemRec.get('cache')) filled = true;
    }
    if (!filled) return false;

    const dbRec = this.db.getRec(viewID);
    const keys = new Set([...this.db.getMap().keys()]);

    if (!dbRec) {
      if (!this.controls.get('parent').get('cache')
        || keys.has(Number(this.controls.get('parent').get('cache')))) return true;
      return false;
    }
    for (const [elemName, elemRec] of this.controls) {
      const valueView = elemRec.get('cache');
      if (elemName === 'parent'
      && valueView
      && !keys.has(Number(valueView))) { return false; }
      if (elemName !== 'id' && dbRec === undefined && valueView) return true;
    }
    return false;
  }

  db2view(id) {
    let idDB = 1;
    if (id !== undefined) idDB = id;
    else if (this.controls.get('id').get('cache')) idDB = this.controls.get('id').get('cache');
    let recDB = this.db.getRec(idDB);
    if (!recDB) {
      [idDB, recDB] = this.db.getMap()[Symbol.iterator]().next().value;
    }
    if (idDB) {
      this.setCache('id', idDB);
      for (const [elemName, elemRec] of this.controls) {
        if (elemName === 'id') {
          const children = this.db.getChildren(Number(idDB));
          if (children.size) {
            const messTable = document.createElement('table');
            this.setCache('down', false);
            this.setCache('archive', true);
            messTable.setAttribute('id', 'messageTable');
            messTable.setAttribute('class', 'table table-hover');
            const messHead = messTable.createTHead();
            const messHeadRow = messHead.insertRow();
            const messHeadth1 = document.createElement('th');
            messHeadth1.setAttribute('scope', 'col');
            messHeadth1.innerHTML = '#';
            messHeadRow.appendChild(messHeadth1);
            const messHeadth2 = messHeadth1.cloneNode(true);
            messHeadth2.innerHTML = 'Description';
            messHeadRow.appendChild(messHeadth2);
            const messBody = messTable.createTBody();
            for (const [childID, childRec] of children) {
              const messBodyRow = messBody.insertRow();
              messBodyRow.setAttribute('id', `row_${childID}`);
              const messBodyth = document.createElement('th');
              messBodyth.setAttribute('scope', 'row');
              messBodyth.innerHTML = `${childID}`;
              messBodyRow.appendChild(messBodyth);
              const cell = messBodyRow.insertCell();
              let cellText;
              if (childRec.has('description')) {
                cellText = document.createTextNode(`${childRec.get('description')}`);
                this.setCache(`row_${childID}`, `${childRec.get('description')}`);
              } else {
                cellText = document.createTextNode('');
                this.setCache(`row_${childID}`, '');
              }
              cell.appendChild(cellText);
            }
            this.setCache('messages', messTable);
          } else {
            this.setCache('messages', null);
            this.setCache('down', true);
          }
        } else if (elemRec.has('type')) {
          const valueDB = recDB.get(elemName);
          if (valueDB === undefined) this.setCache(elemName, '');
          else if (elemRec.get('type') === 'datetime-local' && valueDB) {
            const utc = UtcConv.getLocalDateTime(valueDB);
            this.setCache(elemName, utc);
          } else this.setCache(elemName, valueDB);
          if (elemName === 'parent') {
            if (this.db.hasID(valueDB)) this.setCache('up', false);
            else this.setCache('up', true);
            if (this.db.hasID(Number(elemRec.get('cache'))) && this.db.hasID(id) && id !== Number(elemRec.get('cache'))) this.setCache('swap', false);
            else this.setCache('swap', true);
          }
        }
      }
    }
    return new Map([['system',
      new Map([['record read from DB', idDB]]),
    ]]);
  }

  postLoad() {
    this.setCache('new', false);
    this.setCache('insert', true);
    this.setCache('update', true);
    this.setCache('delete', false);
    this.postNextprev();
  }

  postNew() {
    this.setCache('new', true);
    this.setCache('insert', false);
    this.setCache('update', true);
    this.setCache('delete', true);
  }

  postView2db() {
    this.postLoad();
    this.setCache('save', false);
  }

  postData(targetID, targetValue) {
    this.setCache(targetID, targetValue);

    const messages = new Messages();
    const id = this.controls.get('id').get('cache');

    if (this.canInsert(id, this.db)) this.postNew();
    else this.postLoad();
    if (this.canUpdate(id, this.db)) {
      this.setCache('update', false);
    } else if (!this.controls.get('update').get('cache')) {
      this.setCache('update', true);
    }

    if (targetID === 'parent') {
      if (!targetValue || this.db.hasID(targetValue)) this.setCache('up', false);
      else this.setCache('up', true);
    }
    if (targetID === 'parent' || targetID === 'id') {
      const parent = this.controls.get('parent').get('cache');
      if (this.db.hasID(parent) && this.db.hasID(id) && id !== Number(parent)) this.setCache('swap', false);
      else this.setCache('swap', true);
    }

    return messages;
  }

  setUploadInput(loadVal) {
    this.setCache('load', loadVal);
  }

  setCodeToken(code) {
    this.setCache('codetokenInput', code);
  }

  setLoad(loadVal, messagesVal) {
    this.setCache('load', loadVal);
    this.setCache('messages', messagesVal);
  }

  setSave(saveVal) {
    this.setCache('save', saveVal);
  }

  setNew(idVal, createdVal) {
    this.setCache('id', idVal);
    this.setCache('created', createdVal);
  }

  postNextprev(id) {
    let viewID = 1;
    if (id !== undefined) viewID = id;
    else if (this.controls.get('id').get('cache')) viewID = this.controls.get('id').get('cache');
    const viewParent = this.controls.get('parent').get('cache');
    this.setCache('next', true);
    const keys = new Uint32Array([...this.db.getMap().keys()]).sort();
    for (const key of keys) {
      if (key > Number(viewID)
        && ((viewParent && this.db.getRec(key).get('parent') === Number(viewParent))
        || (!viewParent && !this.db.getRec(key).get('parent')))) {
        this.setCache('next', false);
        break;
      }
    }
    this.setCache('previous', true);
    keys.reverse();
    for (const key of keys) {
      if (key < Number(viewID)
        && ((viewParent && this.db.getRec(key).get('parent') === Number(viewParent))
        || (!viewParent && !this.db.getRec(key).get('parent')))) {
        this.setCache('previous', false);
        break;
      }
    }
  }

  constructor(controls) {
    this.db = new Db();
    this.controls = controls;
  }
}
