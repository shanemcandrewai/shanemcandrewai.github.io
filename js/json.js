import Db from './db.js';

export default class Json {
  static obj2Map = (obj, map = new Map()) => {
    if (Array.isArray(obj)) {
      const newArr = [];
      for (const va of obj.values()) {
        if (typeof (va) === 'object' && va !== null) {
          newArr.push(Json.obj2Map(va));
        } else newArr.push(va);
      }
      return newArr;
    }
    for (const [k, v] of Object.entries(obj)) {
      if (typeof (v) === 'object' && v !== null) {
        map.set(k, Json.obj2Map(v));
      } else map.set(k, v);
    }
    return map;
  };

  static map2Obj = (map, obj = {}) => {
    if (Array.isArray(map)) {
      const newArr = [];
      for (const va of map.values()) {
        if (typeof (va) === 'object' && va !== null) {
          newArr.push(Json.map2Obj(va));
        } else newArr.push(va);
      }
      return newArr;
    }
    for (const [k, v] of map) {
      const ob = obj;
      if (v instanceof Map) {
        ob[k] = Json.map2Obj(v);
      } else ob[k] = v;
    }
    return obj;
  };

  static mapEncoder = (key, value) => {
    if (value instanceof Map) {
      return { dataType: 'Map', value: Array.from(value.entries()) };
    }
    return value;
  };

  static mapDecoder = (key, value) => {
    if (typeof value === 'object' && value !== null) {
      if (value.dataType === 'Map') {
        return new Map(value.value);
      }
    }
    return value;
  };

  getBlob = () => {
    const strObj = this.getString();
    return new Blob(
      [strObj],
      { type: 'application/json' },
    );
  };

  getString = (spacer = 2) => JSON.stringify(Json.map2Obj(this.db.db), null, spacer);

  readFile = async (file) => this.readText(await file.text());

  readText = (text) => {
    const fileObj = Json.obj2Map(JSON.parse(text, null));
    for (const [key, rec] of fileObj) {
    // shane to do - add Array case
      if (rec instanceof Map) {
        for (const [label, value] of rec) {
          if (typeof value !== 'number' && !value) rec.delete(label);
        }
      }
      if (rec) this.db.db.set(key, rec);
    }
    return fileObj.size;
  };

  getRec = (id) => this.db.getRec(id);

  hasRec = (id) => this.db.hasRec(id);

  setRec = (key, value, parentRec) => { this.db.setRec(key, value, parentRec); };

  getMap = () => this.db.getMap();

  hasID = (id) => this.db.hasID(id);

  getChildren = (id) => this.db.getChildren(id);

  size = () => this.db.size();

  deleteRec = (id, parentRec) => { this.db.deleteRec(id, parentRec); };

  deleteField = (id, elemName) => { this.db.deleteField(id, elemName); };

  constructor(map) {
    if (map !== undefined) this.db = new Db(map); else this.db = new Db();
  }
}
