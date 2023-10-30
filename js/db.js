export default class Db {
  getRec(id) { return this.db.get(Number(id)); }

  setRec(id, field, val) {
    if (this.db.has(Number(id))) {
      const dbRec = this.db.get(Number(id));
      dbRec.set(field, val);
    } else this.db.set(Number(id), new Map([[field, val]]));
  }

  getIter() { return this.db[Symbol.iterator](); }

  getMap() { return this.db; }

  hasID(id) { return this.db.has(Number(id)); }

  size() { return this.db.size; }

  deleteRec(id) { this.db.delete(Number(id)); }

  constructor(map) {
    if (map !== undefined) this.db = map; else this.db = new Map();
  }
}
