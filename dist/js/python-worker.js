import { loadPyodide } from '/runtime/pyodide.mjs';
import { matches, sampleInterface } from './judge.js';

self.onmessage = async ({ data: { problem, code } }) => {
  try {
    const [runtime, harness] = await Promise.all([
      loadPyodide({
        indexURL: new URL('/runtime/', import.meta.url).href,
        stdout: () => {},
        stderr: () => {}
      }),
      fetch(new URL('/python/judge.py', import.meta.url)).then((response) => {
        if (!response.ok)
          throw Error('Python sample adapters could not be loaded.');
        return response.text();
      })
    ]);
    runtime.runPython(harness);
    const evaluate = runtime.globals.get('sample_json');
    const metadata = JSON.stringify(sampleInterface(problem));
    self.postMessage({ ready: true });
    const results = problem.cases.map(({ args, expected }) => {
      const start = performance.now();
      try {
        const actual = JSON.parse(
          evaluate(code, metadata, JSON.stringify(args))
        );
        const elapsedMs = performance.now() - start;
        return {
          passed: matches(problem.slug, actual, expected, args),
          actual: JSON.stringify(actual).slice(0, 2000),
          elapsedMs
        };
      } catch (error) {
        const message = String(error.message || error)
          .trim()
          .slice(-1400);
        return {
          passed: false,
          error: message.includes('MemoryError')
            ? 'MemoryError: Python could not allocate more memory within the 128 MiB interpreter heap.'
            : message,
          elapsedMs: performance.now() - start
        };
      }
    });
    evaluate.destroy();
    self.postMessage({
      results,
      heapMiB: runtime._module.HEAPU8.buffer.byteLength / 1048576
    });
  } catch (error) {
    self.postMessage({ error: String(error.message || error).slice(-1200) });
  }
};
