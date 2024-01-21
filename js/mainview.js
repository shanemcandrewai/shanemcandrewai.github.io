import ControlView from './controlview.js';

export default class MainView {
  controls = new Map(
    [
      ['selectFile', new Map([
        ['elemProp', 'innerText']])],
      ['uploadInput', new Map([
        ['event', 'change']])],
      ['codetokenInput', new Map([
        ['event', 'change']])],
      ['load', new Map([
        ['event', 'click'],
        ['elemProp', 'disabled']])],
      ['save', new Map([
        ['event', 'click'],
        ['elemProp', 'disabled']])],
      ['insert', new Map([
        ['event', 'click'],
        ['elemProp', 'disabled']])],
      ['update', new Map([
        ['event', 'click'],
        ['elemProp', 'disabled']])],
      ['delete', new Map([
        ['event', 'click'],
        ['elemProp', 'disabled']])],
      ['new', new Map([
        ['event', 'click'],
        ['elemProp', 'disabled']])],
      ['next', new Map([
        ['event', 'click'],
        ['elemProp', 'disabled']])],
      ['previous', new Map([
        ['event', 'click'],
        ['elemProp', 'disabled']])],
      ['up', new Map([
        ['event', 'click'],
        ['elemProp', 'disabled']])],
      ['down', new Map([
        ['event', 'click'],
        ['elemProp', 'disabled']])],
      ['archive', new Map([
        ['event', 'click'],
        ['elemProp', 'disabled']])],
      ['id', new Map([
        ['type', Number],
        ['event', 'keyup'],
        ['elemProp', 'value']])],
      ['parent', new Map([
        ['type', Number],
        ['event', 'keyup'],
        ['elemProp', 'value']])],
      ['created', new Map([
        ['type', 'datetime-local'],
        ['event', 'change'],
        ['elemProp', 'value']])],
      ['priority', new Map([
        ['type', Number],
        ['event', 'keyup'],
        ['elemProp', 'value']])],
      ['description', new Map([
        ['type', String],
        ['event', 'keyup'],
        ['elemProp', 'value']])],
      ['due', new Map([
        ['type', 'datetime-local'],
        ['event', 'change'],
        ['elemProp', 'value']])],
      ['messages', new Map([
        ['elemProp', 'innerText']])],
    ],
  );

  controlView = new ControlView(this.controls);
}
