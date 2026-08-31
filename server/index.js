// vibetyper — server entrypoint
// Dependency-free (Node built-ins only): serves the static frontend plus a
// small JSON API:
//   GET  /api/health
//   GET  /api/languages        -> available languages + block counts
//   GET  /api/test?lang=&len=  -> randomized congruent blocks joined as text
//   GET  /api/leaderboard      -> all scores, ranked
//   POST /api/scores           -> submit a score
//   GET  /api/reload           -> re-read the dictionary tree (no restart needed)

import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { randomUUID } from 'node:crypto';
import { loadDictionary } from './dictionaryLoader.js';
import { createLeaderboard } from './leaderboard.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const DICT_ROOT = path.join(ROOT, 'dictionary');
const DATA_DIR = path.join(ROOT, 'data');
const PUBLIC_DIR = path.join(ROOT, 'public');
const LEADERBOARD_FILE = path.join(DATA_DIR, 'leaderboard.json');
const MUSIC_DIR = path.join(ROOT, 'music');
const THOCK_DIR = path.join(ROOT, 'thock');

const PORT = Number(process.env.PORT) || 8080;

// --- fair-play / verification constants ---------------------------------
const TAB_WIDTH = 4;                    // must match public/js/app.js
const SMASH_WINDOW_MS = 8000;           // rolling window for smash detection
const SMASH_MIN_KEYS = 25;              // window must contain this many keys
const SMASH_MAX_ERROR_RATE = 0.3;       // > 30% errors in the window rejects
const MAX_LOG_LENGTH = 20000;           // hard cap on submitted keystroke logs
const MAX_AVG_KEYS_PER_SEC = 20;        // sustained rate ceiling (humanly impossible above)
const VALID_DURATIONS = new Set([15, 30, 60, 120]);

// Test sessions: cache the exact text chunks each client was served so a
// submitted keystroke log can be replayed and verified server-side. Tokens are
// short-lived (a test lasts at most 120s) and pruned aggressively.
const sessions = new Map();
const SESSION_TTL_MS = 15 * 60 * 1000;
const MAX_SESSIONS = 200;

function createSession(lang, chunk, words) {
  pruneSessions();
  const token = randomUUID();
  sessions.set(token, { lang, chunks: [chunk], words: !!words, createdAt: Date.now() });
  return token;
}

function getSession(token, lang) {
  const s = sessions.get(token);
  if (!s || s.lang !== lang) return null;
  return s;
}

function pruneSessions() {
  const now = Date.now();
  for (const [token, s] of sessions) {
    if (now - s.createdAt > SESSION_TTL_MS) sessions.delete(token);
  }
  if (sessions.size > MAX_SESSIONS) {
    const oldest = [...sessions.entries()]
      .sort((a, b) => a[1].createdAt - b[1].createdAt)
      .slice(0, sessions.size - MAX_SESSIONS);
    for (const [token] of oldest) sessions.delete(token);
  }
}

class ApiError extends Error {
  constructor(message, status = 400) {
    super(message);
    this.status = status;
  }
}

// --- dictionary state (reloadable) --------------------------------------
let dict = { languages: [], errors: [] };
function reload() {
  const loaded = loadDictionary(DICT_ROOT);
  dict = loaded;
  console.log(
    `[dictionary] loaded ${loaded.languages.length} language(s): ` +
      loaded.languages.map((l) => `${l.id}(${l.blockCount} blocks)`).join(', '),
  );
  for (const err of loaded.errors) console.warn(`[dictionary] ${err}`);
  return loaded;
}
reload();

// Watch the dictionary tree so users can just drop new files in and refresh.
try {
  const watcher = fs.watch(DICT_ROOT, { recursive: true }, debounce(reload, 600));
  watcher.on('error', () => {});
} catch {
  // recursive watch unsupported on some platforms — manual /api/reload still works.
}

const leaderboard = createLeaderboard(LEADERBOARD_FILE);

// --- server -------------------------------------------------------------
const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const route = url.pathname;
  const method = req.method || 'GET';

  try {
    if (route.startsWith('/api/')) {
      handleApi(req, res, url, method, route);
      return;
    }
    if (route.startsWith('/music/')) {
      serveMusic(req, res, url.pathname);
      return;
    }
    if (route.startsWith('/thock/')) {
      serveThock(res, route);
      return;
    }
    serveStatic(res, url.pathname);
  } catch (err) {
    sendJson(res, 500, { error: 'internal error', detail: String(err && err.message) });
  }
});

server.listen(PORT, () => {
  console.log(`\n  ⚡ vibetyper running at http://localhost:${PORT}\n`);
});

// --- API routing --------------------------------------------------------
function handleApi(req, res, url, method, route) {
  if (method === 'GET' && route === '/api/health') return sendJson(res, 200, { ok: true });

  if (method === 'GET' && route === '/api/music') {
    return sendJson(res, 200, { tracks: listMusic() });
  }

  if (method === 'GET' && route === '/api/languages') {
    return sendJson(res, 200, {
      languages: dict.languages.map((l) => ({
        id: l.id,
        name: l.name,
        ext: l.ext,
        comment: l.comment,
        wrap: l.wrap,
        blockCount: l.blockCount,
        files: l.files,
      })),
    });
  }

  if (method === 'GET' && route === '/api/reload') {
    return sendJson(res, 200, { ok: true, ...reload() });
  }

  if (method === 'GET' && route === '/api/test') {
    const langId = String(url.searchParams.get('lang') || 'python');
    const language = dict.languages.find((l) => l.id === langId);
    if (!language) return sendJson(res, 404, { error: `unknown language: ${langId}` });

    const targetLen = clampInt(url.searchParams.get('len'), 400, 8000, 1500);
    const token = url.searchParams.get('token');
    const session = token ? getSession(token, langId) : null;
    if (token && !session) {
      return sendJson(res, 404, { error: 'test session expired or not found — restart the test' });
    }

    const { text, blockCount, charCount } = assembleTest(language, targetLen);
    let sessionToken = token;
    if (session) {
      session.chunks.push(text); // append: client joins chunks itself (see app.js)
    } else {
      sessionToken = createSession(langId, text, !!language.words); // initial fetch: new session
    }
    return sendJson(res, 200, {
      language: { id: language.id, name: language.name, ext: language.ext, wrap: language.wrap, words: !!language.words },
      text,
      blockCount,
      charCount,
      token: sessionToken,
    });
  }

  if (method === 'GET' && route === '/api/leaderboard') {
    const limit = clampInt(url.searchParams.get('limit'), 1, 10000, 0) || null;
    return sendJson(res, 200, {
      entries: leaderboard.ranked(limit),
      total: leaderboard.ranked().length, // unique (name, language) entries
    });
  }

  if (method === 'POST' && route === '/api/scores') {
    readJsonBody(req).then((body) => {
      try {
        const result = submitScore(body);
        sendJson(res, 201, result);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        sendJson(res, err instanceof ApiError ? err.status : 400, { error: msg });
      }
    });
    return;
  }

  sendJson(res, 404, { error: 'not found' });
}

// Verify a score by replaying the client's keystroke log against the exact
// text it was served, then compute the metrics server-side. The client no
// longer gets to pick its own numbers — the leaderboard only contains scores
// that survive replay + the anti-smash window check.
function submitScore(body) {
  const language = String((body && body.language) || '').toLowerCase();
  if (!dict.languages.some((l) => l.id === language)) {
    throw new ApiError(`unknown language: ${language || '(none)'}`);
  }

  const token = String((body && body.token) || '');
  const session = getSession(token, language);
  if (!session) {
    throw new ApiError('test session not found or expired — please take the test again', 404);
  }

  const duration = Number(body.duration);
  if (!VALID_DURATIONS.has(duration)) {
    throw new ApiError('invalid test duration');
  }

  const log = body.log;
  if (!Array.isArray(log) || log.length === 0 || log.length > MAX_LOG_LENGTH) {
    throw new ApiError('invalid keystroke log');
  }

  const metrics = verifyAndCompute(session, log, duration);

  return leaderboard.add({ name: body.name, language, ...metrics });
}

// Replays `log` against the session's full text (chunks joined exactly as the
// client joins them: '\n\n') and returns server-computed metrics. Throws
// ApiError(422) when the run fails the anti-smash / plausibility checks.
function verifyAndCompute(session, log, duration) {
  // Word mode is one continuous stream (join with single spaces); everything
  // else keeps the block/paragraph break the client uses.
  const text = session.chunks.join(session.words ? ' ' : '\n\n');
  const flat = text.split('');
  const n = flat.length;
  // 0 = pending, 1 = correct, 2 = incorrect (same semantics as app.js)
  const charState = new Array(n).fill(0);
  const events = []; // { t, ok } — typing keys only (no backspaces)
  let pos = 0;
  let prevT = -1;
  let typingKeys = 0;
  const maxT = duration * 1000 + 5000; // allow a little slack after the timer

  for (const raw of log) {
    if (!raw || typeof raw !== 'object') throw new ApiError('invalid keystroke log entry');
    const t = Number(raw.t);
    const k = raw.k;
    if (!Number.isFinite(t) || t < 0 || t > maxT) throw new ApiError('invalid keystroke timestamp');
    if (t < prevT) throw new ApiError('keystroke timestamps out of order');
    prevT = t;
    if (typeof k !== 'string' || k.length !== 1) throw new ApiError('invalid keystroke key');

    if (k === '\b') {
      if (pos > 0) {
        pos -= 1;
        charState[pos] = 0;
      }
      continue;
    }

    if (k === '\t') {
      let adv = 0;
      while (adv < TAB_WIDTH && pos + adv < n && flat[pos + adv] === ' ') adv++;
      if (adv > 0) {
        for (let i = 0; i < adv; i++) charState[pos + i] = 1;
        pos += adv;
        events.push({ t, ok: true });
        typingKeys++;
      }
      continue;
    }

    // Printable (including '\n'). Keys past the served text were never
    // counted by the client either, so drop them — they can't inflate a score.
    if (pos >= n) continue;
    const ok = k === flat[pos];
    charState[pos] = ok ? 1 : 2;
    pos += 1;
    events.push({ t, ok });
    typingKeys++;
  }

  // Ceiling sanity: sustained average key rate must be humanly plausible.
  if (typingKeys / duration > MAX_AVG_KEYS_PER_SEC) {
    throw new ApiError('keystroke rate too fast — score not accepted', 422);
  }

  // Anti-smash: any rolling 8-second window with >= 25 typing keys and more
  // than 30% errors rejects the score. Events are time-sorted, so a sliding
  // window ending at each key covers every possible 8s span.
  let left = 0;
  for (let i = 0; i < events.length; i++) {
    while (events[i].t - events[left].t > SMASH_WINDOW_MS) left++;
    const winLen = i - left + 1;
    if (winLen < SMASH_MIN_KEYS) continue;
    let errs = 0;
    for (let j = left; j <= i; j++) if (!events[j].ok) errs++;
    if (errs / winLen > SMASH_MAX_ERROR_RATE) {
      // Deliberately vague: publishing the exact detection parameters would
      // let someone calibrate their smashing to stay just under the limit.
      throw new ApiError('score rejected: run flagged as button-smashing (too many errors in a short span)', 422);
    }
  }

  let correct = 0;
  let incorrect = 0;
  let linesDone = 0;
  for (let i = 0; i < n; i++) {
    if (charState[i] === 1) {
      correct++;
      if (flat[i] === '\n') linesDone++;
    } else if (charState[i] === 2) {
      incorrect++;
    }
  }

  const elapsedMin = duration / 60;
  const wpm = Math.round(correct / 5 / elapsedMin);
  const cpm = Math.round(correct / elapsedMin);
  const lpm = round1(linesDone / elapsedMin);
  const accuracy = round1(correct + incorrect ? (correct / (correct + incorrect)) * 100 : 100);
  return { wpm, cpm, lpm, accuracy };
}

function round1(x) {
  return Math.round(x * 10) / 10;
}

// Serve the "thock" sound-pack directory (config.json + audio files).
function serveThock(res, pathname) {
  const rel = decodeURIComponent(pathname).replace(/^\/thock\//, '');
  if (!rel || rel.includes('/') || rel.includes('..')) return sendJson(res, 403, { error: 'forbidden' });
  const filePath = path.join(THOCK_DIR, rel);
  const ext = path.extname(filePath).toLowerCase();
  const type = ext === '.ogg' ? 'audio/ogg'
    : ext === '.json' ? 'application/json; charset=utf-8'
    : ext === '.wav' ? 'audio/wav'
    : ext === '.mp3' ? 'audio/mpeg'
    : ext === '.flac' ? 'audio/flac'
    : ext === '.m4a' ? 'audio/mp4'
    : 'application/octet-stream';
  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') return sendJson(res, 404, { error: 'not found' });
      return sendJson(res, 500, { error: 'read error' });
    }
    res.writeHead(200, { 'Content-Type': type, 'Cache-Control': 'no-cache' });
    res.end(data);
  });
}

// --- music --------------------------------------------------------------
const AUDIO_EXT = new Set(['.mp3', '.wav', '.ogg', '.oga', '.m4a', '.flac', '.aac', '.opus', '.webm', '.mid']);
const AUDIO_MIME = {
  '.mp3': 'audio/mpeg',
  '.wav': 'audio/wav',
  '.ogg': 'audio/ogg',
  '.oga': 'audio/ogg',
  '.m4a': 'audio/mp4',
  '.flac': 'audio/flac',
  '.aac': 'audio/aac',
  '.opus': 'audio/ogg',
  '.webm': 'audio/webm',
  '.mid': 'audio/midi',
};

function listMusic() {
  if (!fs.existsSync(MUSIC_DIR)) return [];
  return fs.readdirSync(MUSIC_DIR)
    .filter((f) => AUDIO_EXT.has(path.extname(f).toLowerCase()))
    .sort((a, b) => a.localeCompare(b, undefined, { numeric: true }))
    .map((file) => ({
      file,
      name: prettifyTrackName(file),
      url: '/music/' + encodeURIComponent(file),
    }));
}

function prettifyTrackName(file) {
  let base = path.basename(file, path.extname(file));
  base = base.replace(/^\d+[-_.]+/, ''); // strip a leading ordering prefix like "01-"
  base = base.replace(/[-_]+/g, ' ');
  return base.replace(/\b\w/g, (c) => c.toUpperCase());
}

function serveMusic(req, res, pathname) {
  const rel = decodeURIComponent(pathname).replace(/^\/music\//, '');
  if (!rel || rel.includes('..') || rel.includes('/')) return sendJson(res, 403, { error: 'forbidden' });
  const filePath = path.join(MUSIC_DIR, rel);
  const ext = path.extname(filePath).toLowerCase();
  if (!AUDIO_EXT.has(ext)) return sendJson(res, 403, { error: 'forbidden' });

  fs.stat(filePath, (err, stat) => {
    if (err) {
      if (err.code === 'ENOENT') return sendJson(res, 404, { error: 'not found' });
      return sendJson(res, 500, { error: 'read error' });
    }
    const total = stat.size;
    const type = AUDIO_MIME[ext] || 'application/octet-stream';
    const range = req.headers.range;

    if (range) {
      const m = /bytes=(\d*)-(\d*)/.exec(range);
      let start = m && m[1] !== '' ? parseInt(m[1], 10) : 0;
      let end = m && m[2] !== '' ? parseInt(m[2], 10) : total - 1;
      if (Number.isNaN(start) || start < 0) start = 0;
      if (Number.isNaN(end) || end >= total) end = total - 1;
      if (start > end || start >= total) {
        res.writeHead(416, { 'Content-Range': `bytes */${total}` });
        return res.end();
      }
      res.writeHead(206, {
        'Content-Type': type,
        'Content-Range': `bytes ${start}-${end}/${total}`,
        'Content-Length': end - start + 1,
        'Accept-Ranges': 'bytes',
        'Cache-Control': 'no-cache',
      });
      const stream = fs.createReadStream(filePath, { start, end });
      stream.pipe(res);
      stream.on('error', () => res.end());
      return;
    }

    res.writeHead(200, {
      'Content-Type': type,
      'Content-Length': total,
      'Accept-Ranges': 'bytes',
      'Cache-Control': 'no-cache',
    });
    fs.createReadStream(filePath).pipe(res);
  });
}

// --- static serving -----------------------------------------------------
const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.woff': 'font/woff',
  '.ttf': 'font/ttf',
  '.txt': 'text/plain; charset=utf-8',
};

function serveStatic(res, pathname) {
  let rel = pathname === '/' ? '/index.html' : decodeURIComponent(pathname);
  const filePath = path.join(PUBLIC_DIR, path.normalize(rel));
  if (!filePath.startsWith(PUBLIC_DIR + path.sep) && filePath !== path.join(PUBLIC_DIR, 'index.html')) {
    return sendJson(res, 403, { error: 'forbidden' });
  }

  fs.readFile(filePath, (err, data) => {
    if (err) {
      if (err.code === 'ENOENT') return sendJson(res, 404, { error: 'not found' });
      return sendJson(res, 500, { error: 'read error' });
    }
    const ext = path.extname(filePath).toLowerCase();
    res.writeHead(200, {
      'Content-Type': MIME[ext] || 'application/octet-stream',
      'Cache-Control': 'no-cache',
    });
    res.end(data);
  });
}

// --- helpers ------------------------------------------------------------
function sendJson(res, status, obj) {
  const body = JSON.stringify(obj);
  res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' });
  res.end(body);
}

function readJsonBody(req) {
  return new Promise((resolve, reject) => {
    let raw = '';
    req.on('data', (chunk) => {
      raw += chunk;
      if (raw.length > 512 * 1024) {
        reject(new Error('body too large'));
        req.destroy();
      }
    });
    req.on('end', () => {
      if (!raw) return resolve({});
      try {
        resolve(JSON.parse(raw));
      } catch {
        reject(new Error('invalid JSON body'));
      }
    });
    req.on('error', reject);
  });
}

function assembleTest(language, targetLen) {
  if (language.words) return assembleWords(language.blocks, targetLen);

  const pool = shuffle([...language.blocks]);
  const picked = [];
  let total = 0;
  const minBlocks = 3;
  const maxBlocks = 60;

  for (const block of pool) {
    picked.push(block);
    total += block.length;
    if (picked.length >= minBlocks && total >= targetLen) break;
    if (picked.length >= maxBlocks) break;
  }

  const text = picked.join('\n\n');
  return { text, blockCount: picked.length, charCount: text.length };
}

// Word mode: a continuous run-on stream of shuffled words joined by single
// spaces — no punctuation, no newlines (monkeytype-style).
function assembleWords(words, targetLen) {
  const pool = shuffle([...words]);
  const picked = [];
  let total = 0;

  for (const w of pool) {
    picked.push(w);
    total += w.length + 1; // +1 for the joining space
    if (picked.length >= 8 && total - 1 >= targetLen) break;
    if (picked.length >= 500) break;
  }

  const text = picked.join(' ');
  return { text, blockCount: picked.length, charCount: text.length };
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function clampInt(value, min, max, fallback) {
  const n = Number.parseInt(value, 10);
  if (Number.isNaN(n)) return fallback;
  return Math.min(max, Math.max(min, n));
}

function debounce(fn, ms) {
  let t = null;
  return (...args) => {
    clearTimeout(t);
    t = setTimeout(() => fn(...args), ms);
  };
}

export default server;
