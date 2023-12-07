import UtcConv from './utcconv.js';

export default class DataTransfer {
  view2db = (db) => {
    const rec = new Map();
    for (const [elemName, elemRec] of this.data) {
      elemRec.set('value', elemRec.get('elemID').value);
      rec.set(elemName, elemRec.get('value'));
    }
    this.rec2db(db, rec);
  };

  rec2db = (db, rec) => {
    const recID = Number(rec.get('id'));
    if (recID) {
      for (const [elemName, elemRec] of this.data) {
        if (elemName !== 'id') {
          const recValue = rec.get(elemName);
          if (recValue) {
            const type = elemRec.get('type');
            if (type === Number) {
              db.setRec(
                recID,
                elemName,
                Number(recValue),
              );
            } else if (type === 'datetime-local') {
              db.setRec(
                recID,
                elemName,
                UtcConv.getUTCDateTime(recValue),
              );
            } else {
              db.setRec(recID, elemName, recValue);
            }
          } else if (db.hasID(recID)) { db.deleteField(recID, elemName); }
        }
      }
    }
  };

  fillView() {
    for (const properties of this.data.values()) {
      if (properties.has('value') && properties.get('elemID')) {
        properties.get('elemID').value = properties.get('value');
      }
    }
  }

  tranferView() {
    for (const properties of this.data.values()) {
      properties.set('value', properties.get('elemID').value);
    }
  }

  db2view(db, id) {
    let idDB = id || this.data.get('id').get('elemID').value;
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
      const valueView = elemRec.get('value');
      if (elemName === 'parent'
      && valueView
      && !keys.has(Number(valueView))) { return false; }
      if (elemName !== 'id' && dbRec === undefined && valueView) return true;
    }
    return false;
  }

  constructor(data) {
    this.data = data;
  }
}
