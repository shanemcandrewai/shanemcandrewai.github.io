export default class Messages {
  getDisplay() {
    let messageText = '';
    for (const message of this.display.values()) messageText += `${message}\n`;
    this.display.clear();
    for (const message of this.data.values()) messageText += `${message}\n`;
    return messageText;
  }

  constructor() {
    this.system = new Map();
    this.display = new Map();
    this.data = new Map();
  }
}
