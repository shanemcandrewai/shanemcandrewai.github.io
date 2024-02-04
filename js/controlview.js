import ModelController from './modelcontroller.js';
import Json from './json.js';
import Xlsx from './xlsx.js';
import Local from './local.js';
import Dropbox from './dropbox.js';
import UtcConv from './utcconv.js';
import Messages from './messages.js';

export default class ControlView {
  uploadinputListener = (evt) => {
    const file = evt.target.files[0];
    this.storage = new Local(file);
    const dbMap = this.modelController.db.getMap();
    if (file.name.split('.').pop() === 'xlsx') this.modelController.db = new Xlsx(dbMap);
    else this.modelController.db = new Json(dbMap);
    if (!dbMap.size) this.loadListener();
    else this.modelController.setUploadInput(false);
    this.writeCache();
  };

  codetokenInputListener = (evt) => {
    this.modelController.setCodeToken(evt.target.value);
    this.storage = new Dropbox();
    this.modelController.db = new Json(this.modelController.db.getMap());
    if (!this.modelController.db.size()) this.loadListener();
    this.writeCache();
  };

  loadListener = async () => {
    this.modelController.setLoad(true, '');
    this.writeCache();
    let messages;
    try {
      messages = await this.storage.load(
        this.modelController.db,
        'db.json',
        this.controls.get('codetokenInput').get('cache'),
      );
      this.modelController.db2view();
    } catch (readFileError) {
      messages.set('readFileError', readFileError);
    }
    this.modelController.postLoad();
    this.writeCache();
  };

  saveListener = async () => {
    this.modelController.setSave(true);
    this.writeCache();
    const keys = new Uint32Array([...this.modelController.db.getMap().keys()]).sort();
    const dbSorted = new Map();
    for (const key of keys) dbSorted.set(key, this.modelController.db.getRec(key));
    this.modelController.db = new Json(dbSorted);
    this.controls.get('messages').set('innerHTML', '');
    try {
      const messages = await this.storage.save(
        this.modelController.db,
        'db.json',
        this.controls.get('codetokenInput').get('cache'),
      );
      if (messages instanceof Map && messages.has('display')) {
        this.controls.get('messages').set('innerHTML', messages.getDisplay());
      }
    } catch (readFileError) {
      this.controls.get('messages').set('innerHTML', readFileError);
    }
  };

  newListener = () => {
    const keys = new Uint32Array([...this.modelController.db.getMap().keys()]).sort();
    const nextNum = keys.find((id, ind, arr) => (arr[ind + 1] - id) !== 1) + 1 || 1;
    this.modelController.setNew(nextNum, UtcConv.getLocalDateTime());
    this.modelController.postNew();
    this.modelController.postNextprev(nextNum);
    this.writeCache();
  };

  insertListener = () => {
    this.modelController.view2db(this.modelController.db);
    this.modelController.postView2db();
    this.writeCache();
  };

  updateListener = () => {
    this.modelController.view2db(this.modelController.db);
    this.modelController.postView2db();
    this.writeCache();
  };

  deleteListener = () => {
    const viewID = this.controls.get('id').get('cache');
    if (viewID) {
      const viewParent = this.modelController.db.getRec(viewID).get('parent');
      this.modelController.db.deleteRec(viewID);
      for (const [dbID, dbRec] of this.modelController.db.getMap()) {
        if (dbRec.get('parent') === Number(viewID)) {
          this.modelController.db.setRec(dbID, 'parent', viewParent);
        }
      }
      this.modelController.postNew();
      this.writeCache();
    }
  };

  nextprevListener = (evt) => {
    const viewID = this.controls.get('id').get('cache');
    if (viewID) {
      const viewParent = this.controls.get('parent').get('cache');
      const keys = new Uint32Array([...this.modelController.db.getMap().keys()]).sort();
      if (evt.target.id === 'previous') keys.reverse();
      for (const key of keys) {
        if (((evt.target.id === 'next' && key > Number(viewID))
        || (evt.target.id === 'previous' && key < Number(viewID)))
        && ((viewParent && this.modelController.db.getRec(key).get('parent') === Number(viewParent))
        || (!viewParent && !this.modelController.db.getRec(key).get('parent')))) {
          this.modelController.db2view(key);
          this.writeCache();
          break;
        }
      }
      this.modelController.postNextprev();
      this.writeCache();
    }
  };

  upListener = () => {
    const viewParent = Number(this.controls.get('parent').get('cache'));
    this.modelController.db2view(viewParent);
    this.modelController.postNextprev();
    this.writeCache();
  };

  downListener = () => {
    const viewID = Number(this.controls.get('id').get('cache'));
    for (const [dbID, dbRec] of this.modelController.db.getMap()) {
      if (dbRec.get('parent') === viewID) {
        this.modelController.db2view(dbID);
        break;
      }
    }
    this.writeCache();
  };

  archiveListener = () => {
    let ancestors = new Map();
    const arcFromID = Number(this.controls.get('id').get('cache'));
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
        this.modelController.rec2db(currRec);
        previousArcNum = nextArcNum;
        nextArcNum += 1;
      } else previousArcNum = duplicateFound;
    }
    this.modelController.db2view(previousArcNum);
    this.writeCache();
  };

  dataListener = (evt) => {
    this.modelController.setData(evt.target.id, evt.target.value);
    this.modelController.postData();
    this.writeCache();
  };

  parentListener = (evt) => {
    const viewParent = evt.target.value;
    this.modelController.setParent(viewParent);
    this.modelController.postData();
    this.writeCache();
  };

  writeCache() {
    for (const properties of this.controls.values()) {
      if (properties.get('write')) {
        if (properties.get('elemProp') === 'disabled') {
          properties.get('elemID').disabled = properties.get('cache');
        } else if (properties.get('elemProp') === 'innerHTML') {
          properties.get('elemID').innerHTML = properties.get('cache');
        } else if (properties.get('elemProp') === 'value') {
          properties.get('elemID').value = properties.get('cache');
        }
        properties.set('write', false);
      }
    }
  }

  callbacks = new Map(
    [
      ['uploadinput', this.uploadinputListener],
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
      ['id', this.dataListener],
      ['parent', this.parentListener],
      ['created', this.dataListener],
      ['priority', this.dataListener],
      ['description', this.dataListener],
      ['due', this.dataListener],
    ],
  );

  constructor(controls) {
    this.controls = controls;
    this.messages = new Messages();
    this.modelController = new ModelController(controls);

    for (const [elem, elemRec] of controls) {
      const elemID = document.getElementById(elem);
      elemRec.set('elemID', elemID);
      if (elemRec.has('event')) {
        elemID.addEventListener(elemRec.get('event'), this.callbacks.get(elem));
      }
      if (elemRec.get('elemProp') === 'disabled') {
        elemRec.set('cache', elemRec.get('elemID').disabled);
      } else if (elemRec.get('elemProp') === 'innerHTML') {
        elemRec.set('cache', elemRec.get('elemID').innerHTML);
      } else if (elemRec.get('elemProp') === 'value') {
        elemRec.set('cache', elemRec.get('elemID').value);
      }
      elemRec.set('write', false);
    }
  }
}
