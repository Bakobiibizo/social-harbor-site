const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');

for (const page of ['index.html', 'add-friend/index.html', 'privacy/index.html', 'docs/index.html', 'docs/developers/index.html']) {
  test(`${page} has core document metadata`, () => {
    const html = fs.readFileSync(page, 'utf8');
    assert.match(html, /<html lang="en">/);
    assert.match(html, /<meta name="viewport"/);
    assert.match(html, /<title>[^<]+<\/title>/);
    assert.doesNotMatch(html, /<script[^>]+src="https?:\/\//);
  });
}

test('download page loads its resolver from the clean URL', () => {
  const html = fs.readFileSync('download/index.html', 'utf8');
  assert.match(html, /<script src="\/download\/resolver\.js"><\/script>/);
});
