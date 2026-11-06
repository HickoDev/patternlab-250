const legacyPrefix = 'patternlab.v1.';
const backupType = 'patternlab-progress';
const boolFields = new Set(['solved', 'saved']);
const textFields = new Set([
  'code',
  'python',
  'notes',
  'retryCode',
  'retryPython'
]);
let database;

function complete(tx) {
  return new Promise((resolve, reject) => {
    tx.oncomplete = () => resolve();
    tx.onabort = tx.onerror = () =>
      reject(tx.error || Error('Could not save progress.'));
  });
}
export function legacyRecords(slugs) {
  const records = new Map();
  for (const slug of slugs) {
    try {
      const value = JSON.parse(localStorage.getItem(legacyPrefix + slug));
      if (value && typeof value === 'object' && !Array.isArray(value))
        records.set(slug, value);
    } catch {
      /* An unavailable legacy entry should not prevent startup. */
    }
  }
  return records;
}
export async function openProgress(slugs) {
  database = await new Promise((resolve, reject) => {
    const request = indexedDB.open('patternlab-practice', 1);
    request.onupgradeneeded = () => {
      request.result.createObjectStore('records');
      request.result.createObjectStore('settings');
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
  const tx = database.transaction(['records', 'settings'], 'readwrite');
  const done = complete(tx);
  const settings = tx.objectStore('settings');
  const migrated = settings.get('migrated');
  migrated.onsuccess = () => {
    if (migrated.result) return;
    for (const [slug, record] of legacyRecords(slugs))
      tx.objectStore('records').put(record, slug);
    settings.put(true, 'migrated');
  };
  await done;
  return readProgress();
}
export async function readProgress() {
  const tx = database.transaction('records', 'readonly');
  const store = tx.objectStore('records');
  const keys = store.getAllKeys(),
    values = store.getAll();
  await complete(tx);
  return new Map(keys.result.map((key, i) => [key, values.result[i]]));
}
// A backup uses the same field-level merge as an editor save. All records in
// one import commit together, even if a quota error interrupts a write.
export async function mergeProgress(entries) {
  if (!database) throw Error('Browser storage is unavailable.');
  const tx = database.transaction('records', 'readwrite');
  const done = complete(tx);
  const store = tx.objectStore('records');
  for (const [slug, patch] of entries) {
    const current = store.get(slug);
    current.onsuccess = () => store.put({ ...current.result, ...patch }, slug);
  }
  await done;
}
export function makeBackup(records) {
  return {
    format: backupType,
    version: 1,
    exportedAt: new Date().toISOString(),
    records: Object.fromEntries(
      [...records].filter(([, v]) => Object.keys(v).length)
    )
  };
}
export function parseBackup(text, catalog) {
  let backup;
  try {
    backup = JSON.parse(text);
  } catch {
    throw Error('This file contains invalid JSON.');
  }
  if (backup?.format !== backupType || backup.version !== 1)
    throw Error('Choose a PatternLab progress backup (version 1).');
  if (
    !backup.records ||
    typeof backup.records !== 'object' ||
    Array.isArray(backup.records)
  )
    throw Error('The backup is missing its problem records.');
  const incoming = new Map();
  for (const [slug, data] of Object.entries(backup.records)) {
    if (!catalog.has(slug)) throw Error('Unknown problem in backup: ' + slug);
    if (!data || typeof data !== 'object' || Array.isArray(data))
      throw Error('Invalid record for ' + slug);
    for (const [key, value] of Object.entries(data)) {
      if (boolFields.has(key) && typeof value === 'boolean') continue;
      if (textFields.has(key) && typeof value === 'string') continue;
      if (
        key === 'reviewAt' &&
        (value === null ||
          (Number.isSafeInteger(value) &&
            value > 0 &&
            value <= 8640000000000000))
      )
        continue;
      throw Error('Invalid field “' + key + '” in ' + slug + '.');
    }
    if (Object.keys(data).length) incoming.set(slug, data);
  }
  return incoming;
}
