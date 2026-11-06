function startIsolatedWorker() {
  addEventListener(
    'message',
    (event) => {
      if (event.source !== parent || !event.ports[0]) return;
      const port = event.ports[0];
      const { entry, problem, code } = event.data;
      const bootstrap =
        'const ready = import(' +
        JSON.stringify(entry) +
        ');' +
        'self.onmessage = async (event) => { try { await ready; self.onmessage(event); } catch(e) { self.postMessage({error:"Could not load the local Python runtime. Run npm ci and restart the PatternLab server. " + e.message}); } };';
      const url = URL.createObjectURL(
        new Blob([bootstrap], { type: 'text/javascript' })
      );
      const worker = new Worker(url);
      worker.onmessage = ({ data }) => port.postMessage(data);
      worker.onerror = (e) =>
        port.postMessage({
          error:
            e.message ||
            'Python failed to start. Run npm ci and restart the local server.'
        });
      worker.postMessage({ problem, code });
    },
    { once: true }
  );
}
export function runPython(problem, code, signal, onReady) {
  if (signal.aborted) return Promise.reject(Error('Run cancelled.'));
  return new Promise((resolve, reject) => {
    const entry = new URL('./python-worker.js', import.meta.url);
    const frame = document.createElement('iframe');
    frame.hidden = true;
    frame.title = 'Isolated Python sample runner';
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.srcdoc = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' 'wasm-unsafe-eval' blob: ${entry.origin}; connect-src ${entry.origin}; worker-src blob:"><script>(${startIsolatedWorker.toString()})()<\/script>`;
    const channel = new MessageChannel();
    let timeout = setTimeout(
      () =>
        finish(
          'Python took too long to load. Check that npm ci completed, then retry.'
        ),
      30000
    );
    function finish(message, data) {
      clearTimeout(timeout);
      signal.removeEventListener('abort', cancel);
      channel.port1.close();
      frame.remove();
      if (message) reject(Error(message));
      else resolve(data);
    }
    const cancel = () => finish('Run cancelled.');
    signal.addEventListener('abort', cancel, { once: true });
    channel.port1.onmessage = ({ data }) => {
      if (data.ready) {
        clearTimeout(timeout);
        timeout = setTimeout(
          () =>
            finish('Time limit reached. The sample suite exceeded 4 seconds.'),
          4000
        );
        onReady?.();
      } else if (data.error) finish(data.error);
      else if (
        Array.isArray(data.results) &&
        data.results.length === problem.cases.length
      )
        finish(null, data);
      else finish('Unexpected Python runner output.');
    };
    frame.onload = () =>
      frame.contentWindow?.postMessage(
        { entry: entry.href, problem, code },
        '*',
        [channel.port2]
      );
    document.body.append(frame);
  });
}
