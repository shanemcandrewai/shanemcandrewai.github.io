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

  db2view(db, id) {
    let recDB;
    let nextID;
    if (id === undefined) [nextID, recDB] = db.getIter().next().value;
    else {
      nextID = id;
      recDB = db.getRec(id);
    }
    if (recDB) {
      this.data.get('id').get('elemID').value = nextID;
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

  view2db = (db) => {
    const viewID = Number(this.data.get('id').get('elemID').value);
    for (const [elemName, elemRec] of this.data) {
      if (elemName !== 'id') {
        const valueView = elemRec.get('elemID').value;
        const type = elemRec.get('type');
        if (type === Number && valueView) {
          db.setRec(viewID, elemName, Number(valueView));
        } else if (type === 'datetime-local' && valueView) {
          db.setRec(viewID, elemName, UtcConv.getUTCDateTime(valueView));
        } else if (type === 'datetime-local') {
          db.setRec(viewID, elemName, null);
        } else {
          db.setRec(viewID, elemName, valueView);
        }
      }
    }
  };

  needsUpdate(viewID, db) {
    const dbRec = db.getRec(viewID);
    if (dbRec === undefined) return false;
    for (const [elemName, elemRec] of this.data) {
      if (elemName !== 'id') {
        const valueView = elemRec.get('elemID').value;
        const type = elemRec.get('type');
        const valueDB = dbRec.get(elemName);
        if (type === Number && valueView) {
          if (valueDB !== Number(valueView)) return true;
        } else if (type === 'datetime-local' && valueView) {
          if (valueDB !== UtcConv.getUTCDateTime(valueView)) return true;
        } else if (type === 'datetime-local') {
          if (valueDB) return true;
        } else if (valueDB !== valueView) return true;
      }
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

  constructor(controlview) {
    this.controlview = controlview;
  }
}
