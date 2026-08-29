// generate-zig.mjs
// Expands the Zig typing dictionary for vibetyper: writes dictionary/zig/*.zig,
// one output file per curated topic module under scripts/generate/zig-blocks/.
//
// Every block is ONE complete, self-contained top-level braced unit (a fn, a
// `const X = struct {...}` with methods, an enum, or a `test` block) — exactly
// what the braces-mode splitter turns into a typing block. The generator
// prepends the file-level `const std = @import("std");` import (it merges into
// the first block, which is how a real Zig module reads), verifies brace
// balance with a scanner that mirrors server/blockSplitter.js, rejects
// duplicates and filler text, and asserts the per-file block budget.
//
// Run: node scripts/generate/generate-zig.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { splitBraced } from '../../server/blockSplitter.js';

import * as strings from './zig-blocks/strings.mjs';
import * as math from './zig-blocks/math.mjs';
import * as collections from './zig-blocks/collections.mjs';
import * as validation from './zig-blocks/validation.mjs';
import * as dataProcessing from './zig-blocks/data_processing.mjs';
import * as filesystem from './zig-blocks/filesystem.mjs';
import * as networking from './zig-blocks/networking.mjs';
import * as formatting from './zig-blocks/formatting.mjs';
import * as dataStructures from './zig-blocks/data_structures.mjs';
import * as algorithms from './zig-blocks/algorithms.mjs';
import * as concurrency from './zig-blocks/concurrency.mjs';
import * as models from './zig-blocks/models.mjs';
import * as bitsTime from './zig-blocks/bits_time.mjs';
import * as misc from './zig-blocks/misc.mjs';

// [output file, topic label, blocks array, minimum expected blocks]
const MODULES = [
  ['strings.zig', 'string utilities', strings.blocks, 26],
  ['math.zig', 'math & numeric utilities', math.blocks, 24],
  ['collections.zig', 'collections & container helpers', collections.blocks, 22],
  ['validation.zig', 'input validation', validation.blocks, 22],
  ['data_processing.zig', 'data processing & parsing', dataProcessing.blocks, 24],
  ['filesystem.zig', 'filesystem helpers', filesystem.blocks, 20],
  ['networking.zig', 'networking & URL helpers', networking.blocks, 18],
  ['formatting.zig', 'formatting & rendering', formatting.blocks, 20],
  ['data_structures.zig', 'data structures', dataStructures.blocks, 22],
  ['algorithms.zig', 'algorithms', algorithms.blocks, 24],
  ['concurrency.zig', 'concurrency & threads', concurrency.blocks, 18],
  ['models.zig', 'domain models', models.blocks, 22],
  ['bits_time.zig', 'hashing, encoding & time', bitsTime.blocks, 20],
  ['misc.zig', 'misc utilities', misc.blocks, 22],
];

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(HERE, '../../dictionary/zig');

// Filler the task forbids: no TODO/placeholder/lorem/exampleNNN/foo/bar names.
const FILLER = /\b(TODO|FIXME|XXX|placeholder|lorem|asdf|dummy|example)\b|\bfoo\b|\bbar\b|\bfoobar\b/i;

// Brace-balance scan that ignores // comments and "..." / '...' literals —
// mirrors the scanner in server/blockSplitter.js (comments are per-line), so a
// unit that passes here is guaranteed to split as a single block. (Zig has no
// /* */ comments.)
function checkUnitBalance(unit, file, idx) {
  let depth = 0;
  for (const line of unit.split('\n')) {
    let i = 0;
    const len = line.length;
    while (i < len) {
      const ch = line[i];
      const next = line[i + 1];
      if (ch === '/' && next === '/') break; // line comment -> rest of line
      if (ch === '"' || ch === "'") {
        const quote = ch;
        i++;
        while (i < len) {
          if (line[i] === '\\') {
            i += 2;
            continue;
          }
          if (line[i] === quote) {
            i++;
            break;
          }
          i++;
        }
        continue;
      }
      if (ch === '{') depth++;
      else if (ch === '}') depth--;
      i++;
    }
  }
  if (depth !== 0) {
    throw new Error(
      `${file} unit #${idx} has unbalanced braces (depth ${depth}):\n${unit}`,
    );
  }
}

// Returns the quote char if a "..." / '...' literal on this line never closes.
// A stray `'` would be silently misread by the server splitter as an
// unterminated char literal, splitting one block into several — so refuse it.
function unclosedQuote(line) {
  let i = 0;
  while (i < line.length) {
    const ch = line[i];
    const next = line[i + 1];
    if (ch === '/' && next === '/') break; // line comment -> rest of line
    if (ch === '"' || ch === "'") {
      const quote = ch;
      i++;
      let closed = false;
      while (i < line.length) {
        if (line[i] === '\\') {
          i += 2;
          continue;
        }
        if (line[i] === quote) {
          closed = true;
          i++;
          break;
        }
        i++;
      }
      if (!closed) return quote;
    }
    i++;
  }
  return null;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

fs.mkdirSync(OUT_DIR, { recursive: true });

let total = 0;
const seen = new Set();
const written = [];

for (const [fileName, topic, blocks, minBlocks] of MODULES) {
  if (!Array.isArray(blocks) || blocks.length < minBlocks) {
    throw new Error(
      `${fileName}: expected at least ${minBlocks} blocks, got ${Array.isArray(blocks) ? blocks.length : 'missing module'}`,
    );
  }
  for (let i = 0; i < blocks.length; i++) {
    const b = blocks[i];
    if (typeof b !== 'string' || !b.trim()) {
      throw new Error(`${fileName}: empty block #${i}`);
    }
    const lines = b.split('\n').length;
    if (lines < 3) {
      console.warn(`  warn ${fileName} #${i}: very short block (${lines} lines): ${b.split('\n')[0].slice(0, 60)}`);
    }
    if (lines > 26) {
      throw new Error(`${fileName} #${i}: block too long (${lines} lines): ${b.split('\n')[0].slice(0, 60)}`);
    }
    if (FILLER.test(b)) {
      throw new Error(`${fileName} #${i}: filler text detected: ${b.split('\n')[0].slice(0, 60)}`);
    }
    for (const line of b.split('\n')) {
      const q = unclosedQuote(line);
      if (q === "'" || q === '"') {
        throw new Error(`${fileName} #${i}: unterminated literal on line:\n${line}`);
      }
    }
    if (seen.has(b)) {
      throw new Error(`${fileName} #${i}: duplicate block: ${b.split('\n')[0].slice(0, 60)}`);
    }
    seen.add(b);
    checkUnitBalance(b, fileName, i);
  }

  const header = `const std = @import("std");\n\n// vibetyper Zig dictionary — ${topic}\n`;
  const source = header + '\n' + blocks.map((b) => b.trim()).join('\n\n') + '\n';

  // The authoritative split: whatever the server will do to this file.
  const split = splitBraced(source);
  if (split.length !== blocks.length) {
    throw new Error(
      `${fileName}: splitter produced ${split.length} blocks, expected ${blocks.length} — a unit is missing or braces are unbalanced`,
    );
  }

  fs.writeFileSync(path.join(OUT_DIR, fileName), source);
  total += blocks.length;
  written.push(`  ${fileName}: ${blocks.length} blocks`);
}

console.log('Zig dictionary written to', OUT_DIR);
console.log(written.join('\n'));
console.log('TOTAL ZIG BLOCKS:', total);
