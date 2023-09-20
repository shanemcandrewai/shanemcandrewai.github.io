import * as model from './model.js';
import { getExcelBlob } from './converters.js';

const viewDataNames = ['id', 'created', 'priority', 'description', 'due'];
const viewElemNames = ['selectFile', 'uploadInput', 'load', 'save', 'insert',
  'update', 'delete', 'messages'].concat(viewDataNames);
const viewElems = new Map();
for (const elem of viewElemNames) viewElems.set(elem, document.getElementById(elem));

const created = new Date();
created.setMinutes(created.getMinutes() - created.getTimezoneOffset());
viewElems.get('created').value = created.toISOString().slice(0, 16);

const changeEventCB = async () => {
  viewElems.get('save').disabled = false;
  viewElems.get('load').disabled = false;
  viewElems.get('selectFile').innerText = viewElems.get('uploadInput').files[0].name;
};

const fillView = (id) => {
  const rec = model.getRecDb(id);
  if (rec) viewElems.get('id').value = id;
  for (const [elem, value] of rec) {
    if (viewElems.get(elem).type === 'datetime-local' && value) {
      const createdDate = new Date(value);
      createdDate.setMinutes(createdDate.getMinutes() - createdDate.getTimezoneOffset());
      viewElems.get('created').value = createdDate.toISOString().slice(0, 16);
    } else viewElems.get(elem).value = value;
  }
};

const loadCB = async () => {
  viewElems.get('selectFile').innerText = viewElems.get('uploadInput').files[0].name;
  viewElems.get('messages').innerText = '';
  try {
    await model.readFile(viewElems.get('uploadInput').files[0]);
  } catch (readFileError) {
    viewElems.get('messages').innerText = readFileError;
    viewElems.get('selectFile').innerText = 'Select file again';
  }
  fillView(model.getMaxID());
};

const saveCB = () => {
  const anc = document.createElement('a');
  anc.download = viewElems.get('uploadInput').files[0].name;
  if (viewElems.get('selectFile').innerText.split('.').pop() === 'xlsx') {
    anc.href = window.URL.createObjectURL(getExcelBlob());
  } else anc.href = window.URL.createObjectURL(model.getdbBlob());
  anc.click();
};

const getRec = () => {
  const rec = new Map();
  for (const elem of viewDataNames) {
    if (viewElems.get(elem).type === 'number') {
      rec.set(elem, Number(viewElems.get(elem).value));
    } else if (viewElems.get(elem).type === 'datetime-local') {
      rec.set(elem, new Date(viewElems.get(elem).value));
    } else {
      rec.set(elem, viewElems.get(elem).value);
    }
  }
  return rec;
};

const insertCB = () => {
  viewElems.get('messages').innerText = model.insertRec(getRec());
};

const updateCB = () => {
  viewElems.get('messages').innerText = model.updateRec(getRec());
};

const deleteCB = () => {
  viewElems.get('messages').innerText = model.deleteRec(Number(viewElems.get('id').value));
};

viewElems.get('uploadInput').addEventListener('change', changeEventCB);
viewElems.get('load').addEventListener('click', loadCB);
viewElems.get('save').addEventListener('click', saveCB);
viewElems.get('insert').addEventListener('click', insertCB);
viewElems.get('update').addEventListener('click', updateCB);
viewElems.get('delete').addEventListener('click', deleteCB);
