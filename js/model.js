export const recStruct = ['id', 'created', 'priority', 'description', 'due'];

let db = [];

export const setdb = (dbin) => { db = dbin; };
export const getdb = () => db;

export const readFile = async (files) => {
  if (files.length) {
    db = JSON.parse(await files[0].text());
  }
};

export const getRec = (id) => db[id];
export const insertRec = (rec) => db.push(rec);
