import DataView from './dataview.js';
import ControlView from './controlview.js';

export default class Controller {
  controlview = new ControlView();

  dataview = new DataView(this.controlview);

  init() {
    for (const [elem, elemRec] of this.controlview.controls) {
      const elemID = document.getElementById(elem);
      elemRec.set('elemID', elemID);
      if (elemRec.has('event')) {
        elemID.addEventListener(elemRec.get('event'), this.controlview.callbacks.get(elem));
      }
    }

    this.controlview.dataview = this.dataview;

    for (const [elem, elemRec] of this.dataview.data) {
      const elemID = document.getElementById(elem);
      elemRec.set('elemID', elemID);
      if (elemRec.has('event')) {
        elemID.addEventListener(elemRec.get('event'), this.dataview.callbacks.get(elem));
      }
    }
  }
}

const controller = new Controller();
controller.init();
