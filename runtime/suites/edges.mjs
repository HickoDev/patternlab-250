// Irregular cases complement the scaling families: empty prefixes, overlapping
// windows, repeated keys, disconnected graphs, ties and other common mistakes.
// Format: [arguments, answer]. The suite builder rejects duplicate inputs.
export const edges = {
  'concatenation-of-array': [[[971]], [971, 971]],
  'duplicate-integer': [[[-9, 0, 8, 3, -9]], true],
  'is-anagram': [['aabbcc', 'abbbcc'], false],
  'two-integer-sum': [
    [[-13, 4, -13, 9], -26],
    [0, 2]
  ],
  'longest-common-prefix': [[['aaaa', 'aa', '']], ''],
  'anagram-groups': [[['', 'z', '', 'zz']], [['', ''], ['z'], ['zz']]],
  'remove-element': [[[4, 4, 4], 4], []],
  'majority-element': [[[-7]], -7],
  'top-k-elements-in-list': [
    [[-3, -3, 0, 0, 0, 9], 2],
    [-3, 0]
  ],
  'string-encode-and-decode': [[[]], []],
  'products-of-array-discluding-self': [[[0, 3, 0, -1]], [0, 0, 0, 0]],
  'valid-sudoku': [
    [
      [
        '.....4...',
        '...4.....',
        '.........',
        '.........',
        '.........',
        '.........',
        '.........',
        '.........',
        '.........'
      ]
    ],
    false
  ],
  'longest-consecutive-sequence': [[[-8, 0, -7, -7, -6, 2]], 3],
  'majority-element-ii': [[[1, 2, 3, 4]], []],
  'subarray-sum-equals-k': [[[-1, 1, -1, 1, 0], 0], 7],
  'first-missing-positive': [[[1, 1, 0, -4]], 2],
  'is-palindrome': [['., :;'], true],
  'valid-palindrome-ii': [['acbbcxa'], true],
  'two-integer-sum-ii': [
    [[-4, -1, 0, 2, 4], 0],
    [1, 5]
  ],
  'three-integer-sum': [
    [[-4, 0, 2, -2, 4, 0]],
    [
      [-4, 0, 4],
      [-2, 0, 2]
    ]
  ],
  '4sum': [
    [[-2, -1, 0, 0, 1, 2], 0],
    [
      [-2, -1, 1, 2],
      [-2, 0, 0, 2],
      [-1, 0, 0, 1]
    ]
  ],
  'rotate-array': [
    [[9, -1, 5], 0],
    [9, -1, 5]
  ],
  'boats-to-save-people': [[[3, 3, 3], 3], 3],
  'trapping-rain-water': [[[2, 0, 2, 0, 4, 0, 1]], 5],
  'contains-duplicate-ii': [[[9, 9], 0], false],
  'buy-and-sell-crypto': [[[8, 6, 3, 2]], 0],
  'longest-substring-without-duplicates': [['abba'], 2],
  'longest-repeating-substring-with-replacement': [['AABBAAC', 0], 2],
  'permutation-string': [['aabc', 'acbxxba'], false],
  'minimum-size-subarray-sum': [[29, [4, 7, 3]], 0],
  'minimum-window-with-characters': [['cabbaa', 'aab'], 'baa'],
  'sliding-window-maximum': [
    [[-3, -3, -5, -1, -1], 2],
    [-3, -3, -1, -1]
  ],
  'validate-parentheses': [['([)]'], false],
  'evaluate-reverse-polish-notation': [[['-7', '3', '/', '2', '*']], -4],
  'asteroid-collision': [[[-4, 4, 2, -3]], [-4, 4]],
  'largest-rectangle-in-histogram': [[[2, 1, 2, 3, 1]], 5],
  'median-of-two-sorted-arrays': [[[], [-8, 2]], -3],
  'linked-list-cycle-detection': [[[42], 0], true],
  'reorder-linked-list': [[[41, 37, 18, 9]], [41, 9, 37, 18]],
  'reverse-nodes-in-k-group': [
    [[7, 3, 1, 9], 3],
    [1, 3, 7, 9]
  ],
  'depth-of-binary-tree': [[[1, null, 2, 3, null, 4]], 4],
  'valid-binary-search-tree': [[[8, 4, 12, null, 9]], false],
  'binary-tree-maximum-path-sum': [[[-7, -9, -3]], -3],
  'task-scheduling': [[['A', 'A', 'B', 'B', 'C', 'C'], 2], 6],
  'car-pooling': [
    [
      [
        [3, 1, 4],
        [3, 4, 6]
      ],
      3
    ],
    true
  ],
  'partition-to-k-equal-sum-subsets': [[[2, 2, 2, 2, 3, 4, 5], 4], false],
  'islands-and-treasure': [
    [
      [
        [0, -1, 2147483647],
        [-1, -1, 2147483647]
      ]
    ],
    [
      [0, -1, 2147483647],
      [-1, -1, 2147483647]
    ]
  ],
  'rotting-fruit': [
    [
      [
        [2, 0, 1],
        [0, 0, 1]
      ]
    ],
    -1
  ],
  'course-schedule': [
    [
      4,
      [
        [1, 0],
        [2, 3],
        [3, 2]
      ]
    ],
    false
  ],
  'foreign-dictionary': [[['xyz', 'xy']], ''],
  'cheapest-flight-path': [
    [
      4,
      [
        [0, 1, 1],
        [1, 2, 1],
        [2, 3, 1],
        [0, 2, 12]
      ],
      0,
      3,
      1
    ],
    13
  ],
  'decode-ways': [['2101'], 1],
  'house-robber-ii': [[[10, 1, 1, 10]], 11],
  'maximum-product-subarray': [[[-2, 0, -4]], 0],
  'word-break': [['aaaaaaa', ['aaaa', 'aaa']], true],
  'longest-increasing-subsequence': [[[0, 8, 4, 12, 2, 10, 6, 14]], 4],
  'target-sum': [[[0, 0, 0, 1], -1], 8],
  'burst-balloons': [[[0, 2, 0, 3]], 9],
  'maximum-subarray': [[[-8, -3, -5]], -3],
  'maximum-sum-circular-subarray': [[[-5, -2, -6]], -2],
  'longest-turbulent-subarray': [[[8, 8, 6, 9, 4]], 4],
  'gas-station': [
    [
      [1, 0, 3, 0],
      [2, 1, 0, 1]
    ],
    2
  ],
  'merge-intervals': [
    [
      [
        [4, 5],
        [1, 4],
        [2, 3]
      ]
    ],
    [[1, 5]]
  ],
  'meeting-schedule-ii': [
    [
      [
        [1, 4],
        [4, 6],
        [4, 8],
        [8, 10]
      ]
    ],
    2
  ],
  'greatest-common-divisor-of-strings': [['AAAB', 'AAA'], ''],
  'pow-x-n': [[1.5, -3], 8 / 27],
  'multiply-strings': [['0', '987654321'], '0'],
  'reverse-integer': [[-100], -1]
};
