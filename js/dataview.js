import UtcConv from './utcconv.js';

export default class DataView {
  data = new Map(
    [
      ['id', new Map([
        ['elemID', null],
        ['type', Number]])],
      ['created', new Map([
        ['elemID', null],
        ['type', 'datetime-local']])],
      ['priority', new Map([
        ['elemID', null],
        ['type', Number]])],
      ['description', new Map([
        ['elemID', null],
        ['type', String]])],
      ['due', new Map([
        ['elemID', null],
        ['type', 'datetime-local']])],
    ],
  );

  db2view(id) {
    let recDB;
    let nextID = id;
    if (id === undefined) [nextID, recDB] = this.db.getIter().next().value;
    else recDB = this.db.getRec(id);
    if (recDB) this.data.get('id').get('elemID').value = nextID;
    for (const [elem, value] of recDB) {
      if (this.data.get(elem).get('type') === 'datetime-local' && value) {
        const utc = UtcConv.getLocalDateTime(value);
        this.data.get(elem).get('elemID').value = utc;
      } else this.data.get(elem).get('elemID').value = value;
    }
  }

  view2db() {
    let id;
    for (const [elemName, elemRec] of this.data) {
      const { value } = elemRec.get('elemID');
      const type = elemRec.get('type');
      if (elemName === 'id') {
        id = Number(value);
      } else if (type === Number) {
        this.db.setRec(id, elemName, Number(value));
      } else if (type === 'datetime-local' && value) {
        this.db.setRec(id, elemName, UtcConv.getUTCDateTime(value));
      } else if (type === 'datetime-local') {
        this.db.setRec(id, elemName, null);
      } else {
        this.db.setRec(id, elemName, value);
      }
    }
  }

  constructor(db) {
    this.db = db;
    for (const [field, attributes] of this.data) {
      const elemID = document.getElementById(field);
      attributes.set('elemID', elemID);
    }
  }
}
