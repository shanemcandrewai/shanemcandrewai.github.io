import DataView from './dataview.js';
import ControlView from './controlview.js';

export default class MainView {
  controlview = new ControlView();

  dataview = new DataView(this.controlview);

  constructor() {
    this.controlview.dataview = this.dataview;
  }
}
