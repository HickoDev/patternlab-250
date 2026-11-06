import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { makeBackup, parseBackup } from '../dist/js/progress.js';
import { limitPythonHeap, PYTHON_HEAP_MIB } from '../runtime/memory-limit.mjs';

test('backup round trip preserves false flags, empty drafts and active retries', () => {
  const records = new Map([
    [
      'is-anagram',
      {
        solved: false,
        saved: true,
        notes: '',
        code: 'function solve(s,t) {}',
        python: 'def solve(s,t): pass',
        reviewAt: 1234,
        retryCode: '',
        retryPython: ''
      }
    ]
  ]);
  const backup = JSON.stringify(makeBackup(records));
  assert.deepEqual(parseBackup(backup, records), records);
  const invalid = JSON.parse(backup);
  invalid.records.unknown = { solved: true };
  assert.throws(
    () => parseBackup(JSON.stringify(invalid), records),
    /Unknown problem/
  );
  delete invalid.records.unknown;
  invalid.records['is-anagram'].solved = 'true';
  assert.throws(
    () => parseBackup(JSON.stringify(invalid), records),
    /Invalid field/
  );
});
test('WebAssembly memory refuses growth beyond the configured Python heap', async () => {
  // Minimal module with one memory, originally allowed 65,536 pages, exported as "m".
  const module = Buffer.from(
    '0061736d0100000005070101e003808004070501016d0200',
    'hex'
  );
  const { instance } = await WebAssembly.instantiate(limitPythonHeap(module));
  const memory = instance.exports.m;
  const currentPages = memory.buffer.byteLength / 65536;
  memory.grow(PYTHON_HEAP_MIB * 16 - currentPages);
  assert.throws(() => memory.grow(1), RangeError);
  assert.throws(
    () => limitPythonHeap(Buffer.from('0061736d01000000', 'hex')),
    /Unsupported/
  );
});
test('every complexity entry distinguishes official recommendations from named editorial methods', async () => {
  const data = (name) =>
    readFile(
      new URL('../dist/data/' + name + '.json', import.meta.url),
      'utf8'
    ).then(JSON.parse);
  const [{ problems }, strategies] = await Promise.all([
    data('catalog'),
    data('strategies')
  ]);
  for (const p of problems) {
    const { neetcode, leetcode, hint } = strategies[p.slug];
    assert.ok(hint && neetcode.time && neetcode.space, p.slug);
    assert.equal(new URL(neetcode.url).hostname, 'neetcode.io');
    if (neetcode.kind === 'Recommended target')
      assert.ok(neetcode.url.endsWith('/question'));
    else {
      assert.equal(neetcode.kind, 'Published solution');
      assert.ok(neetcode.method && neetcode.url.includes('/solutions/'));
    }
    assert.equal(leetcode.url, p.leetcode_url);
  }
  assert.equal(strategies['is-anagram'].neetcode.time, 'O(n + m)');
  assert.equal(strategies['is-anagram'].neetcode.space, 'O(1)');
});
