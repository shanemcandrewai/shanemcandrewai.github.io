import ControlView from './controlview.js';
import DataView from './dataview.js';

export default class MainView {
  dataview = new DataView();

  controlview = new ControlView(this.dataview);

  constructor() { this.dataview.controlview = this.controlview; }
}
