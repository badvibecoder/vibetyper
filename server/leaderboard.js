// leaderboard.js
// Persistent, append-only score storage backed by a JSON file so the
// leaderboard grows over time and survives restarts.

import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';

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

  load();

  return {
    all() {
      return entries;
    },

    // Returns the new entry with its computed rank (1-based, by wpm).
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

      const rank =
        entries
          .slice()
          .sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy || a.date.localeCompare(b.date))
          .findIndex((e) => e.id === entry.id) + 1;

      return { entry, rank, total: entries.length };
    },

    ranked(limit = null) {
      const sorted = entries
        .slice()
        .sort((a, b) => b.wpm - a.wpm || b.accuracy - a.accuracy || a.date.localeCompare(b.date));
      return limit ? sorted.slice(0, limit) : sorted;
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
