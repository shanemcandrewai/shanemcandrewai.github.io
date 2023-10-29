import Local from './local.js';
import Db from './db.js';
import Json from './json.js';
import Xlsx from './xlsx.js';

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

  changeInputListener = () => {
    const file = this.controls.get('uploadInput').get('elemID').files[0];
    this.storage = new Local(file);
    this.filename = file.name;
    this.controls.get('selectFile').get('elemID').innerText = file.name;
    if (file.name.split('.').pop() === 'xlsx') this.db = new Xlsx(this.db);
    else this.db = new Json(this.db);
    this.updateControls();
  };

  loadListener = async () => {
    this.controls.get('messages').innerText = '';
    try {
      await this.storage.load(this.db);
      this.dataview.db2view(this.db);
    } catch (readFileError) {
      this.controls.get('messages').get('elemID').innerText = readFileError;
      this.controls.get('selectFile').get('elemID').innerText = 'Select file again';
    }
    this.updateControls();
  };

  saveListener = async () => {
    if (typeof this.db.getBlob === 'undefined') this.db = new Json(this.db);
    this.controls.get('messages').innerText = '';
    try {
      await Local.save(this.db, this.filename);
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
    const viewID = Number(this.dataview.data.get('id').get('elemID').value);
    this.db.deleteRec(viewID);
    this.updateControls();
  };

  nextListener = () => {
    const viewID = Number(this.dataview.data.get('id').get('elemID').value);
    this.dataview.db2view(this.db, Number(viewID) + 1);
    this.updateControls();
  };

  previousListener = () => {
    const viewID = Number(this.dataview.data.get('id').get('elemID').value);
    this.dataview.db2view(this.db, Number(viewID) - 1);
    this.updateControls();
  };

  upListener = () => {
    const viewParent = Number(this.dataview.data.get('parent').get('elemID').value);
    this.dataview.db2view(this.db, viewParent);
    this.updateControls();
  };

  downListener = () => {
    const viewID = Number(this.dataview.data.get('id').get('elemID').value);
    for (const [dbID, dbRec] of this.db.getIter()) {
      if (dbRec.get('parent') === viewID) {
        this.dataview.db2view(this.db, dbID);
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
    if (this.controls.get('uploadInput').get('elemID').files.length
     && typeof this.db.readFile !== 'undefined') {
      this.controls.get('load').get('elemID').disabled = false;
    } else {
      this.controls.get('load').get('elemID').disabled = true;
    }
    const viewID = this.dataview.data.get('id').get('elemID').value;
    if (typeof viewID === 'string' && !viewID) {
      this.controls.get('insert').get('elemID').disabled = true;
      this.controls.get('delete').get('elemID').disabled = true;
    } else if (this.db.getRec(viewID)) {
      this.controls.get('insert').get('elemID').disabled = true;
      this.controls.get('delete').get('elemID').disabled = false;
    } else {
      this.controls.get('insert').get('elemID').disabled = false;
      this.controls.get('delete').get('elemID').disabled = true;
    }
    if (typeof viewID === 'string' && !viewID) {
      this.controls.get('update').get('elemID').disabled = true;
    } else if (this.dataview.needsUpdate(viewID, this.db)) {
      this.controls.get('update').get('elemID').disabled = false;
    } else {
      this.controls.get('update').get('elemID').disabled = true;
    }
    if (typeof viewID === 'string' && !viewID) {
      this.controls.get('next').get('elemID').disabled = true;
    } else if (this.db.getRec(Number(viewID) + 1)) {
      this.controls.get('next').get('elemID').disabled = false;
    } else {
      this.controls.get('next').get('elemID').disabled = true;
    }
    if (typeof viewID === 'string' && !viewID) {
      this.controls.get('previous').get('elemID').disabled = true;
    } else if (this.db.getRec(Number(viewID) - 1)) {
      this.controls.get('previous').get('elemID').disabled = false;
    } else {
      this.controls.get('previous').get('elemID').disabled = true;
    }
    const viewParent = this.dataview.data.get('parent').get('elemID').value;
    if (typeof viewParent === 'string' && !viewParent) {
      this.controls.get('up').get('elemID').disabled = true;
    } else if (this.db.getRec(Number(viewParent))) {
      this.controls.get('up').get('elemID').disabled = false;
    } else {
      this.controls.get('up').get('elemID').disabled = true;
    }
    this.controls.get('down').get('elemID').disabled = false;
  }

  callbacks = new Map(
    [
      ['uploadInput', this.changeInputListener],
      ['load', this.loadListener],
      ['save', this.saveListener],
      ['insert', this.insertListener],
      ['update', this.updateListener],
      ['delete', this.deleteListener],
      ['next', this.nextListener],
      ['previous', this.previousListener],
      ['up', this.upListener],
      ['down', this.downListener],
    ],
  );
}
