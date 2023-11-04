import MainView from './mainview.js';

class Controller {
  init() {
    this.mainview = new MainView();
  }
}

const controller = new Controller();
controller.init();

const testElem = document.getElementById('test');
const mochaElem = document.getElementById('mocha');
testElem.addEventListener('change', async () => {
  if (testElem.checked) {
    mochaElem.hidden = false;
    await import('../test/test.all.js');
  } else mochaElem.hidden = true;
});
