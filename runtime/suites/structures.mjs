import {
  seq,
  fill,
  grid,
  reverse,
  asc,
  answer as A,
  az,
  shuffle,
  suite as S,
  operations as ops,
  repeat
} from './build.mjs';
// Complete trees stay shallow enough for recursive traversals. Level order
// indices also give us independent expected traversals and balanced BSTs.
function walk(a, i, order, out = []) {
  if (i >= a.length) return out;
  if (order === 'pre') out.push(a[i]);
  walk(a, i * 2 + 1, order, out);
  if (order === 'in') out.push(a[i]);
  walk(a, i * 2 + 2, order, out);
  if (order === 'post') out.push(a[i]);
  return out;
}
function bst(n) {
  let a = seq(n);
  walk(seq(n), 0, 'in').forEach((k, i) => (a[k] = i + 1));
  return a;
}
const traversal = (order) =>
  S(100, (n) => {
    let a = seq(n, (i) => (i * 31) % 99);
    return A([a], walk(a, 0, order));
  });
const levels = (a) => {
  let rows = [];
  for (let k = 0; k < a.length; ) {
    let end = k * 2 + 1;
    rows.push(a.slice(k, end));
    k = end;
  }
  return rows;
};
const perfect = [7, 31, 255, 4095];
function allPerm(a) {
  return a.length
    ? a.flatMap((v, i) =>
        allPerm(a.filter((_, j) => i !== j)).map((xs) => [v, ...xs])
      )
    : [[]];
}
function subsets(a) {
  return a.reduce((sets, x) => [...sets, ...sets.map((s) => [...s, x])], [[]]);
}
function queens(n) {
  let boards = [];
  function put(cols) {
    if (cols.length === n) {
      boards.push(cols.map((i) => '.'.repeat(i) + 'Q' + '.'.repeat(n - i - 1)));
      return;
    }
    for (let i = 0; i < n; i++)
      if (!cols.some((c, r) => c === i || Math.abs(c - i) === cols.length - r))
        put([...cols, i]);
  }
  put([]);
  return boards;
}
const word = (i) =>
  'a' + az[Math.floor(i / 676) % 26] + az[Math.floor(i / 26) % 26] + az[i % 26];
export const structures = {
  'reverse-a-linked-list': S(4000, (n) => {
    let a = seq(n, (i) => i - 2000);
    return A([a], reverse(a));
  }),
  'merge-two-sorted-linked-lists': S(50, (n) => {
    let a = seq(n, (i) => 2 * i - 50),
      b = seq(n, (i) => 2 * i - 49);
    return A([a, b], asc([...a, ...b]));
  }),
  'linked-list-cycle-detection': S(9000, (n, t) =>
    A([seq(n), t % 2 ? n - 2 : -1], !!(t % 2))
  ),
  'reorder-linked-list': S(8000, (n) => {
    let a = seq(n, (i) => 1 + (i % 1000));
    return A(
      [a],
      seq(n, (i) => a[i % 2 ? n - 1 - (i >> 1) : i >> 1])
    );
  }),
  'remove-node-from-end-of-linked-list': S(30, (n) =>
    A(
      [seq(n), n - 1],
      seq(n).filter((i) => i !== 1)
    )
  ),
  'copy-linked-list-with-random-pointer': S(1000, (n) => {
    let a = seq(n, (i) => [i - 15, i % 3 ? n - i - 1 : null]);
    return A([a], a);
  }),
  'add-two-numbers': S(100, (n) => A([fill(n, 9), [1]], [...fill(n, 0), 1])),
  'find-duplicate-integer': S(65000, (n) =>
    A([shuffle([...seq(n, (i) => i + 1), n - 1], n)], n - 1)
  ),
  'reverse-linked-list-ii': S(500, (n) =>
    A([seq(n), 2, n], [0, ...reverse(seq(n).slice(1))])
  ),
  'design-circular-queue': S(1000, (n) =>
    ops(
      [n],
      [
        ...seq(n, (i) => ['enQueue', i, true]),
        ['isFull', true],
        ['enQueue', 999, false],
        ...repeat(n, (i) => [
          ['Front', i],
          ['deQueue', true]
        ]),
        ['Rear', -1]
      ]
    )
  ),
  'lru-cache': S(2500, (n) =>
    ops(
      [n],
      [
        ...seq(n, (i) => ['put', i, i + 5, null]),
        ['get', 0, 5],
        ['put', n, 900, null],
        ['get', 1, -1],
        ['get', n, 900]
      ]
    )
  ),
  'lfu-cache': S(3000, (n) =>
    ops(
      [n],
      [
        ...seq(n, (i) => ['put', i, i + 5, null]),
        ['get', 0, 5],
        ['put', n, 901, null],
        ['get', 1, -1],
        ['get', 0, 5],
        ['get', n, 901]
      ]
    )
  ),
  'merge-k-sorted-linked-lists': S(2500, (n) => {
    let a = seq(n, (i) => [i, n + i]);
    return A([a], seq(2 * n));
  }),
  'reverse-nodes-in-k-group': S(4800, (n) => {
    let a = seq(n, (i) => i % 999);
    return A(
      [a, 3],
      seq(n, (i) => (i - (i % 3) + 2 < n ? a[i - (i % 3) + 2 - (i % 3)] : a[i]))
    );
  }),
  'binary-tree-inorder-traversal': traversal('in'),
  'binary-tree-preorder-traversal': traversal('pre'),
  'binary-tree-postorder-traversal': traversal('post'),
  'invert-a-binary-tree': S([7, 15, 31, 63], (n) => {
    let a = seq(n);
    return A([a], levels(a).flatMap(reverse));
  }),
  'depth-of-binary-tree': S(perfect, (n) => A([fill(n, 3)], Math.log2(n + 1))),
  'binary-tree-diameter': S(perfect, (n) =>
    A([fill(n, 7)], 2 * (Math.log2(n + 1) - 1))
  ),
  'balanced-binary-tree': S(perfect, (n, t) => {
    let a = fill(n, 1);
    if (t % 2) a.push(1, null, ...fill(n - 1, null), 1);
    return A([a], !(t % 2));
  }),
  'same-binary-tree': S([7, 15, 31, 63], (n, t) => {
    let a = seq(n),
      b = a.slice();
    if (t % 2) b.pop();
    return A([a, b], !(t % 2));
  }),
  'subtree-of-a-binary-tree': S([7, 31, 255, 1023], (n, t) =>
    A([seq(n), [t % 2 ? -1 : n - 1]], !(t % 2))
  ),
  'lowest-common-ancestor-in-binary-search-tree': S(perfect, (n) => {
    let a = bst(n);
    return A([a, 1, n], a[0]);
  }),
  'insert-into-a-binary-search-tree': S(perfect, (n) => {
    let a = bst(n);
    return A([a, 0], [...a, 0]);
  }),
  'delete-node-in-a-bst': S(perfect, (n) => {
    let a = bst(n);
    return A([a, a.at(-1)], a.slice(0, -1));
  }),
  'level-order-traversal-of-binary-tree': S([7, 31, 255, 1023], (n) => {
    let a = seq(n, (i) => i % 177);
    return A([a], levels(a));
  }),
  'binary-tree-right-side-view': S([7, 15, 31, 63], (n) => {
    let a = seq(n);
    return A(
      [a],
      levels(a).map((r) => r.at(-1))
    );
  }),
  'construct-quad-tree': S([4, 8, 32, 64], (n) =>
    A([grid(n, n, (i, j) => Number(i < n / 2 === j < n / 2))], [1, 0, 0, 1])
  ),
  'count-good-nodes-in-binary-tree': S(perfect, (n) => A([seq(n)], n)),
  'valid-binary-search-tree': S(perfect, (n, t) => {
    let a = bst(n);
    if (t % 2) a[a.length - 1] = a[0];
    return A([a], !(t % 2));
  }),
  'kth-smallest-integer-in-bst': S(perfect, (n) => A([bst(n), n - 1], n - 1)),
  'binary-tree-from-preorder-and-inorder-traversal': S(
    [7, 31, 255, 2047],
    (n) => {
      let a = bst(n);
      return A([walk(a, 0, 'pre'), seq(n, (i) => i + 1)], a);
    }
  ),
  'house-robber-iii': S(perfect, (n) => {
    let a = fill(n, 1);
    return A(
      [a],
      levels(a)
        .reverse()
        .reduce((s, r, i) => s + (i % 2 ? 0 : r.length), 0)
    );
  }),
  'delete-leaves-with-a-given-value': S(perfect, (n) =>
    A([[2, ...fill(n - 1, 1)], 1], [2])
  ),
  'binary-tree-maximum-path-sum': S(perfect, (n) =>
    A([fill(n, 3)], 3 * (2 * Math.log2(n + 1) - 1))
  ),
  'serialize-and-deserialize-binary-tree': S(perfect, (n) => {
    let a = seq(n, (i) => (i % 101) - 50);
    return A([a], a);
  }),
  'kth-largest-integer-in-a-stream': S(9000, (n) =>
    ops(
      [2, [-2, -1]],
      seq(n, (i) => ['add', i, i - 1])
    )
  ),
  'last-stone-weight': S(30, (n) => A([fill(n, 17)], n % 2 ? 17 : 0)),
  'k-closest-points-to-origin': S(7500, (n) => {
    let a = seq(n, (i) => [i + 1, 0]),
      k = Math.floor(n / 2);
    return A([shuffle(a, n), k], a.slice(0, k));
  }),
  'kth-largest-element-in-an-array': S(65000, (n) => {
    let a = seq(n, (i) => (i % 1000) - 500),
      k = n >> 1;
    return A([shuffle(a, n), k], asc(a)[n - k]);
  }),
  'task-scheduling': S(10000, (n) => A([fill(n, 'A'), 4], (n - 1) * 5 + 1)),
  'design-twitter-feed': S(1200, (n) =>
    ops(
      [],
      [
        ...seq(n, (i) => ['postTweet', 1, i, null]),
        ['follow', 2, 1, null],
        ['getNewsFeed', 2, reverse(seq(n)).slice(0, 10)],
        ['unfollow', 2, 1, null],
        ['getNewsFeed', 2, []]
      ]
    )
  ),
  'single-threaded-cpu': S(15000, (n) =>
    A([seq(n, (i) => [1, n - i])], reverse(seq(n)))
  ),
  'reorganize-string': S(250, (n, t) =>
    A(
      ['a'.repeat(n) + 'b'.repeat(n - (t % 2 ? 2 : 0))],
      t % 2 ? '' : 'ab'.repeat(n)
    )
  ),
  'longest-happy-string': S(100, (n) => A([n, n, 1], 'ab'.repeat(n) + 'c')),
  'car-pooling': S(990, (n, t) =>
    A([seq(n, (i) => [1, i, i + 2]), t % 2 ? 1 : 2], !(t % 2))
  ),
  'find-median-in-a-data-stream': S(12000, (n) =>
    ops(
      [],
      repeat(n, (i) => [
        ['addNum', i, null],
        ['findMedian', i / 2]
      ])
    )
  ),
  ipo: S(25000, (n) => A([n, 0, fill(n, 1), seq(n)], n)),
  'sum-of-all-subset-xor-totals': S([2, 5, 9, 12], (n) => {
    let a = seq(n, (i) => i + 1);
    return A([a], a.reduce((v, x) => v | x, 0) * 2 ** (n - 1));
  }),
  subsets: S([3, 5, 8, 10], (n) => {
    let a = seq(n, (i) => i - 4);
    return A([a], subsets(a));
  }),
  'combination-target-sum': S([8, 11, 25, 39], (n) => {
    let r = [];
    for (let a = 0; 2 * a <= n; a++)
      if ((n - 2 * a) % 3 === 0)
        r.push([...fill(a, 2), ...fill((n - 2 * a) / 3, 3)]);
    return A([[2, 3], n], r);
  }),
  'combination-target-sum-ii': S(100, (n) => {
    let k = Math.min(n, 30);
    return A([fill(n, 1), k], [fill(k, 1)]);
  }),
  combinations: S([5, 8, 15, 20], (n) =>
    A([n, 2], seq(n, (i) => seq(n - i - 1, (j) => [i + 1, i + j + 2])).flat())
  ),
  permutations: S([3, 4, 5, 6], (n) => {
    let a = seq(n, (i) => i - 2);
    return A([a], allPerm(a));
  }),
  'subsets-ii': S([3, 5, 8, 10], (n) =>
    A(
      [fill(n, -2)],
      seq(n + 1, (i) => fill(i, -2))
    )
  ),
  'permutations-ii': S([3, 4, 6, 8], (n) =>
    A(
      [[...fill(n - 1, 3), 1]],
      seq(n, (i) => seq(n, (j) => (i === j ? 1 : 3)))
    )
  ),
  'search-for-word': S([2, 3, 5, 6], (n, t) =>
    A(
      [
        grid(n, n, (i, j) => az[(i + j) % 26]),
        az.slice(0, 2 * n - 2) + (t % 2 ? 'z' : az[2 * n - 2])
      ],
      !(t % 2)
    )
  ),
  'palindrome-partitioning': S([4, 7, 10, 13], (n) => {
    let s = 'a'.repeat(n),
      r = [[]];
    function parts(k) {
      return k
        ? seq(k, (i) =>
            parts(k - i - 1).map((p) => ['a'.repeat(i + 1), ...p])
          ).flat()
        : r;
    }
    return A([s], parts(n));
  }),
  'combinations-of-a-phone-number': S([1, 2, 3, 4], (n) => {
    let d = '79'.repeat(2).slice(0, n),
      r = [''];
    for (let c of d)
      r = r.flatMap((x) =>
        [...(c === '7' ? 'pqrs' : 'wxyz')].map((y) => x + y)
      );
    return A([d], r);
  }),
  'matchsticks-to-square': S([5, 8, 12, 15], (n) => A([fill(n, 3)], !(n % 4))),
  'partition-to-k-equal-sum-subsets': S([5, 8, 12, 16], (n) =>
    A([fill(n, 7), 4], !(n % 4))
  ),
  'n-queens': S([3, 5, 7, 9], (n) => A([n], queens(n))),
  'n-queens-ii': S([3, 5, 7, 9], (n, t) => A([n], [0, 10, 40, 352][t])),
  'word-break-ii': S([5, 8, 14, 20], (n, t) => {
    let s = 'a'.repeat(n - 1) + (t % 2 ? 'b' : 'a');
    return A([s, ['a']], t % 2 ? [] : [[...s].join(' ')]);
  }),
  'implement-prefix-tree': S(7000, (n) =>
    ops(
      [],
      repeat(n, (i) => [
        ['insert', word(i), null],
        ['search', word(i), true],
        ['startsWith', word(i).slice(0, 3), true]
      ])
    )
  ),
  'design-word-search-data-structure': S(2500, (n) =>
    ops(
      [],
      [
        ...seq(n, (i) => ['addWord', word(i), null]),
        ['search', 'a..a', true],
        ['search', 'b...', false]
      ]
    )
  ),
  'extra-characters-in-a-string': S(50, (n) =>
    A(['x' + 'a'.repeat(n - 2) + 'z', ['a', 'aaaa']], 2)
  ),
  'search-for-word-ii': S([3, 5, 8, 12], (n) =>
    A(
      [grid(n, n, (i, j) => az[(i + j) % 2]), ['ab', 'aba', 'z', 'aaa']],
      ['ab', 'aba']
    )
  )
};
