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
    const strObj = this.getString();
    return new Blob(
      [strObj],
      { type: 'application/json' },
    );
  }

  getString(spacer = 2) {
    return JSON.stringify(this.db.db, Json.mapEncoder, spacer);
  }

  async readFile(file) {
    return this.readText(await file.text());
  }

  readText(text) {
    const fileObj = JSON.parse(text, Json.mapDecoder);
    for (const [key, rec] of fileObj) {
      if (rec instanceof Map) {
        for (const [label, value] of rec) {
          if (typeof value !== 'number' && !value) rec.delete(label);
        }
      }
      if (rec) this.db.db.set(key, rec);
    }
    return fileObj.size;
  }

  getRec(id) { return this.db.getRec(id); }

  setRec(key, value, parentRec) { this.db.setRec(key, value, parentRec); }

  getMap() { return this.db.getMap(); }

  hasID(id) { return this.db.hasID(id); }

  getChildren(id) { return this.db.getChildren(id); }

  size() { return this.db.size(); }

  deleteRec(id, parentRec) { this.db.deleteRec(id, parentRec); }

  deleteField(id, elemName) { this.db.deleteField(id, elemName); }

  constructor(map) {
    if (map !== undefined) this.db = new Db(map); else this.db = new Db();
  }
}
