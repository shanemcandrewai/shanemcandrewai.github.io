import ControlView from './controlview.js';

export default class MainView {
  controlsObj = {
    key_0: {
      events: {
        keyup: {
          recalculate: {
            map: 'disabled',
          },
        },
      },
    },
    value_0: {
      events: {
        keyup: {
          recalculate: {
            update: 'disabled',
          },
        },
      },
    },
  };

  static nestedObj2Map = (obj, map = new Map()) => {
    for (const [k, v] of Object.entries(obj)) {
      if (typeof (v) === 'object' && v !== null) {
        map.set(k, MainView.nestedObj2Map(v));
      } else map.set(k, v);
    }
    return map;
  };

  constructor(writeCacheImmediately) {
    this.controls = MainView.nestedObj2Map(this.controlsObj);
    this.controlView = new ControlView(this.controls, writeCacheImmediately || false);
  }
}
