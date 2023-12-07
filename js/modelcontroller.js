import DataTransfer from './datatransfer.js';
import Messages from './messages.js';
import Db from './db.js';

export default class ModelController {
  db = new Db();

  updateControls() {
    for (const properties of this.controls.values()) {
      if (properties.has('disabled') && properties.get('elemID')) {
        properties.get('elemID').disabled = properties.get('disabled');
      }
      if (properties.has('innerText') && properties.get('elemID')) {
        properties.get('elemID').innerText = properties.get('innerText');
      }
    }
  }

  update(messages) {
    const classMessages = (messages instanceof Messages) ? messages : new Messages();
    if (this.db.size()) {
      this.controls.get('save').set('disabled', false);
    } else {
      this.controls.get('save').set('disabled', true);
    }
    if ((this.controls.get('uploadInput').get('fileName')
         || this.controls.get('codetokenInput').get('value'))
     && typeof this.db.readFile !== 'undefined') {
      this.controls.get('load').set('disabled', false);
    } else {
      this.controls.get('load').set('disabled', true);
    }

    const viewID = this.data.get('id').get('value');
    if (!viewID) {
      this.controls.get('insert').set('disabled', true);
      this.controls.get('delete').set('disabled', true);
      this.controls.get('update').set('disabled', true);
      this.controls.get('next').set('disabled', true);
      this.controls.get('previous').set('disabled', true);
      this.controls.get('up').set('disabled', true);
      this.controls.get('down').set('disabled', true);
      this.controls.get('archive').set('disabled', true);
    } else {
      if (this.datatransfer.canInsert(viewID, this.db)) {
        this.controls.get('new').set('disabled', true);
        this.controls.get('insert').set('disabled', false);
        this.controls.get('archive').set('disabled', true);
      } else {
        this.controls.get('new').set('disabled', false);
        this.controls.get('insert').set('disabled', true);
        this.controls.get('archive').set('disabled', false);
      }
      if (this.datatransfer.canUpdate(viewID, this.db)) {
        this.controls.get('update').set('disabled', false);
      } else {
        this.controls.get('update').set('disabled', true);
      }
      if (this.db.getRec(viewID)) {
        this.controls.get('delete').set('disabled', false);
      } else {
        this.controls.get('delete').set('disabled', true);
      }

      const viewParent = this.data.get('parent').get('value');
      this.controls.get('next').set('disabled', true);
      const keys = new Uint32Array([...this.db.getMap().keys()]).sort();
      for (const key of keys) {
        if (key > Number(viewID)
        && ((viewParent && this.db.getRec(key).get('parent') === Number(viewParent))
        || (!viewParent && !this.db.getRec(key).get('parent')))) {
          this.controls.get('next').set('disabled', false);
          break;
        }
      }

      this.controls.get('previous').set('disabled', true);
      keys.reverse();
      for (const key of keys) {
        if (key < Number(viewID)
        && ((viewParent && this.db.getRec(key).get('parent') === Number(viewParent))
        || (!viewParent && !this.db.getRec(key).get('parent')))) {
          this.controls.get('previous').set('disabled', false);
          break;
        }
      }

      if (this.db.getRec(Number(viewParent))) {
        this.controls.get('up').set('disabled', false);
      } else {
        this.controls.get('up').set('disabled', true);
      }

      let combinedMessages = classMessages.getDisplay();

      const children = this.db.getChildren(Number(viewID));
      if (children.size) {
        this.controls.get('down').set('disabled', false);
        this.controls.get('archive').set('disabled', true);
        for (const [childID, childRec] of children) {
          combinedMessages
            += `${childID}: ${childRec.get('description')}\n`;
        }
      } else {
        this.controls.get('down').set('disabled', true);
      }
      this.controls.get('messages').set('innerText', combinedMessages);
    }
    this.updateControls();
    this.datatransfer.fillView();
  }

  constructor(controls, data) {
    this.controls = controls;
    this.data = data;
    this.datatransfer = new DataTransfer(data);
    this.update();
  }
}
