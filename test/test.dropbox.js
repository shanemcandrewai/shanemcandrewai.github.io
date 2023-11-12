import Dropbox from '../js/dropbox.js';
import Json from '../js/json.js';

const dropbox = new Dropbox();

/* global suite, test, chai */

suite('Dropbox', async () => {
  test('upload db', async () => {
    const json = new Json();
    json.setRec(1, 'priority', 2);
    const response = await dropbox.save(
      json,
      'dbtest.json',
      document.getElementById('tokenInput').value,
    );
    chai.assert.equal(
      response.content_hash,
      '09e12d4cfb2e47c6181b6f7b4b785dbacb6809ab1f412006847ebf1d5111fd04',
    );
  });
  test('upload db without', async () => {
    const json = new Json();
    json.setRec(1, 'priority', 3);
    await dropbox.save(
      json,
      'dbtest.json',
      document.getElementById('tokenInput').value,
    );
    json.setRec(1, 'priority', 2);
    const response = await dropbox.save(
      json,
      'dbtest.json',
    );
    chai.assert.equal(
      response.content_hash,
      '09e12d4cfb2e47c6181b6f7b4b785dbacb6809ab1f412006847ebf1d5111fd04',
    );
  });
  test('download', async () => {
    const json = new Json();
    json.setRec(1, 'priority', 4);
    await dropbox.save(
      json,
      'dbtest.json',
      document.getElementById('tokenInput').value,
    );
    await dropbox.load(json, 'dbtest.json');
    chai.assert.equal(json.getRec(1).get('priority'), 4);
  });
});
