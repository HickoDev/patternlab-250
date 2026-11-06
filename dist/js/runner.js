// The frame has an opaque origin. Only its dedicated worker executes learner code.
function bootWorker() {
  addEventListener(
    'message',
    (event) => {
      if (event.source !== parent || !event.ports[0]) return;
      const port = event.ports[0];
      try {
        const source =
          event.data.judge.replace(/^export /gm, '') +
          '\nself.onmessage = ({data}) => self.postMessage(runSamples(data.problem, data.code));';
        const url = URL.createObjectURL(
          new Blob([source], { type: 'text/javascript' })
        );
        const worker = new Worker(url);
        worker.onmessage = ({ data }) => {
          port.postMessage({ results: data });
          worker.terminate();
          URL.revokeObjectURL(url);
        };
        worker.onerror = () => {
          port.postMessage({
            error: 'The runner could not execute this solution.'
          });
          worker.terminate();
          URL.revokeObjectURL(url);
        };
        worker.postMessage({
          problem: event.data.problem,
          code: event.data.code
        });
      } catch (error) {
        port.postMessage({ error: error.message });
      }
    },
    { once: true }
  );
}
let sourceRequest;
export async function testCode(problem, code, signal) {
  sourceRequest ??= fetch('./js/judge.js')
    .then((r) => {
      if (!r.ok) throw Error('The local runner could not be loaded.');
      return r.text();
    })
    .catch((error) => {
      sourceRequest = undefined;
      throw error;
    });
  const judge = await sourceRequest;
  if (signal.aborted) throw Error('Run cancelled.');
  return new Promise((resolve, reject) => {
    const frame = document.createElement('iframe');
    const channel = new MessageChannel();
    frame.hidden = true;
    frame.title = 'Isolated JavaScript sample runner';
    frame.setAttribute('sandbox', 'allow-scripts');
    frame.srcdoc = `<meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'unsafe-inline' 'unsafe-eval' blob:; worker-src blob:; connect-src 'none'"><script>(${bootWorker.toString()})()<\/script>`;
    function finish(error, results) {
      clearTimeout(timer);
      signal.removeEventListener('abort', cancel);
      channel.port1.close();
      frame.remove();
      if (error) reject(Error(error));
      else resolve(results);
    }
    const cancel = () => finish('Run cancelled.');
    signal.addEventListener('abort', cancel, { once: true });
    const timer = setTimeout(
      () =>
        finish('Time limit reached. Check for an infinite loop and try again.'),
      4000
    );
    channel.port1.onmessage = ({ data }) => {
      if (
        !Array.isArray(data?.results) ||
        data.results.length !== problem.cases.length
      )
        return finish(data?.error || 'Unexpected runner output.');
      finish(null, data.results);
    };
    frame.onload = () =>
      frame.contentWindow?.postMessage({ judge, problem, code }, '*', [
        channel.port2
      ]);
    document.body.append(frame);
  });
}
