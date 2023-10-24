import Local from './local.js';
import Db from './db.js';
import Json from './json.js';
import Xlsx from './xlsx.js';
import ControlsView from './controlsview.js';
import DataView from './dataview.js';

export default class Controller {
  controls = new ControlsView().controls;

  db = new Db();

  dataview = new DataView(this.db);

  changeInputListener = async () => {
    this.controls.get('save').get('elemID').disabled = false;
    this.controls.get('load').get('elemID').disabled = false;
    const file = await this.controls.get('uploadInput').get('elemID').files[0];
    this.storage = new Local(file);
    this.controls.get('selectFile').get('elemID').innerText = file.name;
    if (file.name.split('.').pop() === 'xlsx') this.db = new Xlsx(this.db);
    else this.db = new Json(this.db);
    this.dataview = new DataView(this.db);
  };

  loadListener = async () => {
    this.controls.get('messages').innerText = '';
    try {
      await this.storage.load(this.db);
      this.dataview.db2view();
    } catch (readFileError) {
      this.controls.get('messages').get('elemID').innerText = readFileError;
      this.controls.get('selectFile').get('elemID').innerText = 'Select file again';
    }
  };

  saveListener = async () => {
    this.controls.get('messages').innerText = '';
    try {
      await this.storage.save(this.db);
    } catch (readFileError) {
      this.controls.get('messages').get('elemID').innerText = readFileError;
      this.controls.get('selectFile').get('elemID').innerText = 'Select file again';
    }
  };

  insertListener = () => {
    this.dataview.view2db();
    if (this.db.size) this.controls.get('save').get('elemID').disabled = false;
    else this.controls.get('save').get('elemID').disabled = true;
  };

  updateListener = () => {
    this.dataview.view2db();
  };

  deleteListener() {
    const message = this.db.deleteRec(Number(this.controls.get('id').value));
    this.controls.get('messages').innerText = message;
  }

  callbacks = new Map(
    [
      ['uploadInput', this.changeInputListener],
      ['load', this.loadListener],
      ['save', this.saveListener],
      ['insert', this.insertListener],
      ['update', this.updateListener],
      ['delete', this.deleteListener],
    ],
  );

  addEventListeners() {
    for (const [elem, callback] of this.callbacks) {
      const elemRec = this.controls.get(elem);
      if (elemRec.has('event')) {
        elemRec.get('elemID').addEventListener(elemRec.get('event'), callback);
      }
    }
  }
}

const controller = new Controller();
controller.addEventListeners();
