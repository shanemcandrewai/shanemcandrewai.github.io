export default class Db {
  db = new Map();

  getRec(id) { return this.db.get(id); }

  setRec(id, field, val) {
    if (this.db.has(id)) {
      const dbRec = this.db.get(id);
      dbRec.set(field, val);
    } else this.db.set(id, new Map([[field, val]]));
  }

  getIter() { return this.db[Symbol.iterator](); }
}
