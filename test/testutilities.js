import Json from '../js/json.js';

export default class TestUtilities {
  setControlEvent = (id, propName, propValue, eventName) => {
    if (propName in this.mainview.controls.get(id).get('elemID')) {
      this.mainview.controls.get(id).get('elemID')[propName] = propValue;
      if (this.mainview.controls.get(id).get('elemID').type === 'text') {
        this.mainview.controlView.genericListener({ target: { id, type: 'text' }, type: 'click' });
      }
      const event = { target: { id }, type: eventName };
      event.target[propName] = propValue;
      this.mainview.controlView.genericListener(event);
    }
  };

  loadSampleJson = async (filename = 'wlorig.js') => {
    this.mainview.controlView.db = new Json();
    const dbmap = await import(`./data/${filename}`);
    const strObj = JSON.stringify(
      dbmap.default,
      this.mainview.controlView.db.mapEncoder,
    );
    this.mainview.controlView.db.readText(strObj);
    this.mainview.controlView.db2view();
    this.mainview.controlView.postLoad();
    this.mainview.controlView.writeCache();
    return strObj;
  };

  constructor(mainview) {
    this.mainview = mainview;
  }
}
