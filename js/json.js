import Db from './db.js';

export default class Json {
  getBlob = () => {
    const strObj = this.db.getString();
    return new Blob(
      [strObj],
      { type: 'application/json' },
    );
  };

  readFile = async (file) => this.readText(await file.text());

  getString = (spacer = 2) => this.db.getString(spacer);

  readText = (text) => {
    const fileObj = Db.obj2Map(JSON.parse(text, null));
    for (const [key, rec] of fileObj) {
    // shane to do - add Array case
      this.setRec(key, rec);
    }
    return fileObj.size;
  };

  getRec = (id) => this.db.getRec(id);

  hasRec = (id) => this.db.hasRec(id);

  setRec = (key, value, parentRec, position, append) => this.db.setRec(
    key,
    value,
    parentRec,
    position,
    append,
  );

  getMap = () => this.db.getMap();

  hasID = (id) => this.db.hasID(id);

  getChildren = (id) => this.db.getRecChildren(id);

  size = () => this.db.size();

  deleteRec = (id, parentRec) => { this.db.deleteRec(id, parentRec); };

  deleteField = (id, elemName) => { this.db.deleteField(id, elemName); };

  constructor(map) {
    if (map !== undefined) this.db = new Db(map); else this.db = new Db();
  }
}
