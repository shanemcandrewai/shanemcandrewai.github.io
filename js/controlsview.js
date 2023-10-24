export default class ControlsView {
  controls = new Map(
    [
      ['selectFile', new Map([
        ['elemID', null]])],
      ['uploadInput', new Map([
        ['elemID', null],
        ['event', 'change']])],
      ['load', new Map([
        ['elemID', null],
        ['event', 'click']])],
      ['save', new Map([
        ['elemID', null],
        ['event', 'click']])],
      ['insert', new Map([
        ['elemID', null],
        ['event', 'click']])],
      ['update', new Map([
        ['elemID', null],
        ['event', 'click']])],
      ['delete', new Map([
        ['elemID', null],
        ['event', 'click']])],
      ['messages', new Map([
        ['elemID', null]])],
    ],
  );

  constructor() {
    for (const [controlID, controlRec] of this.controls) {
      const elemID = document.getElementById(controlID);
      controlRec.set('elemID', elemID);
    }
  }
}
