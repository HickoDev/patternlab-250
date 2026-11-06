import { readFile } from 'node:fs/promises';
import { matches } from '../dist/js/judge.js';
import { arrays } from './suites/arrays.mjs';
import { structures } from './suites/structures.mjs';
import { graphsDP } from './suites/graphs-dp.mjs';
import { greedyMath } from './suites/greedy-math.mjs';
import { edges } from './suites/edges.mjs';

const { problems } = JSON.parse(
  await readFile(new URL('../dist/data/catalog.json', import.meta.url))
);
const bySlug = new Map(problems.map((p) => [p.slug, p]));
const recipes = { ...arrays, ...structures, ...graphsDP, ...greedyMath };
export const caseLimitMs = 3000;
const outputLimit = 2 * 1024 * 1024;
export function getSuite(slug) {
  const p = bySlug.get(slug),
    recipe = recipes[slug];
  if (!p || !recipe) return null;
  const seen = new Set(),
    cases = [];
  function add(c, label, group) {
    const key = JSON.stringify(c.args);
    if (seen.has(key)) return;
    seen.add(key);
    cases.push({ ...c, label, group, size: describe(p, c.args) });
  }
  p.cases.forEach((c, i) => add(c, 'Sample ' + (i + 1), 'sample'));
  const extra = edges[slug];
  if (extra)
    add({ args: extra[0], expected: extra[1] }, 'Hidden case 1', 'hidden');
  recipe.sizes.forEach((n, i) =>
    add(
      recipe.make(n, i),
      i < 2
        ? 'Hidden case ' + (i + 1 + Number(!!extra))
        : 'Stress case ' + (i - 1),
      i < 2 ? 'hidden' : 'stress'
    )
  );
  return cases;
}
function describe(p, args) {
  return args
    .map((v, i) => {
      const name =
        p.params?.[i] ||
        (p.slug === 'string-encode-and-decode'
          ? 'strings'
          : p.slug === 'serialize-and-deserialize-binary-tree'
            ? 'tree'
            : p.methods
              ? 'operations'
              : 'input');
      if (Array.isArray(v)) {
        if (p.methods && !p.params && v[0]?.[0] === 'new')
          return (v.length - 1).toLocaleString('en-US') + ' operations';
        if (
          Array.isArray(v[0]) &&
          ['matrix', 'grid', 'heights', 'rooms', 'board'].includes(name)
        )
          return v.length + ' × ' + v[0].length + ' ' + name;
        return name + ': ' + v.length.toLocaleString('en-US') + ' items';
      }
      if (typeof v === 'string')
        return name + ': ' + v.length.toLocaleString('en-US') + ' chars';
      return Number.isInteger(v)
        ? name +
            ': ' +
            (v === 0 ? 1 : Math.floor(Math.log2(Math.abs(v))) + 1) +
            '-bit integer'
        : name + ': number';
    })
    .join(' · ');
}
function json(res, status, data) {
  res
    .writeHead(status, {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff'
    })
    .end(JSON.stringify(data));
}
async function body(req) {
  const parts = [];
  let n = 0;
  for await (const b of req) {
    n += b.length;
    if (n > outputLimit) throw Error('oversized');
    parts.push(b);
  }
  return JSON.parse(Buffer.concat(parts).toString());
}
// No submission code runs on the server. The sandbox receives only inputs;
// only the main app can ask this loopback endpoint to compare an answer.
export async function submitAPI(req, res, path, port) {
  const hosts = new Set(['127.0.0.1:' + port, 'localhost:' + port]);
  if (
    !hosts.has(req.headers.host) ||
    (req.headers.origin &&
      req.headers.origin !== 'http://' + req.headers.host) ||
    req.headers['sec-fetch-site'] === 'cross-site'
  )
    return json(res, 403, { error: 'Use the local practice room.' });
  const m = path.match(/^\/api\/submit\/([a-z0-9-]+)\/(cases|\d+)$/);
  if (!m || !bySlug.has(m[1]))
    return json(res, 404, { error: 'Unknown problem.' });
  const [, slug, key] = m;
  // One bounded cache avoids rebuilding large fixtures between case checks.
  if (cache?.slug !== slug) cache = { slug, cases: getSuite(slug) };
  const cases = cache.cases;
  if (key === 'cases' && req.method === 'GET')
    return json(res, 200, {
      caseLimitMs,
      outputLimit,
      cases: cases.map(({ args, label, size, group }) => ({
        args,
        label,
        size,
        group
      }))
    });
  if (key === 'cases' || req.method !== 'POST')
    return json(res, 405, { error: 'Unsupported submission request.' });
  const c = cases[Number(key)];
  if (!c) return json(res, 404, { error: 'Unknown test case.' });
  if (!req.headers['content-type']?.startsWith('application/json'))
    return json(res, 415, { error: 'JSON required.' });
  try {
    const data = await body(req);
    if (!data || !Object.hasOwn(data, 'actual'))
      return json(res, 400, { error: 'Missing answer.' });
    let passed = false;
    try {
      passed = matches(slug, data.actual, c.expected, c.args);
    } catch {
      /* malformed solution output */
    }
    return json(res, 200, { passed });
  } catch (e) {
    return json(res, e.message === 'oversized' ? 413 : 400, {
      error: 'Invalid or oversized answer.'
    });
  }
}
let cache;
