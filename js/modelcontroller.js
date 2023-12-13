import DataTransfer from './datatransfer.js';
import Messages from './messages.js';
import Db from './db.js';
import UtcConv from './utcconv.js';

export default class ModelController {
  db = new Db();

  fillView() {
    for (const properties of this.data.values()) {
      if (properties.has('elemID') && properties.has('value')) {
        properties.get('elemID').value = properties.get('value');
      }
    }
  }

  db2view(db, id) {
    let idDB = id || this.data.get('id').get('value');
    let recDB = db.getRec(idDB);
    if (!recDB) { [idDB, recDB] = db.getMap()[Symbol.iterator]().next().value; }
    if (idDB) {
      this.data.get('id').set('value', idDB);
      for (const [elemName, elemRec] of this.data) {
        if (elemName !== 'id') {
          const valueDB = recDB.get(elemName);
          if (valueDB === undefined) {
            elemRec.set('value', '');
          } else if (elemRec.get('type') === 'datetime-local' && valueDB) {
            const utc = UtcConv.getLocalDateTime(valueDB);
            elemRec.set('value', utc);
          } else elemRec.set('value', valueDB);
        }
      }
      this.fillView();
    }
    return new Map([['system',
      new Map([['record read from DB', idDB]]),
    ]]);
  }

  setSave() {
    if (this.db.size()) {
      this.controls.get('save').set('disabled', false);
    } else {
      this.controls.get('save').set('disabled', true);
    }
  }

  setLoad() {
    if ((this.controls.get('uploadInput').get('fileName')
         || this.controls.get('codetokenInput').get('value'))
     && typeof this.db.readFile !== 'undefined') {
      this.controls.get('load').set('disabled', false);
    } else {
      this.controls.get('load').set('disabled', true);
    }
  }

  disableNav() {
    this.controls.get('insert').set('disabled', true);
    this.controls.get('delete').set('disabled', true);
    this.controls.get('update').set('disabled', true);
    this.controls.get('next').set('disabled', true);
    this.controls.get('previous').set('disabled', true);
    this.controls.get('up').set('disabled', true);
    this.controls.get('down').set('disabled', true);
    this.controls.get('archive').set('disabled', true);
  }

  setNav(viewID) {
    if (this.datatransfer.canInsert(viewID, this.db)) {
      this.controls.get('new').set('disabled', true);
      this.controls.get('insert').set('disabled', false);
      this.controls.get('archive').set('disabled', true);
    } else {
      this.controls.get('new').set('disabled', false);
      this.controls.get('insert').set('disabled', true);
      this.controls.get('archive').set('disabled', false);
    }
    if (this.datatransfer.canUpdate(viewID, this.db)) {
      this.controls.get('update').set('disabled', false);
    } else {
      this.controls.get('update').set('disabled', true);
    }
    if (this.db.getRec(viewID)) {
      this.controls.get('delete').set('disabled', false);
    } else {
      this.controls.get('delete').set('disabled', true);
    }
  }

  setNextPrev(viewID, viewParent) {
    this.controls.get('next').set('disabled', true);
    const keys = new Uint32Array([...this.db.getMap().keys()]).sort();
    for (const key of keys) {
      if (key > Number(viewID)
        && ((viewParent && this.db.getRec(key).get('parent') === Number(viewParent))
        || (!viewParent && !this.db.getRec(key).get('parent')))) {
        this.controls.get('next').set('disabled', false);
        break;
      }
    }
    this.controls.get('previous').set('disabled', true);
    keys.reverse();
    for (const key of keys) {
      if (key < Number(viewID)
        && ((viewParent && this.db.getRec(key).get('parent') === Number(viewParent))
        || (!viewParent && !this.db.getRec(key).get('parent')))) {
        this.controls.get('previous').set('disabled', false);
        break;
      }
    }
  }

  setUp(viewParent) {
    if (this.db.getRec(Number(viewParent))) {
      this.controls.get('up').set('disabled', false);
    } else {
      this.controls.get('up').set('disabled', true);
    }
  }

  updateControls(messages) {
    const classMessages = (messages instanceof Messages) ? messages : new Messages();
    this.setSave();
    this.setLoad();

    const viewID = this.data.get('id').get('value');
    if (!viewID) {
      this.disableNav();
    } else {
      this.setNav(viewID);
      const viewParent = this.data.get('parent').get('value');
      this.setNextPrev(viewID, viewParent);
      this.setUp(viewParent);

      let displayMessages = classMessages.getDisplay();
      const children = this.db.getChildren(Number(viewID));
      if (children.size) {
        this.controls.get('down').set('disabled', false);
        this.controls.get('archive').set('disabled', true);
        for (const [childID, childRec] of children) {
          displayMessages += `${childID}: ${childRec.get('description')}\n`;
        }
      } else {
        this.controls.get('down').set('disabled', true);
      }
      this.controls.get('messages').set('innerText', displayMessages);
    }
    for (const properties of this.controls.values()) {
      if (properties.has('disabled') && properties.get('elemID')) {
        properties.get('elemID').disabled = properties.get('disabled');
      }
      if (properties.has('innerText') && properties.get('elemID')) {
        properties.get('elemID').innerText = properties.get('innerText');
      }
    }
  }

  constructor(controls, data) {
    this.controls = controls;
    this.data = data;
    this.datatransfer = new DataTransfer(data);
  }
}
