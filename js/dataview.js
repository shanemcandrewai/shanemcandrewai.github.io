export default class DataView {
  dataListener = () => {
    this.modelController.datatransfer.tranferView();
    this.modelController.update();
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
