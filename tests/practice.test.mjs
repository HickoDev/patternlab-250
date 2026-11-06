import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { matches, runSamples } from '../dist/js/judge.js';
import { starter } from '../dist/js/ui.js';

const { problems, days } = JSON.parse(
  await readFile(new URL('../dist/data/catalog.json', import.meta.url))
);
const bySlug = new Map(problems.map((p) => [p.slug, p]));

test('the guide contains 250 unique exercises across 18 topics and 125 complete days', () => {
  assert.equal(problems.length, 250);
  assert.equal(bySlug.size, 250);
  assert.equal(new Set(problems.map((p) => p.category)).size, 18);
  assert.equal(days.length, 125);
  assert.ok(days.every((day) => day.length === 2));
  assert.deepEqual(days.flat().sort(), [...bySlug.keys()].sort());
});

test('every exercise has a usable starter, local examples, and source links', () => {
  for (const p of problems) {
    assert.ok(p.cases.length && p.prompt, p.slug);
    assert.equal(new URL(p.leetcode_url).hostname, 'leetcode.com');
    assert.ok(p.neetcode_url.startsWith('/problems/'));
    const callable = new Function(
      starter(p) + ';return ' + (p.methods ? 'Solution' : 'solve')
    )();
    assert.equal(typeof callable, 'function', p.slug);
    for (const c of p.cases) {
      assert.ok(Array.isArray(c.args), p.slug);
      assert.ok(matches(p.slug, c.expected, c.expected, c.args), p.slug);
    }
  }
});

function verify(slug, solution) {
  const results = runSamples(bySlug.get(slug), solution);
  assert.ok(
    results.every((r) => r.passed),
    slug + ': ' + JSON.stringify(results)
  );
}
test('function tasks accept alternate answer order and report errors', () => {
  verify(
    'two-integer-sum',
    'function solve(nums,k){for(let i=0;i<nums.length;i++)for(let j=i+1;j<nums.length;j++)if(nums[i]+nums[j]===k)return [j,i]}'
  );
  verify(
    'anagram-groups',
    'function solve(words){const groups={};for(const word of words)(groups[[...word].sort().join("")]??=[]).push(word);return Object.values(groups).reverse()}'
  );
  assert.equal(matches('reverse-bits', 2147483647, 2147483648, []), false);
  assert.equal(
    matches(
      'permutations',
      [
        [1, 2],
        [1, 2]
      ],
      [
        [1, 2],
        [2, 1]
      ],
      []
    ),
    false
  );
  assert.ok(
    runSamples(problems[0], 'function solve(){throw Error("try again")}').every(
      (r) => !r.passed && r.error === 'try again'
    )
  );
});
test('in-place samples compare the logical result including prefix length', () => {
  verify(
    'remove-element',
    'function solve(nums,v){let k=0;for(const n of nums)if(n!==v)nums[k++]=n;return k}'
  );
  verify('reverse-string', 'function solve(chars){chars.reverse()}');
  assert.ok(
    !runSamples(bySlug.get('remove-element'), 'function solve(){return 0}')[0]
      .passed
  );
});
test('node adapters preserve pointer-based solutions and reject an alias instead of a copy', () => {
  verify(
    'reverse-a-linked-list',
    'function solve(head){let p=null;while(head){const n=head.next;head.next=p;p=head;head=n}return p}'
  );
  verify(
    'invert-a-binary-tree',
    'function solve(root){if(root)[root.left,root.right]=[solve(root.right),solve(root.left)];return root}'
  );
  verify(
    'linked-list-cycle-detection',
    'function solve(head){const s=new Set();while(head){if(s.has(head))return true;s.add(head);head=head.next}return false}'
  );
  verify(
    'clone-graph',
    'function solve(node,seen=new Map()){if(!node)return null;if(!seen.has(node)){const copy=new Node(node.val);seen.set(node,copy);copy.neighbors=node.neighbors.map(x=>solve(x,seen))}return seen.get(node)}'
  );
  assert.ok(
    !runSamples(
      bySlug.get('copy-linked-list-with-random-pointer'),
      'function solve(head){return head}'
    )[0].passed
  );
});
test('stateful tasks, codecs, and callback tasks receive their local interfaces', () => {
  verify(
    'design-hashmap',
    'class Solution { data={}; put(k,v){this.data[k]=v} get(k){return this.data[k]??-1} remove(k){delete this.data[k]}}'
  );
  verify(
    'string-encode-and-decode',
    'class Solution {encode(a){return JSON.stringify(a)}decode(s){return JSON.parse(s)}}'
  );
  verify(
    'guess-number-higher-or-lower',
    'function solve(n,guess){let lo=1,hi=n;while(lo<=hi){const mid=Math.floor((lo+hi)/2),sign=guess(mid);if(!sign)return mid;if(sign>0)lo=mid+1;else hi=mid-1}}'
  );
});
test('valid alternate graph, string and binary-search-tree solutions pass', () => {
  assert.ok(
    matches(
      'course-schedule-ii',
      [1, 0, 2],
      [0, 1, 2],
      [
        3,
        [
          [2, 0],
          [2, 1]
        ]
      ]
    )
  );
  assert.ok(
    !matches(
      'course-schedule-ii',
      [2, 0, 1],
      [0, 1, 2],
      [
        3,
        [
          [2, 0],
          [2, 1]
        ]
      ]
    )
  );
  assert.ok(
    matches('delete-node-in-a-bst', [5, 1, 8, null, 4], [5, 4, 8, 1], [])
  );
  assert.ok(
    !matches('delete-node-in-a-bst', [5, 8, 1, null, 4], [5, 4, 8, 1], [])
  );
  assert.ok(matches('longest-palindromic-substring', 'cdc', 'aba', ['abacdc']));
  assert.ok(!matches('reorganize-string', 'aabb', 'abab', ['aabb']));
});
