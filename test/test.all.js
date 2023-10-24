import './libs/mocha.js';

/* global mocha */

mocha.setup('tdd');
mocha.checkLeaks();

await import('./test.db.js');
await import('./test.controls.js');
await import('./test.arrobj.js');
await import('./test.json.js');
await import('./test.xlsx.js');
await import('./test.utcconv.js');

mocha.run();
