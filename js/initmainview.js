import MainView from './mainview.js';

const mainview = new MainView();
const codeElem = document.getElementById('codeTokenInput');

const codeTokenInputChange = async (event) => {
  if (event.target.value.slice(0, 1) === 't') await import('../test/test.all.js');
  else mainview.controlView.activeElementID = 'key_0';
};
codeElem.addEventListener('change', codeTokenInputChange);
