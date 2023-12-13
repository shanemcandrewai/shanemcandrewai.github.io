import Json from './json.js';
import Xlsx from './xlsx.js';
import Local from './local.js';
import Dropbox from './dropbox.js';
import UtcConv from './utcconv.js';
import Messages from './messages.js';

export default class ControlView {
  messages = new Messages();

  storage = new Local();

  uploadInputListener = () => {
    const file = this.modelController.controls.get('uploadInput').get('elemID').files[0];
    this.modelController.controls.get('selectFile').set('innerText', file.name);
    this.modelController.controls.get('uploadInput').set('fileName', file.name);
    this.storage = new Local(file);
    if (file.name.split('.').pop() === 'xlsx') this.modelController.db = new Xlsx(this.modelController.db.getMap());
    else this.modelController.db = new Json(this.modelController.db.getMap());
    this.modelController.updateControls();
  };

  codetokenInputListener = () => {
    this.modelController.controls.get('codetokenInput').set(
      'value',
      this.modelController.controls.get('codetokenInput').get('elemID').value,
    );
    this.storage = new Dropbox();
    this.modelController.db = new Json(this.modelController.db.getMap());
    this.modelController.updateControls();
  };

  loadListener = async () => {
    this.modelController.controls.get('load').get('elemID').disabled = true;
    this.modelController.controls.get('messages').innerText = '';
    let messages;
    try {
      messages = await this.storage.load(
        this.modelController.db,
        'db.json',
        this.modelController.controls.get('codetokenInput').get('value'),
      );
      this.modelController.db2view(this.modelController.db);
    } catch (readFileError) {
      messages.set('readFileError', readFileError);
      this.modelController.controls.get('selectFile').set('innerText', 'Select file again');
    }
    this.modelController.updateControls();
  };

  saveListener = async () => {
    this.modelController.controls.get('save').get('elemID').disabled = true;
    const keys = new Uint32Array([...this.modelController.db.getMap().keys()]).sort();
    const dbSorted = new Map();
    for (const key of keys) dbSorted.set(key, this.modelController.db.getRec(key));
    this.modelController.db = new Json(dbSorted);
    this.modelController.controls.get('messages').set('innerText', '');
    try {
      const messages = await this.storage.save(
        this.modelController.db,
        'db.json',
        this.modelController.controls.get('codetokenInput').get('value'),
      );
      if (messages instanceof Map && messages.has('display')) {
        this.modelController.controls.get('messages').set('innerText', messages.getDisplay());
      }
    } catch (readFileError) {
      this.modelController.controls.get('messages').set('innerText', readFileError);
      this.modelController.controls.get('selectFile').set('innerText', 'Select file again');
    }
  };

  insertListener = () => {
    this.modelController.datatransfer.view2db(this.modelController.db);
    this.modelController.updateControls();
  };

  updateListener = () => {
    this.modelController.datatransfer.view2db(this.modelController.db);
    this.modelController.updateControls();
  };

  deleteListener = () => {
    const viewID = this.modelController.data.get('id').get('value');
    if (viewID) {
      const viewParent = this.modelController.db.getRec(viewID).get('parent');
      this.modelController.db.deleteRec(viewID);
      for (const [dbID, dbRec] of this.modelController.db.getMap()) {
        if (dbRec.get('parent') === Number(viewID)) {
          this.modelController.db.setRec(dbID, 'parent', viewParent);
        }
      }
      this.modelController.updateControls();
    }
  };

  newListener = () => {
    const keys = new Uint32Array([...this.modelController.db.getMap().keys()]).sort();
    const nextNum = keys.find((id, ind, arr) => (arr[ind + 1] - id) !== 1) + 1;
    this.modelController.data.get('id').set('value', nextNum || 1);
    this.modelController.data.get('id').get('elemID').value = this.modelController.data.get('id').get('value');
    this.modelController.data.get('created').set('value', UtcConv.getLocalDateTime());
    this.modelController.data.get('created').get('elemID').value = this.modelController.data.get('created').get('value');
    this.modelController.updateControls();
  };

  nextprevListener = (evt) => {
    const viewID = this.modelController.data.get('id').get('value');
    if (viewID) {
      const viewParent = this.modelController.data.get('parent').get('value');
      const keys = new Uint32Array([...this.modelController.db.getMap().keys()]).sort();
      if (evt.target.id === 'previous') keys.reverse();
      for (const key of keys) {
        if (((evt.target.id === 'next' && key > Number(viewID))
        || (evt.target.id === 'previous' && key < Number(viewID)))
        && ((viewParent && this.modelController.db.getRec(key).get('parent') === Number(viewParent))
        || (!viewParent && !this.modelController.db.getRec(key).get('parent')))) {
          this.modelController.db2view(this.modelController.db, key);
          break;
        }
      }
      this.modelController.updateControls();
    }
  };

  upListener = () => {
    const viewParent = Number(this.modelController.data.get('parent').get('value'));
    this.modelController.db2view(this.modelController.db, viewParent);
    this.modelController.updateControls();
  };

  downListener = () => {
    const viewID = Number(this.modelController.data.get('id').get('value'));
    for (const [dbID, dbRec] of this.modelController.db.getMap()) {
      if (dbRec.get('parent') === viewID) {
        this.modelController.db2view(this.modelController.db, dbID);
        break;
      }
    }

    this.modelController.updateControls();
  };

  archiveListener = () => {
    let ancestors = new Map();
    const arcFromID = Number(this.modelController.data.get('id').get('value'));
    let currID = arcFromID;
    while (currID) {
      const currRec = this.modelController.db.getRec(currID);
      ancestors.set(currID, currRec);
      const parentID = currRec.get('parent');
      if (!this.modelController.db.getChildren(currID).size) {
        this.modelController.db.deleteRec(currID);
      }
      currID = parentID;
    }
    ancestors = new Map([...ancestors].reverse());
    const keys = new Uint32Array([...this.modelController.db.getMap().keys()]).sort();
    let nextArcNum;
    if (this.modelController.db.hasID(100000)) {
      nextArcNum = keys.find((id, ind, arr) => (id > 99999 && ((arr[ind + 1] - id) !== 1))) + 1;
    } else nextArcNum = 100000;
    let previousArcNum;
    for (const ancestorRec of ancestors.values()) {
      const currRec = new Map([...ancestorRec]);
      currRec.set('id', nextArcNum);
      if (previousArcNum) currRec.set('parent', previousArcNum);
      else currRec.set('parent', 2);
      const siblings = this.modelController.db.getChildren(currRec.get('parent'));
      let duplicateFound;
      for (const [elemID, elemRec] of siblings) {
        if (elemRec.get('description') === currRec.get('description')) {
          duplicateFound = elemID;
        }
      }
      if (!duplicateFound) {
        this.modelController.datatransfer.rec2db(this.modelController.db, currRec);
        previousArcNum = nextArcNum;
        nextArcNum += 1;
      } else previousArcNum = duplicateFound;
    }
    this.modelController.db2view(this.modelController.db, previousArcNum);
    this.modelController.updateControls();
  };

  callbacks = new Map(
    [
      ['uploadInput', this.uploadInputListener],
      ['load', this.loadListener],
      ['save', this.saveListener],
      ['codetokenInput', this.codetokenInputListener],
      ['insert', this.insertListener],
      ['update', this.updateListener],
      ['delete', this.deleteListener],
      ['new', this.newListener],
      ['next', this.nextprevListener],
      ['previous', this.nextprevListener],
      ['up', this.upListener],
      ['down', this.downListener],
      ['archive', this.archiveListener],
    ],
  );

  constructor(modelController) {
    this.modelController = modelController;

    for (const [elem, elemRec] of this.modelController.controls) {
      const elemID = document.getElementById(elem);
      elemRec.set('elemID', elemID);
      if (elemRec.has('event')) {
        elemID.addEventListener(elemRec.get('event'), this.callbacks.get(elem));
      }
    }
  }
}
