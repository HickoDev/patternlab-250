function bridge() {
  addEventListener(
    'message',
    ({ source, ports, data }) => {
      if (source !== parent || !ports[0]) return;
      const port = ports[0];
      const boot =
        'self.onmessage=async ({data})=>{try{await (await import(' +
        JSON.stringify(data.entry) +
        ')).start(data)}catch(e){self.postMessage({fatal:String(e.message||e)})}}';
      const url = URL.createObjectURL(
        new Blob([boot], { type: 'text/javascript' })
      );
      const worker = new Worker(url);
      worker.onmessage = (e) => port.postMessage(e.data);
      worker.onerror = (e) =>
        port.postMessage({ fatal: e.message || 'Submission worker stopped.' });
      port.onmessage = ({ data }) => worker.postMessage(data);
      worker.postMessage(data.init);
    },
    { once: true }
  );
}
function openWorker(init, signal) {
  const entry = new URL('./submit-worker.js', import.meta.url);
  const frame = document.createElement('iframe'),
    channel = new MessageChannel();
  frame.hidden = true;
  frame.title = 'Isolated submission runner';
  frame.setAttribute('sandbox', 'allow-scripts');
  frame.srcdoc = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: ${entry.origin}; worker-src blob:; connect-src ${entry.origin}"><script>(${bridge.toString()})()<\/script>`;
  let pending;
  function fail(e) {
    pending?.reject(e);
    pending = null;
  }
  const abort = () => fail(new Error('Submission cancelled.'));
  signal.addEventListener('abort', abort, { once: true });
  channel.port1.onmessage = ({ data }) => {
    if (data.fatal) {
      fail(Error(data.fatal));
      return;
    }
    pending?.resolve(data);
    pending = null;
  };
  function next(ms, timeout) {
    let timer;
    return new Promise((resolve, reject) => {
      pending = { resolve, reject };
      timer = setTimeout(() => fail(Error(timeout)), ms);
      if (signal.aborted) abort();
    }).finally(() => clearTimeout(timer));
  }
  const ready = next(
    30000,
    'The local submission runtime took too long to start. Check npm ci and restart the local server.'
  );
  frame.onload = () =>
    frame.contentWindow?.postMessage({ entry: entry.href, init }, '*', [
      channel.port2
    ]);
  document.body.append(frame);
  return {
    ready,
    run(args, ms) {
      const promise = next(ms, 'Time limit exceeded');
      channel.port1.postMessage({ args });
      return promise;
    },
    close() {
      signal.removeEventListener('abort', abort);
      channel.port1.close();
      frame.remove();
    }
  };
}
export async function submitCode(
  p,
  language,
  code,
  signal,
  progress = () => {}
) {
  const base = '/api/submit/' + encodeURIComponent(p.slug) + '/';
  const manifest = await fetch(base + 'cases', { signal });
  if (!manifest.ok)
    throw Error(
      'Hidden cases are unavailable. Restart the local PatternLab server and retry.'
    );
  const { cases, caseLimitMs, outputLimit } = await manifest.json();
  const summaries = cases.map(({ label, group, size }) => ({
    label,
    group,
    size
  }));
  const report = {
    submission: true,
    verdict: 'Starting…',
    cases: summaries,
    results: [],
    limit: caseLimitMs
  };
  const publish = () => {
    if (!signal.aborted) progress(report);
  };
  publish();
  const worker = openWorker(
    {
      problem: { slug: p.slug, params: p.params, methods: p.methods },
      language,
      code,
      outputLimit
    },
    signal
  );
  try {
    const init = await worker.ready;
    if (!init.ready) throw Error('Unexpected submission runtime response.');
    for (let i = 0; i < cases.length; i++) {
      report.verdict = 'Judging ' + cases[i].label.toLowerCase() + '…';
      publish();
      let result;
      try {
        result = await worker.run(cases[i].args, caseLimitMs);
      } catch (e) {
        if (e.message !== 'Time limit exceeded') throw e;
        result = { verdict: e.message, elapsedMs: caseLimitMs };
      }
      if (signal.aborted) throw Error('Submission cancelled.');
      if (result.elapsedMs >= caseLimitMs)
        result.verdict = 'Time limit exceeded';
      if (result.heapMiB != null) report.heapMiB = result.heapMiB;
      if (!result.verdict) {
        if (typeof result.output !== 'string')
          throw Error('Unexpected submission result.');
        const r = await fetch(base + i, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: '{"actual":' + result.output + '}',
          signal
        });
        if (!r.ok)
          throw Error(
            'The local judge could not check this answer. Retry the submission.'
          );
        result.verdict = (await r.json()).passed ? 'Passed' : 'Wrong answer';
      }
      report.results.push({
        verdict: result.verdict,
        elapsedMs: result.elapsedMs,
        error: result.error
      });
      if (result.verdict !== 'Passed') {
        report.verdict = result.verdict;
        return report;
      }
    }
    report.verdict = 'Accepted';
    return report;
  } finally {
    worker.close();
  }
}
