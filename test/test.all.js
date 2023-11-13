import './libs/mocha.js';
import './libs/chai.js';

/* global mocha */

const codetokenElem = document.getElementById('codetokenInput');
codetokenElem.addEventListener('change', async () => {
  mocha.setup('tdd');
  mocha.checkLeaks();
  if (codetokenElem.value !== 'x') await import('./test.dropbox.js');
  await import('./test.db.js');
  await import('./test.mainview.js');
  await import('./test.controlview.js');
  await import('./test.dataview.js');
  await import('./test.arrobj.js');
  await import('./test.json.js');
  await import('./test.xlsx.js');
  await import('./test.utcconv.js');
  mocha.run();
});
