import UtcConv from './utcconv.js';
import Db from './db.js';

export default class ArrObj {
  static obj2Map(rowObj) {
    const rowMap = new Map();
    for (const [label, value] of Object.entries(rowObj)) {
      if (label === 'created') rowMap.set(label, UtcConv.getUTCDateTime(value));
      else if (label !== 'id') rowMap.set(label, value);
    }
    return rowMap;
  }

  static map2Obj(id, rowMap) {
    const objRow = {};
    for (const [label, value] of rowMap) {
      if (label === 'created') objRow[label] = UtcConv.getLocalDateTime(value);
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
