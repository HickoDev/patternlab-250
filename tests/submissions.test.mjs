import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { getSuite } from '../runtime/submissions.mjs';
import { matches } from '../dist/js/judge.js';

const { problems } = JSON.parse(
  await readFile(new URL('../dist/data/catalog.json', import.meta.url))
);
test('all 250 suites contain distinct public, hidden and stress inputs with checkable answers', () => {
  for (const p of problems) {
    const cases = getSuite(p.slug);
    assert.deepEqual(
      cases.slice(0, p.cases.length).map((c) => c.group),
      p.cases.map(() => 'sample'),
      p.slug
    );
    const hidden = cases.slice(p.cases.length, -2);
    assert.ok(
      hidden.length >= 2 && hidden.every((c) => c.group === 'hidden'),
      p.slug
    );
    assert.deepEqual(
      cases.slice(-2).map((c) => c.group),
      ['stress', 'stress'],
      p.slug
    );
    assert.equal(
      new Set(cases.map((c) => JSON.stringify(c.args))).size,
      cases.length,
      p.slug
    );
    for (const c of cases) {
      assert.ok(c.size, p.slug);
      assert.ok(
        matches(p.slug, c.expected, c.expected, c.args),
        p.slug + ' ' + c.label
      );
      assert.ok(
        matches(
          p.slug,
          JSON.parse(JSON.stringify(c.expected)),
          c.expected,
          c.args
        ),
        p.slug
      );
    }
  }
});
test('stress pairs are unique, include late matches and reject a sample-only answer', () => {
  const cases = getSuite('two-integer-sum');
  for (const c of cases.filter((c) => c.group !== 'sample')) {
    const [a, k] = c.args,
      seen = new Map(),
      pairs = [];
    for (const [i, x] of a.entries()) {
      if (seen.has(k - x)) pairs.push([seen.get(k - x), i]);
      seen.set(x, i);
    }
    assert.equal(pairs.length, 1);
    assert.ok(matches('two-integer-sum', pairs[0], c.expected, c.args));
  }
  assert.equal(cases.at(-1).args[0].length, 10000);
  assert.ok(cases.at(-1).expected.every((x) => x >= 9998));
  assert.equal(
    matches(
      'two-integer-sum',
      cases[0].expected,
      cases.at(-1).expected,
      cases.at(-1).args
    ),
    false
  );
});
test('the local submission API keeps expected answers server-side and rejects cross-origin checks', async (t) => {
  const child = spawn(process.execPath, ['server.mjs'], {
    cwd: new URL('../', import.meta.url),
    env: { ...process.env, PORT: '0' },
    stdio: ['ignore', 'pipe', 'pipe']
  });
  t.after(() => child.kill());
  const [chunk] = await once(child.stdout, 'data'),
    origin = chunk.toString().match(/http:\/\/127\.0\.0\.1:\d+/)[0],
    base = origin + '/api/submit/is-anagram/';
  const manifest = await (await fetch(base + 'cases')).json();
  assert.equal(manifest.caseLimitMs, 3000);
  assert.ok(manifest.cases.every((c) => !Object.hasOwn(c, 'expected')));
  const i = manifest.cases.length - 1;
  const [s, t2] = manifest.cases[i].args,
    answer = [...s].sort().join('') === [...t2].sort().join('');
  for (const [actual, passed] of [
    [answer, true],
    [!answer, false]
  ]) {
    const r = await fetch(base + i, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ actual })
    });
    assert.deepEqual(await r.json(), { passed });
  }
  assert.equal(
    (await fetch(base + 'cases', { headers: { Origin: 'null' } })).status,
    403
  );
  assert.equal((await fetch(origin + '/runtime/submissions.mjs')).status, 404);
  assert.equal((await fetch(base + '9999', { method: 'POST' })).status, 404);
});
