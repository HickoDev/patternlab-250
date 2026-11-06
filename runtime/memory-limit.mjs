// Pyodide's pinned WebAssembly binary defines its own linear memory. Lower the
// declared maximum before streaming it to the browser. Never serve an uncapped
// interpreter if a future build changes the memory declaration.
export const PYTHON_HEAP_MIB = 128;
export function limitPythonHeap(original) {
  const bytes = Buffer.from(original);
  let offset = 8;
  function uint() {
    let value = 0,
      scale = 1;
    for (let i = 0; i < 5 && offset < bytes.length; i++) {
      const part = bytes[offset++];
      value += (part & 127) * scale;
      if (part < 128) return value;
      scale *= 128;
    }
    throw Error('Invalid WebAssembly integer');
  }
  while (offset < bytes.length) {
    const section = bytes[offset++];
    const length = uint();
    const end = offset + length;
    if (end > bytes.length) break;
    if (section === 5) {
      const pages = PYTHON_HEAP_MIB * 16;
      if (uint() !== 1 || uint() !== 1 || uint() > pages) break;
      const start = offset;
      if (uint() < pages || offset !== end || end - start < 2) break;
      // WebAssembly permits padded unsigned LEB128. Keeping the encoded length
      // also keeps every section offset unchanged.
      let value = pages;
      for (let i = start; i < end; i++) {
        bytes[i] = value % 128 | (i + 1 < end ? 128 : 0);
        value = Math.floor(value / 128);
      }
      return bytes;
    }
    offset = end;
  }
  throw Error('Unsupported Pyodide memory layout');
}
