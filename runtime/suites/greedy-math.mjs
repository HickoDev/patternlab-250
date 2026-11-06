import {
  seq,
  fill,
  grid,
  reverse,
  answer as A,
  suite as S,
  operations as ops,
  shuffle
} from './build.mjs';
const pop = (n) => n.toString(2).replaceAll('0', '').length;
export const greedyMath = {
  'lemonade-change': S(60000, (n, t) =>
    A(
      [t % 2 ? [...fill(n - 2, 5), 10, 20] : [10, ...fill(n - 1, 5)]],
      !!(t % 2)
    )
  ),
  'maximum-subarray': S(65000, (n) => A([[-9, ...fill(n - 2, 1), -8]], n - 2)),
  'maximum-sum-circular-subarray': S(30000, (n) =>
    A([[8, ...fill(n - 2, -10), 7]], 15)
  ),
  'longest-turbulent-subarray': S(40000, (n) =>
    A([seq(n, (i) => 1 + (i % 2))], n)
  ),
  'jump-game': S(10000, (n, t) =>
    A([[...fill(n - 2, 1), t % 2 ? 0 : 1, 0]], !(t % 2))
  ),
  'jump-game-ii': S(10000, (n) => A([fill(n, 2)], Math.ceil((n - 1) / 2))),
  'jump-game-vii': S(65000, (n, t) =>
    A(
      ['0'.repeat(n - 1) + (t % 2 ? '1' : '0'), 1, Math.min(n - 1, 5000)],
      !(t % 2)
    )
  ),
  'gas-station': S(60000, (n, t) =>
    A(
      [
        [...fill(n - 1, 0), t % 2 ? 0 : 1],
        [...fill(n - 2, 0), 1, 0]
      ],
      t % 2 ? -1 : n - 1
    )
  ),
  'hand-of-straights': S(10000, (n) => A([shuffle(seq(n), n), 3], n % 3 === 0)),
  'dota2-senate': S(5000, (n, t) =>
    A([(t % 2 ? 'DR' : 'RD').repeat(n)], t % 2 ? 'Dire' : 'Radiant')
  ),
  'merge-triplets-to-form-target': S(35000, (n, t) =>
    A(
      [
        [...seq(n - 2, () => [3, 1, 1]), [1, 3, 1], [1, 1, t % 2 ? 4 : 3]],
        [3, 3, 3]
      ],
      !(t % 2)
    )
  ),
  'partition-labels': S(500, (n) =>
    A(['a'.repeat(n - 2) + 'bc'], [n - 2, 1, 1])
  ),
  'valid-parenthesis-string': S(100, (n, t) =>
    A(['('.repeat(n >> 1) + '*'.repeat((n >> 1) - (t % 2))], !(t % 2))
  ),
  candy: S(45000, (n) => A([seq(n)], (n * (n + 1)) / 2)),
  'insert-new-interval': S(10000, (n) =>
    A([seq(n, (i) => [3 * i, 3 * i + 1]), [1, 3 * n - 3]], [[0, 3 * n - 2]])
  ),
  'merge-intervals': S(5000, (n) =>
    A([reverse(seq(n, (i) => [i, i + 1]))], [[0, n]])
  ),
  'non-overlapping-intervals': S(40000, (n) =>
    A([seq(n, (i) => [i, i + 2])], Math.floor(n / 2))
  ),
  'meeting-schedule': S(15000, (n, t) =>
    A([seq(n, (i) => [2 * i, 2 * i + (t % 2 ? 3 : 2)])], !(t % 2))
  ),
  'meeting-schedule-ii': S(15000, (n) =>
    A([seq(n, (i) => [i, i + 3])], Math.min(n, 3))
  ),
  'meeting-rooms-iii': S(30000, (n) => A([3, seq(n, (i) => [i, i + 1])], 0)),
  'minimum-interval-including-query': S(30000, (n) =>
    A(
      [seq(n, (i) => [2 * i + 1, 2 * i + 1]), seq(n, (i) => i + 1)],
      seq(n, (i) => (i % 2 ? -1 : 1))
    )
  ),
  'excel-sheet-column-title': S([1, 703, 18278, 2147483647], (n, t) =>
    A([n], ['A', 'AAA', 'ZZZ', 'FXSHRXW'][t])
  ),
  'greatest-common-divisor-of-strings': S(500, (n) =>
    A(['AB'.repeat(n), 'AB'.repeat(n - 1)], 'AB')
  ),
  'insert-greatest-common-divisors-in-linked-list': S(3000, (n) => {
    let a = seq(n, (i) => (i % 2 ? 21 : 14));
    return A(
      [a],
      a.flatMap((x, i) => (i ? [7, x] : [x]))
    );
  }),
  'transpose-matrix': S(240, (n) =>
    A(
      [grid(n, n - 1, (i, j) => i - j)],
      grid(n - 1, n, (i, j) => j - i)
    )
  ),
  'rotate-matrix': S([3, 6, 12, 20], (n) =>
    A(
      [grid(n, n, (i, j) => i * n + j)],
      grid(n, n, (i, j) => (n - j - 1) * n + i)
    )
  ),
  'spiral-matrix': S([3, 5, 8, 10], (n) => {
    let a = grid(n, n, () => 0),
      v = 0;
    for (let l = 0, h = n - 1; l <= h; l++, h--) {
      for (let j = l; j <= h; j++) a[l][j] = ++v;
      for (let i = l + 1; i <= h; i++) a[i][h] = ++v;
      if (l < h) {
        for (let j = h - 1; j >= l; j--) a[h][j] = ++v;
        for (let i = h - 1; i > l; i--) a[i][l] = ++v;
      }
    }
    return A(
      [a],
      seq(n * n, (i) => i + 1)
    );
  }),
  'set-zeroes-in-matrix': S(160, (n) =>
    A(
      [grid(n, n, (i, j) => (i === n - 2 && j === 1 ? 0 : 3))],
      grid(n, n, (i, j) => (i === n - 2 || j === 1 ? 0 : 3))
    )
  ),
  'non-cyclical-number': S([7, 20, 1000000000, 2147483647], (n, t) =>
    A([n], [true, false, true, false][t])
  ),
  'plus-one': S(100, (n) => A([fill(n, 9)], [1, ...fill(n, 0)])),
  'roman-to-integer': S([1, 2, 3, 4], (n, t) =>
    A(
      [['IV', 'CMXCIX', 'MMCDXLVIII', 'MMMDCCCLXXXVIII'][t]],
      [4, 999, 2448, 3888][t]
    )
  ),
  'pow-x-n': S([-4, 11, -2147483648, 2147483647], (n) =>
    A([-1, n], Math.abs(n) % 2 ? -1 : 1)
  ),
  'multiply-strings': S(200, (n) => {
    let s = '9'.repeat(n);
    return A([s, s], String(BigInt(s) ** 2n));
  }),
  'count-squares': S(700, (n) =>
    ops(
      [],
      [
        ...seq(n, () => ['add', [0, 1], null]),
        ...seq(n, () => ['add', [1, 0], null]),
        ['add', [1, 1], null],
        ['count', [0, 0], n * n]
      ]
    )
  ),
  'single-number': S(14000, (n) =>
    A([shuffle([...seq(n), ...seq(n), -11], n)], -11)
  ),
  'number-of-one-bits': S([2, 1023, 1073741825, 2147483647], (n) =>
    A([n], pop(n))
  ),
  'counting-bits': S(65000, (n) => A([n], seq(n + 1, pop))),
  'add-binary': S(10000, (n) => A(['1'.repeat(n), '1'], '1' + '0'.repeat(n))),
  'reverse-bits': S([2, 12, 1073741826, 2147483646], (n) =>
    A([n], parseInt(reverse(n.toString(2).padStart(32, '0')).join(''), 2))
  ),
  'missing-number': S(10000, (n) => {
    let m = n >> 1;
    return A(
      [
        shuffle(
          seq(n + 1).filter((i) => i !== m),
          n
        )
      ],
      m
    );
  }),
  'sum-of-two-integers': S([1, 57, 500, 1000], (n, t) =>
    A([t % 2 ? -n : n, -n], t % 2 ? -2 * n : 0)
  ),
  'reverse-integer': S([1200, -100000003, 1563847412, -2147483648], (n, t) =>
    A([n], [21, -300000001, 0, 0][t])
  ),
  'bitwise-and-of-numbers-range': S([3, 7, 20, 30], (n) =>
    A([2 ** n, 2 ** (n + 1) - 1], 2 ** n)
  ),
  'minimum-array-end': S([9, 1023, 1000000, 100000000], (n) =>
    A([n, 7], 8 * (n - 1) + 7)
  )
};
