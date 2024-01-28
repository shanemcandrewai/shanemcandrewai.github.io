import MainView from './mainview.js';

const mainview = new MainView();
const codeElem = document.getElementById('codetokenInput');

const codetokenInputListener = async (evt) => {
// load the mocha library and run the test cases if the user enters 'test' in text input
  if (evt.target.value.substring(0, 1) === 't') await import('../test/test.all.js');
  else {
    mainview.controlView.codetokenInputListener(evt);
  }
};
codeElem.addEventListener('change', codetokenInputListener);
