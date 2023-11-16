import Dropbox from '../js/dropbox.js';
import Json from '../js/json.js';

const dropbox = await new Dropbox(document.getElementById('codetokenInput').value);

/* global suite, test, chai */

suite('Dropbox', async () => {
  test('upload db', async () => {
    const json = new Json();
    json.setRec(1, 'priority', 2);
    const response = await dropbox.save(
      json,
      'dbtest.json',
      document.getElementById('codetokenInput').value,
    );
    chai.assert.equal(
      response.get('upload_response').content_hash,
      '09e12d4cfb2e47c6181b6f7b4b785dbacb6809ab1f412006847ebf1d5111fd04',
    );
  });
  test('upload db without refresh token', async () => {
    const json = new Json();
    json.setRec(1, 'priority', 3);
    await dropbox.save(
      json,
      'dbtest.json',
      document.getElementById('codetokenInput').value,
    );
    json.setRec(1, 'priority', 2);
    const response = await dropbox.save(
      json,
      'dbtest.json',
    );
    chai.assert.equal(
      response.get('upload_response').content_hash,
      '09e12d4cfb2e47c6181b6f7b4b785dbacb6809ab1f412006847ebf1d5111fd04',
    );
  });
  test('download', async () => {
    let json = new Json();
    json.setRec(1, 'priority', 4);
    await dropbox.save(
      json,
      'dbtest.json',
      document.getElementById('codetokenInput').value,
    );
    json = new Json();
    await dropbox.load(json, 'dbtest.json');
    chai.assert.equal(json.getRec(1).get('priority'), 4);
  });
  test('access token renewal message', async () => {
    const json = new Json();
    json.setRec(1, 'priority', 4);
    delete dropbox.accessToken;
    const messages = await dropbox.save(
      json,
      'dbtest.json',
      document.getElementById('codetokenInput').value,
    );
    chai.assert.equal(messages.get('display'), 'Access token renewed');
  });
});
