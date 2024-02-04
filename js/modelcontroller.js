import Messages from './messages.js';
import Db from './db.js';
import UtcConv from './utcconv.js';

export default class ModelController {
  setCache(property, value) {
    if (this.controls.get(property).get('cache') !== value) {
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
    if (!recDB) { [idDB, recDB] = this.db.getMap()[Symbol.iterator]().next().value; }
    if (idDB) {
      this.setCache('id', idDB);
      const classMessages = new Messages();
      let displayMessages = classMessages.getDisplay();
      for (const [elemName, elemRec] of this.controls) {
        if (elemName === 'id') {
          const children = this.db.getChildren(Number(idDB));
          if (children.size) {
            this.setCache('down', false);
            this.setCache('archive', true);
            displayMessages += '<table class="table">';
            displayMessages += '<thead>';
            displayMessages += '<tr>';
            displayMessages += '<th scope="col">#</th>';
            displayMessages += '<th scope="col">Description</th>';
            displayMessages += '</tr>';
            displayMessages += '</thead>';
            displayMessages += '<tbody>';
            for (const [childID, childRec] of children) {
              displayMessages += '<tr>';
              displayMessages += `<th scope="row">${childID}</th>`;
              displayMessages += `<td>${childRec.get('description')}</td>`;
              displayMessages += '</tr>';
            }
            displayMessages += '</tbody>';
            displayMessages += '</table>';
          } else this.setCache('down', true);
          this.setCache('messages', displayMessages);
        } else if (elemRec.has('type')) {
          const valueDB = recDB.get(elemName);
          if (elemName === 'messages') this.setCache(elemName, displayMessages);
          else if (valueDB === undefined) this.setCache(elemName, '');
          else if (elemRec.get('type') === 'datetime-local' && valueDB) {
            const utc = UtcConv.getLocalDateTime(valueDB);
            this.setCache(elemName, utc);
          } else this.setCache(elemName, valueDB);
          if (elemName === 'parent') {
            if (this.db.hasID(valueDB)) this.setCache('up', false);
            else this.setCache('up', true);
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

  postData() {
    const messages = new Messages();
    const id = this.controls.get('id').get('cache');

    if (this.canInsert(id, this.db)) this.postNew();
    else this.postLoad();
    if (this.canUpdate(id, this.db)) {
      this.setCache('update', false);
    } else if (!this.controls.get('update').get('cache')) {
      this.setCache('update', true);
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

  setParent(parent) {
    this.setCache('parent', parent);
    if (!parent || this.db.hasID(parent)) this.setCache('up', false);
    else this.setCache('up', true);
  }

  setData(id, value) {
    this.setCache(id, value);
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
