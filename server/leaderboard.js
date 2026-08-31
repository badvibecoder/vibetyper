// leaderboard.js
// Persistent score storage backed by a JSON file. Submissions are append-only
// (history is kept), but the ranked view shows only each user's BEST score per
// language — a user can never appear twice for the same language.
//
// Identity: "a user" is the self-reported name, normalized for case, so
// "Bob" and "bob" are treated as the same person. There is no authentication,
// so a determined person could still register under a second name.

import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

function entryKey(e) {
  return String(e.name).toLowerCase() + '\u0000' + e.language;
}

// Is `a` a strictly better result than `b` for the same key?
// Higher wpm, then higher accuracy, then earlier date.
function isBetter(a, b) {
  if (a.wpm !== b.wpm) return a.wpm > b.wpm;
  if (a.accuracy !== b.accuracy) return a.accuracy > b.accuracy;
  return a.date < b.date;
}

function byRank(a, b) {
  return b.wpm - a.wpm || b.accuracy - a.accuracy || a.date.localeCompare(b.date);
}

// Collapse entries to one per (name, language): the best score for each key.
function bestPerKey(entries) {
  const best = new Map();
  for (const e of entries) {
    const key = entryKey(e);
    const cur = best.get(key);
    if (!cur || isBetter(e, cur)) best.set(key, e);
  }
  return [...best.values()];
}

export function createLeaderboard(filePath) {
  let entries = [];

  function load() {
    try {
      if (fs.existsSync(filePath)) {
        const raw = fs.readFileSync(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        entries = Array.isArray(parsed) ? parsed : [];
      } else {
        entries = [];
      }
    } catch {
      entries = [];
    }
  }

  function persist() {
    fs.mkdirSync(path.dirname(filePath), { recursive: true });
    const tmp = filePath + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(entries, null, 2));
    fs.renameSync(tmp, filePath);
  }

  function rankedEntries(limit) {
    const sorted = bestPerKey(entries).sort(byRank);
    return limit ? sorted.slice(0, limit) : sorted;
  }

  load();

  return {
    // Raw history (includes non-best duplicates). Mostly for debugging.
    all() {
      return entries;
    },

    // Returns the stored entry plus its key's best entry and the rank of that
    // best (1-based, deduped, by wpm). `total` is the count of unique
    // (name, language) entries, not the number of submissions.
    add({ name, language, wpm, cpm, lpm, accuracy }) {
      const entry = {
        id: randomUUID(),
        name: sanitizeName(name),
        language,
        wpm: clamp(wpm, 0, 400),
        cpm: clamp(cpm, 0, 5000),
        lpm: clamp(lpm, 0, 500),
        accuracy: clamp(accuracy, 0, 100),
        date: new Date().toISOString(),
      };
      entries.push(entry);
      persist();

      const ranked = rankedEntries(null);
      const key = entryKey(entry);
      const best = ranked.find((e) => entryKey(e) === key) || entry;
      const idx = ranked.findIndex((e) => e.id === best.id);
      return {
        entry,
        best,
        rank: idx === -1 ? ranked.length + 1 : idx + 1,
        total: ranked.length,
      };
    },

    // Leaderboard: one entry per (name, language), ranked by wpm.
    ranked(limit = null) {
      return rankedEntries(limit);
    },
  };
}

function sanitizeName(name) {
  const s = String(name || '').trim().slice(0, 24);
  return s || 'anonymous';
}

function clamp(value, min, max) {
  const n = Number(value);
  if (!Number.isFinite(n)) return min;
  return Math.min(max, Math.max(min, n));
}
