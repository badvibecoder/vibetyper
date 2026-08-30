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
    const { text, blockCount, charCount } = assembleTest(language.blocks, targetLen);
    return sendJson(res, 200, {
      language: { id: language.id, name: language.name, ext: language.ext, wrap: language.wrap },
      text,
      blockCount,
      charCount,
    });
  }

  if (method === 'GET' && route === '/api/leaderboard') {
    const limit = clampInt(url.searchParams.get('limit'), 1, 10000, 0) || null;
    return sendJson(res, 200, {
      entries: leaderboard.ranked(limit),
      total: leaderboard.all().length,
    });
  }

  if (method === 'POST' && route === '/api/scores') {
    readJsonBody(req).then((body) => {
      try {
        const result = submitScore(body);
        sendJson(res, 201, result);
      } catch (err) {
        sendJson(res, 400, { error: String(err.message) });
      }
    });
    return;
  }

  sendJson(res, 404, { error: 'not found' });
}

function submitScore(body) {
  const language = String((body && body.language) || '').toLowerCase();
  if (!dict.languages.some((l) => l.id === language)) {
    throw new Error(`unknown language: ${language || '(none)'}`);
  }

  const wpm = Number(body.wpm);
  const cpm = Number(body.cpm);
  const lpm = Number(body.lpm);
  const accuracy = Number(body.accuracy);

  if (![wpm, cpm, lpm, accuracy].every(Number.isFinite)) {
    throw new Error('wpm, cpm, lpm and accuracy must be numbers');
  }

  return leaderboard.add({ name: body.name, language, wpm, cpm, lpm, accuracy });
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
      if (raw.length > 64 * 1024) {
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

function assembleTest(blocks, targetLen) {
  const pool = shuffle([...blocks]);
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
