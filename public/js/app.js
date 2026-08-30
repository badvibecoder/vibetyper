// vibetyper — frontend: typing engine, live stats, timer, results, leaderboard.

(function () {
  'use strict';

  // ---- DOM -------------------------------------------------------------
  const els = {
    langSelect: document.getElementById('lang-select'),
    codeTitle: document.getElementById('code-title'),
    codeArea: document.getElementById('code-area'),
    hint: document.getElementById('hint'),
    restartBtn: document.getElementById('restart-btn'),
    statWpm: document.getElementById('stat-wpm'),
    statCpm: document.getElementById('stat-cpm'),
    statLpm: document.getElementById('stat-lpm'),
    statAcc: document.getElementById('stat-acc'),
    statTime: document.getElementById('stat-time'),
    lbBody: document.getElementById('lb-body'),
    lbTotal: document.getElementById('lb-total'),
    resultsModal: document.getElementById('results-modal'),
    resWpm: document.getElementById('res-wpm'),
    resCpm: document.getElementById('res-cpm'),
    resLpm: document.getElementById('res-lpm'),
    resAcc: document.getElementById('res-acc'),
    nameInput: document.getElementById('name-input'),
    saveBtn: document.getElementById('save-btn'),
    saveStatus: document.getElementById('save-status'),
    againBtn: document.getElementById('again-btn'),
    navBtns: Array.from(document.querySelectorAll('.nav__btn')),
    timeBtns: Array.from(document.querySelectorAll('.time-select__btn')),
    views: Array.from(document.querySelectorAll('.view')),
    musicPlayer: document.getElementById('music-player'),
    musicField: document.getElementById('music-field'),
    musicTitle: document.getElementById('music-title'),
    musicToggle: document.getElementById('music-toggle'),
    musicPrev: document.getElementById('music-prev'),
    musicNext: document.getElementById('music-next'),
    musicVolume: document.getElementById('music-volume'),
    soundToggle: document.getElementById('sound-toggle'),
    soundIcon: document.getElementById('sound-icon'),
  };

  // ---- state -----------------------------------------------------------
  const state = {
    lang: 'python',
    duration: 60,
    timeLeft: 60,
    running: false,
    finished: false,
    appending: false,
    startTime: null,
    timerId: null,
    pos: 0,
    correct: 0,
    errors: 0,
    linesDone: 0,
    text: '',
    lastResults: null,
  };

  let currentView = 'test';
  let flat = [];        // every character in state.text (including '\n')
  let lines = [];       // state.text split on '\n'
  let lineStart = [];   // flat index where each line begins
  let charState = [];   // 'pending' | 'correct' | 'incorrect'
  let cells = [];       // DOM cell per flat index
  let cursorIdx = null;
  let languageNames = {};
  let wrapMode = false;       // prose languages soft-wrap instead of one line per \n
  let wrapWidthValue = 80;    // chars per wrapped visual line (prose)

  const TARGET_LEN = 6000;
  const TAB_WIDTH = 4; // number of spaces a single Tab advances (indentation)

  // ---- helpers ---------------------------------------------------------
  async function api(path, opts) {
    const res = await fetch(path, opts);
    if (!res.ok) {
      let msg = res.statusText || 'request failed';
      try {
        const j = await res.json();
        if (j && j.error) msg = j.error;
      } catch (_) {}
      throw new Error(msg);
    }
    return res.json();
  }

  const r1 = (x) => Math.round(x * 10) / 10;
  const escapeHtml = (s) =>
    String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

  function formatDate(iso) {
    const d = new Date(iso);
    const date = d.toLocaleDateString(undefined, { year: 'numeric', month: 'short', day: 'numeric' });
    const time = d.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    return `${date} · ${time}`;
  }

  // ---- test text rendering ---------------------------------------------
  function setText(text) {
    state.text = text;
    flat = text.split('');
    lines = text.split('\n');
    lineStart = [];
    let idx = 0;
    for (const ln of lines) {
      lineStart.push(idx);
      idx += ln.length + 1;
    }
    charState = new Array(flat.length).fill('pending');
    cells = new Array(flat.length).fill(null);
    cursorIdx = null;
    if (wrapMode) wrapWidthValue = measureWrapWidth();
    els.codeArea.innerHTML = '';
    for (let i = 0; i < lines.length; i++) renderLine(i);
    els.codeArea.scrollTop = 0;
    els.codeArea.scrollLeft = 0;
    updateCaret();
  }

  function baseClasses(idx) {
    let c = 'cell';
    if (flat[idx] === '\n') c += ' newline';
    c += ' ' + charState[idx];
    return c;
  }

  function renderLine(i) {
    if (wrapMode) renderProseLine(i);
    else renderCodeLine(i);
  }

  function makeCell(text, className) {
    const cell = document.createElement('span');
    cell.className = className;
    cell.textContent = text;
    return cell;
  }

  function renderCodeLine(i) {
    const line = lines[i];
    const start = lineStart[i];
    const row = document.createElement('div');
    row.className = 'code-line';

    const num = document.createElement('span');
    num.className = 'lineno';
    num.textContent = String(i + 1);
    row.appendChild(num);

    for (let k = 0; k < line.length; k++) {
      const cell = makeCell(flat[start + k], 'cell');
      row.appendChild(cell);
      cells[start + k] = cell;
    }

    if (i < lines.length - 1) {
      const newlineIdx = start + line.length;
      const cell = makeCell('⏎', 'cell newline');
      row.appendChild(cell);
      cells[newlineIdx] = cell;
    }

    els.codeArea.appendChild(row);
  }

  // Prose: paragraphs are soft-wrapped into visual rows. Each wrapped row is a
  // normal flex row (no line numbers), so the user types continuous text and
  // only presses Enter at paragraph boundaries.
  function renderProseLine(i) {
    const line = lines[i];
    const start = lineStart[i];
    const isLast = i === lines.length - 1;

    if (line.length === 0) {
      const row = document.createElement('div');
      row.className = 'code-line code-line--wrap';
      if (!isLast) {
        const cell = makeCell('⏎', 'cell newline');
        row.appendChild(cell);
        cells[start] = cell; // flat[start] is '\n'
      }
      els.codeArea.appendChild(row);
      return;
    }

    const segments = wrapSegment(start, line.length, wrapWidthValue);
    segments.forEach(([s, e], segIdx) => {
      const row = document.createElement('div');
      row.className = 'code-line code-line--wrap';
      for (let idx = s; idx < e; idx++) {
        const cell = makeCell(flat[idx], 'cell');
        row.appendChild(cell);
        cells[idx] = cell;
      }
      if (!isLast && segIdx === segments.length - 1) {
        const newlineIdx = start + line.length;
        const cell = makeCell('⏎', 'cell newline');
        row.appendChild(cell);
        cells[newlineIdx] = cell;
      }
      els.codeArea.appendChild(row);
    });
  }

  function wrapSegment(start, len, width) {
    const segments = [];
    let cur = start;
    const limit = start + len;
    while (cur < limit) {
      let end = Math.min(cur + width, limit);
      if (end < limit) {
        for (let j = end - 1; j >= cur; j--) {
          if (flat[j] === ' ') {
            end = j + 1; // break right after a space (word boundary)
            break;
          }
        }
      }
      segments.push([cur, end]);
      cur = end;
    }
    return segments;
  }

  function measureWrapWidth() {
    const cs = getComputedStyle(els.codeArea);
    const probe = document.createElement('span');
    probe.textContent = '0';
    probe.style.cssText =
      'position:absolute;visibility:hidden;white-space:pre;font-family:' + cs.fontFamily +
      ';font-size:' + cs.fontSize + ';font-weight:' + cs.fontWeight;
    document.body.appendChild(probe);
    const charW = probe.getBoundingClientRect().width || 9;
    document.body.removeChild(probe);
    const avail = Math.max(120, els.codeArea.clientWidth - 56);
    return Math.max(24, Math.floor(avail / charW) - 1);
  }

  function refreshCell(idx) {
    const cell = cells[idx];
    if (!cell) return;
    cell.className = baseClasses(idx) + (idx === cursorIdx ? ' cursor' : '');
  }

  function updateCaret() {
    const prev = cursorIdx;
    cursorIdx = state.pos;
    if (prev !== null && prev < cells.length && cells[prev]) refreshCell(prev);
    if (cursorIdx < cells.length && cells[cursorIdx]) {
      refreshCell(cursorIdx);
      scrollToCell(cells[cursorIdx]);
    }
  }

  function scrollToCell(cell) {
    const area = els.codeArea;
    const areaRect = area.getBoundingClientRect();
    const cellRect = cell.getBoundingClientRect();

    // Vertical: keep the current line roughly centered.
    const relTop = cellRect.top - areaRect.top + area.scrollTop;
    const vMargin = 46;
    if (relTop < area.scrollTop + vMargin || relTop > area.scrollTop + area.clientHeight - vMargin) {
      area.scrollTop = relTop - area.clientHeight / 2;
    }

    // Horizontal: follow the caret on long lines, then snap back to the left
    // when the line ends and the caret returns to the start of the next line.
    const relLeft = cellRect.left - areaRect.left + area.scrollLeft;
    const hMargin = 72; // keep this much look-ahead to the right of the caret
    if (relLeft < area.scrollLeft + 2) {
      area.scrollLeft = 0;
    } else if (relLeft > area.scrollLeft + area.clientWidth - hMargin) {
      area.scrollLeft = relLeft - area.clientWidth + hMargin;
    }
  }

  function triggerShake(cell) {
    if (!cell) return;
    cell.classList.remove('shake');
    void cell.offsetWidth;
    cell.classList.add('shake');
  }

  function appendMore() {
    if (state.appending) return;
    state.appending = true;
    api(`/api/test?lang=${state.lang}&len=${TARGET_LEN}`)
      .then((res) => {
        const oldLineCount = lines.length;
        state.text = state.text + '\n\n' + res.text;
        // rebuild arrays, preserving existing char state (old text is a prefix)
        const oldChar = charState;
        flat = state.text.split('');
        lines = state.text.split('\n');
        lineStart = [];
        let idx = 0;
        for (const ln of lines) {
          lineStart.push(idx);
          idx += ln.length + 1;
        }
        charState = new Array(flat.length).fill('pending');
        for (let i = 0; i < oldChar.length; i++) charState[i] = oldChar[i];
        for (let i = oldLineCount; i < lines.length; i++) renderLine(i);
        updateCaret();
      })
      .catch(() => {})
      .finally(() => {
        state.appending = false;
      });
  }

  // ---- scoring ---------------------------------------------------------
  function computeResults(elapsedMin) {
    const total = state.correct + state.errors;
    return {
      wpm: Math.round(state.pos / 5 / elapsedMin),
      cpm: Math.round(state.pos / elapsedMin),
      lpm: r1(state.linesDone / elapsedMin),
      accuracy: r1(total ? (state.correct / total) * 100 : 100),
    };
  }

  function updateStats() {
    if (!state.running) {
      els.statWpm.textContent = '0';
      els.statCpm.textContent = '0';
      els.statLpm.textContent = '0.0';
      els.statAcc.textContent = '100%';
      return;
    }
    const elapsedMin = Math.max((Date.now() - state.startTime) / 60000, 0.01);
    const r = computeResults(elapsedMin);
    els.statWpm.textContent = r.wpm;
    els.statCpm.textContent = r.cpm;
    els.statLpm.textContent = r.lpm;
    els.statAcc.textContent = r.accuracy + '%';
  }

  // ---- timer / lifecycle ----------------------------------------------
  function start() {
    if (state.running || state.finished) return;
    state.running = true;
    state.startTime = Date.now();
    setHint('');
    // Auto-start the background music on the first keystroke if the user
    // hasn't started it manually yet (same gesture-driven behavior as the keys).
    if (!musicAutoStarted && musicTracks.length && audio.paused) playMusic();
    state.timerId = setInterval(() => {
      const remain = (state.duration * 1000 - (Date.now() - state.startTime)) / 1000;
      els.statTime.textContent = Math.max(0, Math.ceil(remain));
      if (remain <= 0) finish();
      updateStats();
    }, 100);
  }

  function finish() {
    if (state.finished) return;
    state.finished = true;
    state.running = false;
    clearInterval(state.timerId);
    const elapsedMin = Math.max((Date.now() - state.startTime) / 60000, 0.01);
    state.lastResults = computeResults(elapsedMin);
    showResults(state.lastResults);
    setHint('test complete — press <kbd>Ctrl</kbd>+<kbd>R</kbd> to go again');
  }

  function restart() {
    clearInterval(state.timerId);
    state.running = false;
    state.finished = false;
    state.pos = 0;
    state.correct = 0;
    state.errors = 0;
    state.linesDone = 0;
    state.timeLeft = state.duration;
    state.lastResults = null;
    els.statTime.textContent = state.duration;
    closeModal();
    setHint('start typing to begin — <kbd>Tab</kbd>/<kbd>space</kbd> indent · <kbd>Ctrl</kbd>+<kbd>R</kbd> restart');
    updateStats();
    els.codeArea.focus();
    loadTest();
  }

  async function loadTest() {
    try {
      const res = await api(`/api/test?lang=${state.lang}&len=${TARGET_LEN}`);
      wrapMode = !!(res.language && res.language.wrap);
      setText(res.text);
      els.codeTitle.textContent = languageNames[state.lang] || state.lang;
    } catch (err) {
      setHint('failed to load test: ' + err.message);
    }
  }

  function setHint(html) {
    if (html === '') {
      els.hint.style.visibility = 'hidden';
    } else {
      els.hint.style.visibility = 'visible';
      els.hint.innerHTML = html;
    }
  }

  // ---- results modal ---------------------------------------------------
  function showResults(r) {
    els.resWpm.textContent = r.wpm;
    els.resCpm.textContent = r.cpm;
    els.resLpm.textContent = r.lpm;
    els.resAcc.textContent = r.accuracy + '%';
    els.saveStatus.textContent = '';
    els.saveStatus.className = 'save-status';
    els.saveBtn.disabled = false;
    els.saveBtn.style.display = '';
    els.nameInput.value = localStorage.getItem('vibetyper.name') || '';
    els.resultsModal.classList.remove('is-hidden');
  }

  function closeModal() {
    els.resultsModal.classList.add('is-hidden');
  }

  async function saveScore() {
    if (!state.lastResults) return;
    const name = els.nameInput.value.trim() || 'anonymous';
    localStorage.setItem('vibetyper.name', name);
    els.saveBtn.disabled = true;
    try {
      const r = await api('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, language: state.lang, ...state.lastResults }),
      });
      els.saveStatus.textContent = `saved! you rank #${r.rank} of ${r.total}`;
      els.saveStatus.className = 'save-status';
      els.saveBtn.style.display = 'none';
    } catch (err) {
      els.saveStatus.textContent = 'failed to save: ' + err.message;
      els.saveStatus.className = 'save-status error';
      els.saveBtn.disabled = false;
    }
  }

  // ---- leaderboard -----------------------------------------------------
  async function loadLeaderboard() {
    try {
      const res = await api('/api/leaderboard');
      const n = res.total;
      els.lbTotal.textContent = `${n} score${n === 1 ? '' : 's'}`;
      els.lbBody.innerHTML = '';
      if (!res.entries.length) {
        const tr = document.createElement('tr');
        tr.innerHTML = '<td colspan="8" class="empty">no scores yet — be the first to set the record</td>';
        els.lbBody.appendChild(tr);
        return;
      }
      res.entries.forEach((e, i) => {
        const tr = document.createElement('tr');
        const rank = i + 1;
        tr.innerHTML =
          `<td class="rank${rank <= 3 ? ' top' : ''}">${rank}</td>` +
          `<td class="cell-name">${escapeHtml(e.name)}</td>` +
          `<td class="cell-lang">${escapeHtml(e.language)}</td>` +
          `<td class="num cell-wpm">${e.wpm}</td>` +
          `<td class="num cell-cpm">${e.cpm}</td>` +
          `<td class="num cell-lpm">${e.lpm}</td>` +
          `<td class="num cell-acc">${e.accuracy}%</td>` +
          `<td class="cell-date">${formatDate(e.date)}</td>`;
        els.lbBody.appendChild(tr);
      });
    } catch (err) {
      els.lbBody.innerHTML = `<tr><td colspan="8" class="empty">failed to load leaderboard: ${escapeHtml(err.message)}</td></tr>`;
    }
  }

  // ---- music ------------------------------------------------------------
  const audio = new Audio();
  let musicTracks = [];
  let musicIndex = -1;
  let musicHistory = [];        // indices already played, for "previous"
  let musicAutoStarted = false; // once music has played, stop auto-starting

  async function loadMusic() {
    try {
      const res = await api('/api/music');
      musicTracks = res.tracks || [];
      if (!musicTracks.length) {
        els.musicField.classList.add('is-hidden');
        return;
      }
      els.musicField.classList.remove('is-hidden');
      musicIndex = (Math.random() * musicTracks.length) | 0;
      const savedVol = localStorage.getItem('vibetyper.volume');
      audio.volume = savedVol === null ? 0.75 : clampVolume(Number(savedVol));
      els.musicVolume.value = String(audio.volume);
      audio.src = musicTracks[musicIndex].url;
      updateMusicUI();
    } catch (_) {
      els.musicField.classList.add('is-hidden');
    }
  }

  function clampVolume(v) {
    if (!Number.isFinite(v)) return 0.75;
    return Math.min(1, Math.max(0, v));
  }

  function updateMusicUI() {
    if (!musicTracks.length) return;
    els.musicTitle.textContent = musicTracks[musicIndex].name;
    els.musicToggle.textContent = audio.paused ? '▶' : '⏸';
    els.musicPlayer.classList.toggle('is-playing', !audio.paused);
  }

  function playMusic() {
    audio.play().catch(() => {});
  }

  function loadTrack() {
    audio.src = musicTracks[musicIndex].url;
    playMusic();
    updateMusicUI();
  }

  function toggleMusic() {
    if (audio.paused) playMusic();
    else audio.pause();
    updateMusicUI();
  }

  function nextTrack() {
    if (!musicTracks.length) return;
    musicHistory.push(musicIndex);
    if (musicTracks.length === 1) {
      musicIndex = 0;
    } else {
      let next;
      do { next = (Math.random() * musicTracks.length) | 0; } while (next === musicIndex);
      musicIndex = next;
    }
    loadTrack();
  }

  function prevTrack() {
    if (!musicTracks.length) return;
    musicIndex = musicHistory.length
      ? musicHistory.pop()
      : (musicIndex - 1 + musicTracks.length) % musicTracks.length;
    loadTrack();
  }

  // ---- views -----------------------------------------------------------
  function switchView(view) {
    currentView = view;
    els.navBtns.forEach((b) => b.classList.toggle('is-active', b.dataset.view === view));
    els.views.forEach((v) => v.classList.toggle('is-active', v.id === 'view-' + view));
    if (view !== 'test') {
      closeModal();
      if (state.running) restart();
      loadLeaderboard();
    } else {
      els.codeArea.focus();
    }
  }

  // Set a position's state while keeping the running correct/incorrect
  // counts in sync. `state.correct`/`state.errors` are counts of the CURRENT
  // (final) text, so fixing a mistake restores accuracy — it only costs time.
  function setCharState(idx, next) {
    const prev = charState[idx];
    if (prev === next) return;
    if (prev === 'correct') state.correct -= 1;
    else if (prev === 'incorrect') state.errors -= 1;
    if (next === 'correct') state.correct += 1;
    else if (next === 'incorrect') state.errors += 1;
    charState[idx] = next;
  }

  // Advance through up to TAB_WIDTH leading spaces — Tab acts as indentation,
  // while Space still types a single space at a time.
  function typeIndent() {
    if (state.pos >= flat.length) return;
    let n = 0;
    while (n < TAB_WIDTH && state.pos + n < flat.length && flat[state.pos + n] === ' ') n++;
    if (n === 0) return;
    playThock();
    if (!state.running) start();
    for (let i = 0; i < n; i++) {
      setCharState(state.pos, 'correct');
      state.pos += 1;
    }
    updateCaret();
    if (state.pos >= flat.length) appendMore();
    updateStats();
  }

  // ---- keyboard sound ---------------------------------------------------
  let audioCtx = null;
  let keySoundBuffer = null;   // decoded sound.ogg
  let keySlices = [];          // [{ start, dur }] in seconds
  let soundOn = localStorage.getItem('vibetyper.sound') !== 'off';

  function ensureAudio() {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    if (!audioCtx) audioCtx = new AC();
    if (audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  // Load the sound pack: config.json maps key ids to [start_ms, duration_ms]
  // slices inside sound.ogg — each slice is one recorded key press.
  async function loadKeySound() {
    try {
      const cfg = await (await fetch('/thock/config.json')).json();
      const src = cfg.sound || 'sound.ogg';
      const defines = cfg.defines || {};
      keySlices = Object.values(defines)
        .filter((d) => Array.isArray(d) && d.length >= 2 && d[1] > 0)
        .map((d) => ({ start: d[0] / 1000, dur: d[1] / 1000 }));
      if (!keySlices.length) return;

      const ctx = ensureAudio();
      if (!ctx) return;
      const res = await fetch('/thock/' + src);
      const arrayBuf = await res.arrayBuffer();
      keySoundBuffer = await ctx.decodeAudioData(arrayBuf);
    } catch (err) {
      keySoundBuffer = null;
      keySlices = [];
    }
  }

  // Play one real recorded key press (a random slice from the sound pack).
  function playThock() {
    if (!soundOn) return;
    const ctx = ensureAudio();
    if (!ctx || !keySoundBuffer || !keySlices.length) return;
    const slice = keySlices[(Math.random() * keySlices.length) | 0];
    const src = ctx.createBufferSource();
    src.buffer = keySoundBuffer;
    const gain = ctx.createGain();
    gain.gain.value = 0.75;
    src.connect(gain).connect(ctx.destination);
    src.start(0, slice.start, slice.dur + 0.02);
  }

  function updateSoundIcon() {
    els.soundIcon.textContent = soundOn ? '🔊' : '🔇';
    els.soundToggle.classList.toggle('is-muted', !soundOn);
    els.soundToggle.title = soundOn ? 'Keyboard sound on' : 'Keyboard sound off';
  }

  // ---- keyboard --------------------------------------------------------
  function onKeyDown(e) {
    const target = e.target;
    if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) return;
    if (currentView !== 'test') return;

    if ((e.ctrlKey || e.metaKey) && !e.altKey && (e.key === 'r' || e.key === 'R')) {
      e.preventDefault();
      restart();
      return;
    }
    if (e.key === 'Escape') {
      if (state.running && !state.finished) restart();
      return;
    }
    if (e.ctrlKey || e.metaKey || e.altKey) return;
    if (state.finished) return;

    if (e.key === 'Tab') {
      e.preventDefault();
      typeIndent();
      return;
    }

    if (e.key === 'Backspace') {
      e.preventDefault();
      if (!state.running || state.pos === 0) return;
      playThock();
      state.pos -= 1;
      setCharState(state.pos, 'pending');
      updateCaret();
      updateStats();
      return;
    }

    let keyChar = null;
    if (e.key === 'Enter') keyChar = '\n';
    else if (e.key.length === 1) keyChar = e.key;
    if (keyChar === null) return;

    e.preventDefault();
    if (!state.running) start();
    playThock();

    if (state.pos >= flat.length) {
      appendMore();
      return;
    }

    const idx = state.pos;
    const isCorrect = keyChar === flat[idx];
    if (isCorrect) {
      setCharState(idx, 'correct');
      if (flat[idx] === '\n') state.linesDone += 1;
    } else {
      setCharState(idx, 'incorrect');
    }
    state.pos += 1;
    updateCaret();
    if (!isCorrect) triggerShake(cells[idx]);
    if (state.pos >= flat.length) appendMore();
    updateStats();
  }

  // ---- init ------------------------------------------------------------
  async function loadLanguages() {
    try {
      const res = await api('/api/languages');
      const sel = els.langSelect;
      sel.innerHTML = '';
      languageNames = {};
      for (const l of res.languages) {
        languageNames[l.id] = l.name;
        const opt = document.createElement('option');
        opt.value = l.id;
        opt.textContent = `${l.name} (${l.blockCount})`;
        sel.appendChild(opt);
      }
      if (res.languages.length) {
        const preferred = res.languages.some((l) => l.id === 'python') ? 'python' : res.languages[0].id;
        state.lang = preferred;
        sel.value = preferred;
      }
      restart();
    } catch (err) {
      setHint('failed to load languages: ' + err.message);
    }
  }

  function bindEvents() {
    els.navBtns.forEach((b) => b.addEventListener('click', () => switchView(b.dataset.view)));

    els.langSelect.addEventListener('change', () => {
      state.lang = els.langSelect.value;
      restart();
    });

    els.timeBtns.forEach((b) => {
      b.addEventListener('click', () => {
        els.timeBtns.forEach((x) => x.classList.toggle('is-active', x === b));
        state.duration = Number(b.dataset.time);
        els.statTime.textContent = state.duration;
        restart();
      });
    });

    els.restartBtn.addEventListener('click', restart);
    els.againBtn.addEventListener('click', restart);
    els.saveBtn.addEventListener('click', saveScore);

    els.codeArea.addEventListener('click', () => els.codeArea.focus());

    // Keep buttons from stealing the Enter/Space keystrokes after a click.
    document.addEventListener('click', (e) => {
      const el = e.target instanceof Element ? e.target : null;
      const btn = el && el.closest('button');
      if (btn) btn.blur();
    });

    document.addEventListener('keydown', onKeyDown);

    // music player
    els.musicToggle.addEventListener('click', toggleMusic);
    els.musicNext.addEventListener('click', nextTrack);
    els.musicPrev.addEventListener('click', prevTrack);
    els.musicVolume.addEventListener('input', () => {
      audio.volume = clampVolume(Number(els.musicVolume.value));
      localStorage.setItem('vibetyper.volume', String(audio.volume));
    });
    els.musicVolume.addEventListener('change', () => els.musicVolume.blur());
    audio.addEventListener('ended', nextTrack);
    audio.addEventListener('play', () => { musicAutoStarted = true; updateMusicUI(); });
    audio.addEventListener('pause', updateMusicUI);

    // keyboard sound toggle
    els.soundToggle.addEventListener('click', () => {
      soundOn = !soundOn;
      localStorage.setItem('vibetyper.sound', soundOn ? 'on' : 'off');
      updateSoundIcon();
    });

    // Re-wrap prose once webfonts finish loading (mono char width changes).
    if (document.fonts && document.fonts.ready) {
      document.fonts.ready.then(() => {
        if (wrapMode && !state.running && !state.finished && state.text) setText(state.text);
      });
    }
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindEvents();
    els.statTime.textContent = state.duration;
    loadLanguages();
    loadMusic();
    loadKeySound();
    updateSoundIcon();
  });
})();
