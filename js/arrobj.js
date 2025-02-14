import Db from './db.js';

export default class ArrObj {
  static getLocalDateTime(utcString) {
    try {
      const utc = utcString === undefined ? new Date() : new Date(utcString);
      utc.setMinutes(utc.getMinutes() - utc.getTimezoneOffset());
      const local = utc.toISOString();
      return `${local.slice(0, 10)} ${local.slice(11, 16)}`;
    } catch (error) { return utcString; }
  }

  static getUTCDateTime(localString) {
    try {
      return new Date(localString).toISOString();
    } catch (error) { return localString; }
  }

  static obj2Map(rowObj) {
    const rowMap = new Map();
    for (const [label, value] of Object.entries(rowObj)) {
      if (label === 'created') rowMap.set(label, ArrObj.getUTCDateTime(value));
      else if (label !== 'id') rowMap.set(label, value);
    }
    return rowMap;
  }

  static map2Obj(id, rowMap) {
    const objRow = {};
    for (const [label, value] of rowMap) {
      if (label === 'created') objRow[label] = ArrObj.getLocalDateTime(value);
      else objRow[label] = value;
    }
    if (Object.keys(objRow).length) objRow.id = id;
    return objRow;
  }

  setArrObj(objRow) {
    if (Array.isArray(objRow)) {
      for (const row of objRow) this.db.db.set(row.id, ArrObj.obj2Map(row));
    } else this.db.db.set(objRow.id, ArrObj.obj2Map(objRow));
  }

  getArrObj(id) {
    if (id === undefined) {
      const arrObj = [];
      for (const [rowid, row] of this.db.db) arrObj.push(ArrObj.map2Obj(rowid, row));
      return arrObj;
    }
    return ArrObj.map2Obj(id, this.db.db.get(id));
  }

  constructor(db) {
    if (db !== undefined) this.db = db; else this.db = new Db();
  }
}
