import { mapEncoder, mapDecoder } from './converters.js';
import { read, utils } from './xlsx.mjs';

let db = new Map();

export const getRecDb = (id) => db.get(id);

export const empty = () => {
  db = new Map();
  return 'DB succesfully emptied';
};

export const insertRec = (viewRec) => {
  const key = viewRec.get('id');
  const val = db.get(key);
  if (val) return JSON.stringify(val, mapEncoder);
  viewRec.delete('id');
  db.set(key, viewRec);
  return 'Record successfully inserted';
};

export const updateRec = (viewRec) => {
  const key = viewRec.get('id');
  viewRec.delete('id');
  db.set(key, viewRec);
  return 'Record successfully updated';
};
export const deleteRec = (id) => {
  if (db.delete(id)) return 'Record successfully deleted';
  return 'Record deletion failed';
};

export const getDbFromArrayObjs = (arrayObjs) => {
  empty();
  for (const [ind, obj] of arrayObjs.entries()) {
    const row = new Map();
    for (const [label, col] of Object.entries(obj)) {
      row.set(label, col);
    }
    db.set(ind, row);
  }
};

export const readFile = async (file) => {
  if (file) {
    if (file.name.split('.').pop() === 'xlsx') {
      const wb = read(await file.arrayBuffer());
      getDbFromArrayObjs(utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]));
    } else db = JSON.parse(await file.text(), mapDecoder);
  }
};

export const getdbBlob = () => new Blob(
  [JSON.stringify(db, mapEncoder, 2)],
  { type: 'application/json' },
);

export const getArrayObjs = () => {
  db = new Map([...db.entries()].sort());
  const dbArray = [];
  for (const cols of db.values()) {
    const rowobj = {};
    for (const [label, value] of cols) rowobj[label] = value;
    dbArray.push(rowobj);
  }
  return dbArray;
};

export const getMaxID = () => Math.max(...db.keys());
