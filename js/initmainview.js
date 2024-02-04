import MainView from './mainview.js';

const mainview = new MainView();
const codeElem = document.getElementById('codetokenInput');

const codetokenInputListener = async (evt) => {
  if (evt.target.value.substring(0, 1) === 't') await import('../test/test.all.js');
  else mainview.controlView.codetokenInputListener(evt);
};
codeElem.addEventListener('change', codetokenInputListener);
