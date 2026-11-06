export const seq = (n, f = (i) => i) =>
  Array.from({ length: n }, (_, i) => f(i));
export const fill = (n, x) => Array(n).fill(x);
export const grid = (n, m, f) => seq(n, (i) => seq(m, (j) => f(i, j)));
export const reverse = (a) => [...a].reverse();
export const asc = (a) => [...a].sort((x, y) => x - y);
export const answer = (args, expected) => ({ args, expected });
export const az = 'abcdefghijklmnopqrstuvwxyz';
export function shuffle(a, seed) {
  a = a.slice();
  for (let i = a.length - 1; i > 0; i--) {
    seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
    const j = seed % (i + 1);
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
// Each generator builds only the requested case. Keep scalar and exponential
// problems inside their own domains instead of applying a global size multiplier.
export const suite = (max, make) => ({
  sizes: Array.isArray(max)
    ? max
    : [3, Math.min(8, max - 2), Math.max(9, Math.floor(max / 4)), max],
  make
});
export function operations(init, steps) {
  return answer(
    [[['new', ...init], ...steps.map((s) => s.slice(0, -1))]],
    [null, ...steps.map((s) => s.at(-1))]
  );
}
export const repeat = (n, f) => seq(n, f).flat();
