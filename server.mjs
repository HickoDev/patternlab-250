import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { limitPythonHeap } from './runtime/memory-limit.mjs';
import { submitAPI } from './runtime/submissions.mjs';

const root = fileURLToPath(new URL('./dist/', import.meta.url));
const port = Number(process.env.PORT || 4173);
const mime = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.py': 'text/plain; charset=utf-8',
  '.wasm': 'application/wasm',
  '.zip': 'application/zip',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};
const runtimeAssets = new Set([
  'pyodide.mjs',
  'pyodide.asm.mjs',
  'pyodide.asm.wasm',
  'python_stdlib.zip',
  'pyodide-lock.json'
]);
let cappedWasm;

const server = createServer(async (req, res) => {
  try {
    const pathname = decodeURIComponent(
      new URL(req.url, 'http://localhost').pathname
    );
    if (pathname.startsWith('/api/submit/')) {
      return await submitAPI(req, res, pathname, server.address().port);
    }
    let file = path.resolve(
      root,
      '.' + (pathname === '/' ? '/index.html' : pathname)
    );
    const relative = path.relative(root, file);
    if (
      relative.startsWith('..') ||
      path.isAbsolute(relative) ||
      !mime[path.extname(file)]
    ) {
      res.writeHead(404).end();
      return;
    }
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      res.writeHead(405, { Allow: 'GET, HEAD' }).end();
      return;
    }
    if (pathname.startsWith('/runtime/')) {
      const name = pathname.slice('/runtime/'.length);
      if (!runtimeAssets.has(name)) {
        res.writeHead(404).end();
        return;
      }
      file = fileURLToPath(import.meta.resolve('pyodide/' + name));
    }
    const data =
      pathname === '/runtime/pyodide.asm.wasm'
        ? (cappedWasm ??= limitPythonHeap(await readFile(file)))
        : await readFile(file);
    // The Python sandbox has an opaque origin. Only publish its runtime assets
    // for cross-origin reads, never browser progress or arbitrary local paths.
    if (
      pathname.startsWith('/runtime/') ||
      [
        '/js/python-worker.js',
        '/js/submit-worker.js',
        '/js/judge.js',
        '/python/judge.py'
      ].includes(pathname)
    ) {
      res.setHeader('Access-Control-Allow-Origin', 'null');
    }
    res.writeHead(200, {
      'Content-Type': mime[path.extname(file)],
      'X-Content-Type-Options': 'nosniff',
      'Cache-Control': 'no-cache'
    });
    res.end(req.method === 'HEAD' ? undefined : data);
  } catch {
    res.writeHead(404).end('Page unavailable');
  }
});
server.on('error', (error) => {
  console.error(
    error.code === 'EADDRINUSE'
      ? 'Port ' + port + ' is in use. Set PORT to choose another.'
      : error.message
  );
  process.exitCode = 1;
});
server.listen(port, '127.0.0.1', () =>
  console.log(
    'PatternLab is running at http://127.0.0.1:' + server.address().port
  )
);
