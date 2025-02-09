export default class Db {
  getRec = (key, parentRec) => {
    if (parentRec) return parentRec.get(key);
    return this.db.get(String(key));
  };

  setRec = (key, value, parentRec) => {
    let parent = parentRec;
    if (!parent) parent = this.getRec(key);
    if (parent instanceof Map) {
      parent.set(key, value);
    } else if (Array.isArray(parent)) {
      if (key === undefined) parent.push(value);
      else {
        parent.splice(Number(key), 1, value);
      }
    } else this.db.set(key, value);
  };

  deleteRec = (key, parentRec) => {
    if (parentRec instanceof Map) parentRec.delete(key);
    else if (Array.isArray(parentRec)) parentRec.splice(key, 1);
    else this.db.delete(key);
  };

  getMap = () => this.db;

  hasRec = (id) => this.db.has(id);

  getChildren = (id) => {
    const children = new Map();
    for (const [recID, rec] of this.db) {
      if (id === rec.get('parent')) children.set(recID, rec);
    }
    return children;
  };

  size = () => this.db.size;

  deleteField = (id, elemName) => {
    this.db.get(Number(id)).delete(elemName);
  };

  constructor(map) {
    if (map !== undefined) this.db = map; else this.db = new Map();
  }
}
