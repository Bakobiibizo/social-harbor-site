const test = require('node:test');
const assert = require('node:assert/strict');
const { contactStringFromLocation, decodeContactString, MAX_CONTACT_LENGTH } = require('../js/add-friend.js');

const encode = value => Buffer.from(JSON.stringify(value), 'utf8').toString('base64url');
const decode = value => Buffer.from(value, 'base64').toString('binary');

test('decodes a valid unicode contact bundle', () => {
  const raw = encode({ displayName: '火山 🌊', multiaddr: '/ip4/127.0.0.1/tcp/4001/p2p/12D3KooWabc123' });
  assert.deepEqual(decodeContactString(raw, decode), {
    displayName: '火山 🌊', peerId: '12D3KooWabc123', raw
  });
});

test('rejects malformed, unbounded, and non-p2p data', () => {
  assert.equal(decodeContactString('%%%bad', decode), null);
  assert.equal(decodeContactString('a'.repeat(MAX_CONTACT_LENGTH + 1), decode), null);
  assert.equal(decodeContactString(encode({ displayName: 'A', multiaddr: '/ip4/127.0.0.1/tcp/1' }), decode), null);
  assert.equal(decodeContactString(encode({ displayName: '', multiaddr: '/p2p/id' }), decode), null);
});

test('extracts encoded path and query fallback without form-style mutation', () => {
  assert.equal(contactStringFromLocation({ pathname: '/add-friend/a%2Db', search: '' }), 'a-b');
  assert.equal(contactStringFromLocation({ pathname: '/add-friend/index.html', search: '?c=a%2Bb' }), 'a+b');
  assert.equal(contactStringFromLocation({ pathname: '/add-friend/a%2Fb', search: '' }), '');
});
