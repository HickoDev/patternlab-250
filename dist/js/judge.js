// This module is self-contained so it can also run inside an opaque-origin worker.
export class ListNode {
  constructor(val = 0, next = null) {
    this.val = val;
    this.next = next;
  }
}
export class TreeNode {
  constructor(val = 0, left = null, right = null) {
    Object.assign(this, { val, left, right });
  }
}
export class Node {
  constructor(val = 0, neighbors = []) {
    Object.assign(this, { val, neighbors, next: null, random: null });
  }
}

function list(values) {
  return values.reduceRight((next, val) => new ListNode(val, next), null);
}
function listNodes(head) {
  const nodes = [];
  const seen = new Set();
  while (head != null) {
    if (typeof head !== 'object' || seen.has(head) || nodes.length > 10000)
      throw Error('Expected a finite linked list.');
    seen.add(head);
    nodes.push(head);
    head = head.next;
  }
  return nodes;
}
function tree(values) {
  if (!values.length) return null;
  const root = new TreeNode(values[0]);
  const queue = [root];
  let index = 1;
  for (const parent of queue) {
    for (const side of ['left', 'right']) {
      if (index >= values.length) break;
      const val = values[index++];
      if (val !== null) queue.push((parent[side] = new TreeNode(val)));
    }
  }
  return root;
}
function treeValues(root) {
  const values = [];
  const queue = [root];
  const seen = new Set();
  for (const node of queue) {
    if (node == null) {
      values.push(null);
      continue;
    }
    if (typeof node !== 'object' || seen.has(node) || seen.size > 10000)
      throw Error('Expected a tree with distinct nodes.');
    seen.add(node);
    values.push(node.val);
    queue.push(node.left, node.right);
  }
  while (values.at(-1) === null) values.pop();
  return values;
}

const treeOutput = new Set([
  'invert-a-binary-tree',
  'insert-into-a-binary-search-tree',
  'delete-node-in-a-bst',
  'binary-tree-from-preorder-and-inorder-traversal',
  'delete-leaves-with-a-given-value'
]);
const listOutput = new Set([
  'reverse-a-linked-list',
  'merge-two-sorted-linked-lists',
  'reorder-linked-list',
  'remove-node-from-end-of-linked-list',
  'add-two-numbers',
  'reverse-linked-list-ii',
  'merge-k-sorted-linked-lists',
  'reverse-nodes-in-k-group',
  'insert-greatest-common-divisors-in-linked-list'
]);
const inPlace = new Set([
  'sort-colors',
  'reverse-string',
  'merge-sorted-array',
  'rotate-array',
  'reorder-linked-list',
  'islands-and-treasure',
  'surrounded-regions',
  'rotate-matrix',
  'set-zeroes-in-matrix'
]);
const bag = new Set([
  'two-integer-sum',
  'top-k-elements-in-list',
  'majority-element-ii',
  'generate-parentheses',
  'k-closest-points-to-origin',
  'permutations',
  'permutations-ii',
  'palindrome-partitioning',
  'combinations-of-a-phone-number',
  'n-queens',
  'word-break-ii',
  'search-for-word-ii',
  'pacific-atlantic-water-flow',
  'accounts-merge',
  'minimum-height-trees',
  'remove-element'
]);
const groups = new Set([
  'anagram-groups',
  'three-integer-sum',
  '4sum',
  'subsets',
  'combination-target-sum',
  'combination-target-sum-ii',
  'combinations',
  'subsets-ii'
]);
export function sampleInterface(problem) {
  const { slug, params, methods } = problem;
  return {
    slug,
    params,
    methods,
    treeOutput: treeOutput.has(slug),
    listOutput: listOutput.has(slug),
    inPlace: inPlace.has(slug)
  };
}
function sorted(array) {
  return array
    .slice()
    .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b)));
}
function equal(a, b) {
  if (typeof a === 'number' && typeof b === 'number' && !Number.isInteger(b))
    return (
      Number.isFinite(a) && Math.abs(a - b) <= 1e-8 * Math.max(1, Math.abs(b))
    );
  if (Array.isArray(a) && Array.isArray(b))
    return (
      a.length === b.length && b.every((value, index) => equal(a[index], value))
    );
  return a === b;
}
function validBst(node, low = -Infinity, high = Infinity) {
  return (
    !node ||
    (node.val > low &&
      node.val < high &&
      validBst(node.left, low, node.val) &&
      validBst(node.right, node.val, high))
  );
}
export function matches(slug, actual, expected, args) {
  if (actual === undefined) return false;
  if (bag.has(slug))
    return Array.isArray(actual) && equal(sorted(actual), sorted(expected));
  if (groups.has(slug))
    return (
      Array.isArray(actual) &&
      actual.every(Array.isArray) &&
      equal(sorted(actual.map(sorted)), sorted(expected.map(sorted)))
    );
  if (
    slug === 'find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree'
  )
    return (
      Array.isArray(actual) &&
      actual.length === 2 &&
      actual.every(
        (x, i) => Array.isArray(x) && equal(sorted(x), sorted(expected[i]))
      )
    );
  if (slug === 'reorganize-string')
    return (
      typeof actual === 'string' &&
      (expected === ''
        ? actual === ''
        : equal(sorted([...actual]), sorted([...args[0]])) &&
          !/(.)\1/.test(actual))
    );
  if (slug === 'longest-happy-string')
    return (
      typeof actual === 'string' &&
      actual.length === expected.length &&
      /^[abc]*$/.test(actual) &&
      !/(.)\1\1/.test(actual) &&
      [...'abc'].every(
        (x, i) => [...actual].filter((c) => c === x).length <= args[i]
      )
    );
  if (slug === 'longest-palindromic-substring')
    return (
      typeof actual === 'string' &&
      actual.length === expected.length &&
      args[0].includes(actual) &&
      [...actual].reverse().join('') === actual
    );
  if (slug === 'delete-node-in-a-bst') {
    if (!Array.isArray(actual)) return false;
    return (
      validBst(tree(actual)) &&
      equal(
        sorted(actual.filter((x) => x !== null)),
        sorted(expected.filter((x) => x !== null))
      )
    );
  }
  if (slug === 'course-schedule-ii' && expected.length) {
    const [n, edges] = args;
    return (
      Array.isArray(actual) &&
      actual.length === n &&
      new Set(actual).size === n &&
      actual.every((x) => Number.isInteger(x) && x >= 0 && x < n) &&
      edges.every(([a, b]) => actual.indexOf(b) < actual.indexOf(a))
    );
  }
  if (slug === 'foreign-dictionary' && expected.length) {
    if (
      typeof actual !== 'string' ||
      !equal(sorted([...actual]), sorted([...expected]))
    )
      return false;
    return args[0].slice(1).every((word, i) => {
      const prev = args[0][i];
      let j = 0;
      while (j < Math.min(prev.length, word.length) && prev[j] === word[j]) j++;
      return j === Math.min(prev.length, word.length)
        ? prev.length <= word.length
        : actual.indexOf(prev[j]) < actual.indexOf(word[j]);
    });
  }
  if (slug === 'build-a-matrix-with-conditions' && expected.length) {
    const [k, rows, cols] = args;
    if (
      !Array.isArray(actual) ||
      actual.length !== k ||
      !actual.every((row) => Array.isArray(row) && row.length === k)
    )
      return false;
    const positions = new Map();
    for (const [i, row] of actual.entries())
      for (const [j, x] of row.entries()) {
        if (x === 0) continue;
        if (!Number.isInteger(x) || x < 1 || x > k || positions.has(x))
          return false;
        positions.set(x, [i, j]);
      }
    return (
      positions.size === k &&
      rows.every(([a, b]) => positions.get(a)[0] < positions.get(b)[0]) &&
      cols.every(([a, b]) => positions.get(a)[1] < positions.get(b)[1])
    );
  }
  return equal(actual, expected);
}

function graphCopy(fn, adjacency) {
  const original = adjacency.map((_, i) => new Node(i + 1));
  original.forEach(
    (node, i) =>
      (node.neighbors = adjacency[i].map((label) => original[label - 1]))
  );
  const clone = fn(original[0] ?? null);
  if (clone === null) return [];
  const found = new Map();
  const queue = [clone];
  for (const node of queue) {
    if (!node || !Array.isArray(node.neighbors) || original.includes(node))
      throw Error('Return an independent graph of Node objects.');
    if (found.has(node.val)) {
      if (found.get(node.val) !== node) throw Error('A vertex was duplicated.');
      continue;
    }
    if (found.size >= original.length) throw Error('Unexpected vertex.');
    found.set(node.val, node);
    queue.push(...node.neighbors);
  }
  if (clone.val !== 1) throw Error('Return the copy of the starting vertex.');
  return Array.from({ length: found.size }, (_, i) =>
    found
      .get(i + 1)
      .neighbors.map((n) => n.val)
      .sort((a, b) => a - b)
  );
}
function randomCopy(fn, values) {
  const nodes = values.map(([v]) => new Node(v));
  nodes.forEach((node, i) => {
    node.next = nodes[i + 1] ?? null;
    node.random = nodes[values[i][1]] ?? null;
  });
  const copy = listNodes(fn(nodes[0] ?? null));
  if (copy.some((n) => nodes.includes(n)))
    throw Error('Return an independent copy.');
  return copy.map((n) => [
    n.val,
    n.random == null ? null : copy.indexOf(n.random)
  ]);
}
export function evaluateSample(problem, userCode, rawArgs) {
  const { slug, methods, params } = problem;
  const args = structuredClone(rawArgs);
  const create = new Function(
    'ListNode',
    'TreeNode',
    'Node',
    '"use strict";\n' +
      userCode +
      '\nreturn ' +
      (methods ? 'Solution' : 'solve') +
      ';'
  );
  const fn = create(ListNode, TreeNode, Node);
  if (
    slug === 'string-encode-and-decode' ||
    slug === 'serialize-and-deserialize-binary-tree'
  ) {
    const binary = slug.startsWith('serialize');
    const encoded = binary
      ? new fn().serialize(tree(args[0]))
      : new fn().encode(args[0]);
    if (typeof encoded !== 'string')
      throw Error('The encoded value must be a string.');
    return binary
      ? treeValues(new fn().deserialize(encoded))
      : new fn().decode(encoded);
  }
  if (methods) {
    const [init, ...ops] = args[0];
    const instance = new fn(...init.slice(1));
    return [
      null,
      ...ops.map(([method, ...values]) => instance[method](...values) ?? null)
    ];
  }
  if (slug === 'clone-graph') return graphCopy(fn, args[0]);
  if (slug === 'copy-linked-list-with-random-pointer')
    return randomCopy(fn, args[0]);
  if (slug === 'linked-list-cycle-detection') {
    const head = list(args[0]);
    const nodes = listNodes(head);
    if (nodes.length) nodes.at(-1).next = nodes[args[1]] ?? null;
    return fn(head);
  }
  if (slug === 'guess-number-higher-or-lower')
    return fn(args[0], (value) => Math.sign(args[1] - value));
  if (slug === 'find-in-mountain-array')
    return fn(args[0], {
      get: (index) => args[1][index],
      length: () => args[1].length
    });
  const inputs = args.map((arg, i) => {
    if (['root', 'other', 'subRoot'].includes(params[i])) return tree(arg);
    if (['head', 'headA', 'headB'].includes(params[i])) return list(arg);
    if (params[i] === 'lists') return arg.map(list);
    return arg;
  });
  let result = fn(...inputs);
  if (
    slug === 'remove-element' ||
    slug === 'remove-duplicates-from-sorted-array'
  ) {
    if (!Number.isInteger(result) || result < 0 || result > inputs[0].length)
      throw Error('Return the retained prefix length.');
    return inputs[0].slice(0, result);
  }
  if (inPlace.has(slug) && result === undefined) result = inputs[0];
  if (result === undefined) return undefined;
  if (treeOutput.has(slug)) return treeValues(result);
  if (listOutput.has(slug)) return listNodes(result).map((n) => n.val);
  return result;
}
export function runSamples(problem, code) {
  return problem.cases.map(({ args, expected }) => {
    const start = performance.now();
    try {
      const actual = evaluateSample(problem, code, args);
      const elapsedMs = performance.now() - start;
      const passed = matches(problem.slug, actual, expected, args);
      return {
        passed,
        elapsedMs,
        actual: (JSON.stringify(actual) ?? String(actual)).slice(0, 2000)
      };
    } catch (error) {
      return {
        passed: false,
        elapsedMs: performance.now() - start,
        error: String(error?.message ?? error).slice(0, 500)
      };
    }
  });
}
