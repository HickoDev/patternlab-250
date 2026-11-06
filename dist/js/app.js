import { icon, esc, difficulty, topicIcons, starter, contract } from './ui.js';
import { testCode } from './runner.js';

const app = document.querySelector('#app');
const dialog = document.querySelector('#topic-dialog');
const source = 'https://github.com/ascherj/neetcode-250-guide';
const prefix = 'patternlab.v1.';
const levels = ['Easy', 'Medium', 'Hard'];
const pageSize = 12;
let problems,
  days,
  topics,
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

function loadRecord(slug) {
  try {
    return JSON.parse(localStorage.getItem(prefix + slug)) || {};
  } catch {
    return {};
  }
}
function update(slug, data) {
  const previous = storageOK ? loadRecord(slug) : records.get(slug);
  const record = { ...previous, ...data };
  records.set(slug, record);
  try {
    localStorage.setItem(prefix + slug, JSON.stringify(record));
  } catch {
    storageOK = false;
    notify(
      'Browser storage is unavailable. This change is kept for this session.'
    );
  }
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
    <section class="library" aria-label="Problem library"><div class="section-title">${overview ? '<h2>Problem library</h2>' : ''}<span class="count-label" id="lib-count"></span></div>
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
function updateRows() {
  const matched = problems.filter(
    (p) =>
      (route.view !== 'bookmarks' || saved(p)) &&
      (!filters.topic || filters.topic === p.category) &&
      (!filters.level || filters.level === p.difficulty) &&
      (!filters.status || solved(p) === (filters.status === 'Solved')) &&
      (!filters.query ||
        (p.name + ' ' + p.category)
          .toLowerCase()
          .includes(filters.query.trim().toLowerCase()))
  );
  const pages = Math.max(1, Math.ceil(matched.length / pageSize));
  filters.page = Math.min(pages, Math.max(1, filters.page));
  const from = (filters.page - 1) * pageSize;
  document.querySelector('#lib-count').textContent =
    matched.length + ' problems';
  const emptyBookmarks = route.view === 'bookmarks' && !problems.some(saved);
  document.querySelector('#rows').innerHTML = matched.length
    ? `<div class="table-wrap"><table><thead><tr><th class="status-col"><span class="sr">Solved</span>${icon('circle', 15)}</th><th>Problem</th><th class="topic-col">Topic</th><th>Difficulty</th><th><span class="sr">Bookmark</span></th></tr></thead><tbody>
    ${matched
      .slice(from, from + pageSize)
      .map(
        (p) =>
          `<tr><td class="status-col">${solveBtn(p)}</td><td><a class="problem-title" href="${problemURL(p)}">${esc(p.name)}</a></td><td class="topic-col"><a class="table-topic" href="${esc(topicURL(p.category))}">${esc(p.category)}</a></td><td>${difficulty(p.difficulty)}</td><td class="save-col">${bookmarkBtn(p)}</td></tr>`
      )
      .join('')}
    </tbody></table><div class="pagination"><span>${from + 1}–${Math.min(matched.length, from + pageSize)} of ${matched.length}</span><div><button data-action="prev-page" aria-label="Previous page" ${filters.page === 1 ? 'disabled' : ''}>${icon('prev', 14)}</button><span>Page ${filters.page} of ${pages}</span><button data-action="next-page" aria-label="Next page" ${filters.page === pages ? 'disabled' : ''}>${icon('next', 14)}</button></div></div></div>`
    : `<div class="empty">${icon(emptyBookmarks ? 'save' : 'search', 28)}<h3>${emptyBookmarks ? 'No bookmarks yet' : 'No matching problems'}</h3><p>${emptyBookmarks ? 'Bookmark a problem in the library to keep it here.' : 'Try a different search or clear your filters.'}</p>${emptyBookmarks ? '<a class="secondary" href="#/practice">Browse problems</a>' : '<button class="secondary" data-action="clear">Clear filters</button>'}</div>`;
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
function problemPage(p) {
  const guided = route.args.get('study') === '1';
  const sequence = guided ? days.flat().map((s) => bySlug.get(s)) : problems;
  const index = sequence.indexOf(p),
    link = guided ? studyURL : problemURL;
  const back = guided ? '#/plan?block=' + Math.floor(index / 20) : lastLibrary;
  const position = guided
    ? 'Day ' + pad(Math.floor(index / 2) + 1) + ' · ' + ((index % 2) + 1) + '/2'
    : String(index + 1).padStart(3, '0') + ' / 250';
  return `<div class="problem-top"><a class="back-link" href="${esc(back)}">${icon('back', 15)} Back to ${back.startsWith('#/plan') ? 'study plan' : back.startsWith('#/bookmarks') ? 'bookmarks' : 'library'}</a>
    <div class="stepper">${index ? `<a href="${link(sequence[index - 1])}" aria-label="Previous problem">${icon('prev', 14)}</a>` : ''}<span>${position}</span>${index < sequence.length - 1 ? `<a href="${link(sequence[index + 1])}" aria-label="Next problem">${icon('next', 14)}</a>` : ''}</div></div>
    <div class="exercise-heading"><div><div class="exercise-topic">${icon(topicIcons[p.category] || 'nodes', 15)} ${esc(p.category)}</div><h1>${esc(p.name)}</h1></div><div class="exercise-actions">${bookmarkBtn(p)}<button class="secondary ${solved(p) ? 'completed' : ''}" data-action="solve" data-slug="${p.slug}">${icon(solved(p) ? 'check' : 'circle', 15)} ${solved(p) ? 'Solved' : 'Mark solved'}</button></div></div>
    <div class="workbench"><article class="description panel"><div class="panel-head"><h2>${icon('book', 17)} Problem</h2>${difficulty(p.difficulty)}</div><div class="description-body"><p class="prompt">${esc(p.prompt)}</p>
    ${contract(p) ? `<p class="contract">${esc(contract(p))}</p>` : ''}
    <h3>Examples</h3>${p.cases.map((c, i) => `<div class="example"><div class="example-num">Example ${pad(i + 1)}</div><dl><dt>Input</dt><dd>${esc(sampleInput(p, c))}</dd><dt>Expected</dt><dd>${esc(JSON.stringify(c.expected))}</dd></dl></div>`).join('')}
    <div class="references"><h3>References</h3><a href="${esc('https://neetcode.io' + p.neetcode_url)}" target="_blank" rel="noreferrer">NeetCode guide ${icon('external', 14)}</a><a href="${esc(p.leetcode_url)}" target="_blank" rel="noreferrer">LeetCode problem ${icon('external', 14)}</a></div></div></article>
    <section class="editor-panel panel"><div class="panel-head editor-head"><div class="editor-tabs"><button class="${editorTab === 'code' ? 'selected' : ''}" data-action="code-tab">${icon('code', 16)} Code</button><button class="${editorTab === 'notes' ? 'selected' : ''}" data-action="notes-tab">${icon('note', 15)} Notes</button></div><span class="language">${editorTab === 'code' ? 'JavaScript' : 'Plain text'}</span></div>
    ${
      editorTab === 'code'
        ? `<div class="editor-shell"><div class="line-numbers" aria-hidden="true"></div><textarea id="code" aria-label="JavaScript solution" autocapitalize="off" autocomplete="off" spellcheck="false" wrap="off"></textarea></div>
    <div class="editor-controls"><span class="autosave"><i></i> ${storageOK ? 'Saved locally' : 'Session only'}</span><button class="primary run" data-action="run" ${runController ? 'disabled' : ''}>${icon('play', 14)} ${runController ? 'Running…' : 'Run samples'}</button></div><div class="result-box" aria-live="polite"></div>`
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
  const { results, p } = lastResults,
    passed = results.filter((x) => x.passed).length;
  el.innerHTML = `<h3>${icon(passed === results.length ? 'check' : 'terminal', 17)} ${passed} of ${results.length} samples passed</h3>${results.map((r, i) => `<details class="result ${r.passed ? 'pass' : 'fail'}" ${r.passed ? '' : 'open'}><summary>Example ${pad(i + 1)} <span>${r.passed ? 'Passed' : 'Failed'}</span></summary><pre>${r.error ? esc(r.error) : esc('Expected  ' + JSON.stringify(p.cases[i].expected) + '\nReceived  ' + r.actual)}</pre></details>`).join('')}`;
}
function renderContent() {
  const main = document.querySelector('#main');
  const p = bySlug.get(route.slug);
  if (route.view === 'problem' && p) {
    main.innerHTML = problemPage(p);
    const code = document.querySelector('#code'),
      notes = document.querySelector('#notes');
    if (code) {
      code.value = record(p).code ?? starter(p);
      lines();
      code.onscroll = () =>
        (document.querySelector('.line-numbers').scrollTop = code.scrollTop);
    }
    if (notes) notes.value = record(p).notes || '';
    paintResults();
  } else if (route.view === 'plan') main.innerHTML = plan();
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
    (route.slug !== next.slug || route.view !== 'problem');
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
    if (newKey !== routeKey)
      filters = {
        query: '',
        topic: next.topic,
        level: '',
        status: '',
        page: 1
      };
    routeKey = newKey;
  }
  route = next;
  const name =
    route.view === 'problem'
      ? 'Practice room'
      : route.view === 'plan'
        ? 'Study plan'
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
    const results = await testCode(p, code, controller.signal);
    if (!controller.signal.aborted) lastResults = { results, p };
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
  if (name === 'topics') {
    toggleMenu(false);
    openTopics();
  }
  if (name === 'dismiss') dialog.close();
  if (name === 'menu' || name === 'close-menu') toggleMenu(name === 'menu');
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
    renderContent();
    refreshSidebar();
  }
  if (name === 'prev-page' || name === 'next-page') {
    filters.page += name === 'next-page' ? 1 : -1;
    updateRows();
    document.querySelector('.library').scrollIntoView({ block: 'start' });
  }
  if (name === 'clear') {
    if (route.topic) {
      location.hash = '/practice';
      return;
    }
    filters = { query: '', topic: '', level: '', status: '', page: 1 };
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
    filters.page = 1;
    updateRows();
  }
  if (el.id === 'code' || el.id === 'notes') {
    update(route.slug, { [el.id]: el.value });
    if (el.id === 'code') lines();
  }
});
document.addEventListener('change', (e) => {
  const el = e.target;
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
    filters.page = 1;
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
    el.setRangeText('  ', el.selectionStart, el.selectionEnd, 'end');
    el.dispatchEvent(new Event('input', { bubbles: true }));
  }
});
window.addEventListener('storage', (e) => {
  if (!problems || (e.key && !e.key.startsWith(prefix))) return;
  if (e.key) {
    const slug = e.key.slice(prefix.length);
    records.set(slug, loadRecord(slug));
  } else records = new Map(problems.map((p) => [p.slug, loadRecord(p.slug)]));
  if (!['code', 'notes', 'search'].includes(document.activeElement?.id)) {
    renderContent();
    refreshSidebar();
  }
});
try {
  const response = await fetch('./data/catalog.json');
  if (!response.ok) throw Error('Catalog unavailable');
  ({ problems, days } = await response.json());
  topics = [...new Set(problems.map((p) => p.category))];
  bySlug = new Map(problems.map((p) => [p.slug, p]));
  records = new Map(problems.map((p) => [p.slug, loadRecord(p.slug)]));
  window.addEventListener('hashchange', navigate);
  navigate();
} catch (error) {
  app.innerHTML =
    '<main class="empty"><h1>Workspace unavailable</h1><p>Start the local server with <code>npm start</code>, then reload this page.</p></main>';
  console.error(error);
}
