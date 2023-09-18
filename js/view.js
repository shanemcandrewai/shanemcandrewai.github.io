import {
  insertRec, updateRec, getRecDb, readFile, getdbBlob,
} from './model.js';

const viewDataNames = ['id', 'created', 'priority', 'description', 'due'];
const viewElemNames = ['selectFile', 'uploadInput', 'load', 'save', 'insert',
  'update', 'messages'].concat(viewDataNames);
const viewElems = new Map();
for (const elem of viewElemNames) viewElems.set(elem, document.getElementById(elem));

const changeEventCB = async () => {
  viewElems.get('save').disabled = false;
  viewElems.get('load').disabled = false;
  viewElems.get('selectFile').innerText = viewElems.get('uploadInput').files[0].name;
};

const fillView = (id) => {
  const rec = getRecDb(id);
  if (rec) viewElems.get('id').value = id;
  for (const [k, v] of rec) {
    viewElems.get(k).value = v;
  }
};

const loadCB = async () => {
  viewElems.get('selectFile').innerText = viewElems.get('uploadInput').files[0].name;
  viewElems.get('messages').innerText = '';
  try {
    await readFile(viewElems.get('uploadInput').files[0]);
    const currId = viewElems.get('id').value;
    if (currId) {
      fillView(Number(currId));
    } else {
      fillView(1);
    }
  } catch (readFileError) {
    viewElems.get('messages').innerText = readFileError;
    viewElems.get('selectFile').innerText = 'Select file again';
  }
};

const saveCB = () => {
  const bjson = getdbBlob();
  const anc = document.createElement('a');
  anc.download = viewElems.get('uploadInput').files[0].name;
  anc.href = window.URL.createObjectURL(bjson);
  anc.click();
};

const getRec = () => {
  const rec = new Map();
  for (const elem of viewDataNames) {
    if (viewElems.get(elem).type === 'number') {
      rec.set(elem, Number(viewElems.get(elem).value));
    } else {
      rec.set(elem, viewElems.get(elem).value);
    }
  }
  return rec;
};

const insertCB = () => {
  viewElems.get('messages').innerText = insertRec(getRec());
};

const updateCB = () => {
  viewElems.get('messages').innerText = updateRec(getRec());
};

viewElems.get('uploadInput').addEventListener('change', changeEventCB);
viewElems.get('load').addEventListener('click', loadCB);
viewElems.get('save').addEventListener('click', saveCB);
viewElems.get('insert').addEventListener('click', insertCB);
viewElems.get('update').addEventListener('click', updateCB);
