import { icon, esc, difficulty, topicIcons, starter, contract } from './ui.js';
import { testCode } from './runner.js';
import { runPython } from './python-runner.js';
import {
  openProgress,
  readProgress,
  mergeProgress,
  makeBackup,
  parseBackup,
  legacyRecords
} from './progress.js';

const app = document.querySelector('#app');
const dialog = document.querySelector('#topic-dialog');
const source = 'https://github.com/ascherj/neetcode-250-guide';
const languageKey = 'patternlab.ui.language';
let language = 'python',
  pendingBackup,
  progressRevision = 0,
  approaches;
const changes =
  typeof BroadcastChannel === 'function'
    ? new BroadcastChannel('patternlab-progress-changes')
    : null;
const isRetry = () => route.args.get('retry') === '1';
function codeField() {
  if (isRetry()) return language === 'python' ? 'retryPython' : 'retryCode';
  return language === 'python' ? 'python' : 'code';
}
function chosenLanguage(p) {
  try {
    const preferred = localStorage.getItem(languageKey);
    if (['javascript', 'python'].includes(preferred)) return preferred;
  } catch {
    /* Preferences are optional. */
  }
  return record(p).code !== undefined && record(p).python === undefined
    ? 'javascript'
    : 'python';
}
const levels = ['Easy', 'Medium', 'Hard'];
const openTopicsKey = 'patternlab.ui.openTopics';
const collapsedMatches = new Set();
let openTopicsOnDashboard = new Set();
let problems,
  days,
  topics,
  problemsByTopic,
  bySlug,
  records = new Map();
let filters,
  lastLibrary = '#/practice',
  runController,
  lastResults,
  editorTab = 'code';
let route = {},
  routeKey = '',
  toastTimer,
  storageOK = true;

function update(slug, data) {
  progressRevision++;
  records.set(slug, { ...records.get(slug), ...data });
  if (!storageOK) return;
  mergeProgress([[slug, data]])
    .then(() => changes?.postMessage('saved'))
    .catch(() => {
      storageOK = false;
      notify(
        'Browser storage is unavailable. Export a backup to keep this session.'
      );
      document
        .querySelectorAll('.autosave')
        .forEach((el) => (el.textContent = 'Session only'));
    });
}
async function synchronize() {
  if (!storageOK) return;
  const revision = progressRevision;
  const fresh = await readProgress();
  if (progressRevision !== revision) return synchronize();
  if (storageOK) records = fresh;
}
const record = (p) => records.get(p.slug) || {};
const solved = (p) => Boolean(record(p).solved);
const saved = (p) => Boolean(record(p).saved);
const problemURL = (p) => '#/problem/' + p.slug;
const studyURL = (p) => problemURL(p) + '?study=1';
const topicURL = (t) => '#/practice?topic=' + encodeURIComponent(t);
const currentDay = () =>
  days.findIndex((pair) => pair.some((slug) => !solved(bySlug.get(slug))));
const pad = (n) => String(n).padStart(2, '0');
function notify(message) {
  const el = document.querySelector('#notice');
  el.textContent = message;
  el.classList.add('visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('visible'), 2600);
}
function navLink(url, label, glyph, active, count = '') {
  return `<a class="nav-link ${active ? 'active' : ''}" href="${esc(url)}" ${active ? 'aria-current="page"' : ''}>${icon(glyph)}<span>${esc(label)}</span>${count !== '' ? `<small>${count}</small>` : ''}</a>`;
}
function sidebar() {
  return `<div class="brand"><a href="#/practice"><img src="./mark.svg" alt=""><span>Pattern<span class="brand-light">Lab</span></span></a><button class="icon-btn mobile-close" data-action="close-menu" aria-label="Close menu">${icon('x')}</button></div>
    <nav aria-label="Workspace navigation"><div class="nav-label">Workspace</div>
    ${navLink('#/practice', 'Practice dashboard', 'grid', route.view === 'practice' && !route.topic)}
    ${navLink('#/plan', 'Study plan', 'plan', route.view === 'plan')}
    ${navLink('#/bookmarks', 'Bookmarks', 'save', route.view === 'bookmarks', problems.filter(saved).length || '')}
    ${navLink('#/review', 'Solve again', 'repeat', route.view === 'review', problems.filter((p) => record(p).reviewAt).length || '')}
    ${navLink('#/backup', 'Progress backup', 'db', route.view === 'backup')}
    <div class="nav-rule"></div><div class="nav-label">Topics</div>
    ${topics
      .slice(0, 5)
      .map((t) =>
        navLink(
          topicURL(t),
          t,
          topicIcons[t],
          route.view === 'practice' && route.topic === t
        )
      )
      .join('')}
    <button class="all-topics" data-action="topics">All ${topics.length} topics ${icon('arrow', 15)}</button></nav>
    <div class="side-bottom"><a class="source-link" href="${source}" target="_blank" rel="noreferrer">${icon('book', 16)} Source guide ${icon('external', 14)}</a>
    <div class="profile"><span class="avatar">H</span><span><strong>HickoDev</strong><small>Local workspace</small></span><i class="online-dot" title="Local workspace"></i></div></div>`;
}
function refreshSidebar() {
  const aside = document.querySelector('#sidebar');
  if (aside) aside.innerHTML = sidebar();
}
function libraryHero() {
  const day = currentDay();
  const next =
    day >= 0
      ? days[day].map((s) => bySlug.get(s)).find((p) => !solved(p))
      : null;
  const started = problems.some(solved);
  return `<section class="hero"><div class="hero-copy"><div class="hero-label">${icon('layers', 15)} Guided study plan</div><h2>NeetCode 250<span>.</span></h2>
    <p>250 coding problems across 18 topics,<br class="wide-only"> organized into a 125-day study plan.</p>
    <a class="primary hero-cta" href="${next ? studyURL(next) : '#/plan'}">${next ? (started ? 'Continue' : 'Start') + ' day ' + (day + 1) : 'Review study plan'} ${icon('arrow', 16)}</a></div>
    <img class="hero-art" src="./plan-art.svg" alt="" aria-hidden="true"></section>`;
}
function progressCard() {
  const count = problems.filter(solved).length,
    percent = Math.round((1000 * count) / problems.length) / 10;
  return `<section class="progress-card"><h2>Your progress ${icon('target', 17)}</h2><div class="progress-main"><div class="progress-graph" style="--progress:${percent}%"><span>${percent}<small>%</small></span></div>
    <div><div class="progress-count">${count}<span> / ${problems.length}</span></div><p>Problems solved</p></div></div>
    <div class="level-progress">${levels
      .map((level) => {
        const items = problems.filter((p) => p.difficulty === level),
          done = items.filter(solved).length;
        return `<div><span class="level-label"><i class="${level.toLowerCase()}"></i>${level}</span><span class="track"><i class="${level.toLowerCase()}" style="width:${(100 * done) / items.length}%"></i></span><span class="level-count">${done}<b> / ${items.length}</b></span></div>`;
      })
      .join('')}</div></section>`;
}
function select(name, label, items, selected) {
  return `<label class="select"><select aria-label="${label}" data-filter="${name}"><option value="">${label}</option>${items.map((x) => `<option value="${esc(x)}" ${selected === x ? 'selected' : ''}>${esc(x)}</option>`).join('')}</select>${icon('down', 13)}</label>`;
}
function library() {
  const overview = route.view === 'practice' && !route.topic;
  const bookmarks = route.view === 'bookmarks';
  return `<div class="page-heading"><h1>${overview ? 'Practice dashboard' : bookmarks ? 'Bookmarks' : esc(route.topic)}</h1></div>
    ${overview ? `<div class="summary">${libraryHero()}${progressCard()}</div>` : ''}
    <section class="library" aria-label="Problem library"><div class="section-title">${overview ? '<h2>Problem library</h2>' : ''}<span class="count-label" id="lib-count"></span><button class="expand-topics" data-action="toggle-all-topics" hidden></button></div>
    <div class="toolbar"><label class="search-box">${icon('search', 17)}<input type="search" id="search" value="${esc(filters.query)}" placeholder="Search problems…" aria-label="Search problems"><kbd>/</kbd></label>
    ${select('topic', 'All topics', topics, filters.topic)}${select('level', 'Difficulty', levels, filters.level)}${select('status', 'Status', ['Unsolved', 'Solved'], filters.status)}</div>
    <div id="rows"></div></section>`;
}
function bookmarkBtn(p) {
  return `<button class="icon-btn bookmark ${saved(p) ? 'on' : ''}" aria-label="${saved(p) ? 'Remove bookmark for' : 'Bookmark'} ${esc(p.name)}" aria-pressed="${saved(p)}" data-action="bookmark" data-slug="${p.slug}" title="${saved(p) ? 'Remove bookmark' : 'Bookmark problem'}">${icon('save', 16)}</button>`;
}
function solveBtn(p) {
  return `<button class="solve-toggle ${solved(p) ? 'on' : ''}" aria-label="Mark ${esc(p.name)} ${solved(p) ? 'unsolved' : 'solved'}" aria-pressed="${solved(p)}" data-action="solve" data-slug="${p.slug}" title="${solved(p) ? 'Mark unsolved' : 'Mark solved'}">${solved(p) ? icon('check', 12) : ''}</button>`;
}
function filteredLibrary() {
  return Boolean(
    route.view === 'bookmarks' ||
      filters.query.trim() ||
      filters.topic ||
      filters.level ||
      filters.status
  );
}
function topicGroup(topic, items, visible, index) {
  const open = filteredLibrary()
    ? !collapsedMatches.has(topic)
    : openTopicsOnDashboard.has(topic);
  const done = items.filter(solved).length;
  const panelId = 'topic-problems-' + index;
  const rows = visible
    .map(
      (p) => `<tr>
    <td class="status-col">${solveBtn(p)}</td>
    <td><a class="problem-title" href="${problemURL(p)}">${esc(p.name)}</a></td>
    <td>${difficulty(p.difficulty)}</td><td class="save-col">${bookmarkBtn(p)}</td>
  </tr>`
    )
    .join('');
  return `<section class="topic-group"><h3><button class="topic-toggle" data-action="toggle-topic" data-topic="${esc(topic)}" aria-expanded="${open}" aria-controls="${panelId}">
    ${icon('next', 15)}<span class="topic-name">${esc(topic)}</span>
    ${visible.length < items.length ? `<span class="match-count">${visible.length} shown</span>` : ''}
    <span class="topic-meter" aria-hidden="true"><i style="width:${(100 * done) / items.length}%"></i></span>
    <span class="topic-count${done === items.length ? ' complete' : ''}">${done} / ${items.length} solved</span>
  </button></h3><div id="${panelId}" ${open ? '' : 'hidden'}><table aria-label="${esc(topic)} problems">
    <thead><tr><th class="status-col"><span class="sr">Solved</span>${icon('circle', 15)}</th><th>Problem</th><th class="difficulty-col">Difficulty</th><th class="save-col"><span class="sr">Bookmark</span></th></tr></thead>
    <tbody>${rows}</tbody></table></div></section>`;
}
function syncExpandButton() {
  const button = document.querySelector('.expand-topics');
  const toggles = document.querySelectorAll('.topic-toggle');
  button.hidden = toggles.length < 2;
  button.textContent = document.querySelector(
    '.topic-toggle[aria-expanded="true"]'
  )
    ? 'Collapse all'
    : 'Expand all';
}
function changeTopicExpansion(buttons, open) {
  const filtered = filteredLibrary();
  for (const button of buttons) {
    const topic = button.dataset.topic;
    if (filtered) {
      if (open) collapsedMatches.delete(topic);
      else collapsedMatches.add(topic);
    } else if (open) openTopicsOnDashboard.add(topic);
    else openTopicsOnDashboard.delete(topic);
    button.setAttribute('aria-expanded', String(open));
    document.getElementById(button.getAttribute('aria-controls')).hidden =
      !open;
  }
  if (!filtered) {
    try {
      localStorage.setItem(
        openTopicsKey,
        JSON.stringify([...openTopicsOnDashboard])
      );
    } catch {
      /* Keep the display preference in memory when storage is unavailable. */
    }
  }
  syncExpandButton();
}
function updateRows() {
  const focus = document.activeElement;
  const focusGroup = focus?.closest('.topic-group');
  const query = filters.query.trim().toLowerCase();
  const sections = [];
  let count = 0;
  for (const [index, topic] of topics.entries()) {
    if (filters.topic && filters.topic !== topic) continue;
    const items = problemsByTopic.get(topic);
    const visible = items.filter(
      (p) =>
        (route.view !== 'bookmarks' || saved(p)) &&
        (!filters.level || filters.level === p.difficulty) &&
        (!filters.status || solved(p) === (filters.status === 'Solved')) &&
        (!query || (p.name + ' ' + topic).toLowerCase().includes(query))
    );
    if (visible.length) sections.push(topicGroup(topic, items, visible, index));
    count += visible.length;
  }
  document.querySelector('#lib-count').textContent =
    count + (count === 1 ? ' problem' : ' problems');
  const emptyBookmarks = route.view === 'bookmarks' && !problems.some(saved);
  document.querySelector('#rows').innerHTML = sections.length
    ? sections.join('')
    : `<div class="empty">${icon(emptyBookmarks ? 'save' : 'search', 28)}<h3>${emptyBookmarks ? 'No bookmarks yet' : 'No matching problems'}</h3><p>${emptyBookmarks ? 'Bookmark a problem in the library to keep it here.' : 'Try a different search or clear your filters.'}</p>${emptyBookmarks ? '<a class="secondary" href="#/practice">Browse problems</a>' : '<button class="secondary" data-action="clear">Clear filters</button>'}</div>`;
  syncExpandButton();
  if (focusGroup) {
    const heading = focusGroup.querySelector('.topic-toggle');
    const replacementHeading = document.querySelector(
      `.topic-toggle[data-topic="${CSS.escape(heading.dataset.topic)}"]`
    );
    const rowControl =
      focus.dataset.slug &&
      document.querySelector(
        `#rows [data-action="${CSS.escape(focus.dataset.action)}"][data-slug="${CSS.escape(focus.dataset.slug)}"]`
      );
    (
      rowControl ||
      replacementHeading ||
      document.querySelector('#search')
    ).focus({ preventScroll: true });
  }
}
function refreshProgressView() {
  if (route.view === 'practice' || route.view === 'bookmarks') {
    updateRows();
    const summary = document.querySelector('.summary');
    if (summary) summary.innerHTML = libraryHero() + progressCard();
  } else {
    renderContent();
  }
  refreshSidebar();
}
function plan() {
  const active = currentDay();
  const chunk = Math.min(
    12,
    Math.max(
      0,
      Number(route.args.get('block') ?? Math.floor(Math.max(0, active) / 10)) ||
        0
    )
  );
  const start = Math.floor(chunk) * 10;
  return `<div class="page-heading"><h1>Study plan</h1><p>Work through the guide in order, two problems at a time.</p></div>
    <div class="plan-toolbar"><div class="section-title"><h2>Daily practice</h2><span class="count-label">125 days</span></div>
    <label class="select"><select id="plan-block" aria-label="Days to display">${Array.from({ length: 13 }, (_, i) => `<option value="${i}" ${i === chunk ? 'selected' : ''}>Days ${i * 10 + 1}–${Math.min(125, i * 10 + 10)}</option>`).join('')}</select>${icon('down', 14)}</label></div>
    <div class="days">${days
      .slice(start, start + 10)
      .map((slugs, i) => {
        const pair = slugs.map((s) => bySlug.get(s)),
          index = start + i,
          done = pair.filter(solved).length;
        return `<section class="day ${active === index ? 'current' : ''}"><div class="day-head"><span class="day-icon">${icon(done === 2 ? 'check' : 'calendar', 18)}</span><div><small>Day ${pad(index + 1)}</small><h3>${esc([...new Set(pair.map((p) => p.category))].join(' + '))}</h3></div><span class="day-state">${done === 2 ? 'Completed' : active === index ? 'Up next' : done + '/2 solved'}</span></div>
      ${pair.map((p) => `<div class="day-problem">${solveBtn(p)}<a href="${studyURL(p)}">${esc(p.name)}</a>${difficulty(p.difficulty)}${bookmarkBtn(p)}</div>`).join('')}</section>`;
      })
      .join('')}</div>`;
}
function reviewAction(p) {
  const queued = Boolean(record(p).reviewAt);
  const label =
    isRetry() && queued
      ? 'Finish review'
      : queued
        ? 'Remove from queue'
        : 'Solve again';
  return `<button class="secondary" data-action="toggle-review" data-slug="${p.slug}">${icon('repeat', 15)} ${label}</button>`;
}
function reviewPage() {
  const queue = problems
    .filter((p) => record(p).reviewAt)
    .sort((a, b) => record(a).reviewAt - record(b).reviewAt);
  return `<div class="page-heading"><h1>Solve again</h1><p>Revisit problems in the order you added them. Each retry has its own draft.</p></div>${
    queue.length
      ? `<section class="panel queue-list">${queue.map((p) => `<div class="queue-row"><div><a class="problem-title" href="${problemURL(p)}?retry=1">${esc(p.name)}</a><small>${esc(p.category)}</small></div>${difficulty(p.difficulty)}<a class="secondary" href="${problemURL(p)}?retry=1">Retry ${icon('arrow', 14)}</a><button class="icon-btn" aria-label="Remove ${esc(p.name)} from queue" data-action="toggle-review" data-slug="${p.slug}">${icon('x', 15)}</button></div>`).join('')}</section>`
      : `<div class="empty">${icon('repeat', 28)}<h3>Your queue is empty</h3><p>Use Solve again in a practice room to add a problem.</p><a class="secondary" href="#/practice">Browse problems</a></div>`
  }`;
}
function strategyPanel(p) {
  const { neetcode, leetcode, hint } = approaches[p.slug];
  return `<details class="strategy"><summary>Complexity target &amp; constraints</summary>
    <p><strong>NeetCode · ${esc(neetcode.kind)}</strong>${neetcode.method ? ' · ' + esc(neetcode.method) : ''}</p>
    <dl><dt>Time</dt><dd>${esc(neetcode.time)}</dd><dt>Space</dt><dd>${esc(neetcode.space)}</dd></dl>
    ${neetcode.variables ? `<p>${esc(neetcode.variables)}</p>` : ''}
    <a href="${esc(neetcode.url)}" target="_blank" rel="noreferrer">NeetCode source ${icon('external', 14)}</a>
    ${
      leetcode.bounds.length || leetcode.requirement || leetcode.followUp
        ? `<p><strong>LeetCode constraints</strong></p>
      ${leetcode.bounds.length ? `<ul>${leetcode.bounds.map((b) => `<li><code>${esc(b)}</code></li>`).join('')}</ul>` : ''}
      ${leetcode.requirement ? `<p>Required · ${esc(leetcode.requirement)}</p>` : ''}
      ${leetcode.followUp ? `<p>Follow-up · ${esc(leetcode.followUp)}</p>` : ''}`
        : ''
    }
    <a href="${esc(leetcode.url)}" target="_blank" rel="noreferrer">LeetCode statement ${icon('external', 14)}</a></details>
    <details class="strategy"><summary>Reveal an approach</summary><p>${esc(hint)}</p>
    <a href="${esc('https://neetcode.io/problems/' + p.slug + '/solution')}" target="_blank" rel="noreferrer">Open NeetCode solution ${icon('external', 14)}</a></details>`;
}
function backupPage() {
  return `<div class="page-heading"><h1>Progress backup</h1><p>Move your practice history between browsers or computers.</p></div>
  <div class="backup-grid"><section class="panel backup-panel"><h2>Export progress</h2><p>Download your solved status, bookmarks, notes, both languages’ drafts, and Solve again queue as one JSON file.</p>
  <button class="primary run" data-action="export">Download backup</button></section>
  <section class="panel backup-panel"><h2>Import progress</h2><p>Choose a PatternLab backup to preview. Imported fields replace matching local fields. Other progress is kept.</p>
  <input id="backup-file" type="file" accept=".json,application/json" aria-label="Choose a progress backup"><div id="backup-preview" aria-live="polite"></div></section></div>`;
}
async function exportBackup() {
  try {
    try {
      await synchronize();
    } catch {
      // Keep the current session exportable if the browser revokes storage.
      storageOK = false;
    }
    const data = JSON.stringify(makeBackup(records), null, 2);
    const url = URL.createObjectURL(
      new Blob([data], { type: 'application/json' })
    );
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download =
      'patternlab-progress-' + new Date().toISOString().slice(0, 10) + '.json';
    document.body.append(anchor);
    anchor.click();
    anchor.remove();
    setTimeout(() => URL.revokeObjectURL(url), 30000);
    notify('Backup download started.');
  } catch (error) {
    notify('Could not export progress: ' + error.message);
  }
}
async function previewBackup(file) {
  const output = document.querySelector('#backup-preview');
  pendingBackup = null;
  output.replaceChildren();
  if (!file) return;
  try {
    const incoming = parseBackup(await file.text(), bySlug);
    if (document.querySelector('#backup-file')?.files[0] !== file) return;
    const conflicts = [...incoming].filter(([slug, fields]) =>
      Object.entries(fields).some(
        ([key, val]) =>
          Object.hasOwn(records.get(slug) || {}, key) &&
          records.get(slug)[key] !== val
      )
    ).length;
    pendingBackup = incoming;
    output.innerHTML = `<p>${incoming.size} problem records · ${conflicts} with changed local values.</p>${incoming.size ? '<button class="secondary" data-action="apply-backup">Import backup</button>' : ''}`;
  } catch (error) {
    output.textContent = error.message;
  }
}
async function importBackup(button) {
  if (!pendingBackup || button.disabled) return;
  const incoming = pendingBackup;
  const output = document.querySelector('#backup-preview');
  button.disabled = true;
  try {
    if (!storageOK)
      throw Error(
        'Browser storage is unavailable. Import in a browser that can save progress.'
      );
    await mergeProgress(incoming);
    await synchronize();
    pendingBackup = null;
    changes?.postMessage('import');
    refreshSidebar();
    output.textContent =
      'Imported progress for ' + incoming.size + ' problems.';
  } catch (error) {
    output.textContent = 'Import failed: ' + error.message;
  }
}
function problemPage(p) {
  const guided = route.args.get('study') === '1';
  const sequence = guided ? days.flat().map((s) => bySlug.get(s)) : problems;
  const index = sequence.indexOf(p),
    link = guided ? studyURL : problemURL;
  const back = isRetry()
    ? '#/review'
    : guided
      ? '#/plan?block=' + Math.floor(index / 20)
      : lastLibrary;
  const position = guided
    ? 'Day ' + pad(Math.floor(index / 2) + 1) + ' · ' + ((index % 2) + 1) + '/2'
    : String(index + 1).padStart(3, '0') + ' / 250';
  return `<div class="problem-top"><a class="back-link" href="${esc(back)}">${icon('back', 15)} Back to ${back.startsWith('#/review') ? 'Solve again' : back.startsWith('#/plan') ? 'study plan' : back.startsWith('#/bookmarks') ? 'bookmarks' : 'library'}</a>
    <div class="stepper">${isRetry() ? '<span>Retry attempt</span>' : `${index ? `<a href="${link(sequence[index - 1])}" aria-label="Previous problem">${icon('prev', 14)}</a>` : ''}<span>${position}</span>${index < sequence.length - 1 ? `<a href="${link(sequence[index + 1])}" aria-label="Next problem">${icon('next', 14)}</a>` : ''}`}</div></div>
    <div class="exercise-heading"><div><div class="exercise-topic">${icon(topicIcons[p.category] || 'nodes', 15)} ${esc(p.category)}</div><h1>${esc(p.name)}</h1></div><div class="exercise-actions">${bookmarkBtn(p)}${reviewAction(p)}<button class="secondary ${solved(p) ? 'completed' : ''}" data-action="solve" data-slug="${p.slug}">${icon(solved(p) ? 'check' : 'circle', 15)} ${solved(p) ? 'Solved' : 'Mark solved'}</button></div></div>
    <div class="workbench"><article class="description panel"><div class="panel-head"><h2>${icon('book', 17)} Problem</h2>${difficulty(p.difficulty)}</div><div class="description-body"><p class="prompt">${esc(p.prompt)}</p>
    ${contract(p) ? `<p class="contract">${esc(contract(p))}</p>` : ''}
    ${strategyPanel(p)}<h3>Examples</h3>${p.cases.map((c, i) => `<div class="example"><div class="example-num">Example ${pad(i + 1)}</div><dl><dt>Input</dt><dd>${esc(sampleInput(p, c))}</dd><dt>Expected</dt><dd>${esc(JSON.stringify(c.expected))}</dd></dl></div>`).join('')}
    <div class="references"><h3>References</h3><a href="${esc('https://neetcode.io' + p.neetcode_url)}" target="_blank" rel="noreferrer">NeetCode guide ${icon('external', 14)}</a><a href="${esc(p.leetcode_url)}" target="_blank" rel="noreferrer">LeetCode problem ${icon('external', 14)}</a></div></div></article>
    <section class="editor-panel panel"><div class="panel-head editor-head"><div class="editor-tabs"><button class="${editorTab === 'code' ? 'selected' : ''}" data-action="code-tab">${icon('code', 16)} Code</button><button class="${editorTab === 'notes' ? 'selected' : ''}" data-action="notes-tab">${icon('note', 15)} Notes</button></div>${
      editorTab === 'code'
        ? `<label class="select language-select"><select id="language" aria-label="Solution language">
      <option value="python" ${language === 'python' ? 'selected' : ''}>Python</option>
      <option value="javascript" ${language === 'javascript' ? 'selected' : ''}>JavaScript</option></select>${icon('down', 12)}</label>`
        : '<span class="language">Plain text</span>'
    }</div>
    ${
      editorTab === 'code'
        ? `<div class="editor-shell"><div class="line-numbers" aria-hidden="true"></div><textarea id="code" aria-label="${language === 'python' ? 'Python' : 'JavaScript'} solution" autocapitalize="off" autocomplete="off" spellcheck="false" wrap="off"></textarea></div>
    <div class="editor-controls"><span class="autosave"><i></i> ${storageOK ? 'Saved locally' : 'Session only'}</span><button class="primary run" data-action="run" ${runController ? 'disabled' : ''}>${icon('play', 14)} ${runController ? 'Running…' : 'Run samples'}</button></div><div class="result-box" aria-live="polite"></div><p class="run-limits">4 s per sample suite. ${language === 'python' ? 'Python has a 128 MiB interpreter heap limit.' : 'JavaScript memory usage is managed by your browser.'}</p>`
        : `<textarea id="notes" aria-label="Problem notes" placeholder="Write down your approach, complexity, or a detail to revisit." spellcheck="true"></textarea><div class="editor-controls"><span class="autosave"><i></i> ${storageOK ? 'Notes saved locally' : 'Session only'}</span></div>`
    }
    </section></div>`;
}
function sampleInput(p, c) {
  if (p.methods) return JSON.stringify(c.args[0]);
  if (p.slug === 'linked-list-cycle-detection')
    return (
      'values = ' + JSON.stringify(c.args[0]) + '\njoinIndex = ' + c.args[1]
    );
  return c.args
    .map((val, i) => (p.params[i] || 'arg') + ' = ' + JSON.stringify(val))
    .join('\n');
}
function lines() {
  const code = document.querySelector('#code'),
    lineEl = document.querySelector('.line-numbers');
  if (!code) return;
  lineEl.textContent = Array.from(
    { length: code.value.split('\n').length },
    (_, i) => i + 1
  ).join('\n');
  lineEl.scrollTop = code.scrollTop;
}
function paintResults() {
  const el = document.querySelector('.result-box');
  if (!el) return;
  if (!lastResults) {
    el.innerHTML = `<h3>${icon('terminal', 16)} Sample results</h3><p>Run your solution to check it against the examples.</p>`;
    return;
  }
  if (lastResults.error) {
    el.innerHTML = `<h3>Run stopped</h3><p>${esc(lastResults.error)}</p>`;
    return;
  }
  const { results, p, heapMiB } = lastResults,
    passed = results.filter((x) => x.passed).length;
  el.innerHTML = `<h3>${icon(passed === results.length ? 'check' : 'terminal', 17)} ${passed} of ${results.length} samples passed</h3><p class="run-metrics">${results.reduce((sum, r) => sum + (r.elapsedMs || 0), 0).toFixed(2)} ms across samples${heapMiB != null ? ' · ' + heapMiB.toFixed(1) + ' MiB Python heap capacity' : ''}</p>${results.map((r, i) => `<details class="result ${r.passed ? 'pass' : 'fail'}" ${r.passed ? '' : 'open'}><summary>Example ${pad(i + 1)} <span>${r.elapsedMs?.toFixed(2) ?? '0'} ms · ${r.passed ? 'Passed' : 'Failed'}</span></summary><pre>${r.error ? esc(r.error) : esc('Expected  ' + JSON.stringify(p.cases[i].expected) + '\nReceived  ' + r.actual)}</pre></details>`).join('')}`;
}
function renderContent() {
  const main = document.querySelector('#main');
  const p = bySlug.get(route.slug);
  if (route.view === 'problem' && p) {
    main.innerHTML = problemPage(p);
    const code = document.querySelector('#code'),
      notes = document.querySelector('#notes');
    if (code) {
      code.value = record(p)[codeField()] ?? starter(p, language);
      lines();
      code.onscroll = () =>
        (document.querySelector('.line-numbers').scrollTop = code.scrollTop);
    }
    if (notes) notes.value = record(p).notes || '';
    paintResults();
  } else if (route.view === 'review') main.innerHTML = reviewPage();
  else if (route.view === 'backup') main.innerHTML = backupPage();
  else if (route.view === 'plan') main.innerHTML = plan();
  else if (route.view === 'practice' || route.view === 'bookmarks') {
    main.innerHTML = library();
    updateRows();
  } else
    main.innerHTML =
      '<div class="empty"><h1>Page unavailable</h1><a class="secondary" href="#/practice">Back to practice</a></div>';
}
function readRoute() {
  const url = new URL(
    location.hash.startsWith('#/') ? location.hash.slice(1) : '/practice',
    location.origin
  );
  const [, view, slug] = url.pathname.split('/');
  return {
    view,
    slug,
    args: url.searchParams,
    topic: topics.includes(url.searchParams.get('topic'))
      ? url.searchParams.get('topic')
      : ''
  };
}
function navigate() {
  const next = readRoute(),
    newKey = next.view + '/' + (next.topic || '');
  const enteringProblem =
    next.view === 'problem' &&
    (route.slug !== next.slug ||
      route.view !== 'problem' ||
      route.args?.get('retry') !== next.args.get('retry'));
  if (runController) {
    runController.abort();
    runController = null;
  }
  if (enteringProblem) {
    lastResults = null;
    editorTab = 'code';
  }
  if (next.view !== 'problem') {
    lastLibrary = location.hash.startsWith('#/') ? location.hash : '#/practice';
    if (newKey !== routeKey) {
      collapsedMatches.clear();
      filters = {
        query: '',
        topic: next.topic,
        level: '',
        status: ''
      };
    }
    routeKey = newKey;
  }
  route = next;
  if (route.view === 'problem' && bySlug.has(route.slug))
    language = chosenLanguage(bySlug.get(route.slug));
  const name =
    route.view === 'problem'
      ? 'Practice room'
      : route.view === 'plan'
        ? 'Study plan'
        : route.view === 'review'
          ? 'Solve again'
          : route.view === 'backup'
            ? 'Progress backup'
            : route.view === 'bookmarks'
              ? 'Bookmarks'
              : 'Practice dashboard';
  document.title =
    (route.view === 'problem'
      ? bySlug.get(route.slug)?.name || 'Problem'
      : name) + ' · PatternLab';
  if (dialog.open) dialog.close();
  app.innerHTML = `<div class="layout"><aside id="sidebar">${sidebar()}</aside><button class="scrim" data-action="close-menu" aria-label="Close menu"></button><div class="workspace"><header class="topbar">
 <button class="icon-btn menu-toggle" data-action="menu" aria-label="Open navigation" aria-expanded="false">${icon('menu', 20)}</button><div class="breadcrumb">${icon('folder', 16)} <span>Workspace</span><b>/</b><strong>${name}</strong></div>
 <div class="device"> <i class="online-dot"></i> Local session</div></header><main id="main" tabindex="-1"></main></div></div>`;
  renderContent();
  window.scrollTo(0, 0);
}
function openTopics() {
  dialog.innerHTML = `<div class="dialog-head"><h2>Browse topics</h2><button class="icon-btn" data-action="dismiss" aria-label="Close topic list">${icon('x')}</button></div><div class="topic-grid">${topics.map((t) => `<a href="${esc(topicURL(t))}">${icon(topicIcons[t] || 'nodes', 17)}<span>${esc(t)}</span><small>${problems.filter((p) => p.category === t).length}</small></a>`).join('')}</div>`;
  dialog.showModal();
}
async function run() {
  if (
    runController ||
    route.view !== 'problem' ||
    !document.querySelector('#code')
  )
    return;
  const p = bySlug.get(route.slug),
    code = document.querySelector('#code').value;
  const controller = new AbortController();
  runController = controller;
  const btn = document.querySelector('[data-action="run"]');
  btn.disabled = true;
  btn.textContent = 'Running…';
  try {
    let report;
    if (language === 'python') {
      btn.textContent = 'Loading Python…';
      report = await runPython(p, code, controller.signal, () => {
        btn.textContent = 'Running…';
      });
    } else report = { results: await testCode(p, code, controller.signal) };
    if (!controller.signal.aborted) lastResults = { ...report, p };
  } catch (error) {
    if (!controller.signal.aborted) lastResults = { error: error.message };
  } finally {
    if (runController === controller) {
      runController = null;
      const current = document.querySelector('[data-action="run"]');
      if (current) {
        current.disabled = false;
        current.innerHTML = icon('play', 14) + ' Run samples';
      }
      paintResults();
    }
  }
}
function toggleMenu(open) {
  document.querySelector('.layout')?.classList.toggle('menu-open', open);
  document
    .querySelector('.menu-toggle')
    ?.setAttribute('aria-expanded', String(open));
}
document.addEventListener('click', (e) => {
  const action = e.target.closest('[data-action]'),
    link = e.target.closest('a[href^="#/"]');
  if (link) {
    toggleMenu(false);
    if (dialog.open) dialog.close();
  }
  if (!action) return;
  const name = action.dataset.action,
    p = bySlug.get(action.dataset.slug);
  if (name === 'toggle-review') {
    if (record(p).reviewAt) update(p.slug, { reviewAt: null });
    else
      update(p.slug, {
        reviewAt: Date.now(),
        retryCode: starter(p),
        retryPython: starter(p, 'python')
      });
    if (route.view === 'problem' && isRetry()) location.hash = '/review';
    else refreshProgressView();
    return;
  }
  if (name === 'export') {
    exportBackup();
    return;
  }
  if (name === 'apply-backup') {
    importBackup(action);
    return;
  }
  if (name === 'topics') {
    toggleMenu(false);
    openTopics();
  }
  if (name === 'dismiss') dialog.close();
  if (name === 'menu' || name === 'close-menu') toggleMenu(name === 'menu');
  if (name === 'toggle-topic')
    changeTopicExpansion(
      [action],
      action.getAttribute('aria-expanded') !== 'true'
    );
  if (name === 'toggle-all-topics') {
    const toggles = document.querySelectorAll('.topic-toggle');
    changeTopicExpansion(
      toggles,
      !document.querySelector('.topic-toggle[aria-expanded="true"]')
    );
  }
  if (name === 'bookmark' || name === 'solve') {
    const key = name === 'solve' ? 'solved' : 'saved';
    update(p.slug, { [key]: !record(p)[key] });
    notify(
      key === 'saved'
        ? saved(p)
          ? 'Problem bookmarked'
          : 'Bookmark removed'
        : solved(p)
          ? 'Marked as solved'
          : 'Marked as unsolved'
    );
    refreshProgressView();
  }
  if (name === 'clear') {
    if (route.topic) {
      location.hash = '/practice';
      return;
    }
    collapsedMatches.clear();
    filters = { query: '', topic: '', level: '', status: '' };
    renderContent();
  }
  if (name === 'code-tab' || name === 'notes-tab') {
    editorTab = name === 'code-tab' ? 'code' : 'notes';
    renderContent();
  }
  if (name === 'run') run();
});
dialog.addEventListener('click', (e) => {
  if (e.target === dialog) dialog.close();
});
document.addEventListener('input', (e) => {
  const el = e.target;
  if (el.id === 'search') {
    filters.query = el.value;
    collapsedMatches.clear();
    updateRows();
  }
  if (el.id === 'code' || el.id === 'notes') {
    if (el.id === 'code' && (runController || lastResults)) {
      runController?.abort();
      runController = null;
      lastResults = null;
      const runButton = document.querySelector('[data-action="run"]');
      if (runButton) {
        runButton.disabled = false;
        runButton.innerHTML = icon('play', 14) + ' Run samples';
      }
      paintResults();
    }
    update(route.slug, {
      [el.id === 'code' ? codeField() : 'notes']: el.value
    });
    if (el.id === 'code') lines();
  }
});
document.addEventListener('change', (e) => {
  const el = e.target;
  if (el.id === 'backup-file') {
    previewBackup(el.files[0]);
    return;
  }
  if (el.id === 'language') {
    runController?.abort();
    runController = null;
    lastResults = null;
    language = el.value;
    try {
      localStorage.setItem(languageKey, language);
    } catch {
      /* Keep the current selection. */
    }
    renderContent();
    return;
  }
  if (el.id === 'plan-block') {
    location.hash = '/plan?block=' + el.value;
    return;
  }
  if (el.dataset.filter) {
    if (route.topic && el.dataset.filter === 'topic') {
      location.hash = el.value ? topicURL(el.value) : '#/practice';
      return;
    }
    filters[el.dataset.filter] = el.value;
    collapsedMatches.clear();
    updateRows();
  }
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') toggleMenu(false);
  if (
    e.key === '/' &&
    !dialog.open &&
    !['INPUT', 'TEXTAREA', 'SELECT'].includes(e.target.tagName) &&
    document.querySelector('#search')
  ) {
    e.preventDefault();
    document.querySelector('#search').focus();
  }
  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey) && e.target.id === 'code') {
    e.preventDefault();
    run();
  }
  if (
    e.key === 'Tab' &&
    !e.shiftKey &&
    e.target.id === 'code' &&
    !e.ctrlKey &&
    !e.altKey
  ) {
    // Modified Tab keeps native focus navigation available in the editor.
    e.preventDefault();
    const el = e.target;
    el.setRangeText(
      language === 'python' ? '    ' : '  ',
      el.selectionStart,
      el.selectionEnd,
      'end'
    );
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
});
changes?.addEventListener('message', async () => {
  if (!route.view || !storageOK) return;
  try {
    await synchronize();
  } catch {
    notify('Could not read progress from the other tab.');
    return;
  }
  if (route.view === 'backup') {
    refreshSidebar();
    return;
  }
  if (!['code', 'notes'].includes(document.activeElement?.id))
    refreshProgressView();
});
try {
  const [catalogResponse, strategyResponse] = await Promise.all([
    fetch('./data/catalog.json'),
    fetch('./data/strategies.json')
  ]);
  if (!catalogResponse.ok || !strategyResponse.ok)
    throw Error('Catalog unavailable');
  ({ problems, days } = await catalogResponse.json());
  approaches = await strategyResponse.json();
  topics = [...new Set(problems.map((p) => p.category))];
  problemsByTopic = new Map(
    topics.map((topic) => [topic, problems.filter((p) => p.category === topic)])
  );
  try {
    const stored = JSON.parse(localStorage.getItem(openTopicsKey));
    if (Array.isArray(stored))
      openTopicsOnDashboard = new Set(
        stored.filter((topic) => problemsByTopic.has(topic))
      );
  } catch {
    /* Start with topics collapsed if the preference cannot be read. */
  }
  bySlug = new Map(problems.map((p) => [p.slug, p]));
  try {
    records = await openProgress(bySlug.keys());
  } catch {
    storageOK = false;
    records = legacyRecords(bySlug.keys());
    notify(
      'Progress is in memory for this session. Export a backup before closing.'
    );
  }
  window.addEventListener('hashchange', navigate);
  navigate();
} catch (error) {
  app.innerHTML =
    '<main class="empty"><h1>Workspace unavailable</h1><p>Start the local server with <code>npm start</code>, then reload this page.</p></main>';
  console.error(error);
}
