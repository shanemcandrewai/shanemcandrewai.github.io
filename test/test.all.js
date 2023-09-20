import './mocha.js';

/* global mocha */

mocha.setup('tdd');
mocha.checkLeaks();

await import('./test.model.js');
await import('./test.converters.js');

mocha.run();
