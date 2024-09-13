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
      '09e12d4cfb2e47c6181b6f7b4b785dbacb6809ab1f412006847ebf1d5111fd04',
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
    chai.assert.equal(json.getRec(1).get('priority'), 3);
    chai.assert.equal(
      response.get('upload_response').content_hash,
      '5b8d153dedccc151defc2a33609b7c00e1cb578470a3f75b96c281aa4d3aa279',
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
    chai.assert.equal(json.getRec(1).get('priority'), 4);
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
