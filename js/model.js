let db = new Map();

export const getRec = (id) => db.get(id);

export const mapEncoder = (key, value) => {
  if (value instanceof Map) {
    return { dataType: 'Map', value: Array.from(value.entries()) };
  }
  return value;
};

const mapDecoder = (key, value) => {
  if (typeof value === 'object' && value !== null) {
    if (value.dataType === 'Map') { return new Map(value.value); }
  }
  return value;
};

export const insertRec = (viewRec) => {
  const key = viewRec.get('id');
  const val = db.get(key);
  if (val) return JSON.stringify(val, mapEncoder);
  viewRec.delete('id');
  db.set(key, viewRec);
  return 'successfully inserted';
};

export const updateRec = (viewRec) => {
  const key = viewRec.get('id');
  viewRec.delete('id');
  db.set(key, viewRec);
  return 'successfully updated';
};

export const readFile = async (file) => {
  if (file) db = JSON.parse(await file.text(), mapDecoder);
};

export const getdbBlob = () => new Blob([JSON.stringify(db, mapEncoder, 2)], { type: 'application/json' });
