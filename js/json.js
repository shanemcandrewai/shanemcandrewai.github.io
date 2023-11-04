import Db from './db.js';

export default class Json {
  static mapEncoder(key, value) {
    if (value instanceof Map) {
      return { dataType: 'Map', value: Array.from(value.entries()) };
    }
    return value;
  }

  static mapDecoder(key, value) {
    if (typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value);
      }
    }
    return value;
  }

  getBlob() {
    const strObj = JSON.stringify(this.db.db, Json.mapEncoder, 2);
    return new Blob(
      [strObj],
      { type: 'application/json' },
    );
  }

  async readFile(file) {
    const fileObj = JSON.parse(await file.text(), Json.mapDecoder);
    for (const [key, rec] of fileObj) {
      for (const [label, value] of rec) if (!value) rec.delete(label);
      if (rec) this.db.db.set(key, rec);
    }
  }

  getRec(id) { return this.db.getRec(id); }

  setRec(id, field, val) { this.db.setRec(id, field, val); }

  getIter() { return this.db.getIter(); }

  getMap() { return this.db.getMap(); }

  hasID(id) { return this.db.hasID(id); }

  size() { return this.db.size(); }

  deleteRec(id) { this.db.deleteRec(id); }

  constructor(map) {
    if (map !== undefined) this.db = new Db(map); else this.db = new Db();
  }
}
