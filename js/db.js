export default class Db {
  getRec(key, parentRec) {
    if (parentRec) return parentRec.get(key);
    return this.db.get(String(key));
  }

  setRec(key, value, parentRec) {
    if (parentRec instanceof Map) {
      parentRec.set(key, value);
    } else if (Array.isArray(parentRec)) {
      if (key === undefined) parentRec.push(value);
      else {
        parentRec.splice(Number(key), 1, value);
      }
    } else this.db.set(key, value);
  }

  deleteRec(key, parentRec) {
    if (parentRec instanceof Map) parentRec.delete(key);
    else if (Array.isArray(parentRec)) parentRec.splice(key, 1);
    else this.db.delete(key);
  }

  getMap() { return this.db; }

  hasID(id) { return this.db.has(id); }

  getChildren(id) {
    const children = new Map();
    for (const [recID, rec] of this.db) {
      if (id === rec.get('parent')) children.set(recID, rec);
    }
    return children;
  }

  size() { return this.db.size; }

  deleteField(id, elemName) {
    this.db.get(Number(id)).delete(elemName);
  }

  constructor(map) {
    if (map !== undefined) this.db = map; else this.db = new Map();
  }
}
