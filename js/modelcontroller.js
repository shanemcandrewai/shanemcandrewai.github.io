import Messages from './messages.js';
import Db from './db.js';
import UtcConv from './utcconv.js';

export default class ModelController {
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
      if (this.controls.get('id').get('cache') !== idDB) {
        this.controls.get('id').set('cache', idDB);
        this.controls.get('id').set('write', true);
      }
      const classMessages = new Messages();
      let displayMessages = classMessages.getDisplay();
      for (const [elemName, elemRec] of this.controls) {
        if (elemName === 'id') {
          const children = this.db.getChildren(Number(idDB));
          if (children.size) {
            this.controls.get('down').set('cache', false);
            this.controls.get('down').set('write', true);
            this.controls.get('archive').set('cache', true);
            this.controls.get('archive').set('write', true);
            for (const [childID, childRec] of children) {
              displayMessages += `${childID}: ${childRec.get('description')}\n`;
            }
          } else {
            this.controls.get('down').set('cache', true);
            this.controls.get('down').set('write', true);
          }
          this.controls.get('messages').set('cache', displayMessages);
          this.controls.get('messages').set('write', true);
        } else if (elemRec.has('type')) {
          const valueDB = recDB.get(elemName);
          if (elemName === 'messages') {
            elemRec.set('cache', displayMessages);
            elemRec.set('write', true);
          } else if (valueDB === undefined) {
            elemRec.set('cache', '');
            elemRec.set('write', true);
          } else if (elemRec.get('type') === 'datetime-local' && valueDB) {
            const utc = UtcConv.getLocalDateTime(valueDB);
            elemRec.set('cache', utc);
            elemRec.set('write', true);
          } else {
            elemRec.set('cache', valueDB);
            elemRec.set('write', true);
          }
          if (elemName === 'parent') {
            if (this.db.hasID(valueDB)) {
              this.controls.get('up').set('cache', false);
              this.controls.get('up').set('write', true);
            } else {
              this.controls.get('up').set('cache', true);
              this.controls.get('up').set('write', true);
            }
          }
        }
      }
    }
    return new Map([['system',
      new Map([['record read from DB', idDB]]),
    ]]);
  }

  postLoad() {
    if (this.controls.get('new').get('cache')) {
      this.controls.get('new').set('cache', false);
      this.controls.get('new').set('write', true);
    }
    if (!this.controls.get('insert').get('cache')) {
      this.controls.get('insert').set('cache', true);
      this.controls.get('insert').set('write', true);
    }
    if (!this.controls.get('update').get('cache')) {
      this.controls.get('update').set('cache', true);
      this.controls.get('update').set('write', true);
    }
    if (this.controls.get('delete').get('cache')) {
      this.controls.get('delete').set('cache', false);
      this.controls.get('delete').set('write', true);
    }
    this.postNextprev();
  }

  postNew() {
    if (!this.controls.get('new').get('cache')) {
      this.controls.get('new').set('cache', true);
      this.controls.get('new').set('write', true);
    }
    if (this.controls.get('insert').get('cache')) {
      this.controls.get('insert').set('cache', false);
      this.controls.get('insert').set('write', true);
    }
    if (!this.controls.get('update').get('cache')) {
      this.controls.get('update').set('cache', true);
      this.controls.get('update').set('write', true);
    }
    if (!this.controls.get('delete').get('cache')) {
      this.controls.get('delete').set('cache', true);
      this.controls.get('delete').set('write', true);
    }
  }

  postView2db() {
    if (this.controls.get('new').get('cache')) {
      this.controls.get('new').set('cache', false);
      this.controls.get('new').set('write', true);
    }
    if (!this.controls.get('insert').get('cache')) {
      this.controls.get('insert').set('cache', true);
      this.controls.get('insert').set('write', true);
    }
    if (!this.controls.get('update').get('cache')) {
      this.controls.get('update').set('cache', true);
      this.controls.get('update').set('write', true);
    }
    if (this.controls.get('delete').get('cache')) {
      this.controls.get('delete').set('cache', false);
      this.controls.get('delete').set('write', true);
    }
    this.controls.get('save').set('cache', false);
    this.controls.get('save').set('write', true);
  }

  postData() {
    const messages = new Messages();
    const id = this.controls.get('id').get('cache');

    if (this.canInsert(id, this.db)) {
      if (!this.controls.get('new').get('cache')) {
        this.controls.get('new').set('cache', true);
        this.controls.get('new').set('write', true);
      }
      if (this.controls.get('insert').get('cache')) {
        this.controls.get('insert').set('cache', false);
        this.controls.get('insert').set('write', true);
      }
      if (!this.controls.get('archive').get('cache')) {
        this.controls.get('archive').set('cache', true);
        this.controls.get('archive').set('write', true);
      }
    } else {
      if (this.controls.get('new').get('cache')) {
        this.controls.get('new').set('cache', false);
        this.controls.get('new').set('write', true);
      }
      if (!this.controls.get('insert').get('cache')) {
        this.controls.get('insert').set('cache', true);
        this.controls.get('insert').set('write', true);
      }
      if (this.controls.get('archive').get('cache')) {
        this.controls.get('archive').set('cache', false);
        this.controls.get('archive').set('write', true);
      }
    }
    if (this.canUpdate(id, this.db)) {
      if (this.controls.get('update').get('cache')) {
        this.controls.get('update').set('cache', false);
        this.controls.get('update').set('write', true);
      }
    } else if (!this.controls.get('update').get('cache')) {
      this.controls.get('update').set('cache', true);
      this.controls.get('update').set('write', true);
    }
    if (this.db.getRec(id)) {
      if (this.controls.get('delete').get('cache')) {
        this.controls.get('delete').set('cache', false);
        this.controls.get('delete').set('write', true);
      }
    } else if (!this.controls.get('delete').get('cache')) {
      this.controls.get('delete').set('cache', true);
      this.controls.get('delete').set('write', true);
    }

    return messages;
  }

  postNextprev(id) {
    let viewID = 1;
    if (id !== undefined) viewID = id;
    else if (this.controls.get('id').get('cache')) viewID = this.controls.get('id').get('cache');
    const viewParent = this.controls.get('parent').get('cache');
    this.controls.get('next').set('cache', true);
    this.controls.get('next').set('write', true);
    const keys = new Uint32Array([...this.db.getMap().keys()]).sort();
    for (const key of keys) {
      if (key > Number(viewID)
        && ((viewParent && this.db.getRec(key).get('parent') === Number(viewParent))
        || (!viewParent && !this.db.getRec(key).get('parent')))) {
        this.controls.get('next').set('cache', false);
        this.controls.get('next').set('write', true);
        break;
      }
    }
    this.controls.get('previous').set('cache', true);
    this.controls.get('previous').set('write', true);
    keys.reverse();
    for (const key of keys) {
      if (key < Number(viewID)
        && ((viewParent && this.db.getRec(key).get('parent') === Number(viewParent))
        || (!viewParent && !this.db.getRec(key).get('parent')))) {
        this.controls.get('previous').set('cache', false);
        this.controls.get('previous').set('write', true);
        break;
      }
    }
  }

  constructor(controls) {
    this.db = new Db();
    this.controls = controls;
  }
}
