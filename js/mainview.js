import ControlView from './controlview.js';
import Db from './db.js';

export default class MainView {
  controlsObj = {
    key_0: {
      events: {
        input: {
          recalculate: {
            map: 'disabled',
          },
        },
      },
    },
  };

  constructor(writeCacheImmediately) {
    this.controls = Db.obj2Map(this.controlsObj);
    this.controlView = new ControlView(this.controls, writeCacheImmediately || false);
  }
}
