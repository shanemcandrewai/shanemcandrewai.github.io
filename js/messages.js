export default class Messages {
  getDisplay() {
    return this.display;
  }

  constructor() {
    this.system = new Map();
    this.display = '';
    this.data = new Map();
  }
}
