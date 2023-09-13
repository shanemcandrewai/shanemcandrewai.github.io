import {
  readFile, getRec, getdb, insertRec, recStruct,
} from './model.js';

const selectFile = document.getElementById('selectFile');
const uploadInput = document.getElementById('uploadInput');
const load = document.getElementById('load');
const save = document.getElementById('save');
const insert = document.getElementById('insert');

const view = {};
for (const element of recStruct) {
  view[element] = document.getElementById(element);
}

const messages = document.getElementById('messages');

const changeEventCB = async () => {
  save.disabled = false;
  load.disabled = false;
  selectFile.innerText = uploadInput.files[0].name;
};

const fillView = (idin) => {
  const rec = getRec(idin);
  for (const [k, v] of Object.entries(view)) {
    v.value = rec[k];
  }
};

const loadCB = async () => {
  selectFile.innerText = uploadInput.files[0].name;
  messages.innerText = '';
  try {
    await readFile(uploadInput.files);
    if (!view.id.value) fillView(0);
  } catch (readFileError) {
    messages.innerText = readFileError;
    selectFile.innerText = 'Select file again';
  }
};

const saveCB = () => {
  const bjson = new Blob([JSON.stringify(getdb(), null, 2)], { type: 'application/json' });
  const anc = document.createElement('a');
  anc.download = uploadInput.files[0].name;
  anc.href = window.URL.createObjectURL(bjson);
  anc.click();
};

const insertCB = () => {
  const rec = {};
  for (const [k, v] of Object.entries(view)) {
    rec[k] = v.value;
  }
  insertRec(rec);
};

uploadInput.addEventListener(
  'change',
  changeEventCB,
);

load.addEventListener(
  'click',
  loadCB,
);

save.addEventListener(
  'click',
  saveCB,
);

insert.addEventListener(
  'click',
  insertCB,
);
