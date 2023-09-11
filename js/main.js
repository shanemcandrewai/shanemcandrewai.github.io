const selectFile = document.getElementById('selectFile');
const uploadInput = document.getElementById('uploadInput');
const id = document.getElementById('id');
const created = document.getElementById('created');
const priority = document.getElementById('priority');
const description = document.getElementById('description');
const due = document.getElementById('due');
const save = document.getElementById('save');
const load = document.getElementById('load');
const messages = document.getElementById('messages');
let db = {};

const readFile = async (files) => {
  if (files.length) {
    return JSON.parse(await files[0].text());
  }
  return { id: -1 };
};

const changeEventCB = async () => {
  save.disabled = false;
  load.disabled = false;
  selectFile.innerText = uploadInput.files[0].name;
};

const loadCB = async () => {
  selectFile.innerText = uploadInput.files[0].name;
  messages.innerText = '';
  try {
    db = await readFile(uploadInput.files);
    id.value = db.id;
    created.value = db.created;
    priority.value = db.priority;
    description.value = db.description;
    if (db.due != null) {
      due.value = db.due;
    }
  } catch (readFileError) {
    messages.innerText = readFileError;
    selectFile.innerText = 'Select file again';
  }
};

const saveCB = () => {
  db.id = id.value;
  db.created = created.value;
  db.priority = priority.value;
  db.description = description.value;
  db.due = id.due;
  const bjson = new Blob([JSON.stringify(db, null, 2)], { type: 'application/json' });
  const anc = document.createElement('a');
  anc.download = uploadInput.files[0].name;
  anc.href = window.URL.createObjectURL(bjson);
  anc.click();
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
