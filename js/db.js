export default class Db {
  getRec(id) {
    if (id) return this.db.get(Number(id));
    return undefined;
  }

  setRec(id, field, val) {
    if (id && field) {
      if (typeof val === 'number' || val || val === undefined) {
        const dbRec = this.db.get(Number(id));
        if (dbRec !== undefined) {
          if (val === undefined) {
            dbRec.delete(field);
          } else {
            dbRec.set(field, val);
          }
        } else this.db.set(Number(id), new Map([[field, val]]));
      }
    }
  }

  getIter() { return this.db[Symbol.iterator](); }

  getMap() { return this.db; }

  hasID(id) { return this.db.has(Number(id)); }

  size() { return this.db.size; }

  deleteRec(id) { this.db.delete(Number(id)); }

  deleteField(id, elemName) { this.db.get(id).delete(elemName); }

  constructor(map) {
    if (map !== undefined) this.db = map; else this.db = new Map();
  }
}
