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
const rotation = (a, k) => [...a.slice(k), ...a.slice(0, k)];
const palindrome = (s) => s + [...s].reverse().join('');
export const arrays = {
  'concatenation-of-array': S(1000, (n) => {
    let a = seq(n, (i) => 1 + ((i * 97) % 1000));
    return A([a], [...a, ...a]);
  }),
  'duplicate-integer': S(65000, (n, t) => {
    let a = shuffle(
      seq(n, (i) => i - Math.floor(n / 2)),
      n
    );
    if (t % 2) a[n - 1] = a[0];
    return A([a], !!(t % 2));
  }),
  'is-anagram': S(50000, (n, t) => {
    let a = seq(n, (i) => az[(i * 7) % 25]).join(''),
      b = reverse(a).join('');
    return A([a, t % 2 ? b : b.slice(1) + 'z'], !!(t % 2));
  }),
  'two-integer-sum': S(10000, (n, t) => {
    let a = seq(n, (i) => 100 + i),
      x = t === 3 ? n - 2 : n >> 1,
      y = t === 3 ? n - 1 : 0;
    a[x] = -7;
    a[y] = 9;
    return A([a, 2], [x, y]);
  }),
  'longest-common-prefix': S(200, (n) => {
    let s = 'x'.repeat(n - 1);
    return A([seq(n, (i) => s + az[i % 26])], s);
  }),
  'anagram-groups': S(10000, (n) => {
    let a = seq(n, (i) => ['cab', 'xy', 'bac', 'yx'][i % 4]);
    return A(
      [a],
      [a.filter((x) => x.length === 3), a.filter((x) => x.length === 2)]
    );
  }),
  'remove-element': S(100, (n) => {
    let a = seq(n, (i) => i % 5);
    return A(
      [a, 2],
      a.filter((x) => x !== 2)
    );
  }),
  'majority-element': S(50000, (n) =>
    A(
      [
        shuffle(
          seq(n, (i) => (i <= n / 2 ? -32 : i)),
          n
        )
      ],
      -32
    )
  ),
  'design-hashset': S(2400, (n) =>
    ops(
      [],
      repeat(n, (i) => [
        ['add', i, null],
        ['contains', i, true],
        ['remove', i, null],
        ['contains', i, false]
      ])
    )
  ),
  'design-hashmap': S(1600, (n) =>
    ops(
      [],
      repeat(n, (i) => [
        ['put', i, i, null],
        ['put', i, i + 1, null],
        ['get', i, i + 1],
        ['remove', i, null],
        ['get', i, -1]
      ])
    )
  ),
  'sort-an-array': S(45000, (n) => {
    let a = shuffle(
      seq(n, (i) => (i % 503) - 251),
      n
    );
    return A([a], asc(a));
  }),
  'sort-colors': S(300, (n) => {
    let a = shuffle(
      seq(n, (i) => i % 3),
      n
    );
    return A([a], asc(a));
  }),
  'top-k-elements-in-list': S(55000, (n) => {
    let a = seq(n, (i) => (i % 3 === 0 ? -2 : 7));
    return A([shuffle(a, n), 1], [7]);
  }),
  'string-encode-and-decode': S(180, (n) => {
    let a = seq(n, (i) => ['', '###', '12:0', 'ðŸ¦Š', String(i)][i % 5]);
    return A([a], a);
  }),
  'range-sum-query-2d-immutable': S(180, (n) =>
    ops(
      [grid(n, n, () => 2)],
      seq(n * 2, (i) => {
        let k = i % n;
        return ['sumRegion', k, 0, n - 1, k, 2 * (n - k) * (k + 1)];
      })
    )
  ),
  'products-of-array-discluding-self': S(55000, (n, t) => {
    let a = fill(n, 1);
    a[1] = -2;
    if (t % 2) a[n - 1] = 0;
    return A(
      [a],
      a.map((_, i) => (t % 2 ? (i === n - 1 ? -2 : 0) : i === 1 ? 1 : -2))
    );
  }),
  'valid-sudoku': S([1, 2, 3, 4], (n, t) => {
    let b = seq(9, (i) =>
      seq(9, (j) => String(1 + ((i * 3 + Math.floor(i / 3) + j + n) % 9)))
    );
    if (t % 2) b[8][8] = b[8][7];
    return A([b.map((r) => r.join(''))], !(t % 2));
  }),
  'longest-consecutive-sequence': S(65000, (n) =>
    A(
      [
        shuffle(
          seq(n, (i) => i - 300),
          n
        )
      ],
      n
    )
  ),
  'best-time-to-buy-and-sell-stock-ii': S(30000, (n) =>
    A([seq(n, (i) => (i % 2 ? 8 : 1))], 7 * Math.floor(n / 2))
  ),
  'majority-element-ii': S(40000, (n) =>
    A([seq(n, (i) => (i % 2 ? -5 : 7))], n === 3 ? [7] : [7, -5])
  ),
  'subarray-sum-equals-k': S(20000, (n) =>
    A([fill(n, 0), 0], (n * (n + 1)) / 2)
  ),
  'first-missing-positive': S(70000, (n) =>
    A(
      [
        shuffle(
          seq(n, (i) => i + 1),
          n
        )
      ],
      n + 1
    )
  ),
  'reverse-string': S(65000, (n) => {
    let a = seq(n, (i) => az[i % 26]);
    return A([a], reverse(a));
  }),
  'is-palindrome': S(70000, (n, t) => {
    let s = palindrome('aB!'.repeat(Math.floor(n / 3)));
    return A([s + (t % 2 ? 'z' : '')], !(t % 2));
  }),
  'valid-palindrome-ii': S(40000, (n, t) => {
    let s = 'a'.repeat(n);
    return A([s + (t % 2 ? 'bc' : 'b') + s + 'a'], !(t % 2));
  }),
  'merge-strings-alternately': S(100, (n) =>
    A(['a'.repeat(n), 'b'.repeat(n - 1)], 'ab'.repeat(n - 1) + 'a')
  ),
  'merge-sorted-array': S(100, (n) => {
    let a = seq(n, (i) => 2 * i - 100),
      b = seq(n, (i) => 2 * i - 99);
    return A([[...a, ...fill(n, 0)], n, b, n], asc([...a, ...b]));
  }),
  'remove-duplicates-from-sorted-array': S(30000, (n) => {
    let a = asc(seq(n, (i) => (i % 101) - 50));
    return A([a], [...new Set(a)]);
  }),
  'two-integer-sum-ii': S(30000, (n) =>
    A([[...fill(n - 2, -6), 2, 7], 9], [n - 1, n])
  ),
  'three-integer-sum': S(2600, (n) =>
    A(
      [[...fill(n - 2, 4), -8, 2]],
      [[-8, 4, 4]].filter(() => n >= 4)
    )
  ),
  '4sum': S(200, (n) => A([fill(n, 7), 28], n < 4 ? [] : [[7, 7, 7, 7]])),
  'rotate-array': S(45000, (n) => {
    let a = seq(n);
    return A([a, n + 1], rotation(a, n - 1));
  }),
  'max-water-container': S(65000, (n) =>
    A([[3, ...fill(n - 2, 1), 3]], 3 * (n - 1))
  ),
  'boats-to-save-people': S(45000, (n) =>
    A([seq(n, (i) => (i % 2 ? 2 : 1)), 3], Math.ceil(n / 2))
  ),
  'trapping-rain-water': S(20000, (n) =>
    A([[11, ...fill(n - 2, 1), 9]], 8 * (n - 2))
  ),
  'contains-duplicate-ii': S(60000, (n, t) =>
    A([[...seq(n - 1), 0], t % 2 ? n - 1 : n - 2], !!(t % 2))
  ),
  'buy-and-sell-crypto': S(65000, (n) =>
    A([[...fill(n - 2, 5), 1, 9999]], 9998)
  ),
  'longest-substring-without-duplicates': S(60000, (n) =>
    A([seq(n, (i) => az[i % 26]).join('')], Math.min(26, n))
  ),
  'longest-repeating-substring-with-replacement': S(60000, (n) =>
    A([seq(n, (i) => (i % 2 ? 'A' : 'B')).join(''), 1], Math.min(n, 3))
  ),
  'permutation-string': S(10000, (n, t) =>
    A(['ab', 'x'.repeat(n - 2) + (t % 2 ? 'ba' : 'aa')], !!(t % 2))
  ),
  'minimum-size-subarray-sum': S(65000, (n) =>
    A([2 * (n - 1), fill(n, 2)], n - 1)
  ),
  'find-k-closest-elements': S(10000, (n) =>
    A([seq(n), Math.floor(n / 2), -1], seq(Math.floor(n / 2)))
  ),
  'minimum-window-with-characters': S(60000, (n) =>
    A(['b'.repeat(n - 2) + 'ca', 'abc'], 'bca')
  ),
  'sliding-window-maximum': S(60000, (n) => {
    let a = seq(n, (i) => i % 5000),
      k = Math.floor(n / 2);
    return A(
      [a, k],
      seq(n - k + 1, (i) =>
        k >= 5000 || a[i] > a[i + k - 1] ? 4999 : a[i + k - 1]
      )
    );
  }),
  'baseball-game': S(1000, (n) =>
    A(
      [seq(n, (i) => (i % 2 ? 'D' : '3'))],
      3 * Math.ceil(n / 2) + 6 * Math.floor(n / 2)
    )
  ),
  'validate-parentheses': S(5000, (n, t) =>
    A(['('.repeat(n) + ')'.repeat(n - (t % 2))], !(t % 2))
  ),
  'implement-stack-using-queues': S([3, 8, 15, 30], (n) =>
    ops(
      [],
      repeat(n, (i) => {
        let x = (i % 9) + 1;
        return [
          ['push', x, null],
          ['top', x],
          ['pop', x]
        ];
      })
    )
  ),
  'implement-queue-using-stacks': S([3, 8, 15, 30], (n) =>
    ops(
      [],
      repeat(n, (i) => {
        let x = (i % 9) + 1;
        return [
          ['push', x, null],
          ['peek', x],
          ['pop', x]
        ];
      })
    )
  ),
  'minimum-stack': S(9000, (n) =>
    ops(
      [],
      [
        ...seq(n, (i) => ['push', -i, null]),
        ...repeat(n, (i) => [
          ['getMin', -(n - 1 - i)],
          ['pop', null]
        ])
      ]
    )
  ),
  'evaluate-reverse-polish-notation': S(4800, (n) =>
    A([['1', ...repeat(n, (i) => ['1', '+'])]], n + 1)
  ),
  'generate-parentheses': S([4, 3, 6, 8], (n) => {
    let r = [];
    function visit(s, l, h) {
      if (h === n) r.push(s);
      else {
        if (l < n) visit(s + '(', l + 1, h);
        if (h < l) visit(s + ')', l, h + 1);
      }
    }
    visit('', 0, 0);
    return A([n], r);
  }),
  'asteroid-collision': S(5000, (n) =>
    A([[...fill(n, 1), ...fill(n, -1)]], [])
  ),
  'daily-temperatures': S(65000, (n) =>
    A(
      [[...fill(n - 1, 51), 52]],
      seq(n, (i) => n - 1 - i)
    )
  ),
  'online-stock-span': S(9500, (n) =>
    ops(
      [],
      seq(n, (i) => ['next', 5 + i, i + 1])
    )
  ),
  'car-fleet': S(45000, (n) => A([n + 1, seq(n), fill(n, 1)], n)),
  'simplify-path': S(400, (n) => A(['/a' + '/b/..'.repeat(n) + '/c'], '/a/c')),
  'decode-string': S([3, 8, 90, 300], (n) =>
    A([n + '[3[ab]c]'], 'abababc'.repeat(n))
  ),
  'maximum-frequency-stack': S(9000, (n) =>
    ops(
      [],
      [
        ...seq(n, (i) => ['push', i, null]),
        ...seq(n, (i) => ['pop', n - 1 - i])
      ]
    )
  ),
  'largest-rectangle-in-histogram': S(65000, (n) => A([fill(n, 7)], 7 * n)),
  'binary-search': S(9000, (n, t) =>
    A([seq(n, (i) => i - 4500), t % 2 ? n - 4501 : 9999], t % 2 ? n - 1 : -1)
  ),
  'search-insert-position': S(9000, (n) =>
    A([seq(n, (i) => i - 4500), n - 4500], n)
  ),
  'guess-number-higher-or-lower': S([13, 91, 1000001, 2147483647], (n) =>
    A([n, n - 2], n - 2)
  ),
  sqrtx: S([1, 26, 100000001, 2147483647], (n) =>
    A([n], Math.floor(Math.sqrt(n)))
  ),
  'search-2d-matrix': S(100, (n, t) =>
    A([grid(n, n, (i, j) => i * n + j), t % 2 ? n * n - 1 : -1], !!(t % 2))
  ),
  'eating-bananas': S(10000, (n) => A([fill(n, 999999937), n], 999999937)),
  'capacity-to-ship-packages-within-d-days': S(45000, (n) =>
    A([fill(n, 7), 2], 7 * Math.ceil(n / 2))
  ),
  'find-minimum-in-rotated-sorted-array': S(5000, (n) =>
    A(
      [
        rotation(
          seq(n, (i) => i - 1),
          Math.floor(n / 2)
        )
      ],
      -1
    )
  ),
  'find-target-in-rotated-sorted-array': S(5000, (n) => {
    let a = rotation(seq(n), Math.floor(n / 2));
    return A([a, 0], a.indexOf(0));
  }),
  'search-in-rotated-sorted-array-ii': S(5000, (n, t) =>
    A([[...fill(n - 2, 2), 1, 2], t % 2 ? 1 : 3], !!(t % 2))
  ),
  'time-based-key-value-store': S(12000, (n) =>
    ops(
      [],
      [
        ...seq(n, (i) => ['set', 'a', String(i), 2 * i + 2, null]),
        ...seq(n, (i) => ['get', 'a', 2 * i + 1, i ? String(i - 1) : ''])
      ]
    )
  ),
  'split-array-largest-sum': S(1000, (n) =>
    A([fill(n, 5), 2], 5 * Math.ceil(n / 2))
  ),
  'median-of-two-sorted-arrays': S(1000, (n) =>
    A([seq(n, (i) => i * 2), seq(n, (i) => i * 2 + 1)], n - 0.5)
  ),
  'find-in-mountain-array': S(4999, (n) =>
    A([n - 1, [...seq(n), n, ...reverse(seq(n))]], n - 1)
  )
};
