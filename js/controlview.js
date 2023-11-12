import Local from './local.js';
import Db from './db.js';
import Json from './json.js';
import Xlsx from './xlsx.js';
import DataView from './dataview.js';
import Dropbox from './dropbox.js';

export default class ControlView {
  filename = 'db2.json';

  db = new Db();

  storage = new Local();

  controls = new Map(
    [
      ['selectFile', new Map([
        ['elemID', null]])],
      ['uploadInput', new Map([
        ['elemID', null],
        ['event', 'change']])],
      ['load', new Map([
        ['elemID', null],
        ['event', 'click']])],
      ['tokenInput', new Map([
        ['elemID', null],
        ['event', 'change']])],
      ['save', new Map([
        ['elemID', null],
        ['event', 'click']])],
      ['insert', new Map([
        ['elemID', null],
        ['event', 'click']])],
      ['update', new Map([
        ['elemID', null],
        ['event', 'click']])],
      ['delete', new Map([
        ['elemID', null],
        ['event', 'click']])],
      ['next', new Map([
        ['elemID', null],
        ['event', 'click']])],
      ['previous', new Map([
        ['elemID', null],
        ['event', 'click']])],
      ['up', new Map([
        ['elemID', null],
        ['event', 'click']])],
      ['down', new Map([
        ['elemID', null],
        ['event', 'click']])],
      ['messages', new Map([
        ['elemID', null]])],
    ],
  );

  uploadInputListener = () => {
    const file = this.controls.get('uploadInput').get('elemID').files[0];
    this.storage = new Local(file);
    this.filename = file.name;
    this.controls.get('selectFile').get('elemID').innerText = file.name;
    if (file.name.split('.').pop() === 'xlsx') this.db = new Xlsx(this.db.getMap());
    else this.db = new Json(this.db.getMap());
    this.updateControls();
  };

  tokenInputListener = () => {
    this.storage = new Dropbox();
    this.db = new Json(this.db.getMap());
    this.updateControls();
  };

  loadListener = async () => {
    this.controls.get('messages').innerText = '';
    try {
      await this.storage.load(this.db, 'db.json', this.controls.get('tokenInput').get('elemID').value);
      this.dataview.db2view(this.db);
    } catch (readFileError) {
      this.controls.get('messages').get('elemID').innerText = readFileError;
      this.controls.get('selectFile').get('elemID').innerText = 'Select file again';
    }
    this.updateControls();
  };

  saveListener = async () => {
    const keys = new Uint32Array([...this.db.getMap().keys()]).sort();
    const dbSorted = new Map();
    for (const key of keys) dbSorted.set(key, this.db.getMap().get(key));
    this.db = new Json(dbSorted);
    this.controls.get('messages').innerText = '';
    try {
      await this.storage.save(this.db, 'db.json', this.controls.get('tokenInput').get('elemID').value);
    } catch (readFileError) {
      this.controls.get('messages').get('elemID').innerText = readFileError;
      this.controls.get('selectFile').get('elemID').innerText = 'Select file again';
    }
  };

  insertListener = () => {
    this.dataview.view2db(this.db);
    this.updateControls();
  };

  updateListener = () => {
    this.dataview.view2db(this.db);
    this.updateControls();
  };

  deleteListener = () => {
    const viewID = this.dataview.data.get('id').get('elemID').value;
    if (viewID) {
      const viewParent = this.db.getRec(viewID).get('parent');
      this.db.deleteRec(viewID);
      for (const [dbID, dbRec] of this.db.getMap()) {
        if (dbRec.get('parent') === Number(viewID)) {
          this.db.setRec(dbID, 'parent', viewParent);
        }
      }
      this.updateControls();
    }
  };

  nextprevListener = (evt) => {
    const viewID = this.dataview.data.get('id').get('elemID').value;
    if (viewID) {
      const viewParent = this.dataview.data.get('parent').get('elemID').value;
      let nextFound = false;
      const keys = new Uint32Array([...this.db.getMap().keys()]).sort();
      if (evt.target.id === 'previous') keys.reverse();
      for (const key of keys) {
        if (((evt.target.id === 'next' && key > Number(viewID))
        || (evt.target.id === 'previous' && key < Number(viewID)))
        && ((viewParent && this.db.getMap().get(key).get('parent') === viewParent)
        || (!viewParent && !this.db.getMap().get(key).get('parent')))) {
          this.dataview.db2view(this.db, key);
          nextFound = true;
          this.updateControls();
          break;
        }
      }
      if (!nextFound) {
        for (const key of keys) {
          if ((evt.target.id === 'next' && key > Number(viewID))
          || (evt.target.id === 'previous' && key < Number(viewID))) {
            this.dataview.db2view(this.db, key);
            this.updateControls();
            break;
          }
        }
      }
    }
  };

  upListener = () => {
    const viewParent = Number(this.dataview.data.get('parent').get('elemID').value);
    this.dataview.db2view(this.db, viewParent);
    this.updateControls();
  };

  downListener = () => {
    const viewID = Number(this.dataview.data.get('id').get('elemID').value);
    for (const [dbID, dbRec] of this.db.getMap()) {
      if (dbRec.get('parent') === viewID) {
        this.dataview.db2view(this.db, dbID);
        break;
      }
    }

    this.updateControls();
  };

  updateControls() {
    if (this.db.size()) {
      this.controls.get('save').get('elemID').disabled = false;
    } else {
      this.controls.get('save').get('elemID').disabled = true;
    }
    if ((this.controls.get('uploadInput').get('elemID').files.length
         || this.controls.get('tokenInput').get('elemID').value)
     && typeof this.db.readFile !== 'undefined') {
      this.controls.get('load').get('elemID').disabled = false;
    } else {
      this.controls.get('load').get('elemID').disabled = true;
    }

    const viewID = this.dataview.data.get('id').get('elemID').value;
    if (!viewID) {
      this.controls.get('insert').get('elemID').disabled = true;
      this.controls.get('delete').get('elemID').disabled = true;
      this.controls.get('update').get('elemID').disabled = true;
      this.controls.get('next').get('elemID').disabled = true;
      this.controls.get('previous').get('elemID').disabled = true;
      this.controls.get('up').get('elemID').disabled = true;
      this.controls.get('down').get('elemID').disabled = true;
    } else {
      if (this.dataview.canInsert(viewID, this.db)) {
        this.controls.get('insert').get('elemID').disabled = false;
      } else {
        this.controls.get('insert').get('elemID').disabled = true;
      }
      if (this.dataview.canUpdate(viewID, this.db)) {
        this.controls.get('update').get('elemID').disabled = false;
      } else {
        this.controls.get('update').get('elemID').disabled = true;
      }
      if (this.db.getRec(viewID)) {
        this.controls.get('delete').get('elemID').disabled = false;
      } else {
        this.controls.get('delete').get('elemID').disabled = true;
      }

      const keys = [...this.db.getMap().keys()];
      if (keys.some((elem) => elem > viewID)) {
        this.controls.get('next').get('elemID').disabled = false;
      } else {
        this.controls.get('next').get('elemID').disabled = true;
      }
      if (keys.some((elem) => elem < viewID)) {
        this.controls.get('previous').get('elemID').disabled = false;
      } else {
        this.controls.get('previous').get('elemID').disabled = true;
      }
      const viewParent = this.dataview.data.get('parent').get('elemID').value;
      if (this.db.getRec(Number(viewParent))) {
        this.controls.get('up').get('elemID').disabled = false;
      } else {
        this.controls.get('up').get('elemID').disabled = true;
      }
      this.controls.get('down').get('elemID').disabled = true;
      for (const dbRec of this.db.getMap().values()) {
        if (dbRec.get('parent') === Number(viewID)) {
          this.controls.get('down').get('elemID').disabled = false;
          break;
        }
      }
    }
  }

  callbacks = new Map(
    [
      ['uploadInput', this.uploadInputListener],
      ['load', this.loadListener],
      ['save', this.saveListener],
      ['tokenInput', this.tokenInputListener],
      ['insert', this.insertListener],
      ['update', this.updateListener],
      ['delete', this.deleteListener],
      ['next', this.nextprevListener],
      ['previous', this.nextprevListener],
      ['up', this.upListener],
      ['down', this.downListener],
    ],
  );

  constructor(dataview) {
    if (dataview) this.dataview = dataview;
    else this.dataview = new DataView();
    for (const [elem, elemRec] of this.controls) {
      const elemID = document.getElementById(elem);
      elemRec.set('elemID', elemID);
      if (elemRec.has('event')) {
        elemID.addEventListener(elemRec.get('event'), this.callbacks.get(elem));
      }
    }
  }
}
