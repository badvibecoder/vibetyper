// dictionaryLoader.js
// Reads the modular `dictionary/` tree and turns it into a set of languages,
// each with a flat list of "congruent blocks" ready to be served for typing.
//
// Expected layout:
//   dictionary/
//     python/
//       setup            <- metadata (name, ext, comment, blockmode)
//       anything.py      <- any other file is ingested as dictionary data
//       more/code.py     <- sub-folders are walked too
//     go/
//       setup
//       sample.go
//
// The `setup` file is plain text, `key=value` per line, `#` for comments:
//   name = Python
//   ext  = py
//   comment = #
//   blockmode = indent      # indent | braces | blank (optional; inferred if omitted)

import fs from 'node:fs';
import path from 'node:path';
import { splitSource } from './blockSplitter.js';

const SETUP_FILE = 'setup';

const BRACE_EXTS = new Set([
  'go', 'c', 'h', 'cpp', 'hpp', 'cc', 'hh', 'cxx', 'odin', 'rs', 'zig',
  'java', 'cs', 'js', 'ts', 'tsx', 'jsx', 'mjs', 'cjs', 'swift', 'kt', 'kts',
]);

function parseSetup(text) {
  const meta = {};
  for (const raw of text.split('\n')) {
    const line = raw.replace(/\s+$/, '');
    if (!line || line.trimStart().startsWith('#')) continue;
    const eq = line.indexOf('=');
    if (eq === -1) continue;
    const key = line.slice(0, eq).trim().toLowerCase();
    const value = line.slice(eq + 1).trim();
    if (key && value) meta[key] = value;
  }
  return meta;
}

function walkFiles(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkFiles(full, out);
    } else if (entry.isFile()) {
      out.push(full);
    }
  }
  return out;
}

export function loadDictionary(root) {
  const languages = [];

  if (!fs.existsSync(root)) {
    return { languages, errors: [`Dictionary root not found: ${root}`] };
  }

  const errors = [];
  const entries = fs.readdirSync(root, { withFileTypes: true });

  for (const entry of entries) {
    if (entry.name.startsWith('.') || entry.name.startsWith('_')) continue;
    if (!entry.isDirectory()) continue;

    const langId = entry.name;
    const dir = path.join(root, entry.name);
    const setupPath = path.join(dir, SETUP_FILE);

    let meta = {};
    if (fs.existsSync(setupPath)) {
      meta = parseSetup(fs.readFileSync(setupPath, 'utf8'));
    } else {
      // Tolerate a `setup.txt` or `setup.json`-style fallback? Keep it simple:
      errors.push(`[${langId}] missing "setup" file — using defaults`);
    }

    const name = meta.name || langId;
    const ext = (meta.ext || langId).toLowerCase();
    const comment = meta.comment || '#';
    const blockmode = meta.blockmode || null;
    const wrap = meta.wrap === 'true' || meta.wrap === '1' || meta.wrap === 'yes';

    const blocks = [];
    let files = 0;

    const filesOnDisk = walkFiles(dir).filter((f) => path.basename(f) !== SETUP_FILE);

    for (const file of filesOnDisk) {
      let source;
      try {
        source = fs.readFileSync(file, 'utf8');
      } catch {
        errors.push(`[${langId}] skipped unreadable file: ${path.relative(dir, file)}`);
        continue;
      }
      if (!source.trim()) continue;

      // Expand tabs to spaces so the typed text is always plain, visible
      // spaces (the frontend maps Tab to "advance through indentation", so
      // the target text never contains a literal tab character).
      source = source.replace(/\t/g, '    ');

      let fileBlocks;
      try {
        fileBlocks = splitSource(source, blockmode, ext);
      } catch (e) {
        errors.push(`[${langId}] failed to split ${path.relative(dir, file)}: ${e.message}`);
        fileBlocks = [];
      }

      // Drop trivially small fragments (whitespace-only, lone symbols).
      const usable = fileBlocks.filter((b) => b.trim().length >= 2);
      if (usable.length) files++;
      blocks.push(...usable);
    }

    if (blocks.length) {
      languages.push({
        id: langId,
        name,
        ext,
        comment,
        blockmode: blockmode || (ext === 'py' ? 'indent' : BRACE_EXTS.has(ext) ? 'braces' : 'blank'),
        wrap,
        files,
        blockCount: blocks.length,
        blocks,
      });
    } else {
      errors.push(`[${langId}] no usable code blocks found`);
    }
  }

  languages.sort((a, b) => a.name.localeCompare(b.name));
  return { languages, errors };
}
