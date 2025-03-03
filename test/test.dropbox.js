import Dropbox from '../js/dropbox.js';
import Json from '../js/json.js';

const dropbox = await new Dropbox(document.getElementById('codeTokenInput').value);

/* global suite, test, chai */

suite('Dropbox', async () => {
  test('save db', async () => {
    const json = new Json(new Map([[1, new Map([['priority', 2]])]]));
    const response = await dropbox.save(
      json,
      'dbtest.json',
      document.getElementById('codeTokenInput').value,
    );
    chai.assert.equal(
      response.get('upload_response').content_hash,
      'cfad6a153ba3c6d49912ad3477fab7298027eca06ecec50b55649fec3d5e28c5',
    );
  });
  test('save db and modify', async () => {
    const json = new Json(new Map([[1, new Map([['priority', 3]])]]));
    await dropbox.save(
      json,
      'dbtest.json',
      document.getElementById('codeTokenInput').value,
    );
    json.db.db.set(2, new Map([['priority', 2]]));
    const response = await dropbox.save(
      json,
      'dbtest.json',
    );
    chai.assert.equal(json.getRec(2).get('priority'), 2);
    chai.assert.equal(
      response.get('upload_response').content_hash,
      '28aa78a7ef6e5649e89250b903f7135a2733a5a5ac61ca9903330bb243e4686c',
    );
  });
  test('save and load', async () => {
    let json = new Json(new Map([[1, new Map([['priority', 4]])]]));
    await dropbox.save(
      json,
      'dbtest.json',
      document.getElementById('codeTokenInput').value,
    );
    json = new Json();
    await dropbox.load(json, 'dbtest.json');
    chai.assert.equal(json.getRec('1').get('priority'), 4);
  });
  test('access token renewal and save', async () => {
    const json = new Json(new Map([[1, new Map([['priority', 4]])]]));
    delete dropbox.accessToken;
    const messages = await dropbox.save(
      json,
      'dbtest.json',
      document.getElementById('codeTokenInput').value,
    );
    chai.assert.equal(messages.get('display'), 'Dropbox access token renewed from input refresh token\n');
  });
});
