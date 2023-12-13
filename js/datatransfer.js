import UtcConv from './utcconv.js';

export default class DataTransfer {
  view2db(db) {
    const rec = new Map();
    for (const [elemName, elemRec] of this.data) {
      rec.set(elemName, elemRec.get('value'));
    }
    this.rec2db(db, rec);
  }

  rec2db(db, rec) {
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
  }

  canUpdate(viewID, db) {
    const dbRec = db.getRec(viewID);
    if (dbRec === undefined) return false;
    for (const [elemName, elemRec] of this.data) {
      if (elemName !== 'id') {
        const valueView = elemRec.get('value');
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
