import ControlView from './controlview.js';
import DataView from './dataview.js';
import ModelController from './modelcontroller.js';

export default class MainView {
  controls = new Map(
    [
      ['selectFile', new Map([
        ['elemID', null],
        ['innerText', null],
        ['disabled', false]])],
      ['uploadInput', new Map([
        ['elemID', null],
        ['event', 'change'],
        ['fileName', null],
        ['disabled', false]])],
      ['codetokenInput', new Map([
        ['elemID', null],
        ['event', 'change'],
        ['value', null],
        ['disabled', false]])],
      ['load', new Map([
        ['elemID', null],
        ['event', 'click'],
        ['disabled', false]])],
      ['save', new Map([
        ['elemID', null],
        ['event', 'click'],
        ['disabled', false]])],
      ['insert', new Map([
        ['elemID', null],
        ['event', 'click'],
        ['disabled', false]])],
      ['update', new Map([
        ['elemID', null],
        ['event', 'click'],
        ['disabled', false]])],
      ['delete', new Map([
        ['elemID', null],
        ['event', 'click'],
        ['disabled', false]])],
      ['new', new Map([
        ['elemID', null],
        ['event', 'click'],
        ['disabled', false]])],
      ['next', new Map([
        ['elemID', null],
        ['event', 'click'],
        ['disabled', false]])],
      ['previous', new Map([
        ['elemID', null],
        ['event', 'click'],
        ['disabled', false]])],
      ['up', new Map([
        ['elemID', null],
        ['event', 'click'],
        ['disabled', false]])],
      ['down', new Map([
        ['elemID', null],
        ['event', 'click'],
        ['disabled', false]])],
      ['archive', new Map([
        ['elemID', null],
        ['event', 'click'],
        ['disabled', false]])],
      ['messages', new Map([
        ['elemID', null],
        ['innerText', null]])],
    ],
  );

  data = new Map(
    [
      ['id', new Map([
        ['elemID', null],
        ['type', Number],
        ['event', 'keyup'],
        ['value', 1]])],
      ['parent', new Map([
        ['elemID', null],
        ['type', Number],
        ['event', 'keyup'],
        ['value', null]])],
      ['created', new Map([
        ['elemID', null],
        ['type', 'datetime-local'],
        ['event', 'change'],
        ['value', null]])],
      ['priority', new Map([
        ['elemID', null],
        ['type', Number],
        ['event', 'keyup'],
        ['value', null]])],
      ['description', new Map([
        ['elemID', null],
        ['type', String],
        ['event', 'keyup'],
        ['value', null]])],
      ['due', new Map([
        ['elemID', null],
        ['type', 'datetime-local'],
        ['event', 'change'],
        ['value', null]])],
    ],
  );

  modelController = new ModelController(this.controls, this.data);

  dataview = new DataView(this.modelController);

  controlview = new ControlView(this.modelController);
}
