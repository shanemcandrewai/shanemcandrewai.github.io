export default class DataView {
  dataListener = (evt) => {
    this.modelController.data.get(evt.target.id).set(
      'value',
      this.modelController.data.get(evt.target.id).get('elemID').value,
    );
    this.modelController.updateControls();
  };

  callbacks = new Map(
    [
      ['id', this.dataListener],
      ['parent', this.dataListener],
      ['created', this.dataListener],
      ['priority', this.dataListener],
      ['description', this.dataListener],
      ['due', this.dataListener],
    ],
  );

  constructor(modelController) {
    this.modelController = modelController;
    for (const [elem, elemRec] of this.modelController.data) {
      const elemID = document.getElementById(elem);
      elemRec.set('elemID', elemID);
      if (elemRec.has('event')) {
        elemID.addEventListener(elemRec.get('event'), this.callbacks.get(elem));
      }
    }
  }
}
