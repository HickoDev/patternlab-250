const paths = {
  grid: '<rect x="3" y="3" width="7" height="7" rx="1.4"/><rect x="14" y="3" width="7" height="7" rx="1.4"/><rect x="3" y="14" width="7" height="7" rx="1.4"/><rect x="14" y="14" width="7" height="7" rx="1.4"/>',
  plan: '<path d="M4 5.5c3-1 5.8-.5 8 1.3 2.2-1.8 5-2.3 8-1.3v13c-3-1-5.8-.5-8 1.3-2.2-1.8-5-2.3-8-1.3zM12 7v13"/>',
  save: '<path d="M6 4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17l-6-4-6 4z"/>',
  calendar:
    '<rect x="3.5" y="5" width="17" height="16" rx="2.5"/><path d="M7.5 3v4m9-4v4M4 10h16"/>',
  arrow: '<path d="M4 12h15m-6-6 6 6-6 6"/>',
  back: '<path d="M20 12H5m6-6-6 6 6 6"/>',
  next: '<path d="m9 5 7 7-7 7"/>',
  prev: '<path d="m15 5-7 7 7 7"/>',
  down: '<path d="m6 9 6 6 6-6"/>',
  external: '<path d="M7 17 18 6M8 6h10v10"/>',
  layers: '<path d="m3 8 9-5 9 5-9 5zm0 5 9 5 9-5M3 17.5l9 5 9-5"/>',
  code: '<path d="m8 7-5 5 5 5m8-10 5 5-5 5m-3-14-3 18"/>',
  hash: '<path d="m10 3-4 18m12-18-4 18M4 9h16M3 15h16"/>',
  list: '<path d="M8 6h12M8 12h12M8 18h12"/><circle cx="4" cy="6" r=".7"/><circle cx="4" cy="12" r=".7"/><circle cx="4" cy="18" r=".7"/>',
  stack: '<path d="m3 7 9-4 9 4-9 4zm0 5 9 4 9-4m-18 5 9 4 9-4"/>',
  nodes:
    '<circle cx="6" cy="6" r="2.4"/><circle cx="18" cy="6" r="2.4"/><circle cx="12" cy="18" r="2.4"/><path d="m7.2 8 3.8 7.8M16.8 8 13 15.8M9 6h6"/>',
  pointers: '<path d="M3 8h13m-4-4 4 4-4 4m9 4H8m4-4-4 4 4 4"/>',
  window:
    '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="M8 5v14m8-14v14"/>',
  tree: '<rect x="9" y="2" width="6" height="5" rx="1"/><path d="M12 7v4m-7 5v-5h14v5"/><rect x="2" y="16" width="6" height="5" rx="1"/><rect x="16" y="16" width="6" height="5" rx="1"/>',
  search: '<circle cx="10.5" cy="10.5" r="6.5"/><path d="m15.5 15.5 4.5 4.5"/>',
  check: '<path d="m4 12 5 5L20 6"/>',
  menu: '<path d="M3 6h18M3 12h18M3 18h18"/>',
  x: '<path d="m6 6 12 12M18 6 6 18"/>',
  folder: '<path d="M3 7V5h6l2 2h10v12H3z"/>',
  play: '<path d="m8 4 12 8-12 8z"/>',
  note: '<path d="M5 3h10l4 4v14H5zM9 11h6m-6 4h6"/>',
  terminal: '<path d="m4 7 5 5-5 5m8 0h8"/>',
  book: '<path d="M5 3h14v17H7a2 2 0 0 1-2-2zm0 14c0-1.1.9-2 2-2h12"/>',
  target:
    '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1"/>',
  db: '<ellipse cx="12" cy="5" rx="8" ry="3"/><path d="M4 5v14c0 4 16 4 16 0V5M4 12c0 4 16 4 16 0"/>',
  circle: '<circle cx="12" cy="12" r="8"/>'
};
export function icon(name, size = 18) {
  return (
    '<svg class="icon" width="' +
    size +
    '" height="' +
    size +
    '" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' +
    (paths[name] || paths.nodes) +
    '</svg>'
  );
}
export function esc(value) {
  return String(value).replace(
    /[&<>"']/g,
    (s) =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[
        s
      ]
  );
}
export const topicIcons = {
  'Arrays & Hashing': 'hash',
  'Two Pointers': 'pointers',
  'Sliding Window': 'window',
  Stack: 'stack',
  'Binary Search': 'tree',
  Trees: 'tree',
  Tries: 'tree',
  'Linked List': 'nodes',
  'Bit Manipulation': 'code',
  Intervals: 'window'
};
export const difficulty = (level) =>
  '<span class="difficulty ' +
  level.toLowerCase() +
  '"><i></i>' +
  level +
  '</span>';
export function starter(p) {
  if (p.methods)
    return (
      'class Solution {\n' +
      p.methods
        .map(
          (method) =>
            '  ' +
            method.replaceAll(',', ', ') +
            ' {\n    // Your code here\n  }'
        )
        .join('\n\n') +
      '\n}'
    );
  return (
    'function solve(' + p.params.join(', ') + ') {\n  // Your code here\n  \n}'
  );
}
export function contract(p) {
  if (
    p.slug === 'remove-element' ||
    p.slug === 'remove-duplicates-from-sorted-array'
  )
    return 'Expected output shows the retained prefix. Return its length after updating the array.';
  if (
    p.slug === 'string-encode-and-decode' ||
    p.slug === 'serialize-and-deserialize-binary-tree'
  )
    return 'Implement both methods in class Solution. Each sample encodes and then decodes using a fresh instance.';
  if (p.methods)
    return 'Implement class Solution. Each sample lists the constructor call (“new”) followed by method calls. Void methods produce null in the output.';
  if (
    p.slug === 'copy-linked-list-with-random-pointer' ||
    p.slug === 'clone-graph'
  )
    return 'The runner supplies the Node constructor and converts sample arrays to and from nodes.';
  if (
    p.params.some((x) => ['root', 'subRoot', 'other'].includes(x)) ||
    p.slug === 'binary-tree-from-preorder-and-inorder-traversal'
  )
    return 'Trees use level-order arrays in the examples. Your function receives or returns TreeNode objects with val, left and right.';
  if (p.params.some((x) => ['head', 'headA', 'headB', 'lists'].includes(x)))
    return 'Examples display lists as arrays. Your function receives ListNode objects with val and next. The ListNode constructor is available.';
  return '';
}
