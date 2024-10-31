import ControlView from './controlview.js';

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
    this.controls = ControlView.obj2Map(this.controlsObj);
    this.controlView = new ControlView(this.controls, writeCacheImmediately || false);
  }
}
