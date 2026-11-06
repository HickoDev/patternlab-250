import {
  seq,
  fill,
  grid,
  reverse,
  answer as A,
  az,
  suite as S
} from './build.mjs';
const chain = (n) => seq(n - 1, (i) => [i, i + 1]);
const stairs = (n) => {
  let a = 1,
    b = 1;
  for (let i = 2; i <= n; i++) [a, b] = [b, a + b];
  return b;
};
const airport = (i) =>
  'A' + az[(i / 26) | 0].toUpperCase() + az[i % 26].toUpperCase();
export const graphsDP = {
  'island-perimeter': S(100, (n) => A([grid(n, n, () => 1)], 4 * n)),
  'verifying-an-alien-dictionary': S(100, (n, t) => {
    let a = seq(n, (i) => az[(i / 26) | 0] + az[i % 26]);
    return A([t % 2 ? reverse(a) : a, az], !(t % 2));
  }),
  'find-the-town-judge': S([4, 8, 250, 1000], (n, t) =>
    A(
      [n, [...seq(n - 1, (i) => [i + 1, n]), ...(t % 2 ? [[n, 1]] : [])]],
      t % 2 ? -1 : n
    )
  ),
  'count-number-of-islands': S(200, (n) =>
    A([grid(n, n, (i, j) => ((i + j) % 2 ? '0' : '1'))], Math.ceil((n * n) / 2))
  ),
  'max-area-of-island': S(50, (n) =>
    A([grid(n, n, (i) => (i % 2 ? 0 : 1))], n)
  ),
  'clone-graph': S(100, (n) => {
    let a = seq(n, (i) => [...(i ? [i] : []), ...(i < n - 1 ? [i + 2] : [])]);
    return A([a], a);
  }),
  'islands-and-treasure': S(130, (n) =>
    A(
      [grid(n, n, (i, j) => (i || j ? 2147483647 : 0))],
      grid(n, n, (i, j) => i + j)
    )
  ),
  'rotting-fruit': S([3, 5, 8, 10], (n) =>
    A([grid(n, n, (i, j) => (i || j ? 1 : 2))], 2 * (n - 1))
  ),
  'pacific-atlantic-water-flow': S(110, (n) =>
    A(
      [grid(n, n, (i, j) => i + j)],
      seq(n, (i) => (i === n - 1 ? seq(n, (j) => [i, j]) : [[i, n - 1]])).flat()
    )
  ),
  'surrounded-regions': S(150, (n) =>
    A(
      [
        grid(n, n, (i, j) =>
          i > 0 && j > 0 && i < n - 1 && j < n - 1 ? 'O' : 'X'
        )
      ],
      grid(n, n, () => 'X')
    )
  ),
  'open-the-lock': S(500, (n, t) => {
    let dead = seq(n, (i) => String(1000 + i));
    return A([dead, t % 2 ? '5555' : '9999'], t % 2 ? 20 : 4);
  }),
  'course-schedule': S(1600, (n, t) =>
    A([n, [...chain(n), ...(t % 2 ? [[n - 1, 0]] : [])]], !(t % 2))
  ),
  'course-schedule-ii': S(1600, (n, t) =>
    A(
      [n, [...chain(n), ...(t % 2 ? [[n - 1, 0]] : [])]],
      t % 2 ? [] : reverse(seq(n))
    )
  ),
  'valid-tree': S(3000, (n, t) =>
    A([n, [...chain(n), ...(t % 2 ? [[0, n - 1]] : [])]], !(t % 2))
  ),
  'course-schedule-iv': S(100, (n) => {
    let q = seq(n, (i) => [i, (i + 1) % n]);
    return A(
      [n, chain(n), q],
      q.map(([a, b]) => a < b)
    );
  }),
  'count-connected-components': S(2000, (n) =>
    A([n, chain(n).filter(([i]) => i % 4 !== 0)], 1 + Math.ceil((n - 1) / 4))
  ),
  'redundant-connection': S(1000, (n) =>
    A([[...seq(n - 1, (i) => [i + 1, i + 2]), [1, n]]], [1, n])
  ),
  'accounts-merge': S(1000, (n) => {
    let mail = (i) => 'u' + i + '@test.dev',
      a = seq(n, (i) => ['Jo', mail(i), mail(i + 1)]);
    return A([a], [['Jo', ...seq(n + 1, mail).sort()]]);
  }),
  'evaluate-division': S([3, 5, 12, 20], (n) =>
    A(
      [
        seq(n, (i) => ['x' + i, 'x' + (i + 1)]),
        fill(n, 2),
        [
          ['x0', 'x' + n],
          ['x' + n, 'x0'],
          ['u', 'u']
        ]
      ],
      [2 ** n, 2 ** -n, -1]
    )
  ),
  'minimum-height-trees': S(12000, (n) =>
    A([n, chain(n)], n % 2 ? [n >> 1] : [n / 2 - 1, n / 2])
  ),
  'word-ladder': S([5, 26, 676, 4000], (n) => {
    let pad = (i) => az[(i / 676) | 0] + az[((i / 26) | 0) % 26] + az[i % 26];
    return A(['zzz', 'zza', [...seq(n, pad), 'zza']], 2);
  }),
  'path-with-minimum-effort': S(100, (n) =>
    A([grid(n, n, (i, j) => 1 + 2 * i + 3 * j)], 3)
  ),
  'network-delay-time': S(100, (n) =>
    A([seq(n - 1, (i) => [i + 1, i + 2, 3]), n, 1], 3 * (n - 1))
  ),
  'reconstruct-flight-path': S(300, (n) => {
    let a = ['JFK', ...seq(n, airport)];
    return A([reverse(seq(n, (i) => [a[i], a[i + 1]]))], a);
  }),
  'min-cost-to-connect-points': S(750, (n) =>
    A([seq(n, (i) => [i * 3, 1])], 3 * (n - 1))
  ),
  'swim-in-rising-water': S(50, (n) =>
    A([grid(n, n, (i, j) => n * n - 1 - (i * n + j))], n * n - 1)
  ),
  'foreign-dictionary': S([3, 7, 15, 26], (n) =>
    A([seq(n, (i) => az[i])], az.slice(0, n))
  ),
  'cheapest-flight-path': S(100, (n, t) =>
    A(
      [
        n,
        [...chain(n).map(([a, b]) => [a, b, 1]), [0, n - 1, 999]],
        0,
        n - 1,
        t % 2 ? 0 : n - 2
      ],
      t % 2 ? 999 : n - 1
    )
  ),
  'find-critical-and-pseudo-critical-edges-in-minimum-spanning-tree': S(
    100,
    (n) =>
      A(
        [n, [...chain(n).map(([a, b]) => [a, b, 1]), [0, n - 1, 1]]],
        [[], seq(n)]
      )
  ),
  'build-a-matrix-with-conditions': S(180, (n) => {
    let e = chain(n).map(([a, b]) => [a + 1, b + 1]);
    return A(
      [n, e, e],
      grid(n, n, (i, j) => (i === j ? i + 1 : 0))
    );
  }),
  'greatest-common-divisor-traversal': S(40000, (n, t) =>
    A([[...fill(n - 1, 6), t % 2 ? 7 : 10]], !(t % 2))
  ),
  'climbing-stairs': S([3, 9, 32, 45], (n) => A([n], stairs(n))),
  'min-cost-climbing-stairs': S(1000, (n) =>
    A([fill(n, 9)], 9 * Math.floor(n / 2))
  ),
  'n-th-tribonacci-number': S([2, 9, 28, 37], (n) => {
    let a = [0, 1, 1];
    while (a.length <= n) a.push(a.at(-1) + a.at(-2) + a.at(-3));
    return A([n], a[n]);
  }),
  'house-robber': S(100, (n) => A([fill(n, 11)], 11 * Math.ceil(n / 2))),
  'house-robber-ii': S(100, (n) => A([fill(n, 7)], 7 * Math.floor(n / 2))),
  'longest-palindromic-substring': S(1000, (n) =>
    A(['a'.repeat(n - 1) + 'z'], 'a'.repeat(n - 1))
  ),
  'palindromic-substrings': S([4, 8, 250, 1000], (n) =>
    A(['a'.repeat(n)], (n * (n + 1)) / 2)
  ),
  'decode-ways': S(100, (n, t) =>
    A(
      ['10'.repeat((n - 2) >> 1) + (n % 2 ? '1' : '') + (t % 2 ? '12' : '00')],
      t % 2 ? 2 : 0
    )
  ),
  'coin-change': S(10000, (n) =>
    A(
      [[2, 5], n],
      (() => {
        for (let f = Math.floor(n / 5); f >= 0; f--)
          if (!((n - f * 5) % 2)) return f + (n - f * 5) / 2;
        return -1;
      })()
    )
  ),
  'maximum-product-subarray': S(16000, (n) =>
    A([[...fill(n - 3, -1), -2, 3, -3]], 18)
  ),
  'word-break': S(300, (n, t) =>
    A(
      ['a'.repeat(n - 1) + (t % 2 ? 'z' : 'a'), ['a', 'aa', 'aaa', 'aaaa']],
      !(t % 2)
    )
  ),
  'longest-increasing-subsequence': S(2500, (n, t) =>
    A([t % 2 ? seq(n) : reverse(seq(n))], t % 2 ? n : 1)
  ),
  'partition-equal-subset-sum': S(200, (n) => A([fill(n, 3)], !(n % 2))),
  'combination-sum-iv': S(1000, (n) => A([[1, n], n], 2)),
  'perfect-squares': S([7, 17, 9973, 10000], (n, t) => A([n], [4, 2, 2, 1][t])),
  'integer-break': S([3, 11, 35, 58], (n) =>
    A(
      [n],
      n < 4
        ? n - 1
        : n % 3 === 0
          ? 3 ** (n / 3)
          : n % 3 === 1
            ? 4 * 3 ** ((n - 4) / 3)
            : 2 * 3 ** ((n - 2) / 3)
    )
  ),
  'stone-game-iii': S(30000, (n) => {
    let v = n % 6;
    return A([fill(n, 1)], v === 0 ? 'Tie' : 'Alice');
  }),
  'count-paths': S(100, (n) => A([3, n], (n * (n + 1)) / 2)),
  'unique-paths-ii': S(100, (n) =>
    A([grid(n, n, (i, j) => (i === 0 || j === n - 1 ? 0 : 1))], 1)
  ),
  'minimum-path-sum': S(160, (n) => A([grid(n, n, () => 3)], 3 * (2 * n - 1))),
  'longest-common-subsequence': S(650, (n) =>
    A(['a'.repeat(n - 1) + 'b', 'b' + 'a'.repeat(n - 1)], n - 1)
  ),
  'last-stone-weight-ii': S(30, (n) => A([fill(n, 7)], n % 2 ? 7 : 0)),
  'buy-and-sell-crypto-with-cooldown': S(5000, (n) =>
    A([seq(n, (i) => (i % 3 === 1 ? 9 : 1))], 8 * Math.floor((n + 1) / 3))
  ),
  'coin-change-ii': S(5000, (n) => A([n, [1, 2]], Math.floor(n / 2) + 1)),
  'target-sum': S([4, 8, 16, 20], (n) =>
    A([[...fill(n - 1, 0), 5], 5], 2 ** (n - 1))
  ),
  'interleaving-string': S(100, (n, t) =>
    A(
      [
        'a'.repeat(n),
        'b'.repeat(n),
        'ab'.repeat(n - 1) + (t % 2 ? 'ac' : 'ab')
      ],
      !(t % 2)
    )
  ),
  'stone-game': S([4, 10, 120, 500], (n) => A([[2, ...fill(n - 1, 1)]], true)),
  'stone-game-ii': S(100, (n) => {
    let memo = new Map();
    function score(i, m) {
      if (i + 2 * m >= n) return n - i;
      let k = i + ',' + m;
      if (!memo.has(k))
        memo.set(
          k,
          n -
            i -
            Math.min(...seq(2 * m, (j) => score(i + j + 1, Math.max(m, j + 1))))
        );
      return memo.get(k);
    }
    return A([fill(n, 1)], score(0, 1));
  }),
  'longest-increasing-path-in-matrix': S(150, (n) =>
    A([grid(n, n, (i, j) => i + j)], 2 * n - 1)
  ),
  'count-subsequences': S(1000, (n) =>
    A(['a'.repeat(n), 'aa'], (n * (n - 1)) / 2)
  ),
  'edit-distance': S(500, (n) => A(['a'.repeat(n), 'b'.repeat(n)], n)),
  'burst-balloons': S(85, (n) => A([fill(n, 1)], n)),
  'regular-expression-matching': S([2, 4, 7, 9], (n, t) =>
    A(['a'.repeat(n) + (t % 2 ? 'c' : 'b'), 'a*'.repeat(n) + 'b'], !(t % 2))
  )
};
