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
    for (const [key, value] of fileObj) this.db.db.set(key, value);
  }

  getRec(id) { return this.db.getRec(id); }

  setRec(id, field, val) { this.db.setRec(id, field, val); }

  getIter() { return this.db.getIter(); }

  constructor(db) {
    if (db !== undefined) this.db = db; else this.db = new Db();
  }
}
