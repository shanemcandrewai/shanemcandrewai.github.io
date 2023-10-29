export default class Db {
  db = new Map();

  getRec(id) { return this.db.get(Number(id)); }

  setRec(id, field, val) {
    if (this.db.has(Number(id))) {
      const dbRec = this.db.get(Number(id));
      dbRec.set(field, val);
    } else this.db.set(Number(id), new Map([[field, val]]));
  }

  getIter() { return this.db[Symbol.iterator](); }

  hasID(id) { return this.db.has(Number(id)); }

  size() { return this.db.size; }

  deleteRec(id) { this.db.delete(Number(id)); }
}
