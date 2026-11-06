import { evaluateSample, sampleInterface } from './judge.js';
// This module is loaded only in an opaque-origin dedicated worker.
export async function start({ problem, language, code, outputLimit }) {
  let evaluate, runtime;
  if (language === 'python') {
    const [{ loadPyodide }, harness] = await Promise.all([
      import('/runtime/pyodide.mjs'),
      fetch(new URL('/python/judge.py', import.meta.url)).then((r) => {
        if (!r.ok) throw Error('Python adapters unavailable.');
        return r.text();
      })
    ]);
    runtime = await loadPyodide({
      indexURL: new URL('/runtime/', import.meta.url).href,
      stdout: () => {},
      stderr: () => {}
    });
    runtime.runPython(harness);
    const fn = runtime.globals.get('sample_json'),
      meta = JSON.stringify(sampleInterface(problem));
    evaluate = (args) => fn(code, meta, JSON.stringify(args));
  } else
    evaluate = (args) => JSON.stringify(evaluateSample(problem, code, args));
  self.onmessage = ({ data: { args } }) => {
    const start = performance.now();
    let output, error, verdict;
    try {
      output = evaluate(args);
      if (output === undefined) output = 'null';
      if (new TextEncoder().encode(output).length > outputLimit - 32) {
        verdict = 'Output limit exceeded';
        output = undefined;
      }
    } catch (e) {
      error = String(e.message || e)
        .trim()
        .slice(-900);
      verdict =
        language === 'python' &&
        /MemoryError|out of memory|could not allocate/i.test(error)
          ? 'Memory limit exceeded'
          : 'Runtime error';
    }
    self.postMessage({
      output,
      error,
      verdict,
      elapsedMs: performance.now() - start,
      heapMiB: runtime
        ? runtime._module.HEAPU8.buffer.byteLength / 1048576
        : null
    });
  };
  self.postMessage({ ready: true });
}
