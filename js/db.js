export default class Db {
  static obj2Map = (obj, map = new Map()) => {
    if (Array.isArray(obj)) {
      const newArr = [];
      for (const va of obj.values()) {
        if (typeof (va) === 'object' && va !== null) {
          newArr.push(Db.obj2Map(va));
        } else newArr.push(va);
      }
      return newArr;
    }
    for (const [k, v] of Object.entries(obj)) {
      if (typeof (v) === 'object' && v !== null) {
        map.set(k, Db.obj2Map(v));
      } else map.set(k, v);
    }
    return map;
  };

  static map2Obj = (map, obj = {}) => {
    if (Array.isArray(map)) {
      const newArr = [];
      for (const va of map.values()) {
        if (typeof (va) === 'object' && va !== null) {
          newArr.push(Db.map2Obj(va));
        } else newArr.push(va);
      }
      return newArr;
    }
    for (const [k, v] of map) {
      const ob = obj;
      if (v instanceof Map) {
        ob[k] = Db.map2Obj(v);
      } else ob[k] = v;
    }
    return obj;
  };

  getRec = (key, parentRec) => {
    if (parentRec) return parentRec.get(key);
    return this.db.get(String(key));
  };

  setRec = (key, value, parentRec, position) => {
    let parent = parentRec;
    if (!parent) parent = this.getRec(key);
    if (parent instanceof Map) {
      if (position === undefined) parent.set(key, value);
      else {
        const parentNew = new Map(parent);
        parent.clear();
        const parentEntries = parentNew.entries();
        let parentEntry = parentEntries.next();
        for (parentNew; !parentEntry.done; parentEntry = parentEntries.next()) {
          parent.set(parentEntry.value[0], parentEntry.value[1]);
          if (position === parentEntry.value[0]) parent.set(key, value);
        }
      }
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

  getString = (spacer = 2) => JSON.stringify(Db.map2Obj(this.db), null, spacer);

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
