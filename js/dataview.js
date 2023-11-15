import UtcConv from './utcconv.js';

export default class DataView {
  data = new Map(
    [
      ['id', new Map([
        ['elemID', null],
        ['type', Number],
        ['event', 'keyup']])],
      ['parent', new Map([
        ['elemID', null],
        ['type', Number],
        ['event', 'keyup']])],
      ['created', new Map([
        ['elemID', null],
        ['type', 'datetime-local'],
        ['event', 'change']])],
      ['priority', new Map([
        ['elemID', null],
        ['type', Number],
        ['event', 'keyup']])],
      ['description', new Map([
        ['elemID', null],
        ['type', String],
        ['event', 'keyup']])],
      ['due', new Map([
        ['elemID', null],
        ['type', 'datetime-local'],
        ['event', 'change']])],
    ],
  );

  view2db = (db) => {
    const viewID = this.data.get('id').get('elemID').value;
    if (viewID) {
      for (const [elemName, elemRec] of this.data) {
        if (elemName !== 'id') {
          const valueView = elemRec.get('elemID').value;
          if (valueView) {
            const type = elemRec.get('type');
            if (type === Number) {
              db.setRec(
                Number(viewID),
                elemName,
                Number(valueView),
              );
            } else if (type === 'datetime-local') {
              db.setRec(
                Number(viewID),
                elemName,
                UtcConv.getUTCDateTime(valueView),
              );
            } else {
              db.setRec(viewID, elemName, valueView);
            }
          } else if (db.hasID(Number(viewID))) { db.deleteField(Number(viewID), elemName); }
        }
      }
    }
  };

  db2view(db, id) {
    let idDB = id || this.data.get('id').get('elemID').value;
    let recDB = db.getRec(idDB);
    if (!recDB) { [idDB, recDB] = db.getMap()[Symbol.iterator]().next().value; }
    if (idDB) {
      this.data.get('id').get('elemID').value = idDB;
      for (const [elemName, elemRec] of this.data) {
        if (elemName !== 'id') {
          const valueDB = recDB.get(elemName);
          if (valueDB === undefined) {
            elemRec.get('elemID').value = '';
          } else if (elemRec.get('type') === 'datetime-local' && valueDB) {
            const utc = UtcConv.getLocalDateTime(valueDB);
            elemRec.get('elemID').value = utc;
          } else elemRec.get('elemID').value = valueDB;
        }
      }
    }
  }

  canUpdate(viewID, db) {
    const dbRec = db.getRec(viewID);
    if (dbRec === undefined) return false;
    for (const [elemName, elemRec] of this.data) {
      if (elemName !== 'id') {
        const valueView = elemRec.get('elemID').value;
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

  canInsert(viewID, db) {
    if (!viewID) return false;
    const dbRec = db.getRec(viewID);
    const keys = new Set([...db.getMap().keys()]);
    for (const [elemName, elemRec] of this.data) {
      const valueView = elemRec.get('elemID').value;
      if (elemName === 'parent'
      && valueView
      && !keys.has(Number(valueView))) { return false; }
      if (elemName !== 'id' && dbRec === undefined && valueView) return true;
    }
    return false;
  }

  dataListener = () => {
    this.controlview.updateControls();
  };

  callbacks = new Map(
    [
      ['id', this.dataListener],
      ['parent', this.dataListener],
      ['created', this.dataListener],
      ['priority', this.dataListener],
      ['description', this.dataListener],
      ['due', this.dataListener],
    ],
  );

  constructor() {
    for (const [elem, elemRec] of this.data) {
      const elemID = document.getElementById(elem);
      elemRec.set('elemID', elemID);
      if (elemRec.has('event')) {
        elemID.addEventListener(elemRec.get('event'), this.callbacks.get(elem));
      }
    }
  }
}
