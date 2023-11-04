import UtcConv from '../js/utcconv.js';

/* global suite, test, chai */

suite('UtcConv', () => {
  test('UTC to local', () => {
    const local = UtcConv.getLocalDateTime('2023-10-01T09:08:46.606Z');
    chai.assert.equal(local, '2023-10-01 11:08');
  });
  test('UTC short to local', () => {
    const local = UtcConv.getLocalDateTime('2023-10-01T09:08Z');
    chai.assert.equal(local, '2023-10-01 11:08');
  });
  test('local to UTC', () => {
    const utc = UtcConv.getUTCDateTime('2023-10-01 11:08');
    chai.assert.equal(utc, '2023-10-01T09:08:00.000Z');
  });
  test('now local to UTC and reverse', () => {
    const utc = new Date().toISOString();
    const local = UtcConv.getLocalDateTime(utc);
    chai.assert.equal(UtcConv.getLocalDateTime(utc), local);
  });
  test('invalid datetime', () => {
    const local = UtcConv.getLocalDateTime('2023-10-0109:08:00');
    chai.assert.equal(UtcConv.getLocalDateTime('2023-10-0109:08:00'), local);
  });
});
