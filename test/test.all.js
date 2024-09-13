import './libs/mocha.js';
import './libs/chai.js';

/* global mocha */

const codeTokenElem = document.getElementById('codeTokenInput');

const styleSheet = document.createElement('style');
styleSheet.innerText = '@import url("test/libs/mocha.css")';
document.head.appendChild(styleSheet);

mocha.setup('tdd');
mocha.checkLeaks();
if (codeTokenElem.value !== 't') {
  codeTokenElem.value = codeTokenElem.value.slice(1);
  await import('./test.dropbox.js');
}
await import('./test.db.js');
await import('./test.mainview.js');
await import('./test.arrobj.js');
await import('./test.json.js');
await import('./test.xlsx.js');
await import('./test.utcconv.js');
mocha.run();
