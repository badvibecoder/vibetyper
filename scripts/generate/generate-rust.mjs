// generate-rust.mjs
// Expands the Rust typing dictionary for vibetyper: writes dictionary/rust/*.rs,
// one output file per curated topic module under scripts/generate/rust-blocks/.
//
// Every block is ONE complete, self-contained top-level braced unit (a free fn,
// struct, enum, impl, or trait) — exactly what the braces-mode splitter turns
// into a typing block. The generator verifies brace balance (using a scanner
// that mirrors server/blockSplitter.js), rejects duplicate blocks, rejects
// filler text, and asserts the per-file block budget so a shortfall fails
// loudly instead of shipping a thin dictionary.
//
// Run: node scripts/generate/generate-rust.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { splitBraced } from '../../server/blockSplitter.js';

import * as strings from './rust-blocks/strings.mjs';
import * as math from './rust-blocks/math.mjs';
import * as collections from './rust-blocks/collections.mjs';
import * as validation from './rust-blocks/validation.mjs';
import * as dataProcessing from './rust-blocks/data_processing.mjs';
import * as filesystem from './rust-blocks/filesystem.mjs';
import * as networking from './rust-blocks/networking.mjs';
import * as formatting from './rust-blocks/formatting.mjs';
import * as dataStructures from './rust-blocks/data_structures.mjs';
import * as algorithms from './rust-blocks/algorithms.mjs';
import * as concurrency from './rust-blocks/concurrency.mjs';
import * as models from './rust-blocks/models.mjs';
import * as cryptoTime from './rust-blocks/crypto_time.mjs';
import * as misc from './rust-blocks/misc.mjs';

// [output file, topic label, blocks array, minimum expected blocks]
const MODULES = [
  ['strings.rs', 'string utilities', strings.blocks, 26],
  ['math.rs', 'math & numeric utilities', math.blocks, 24],
  ['collections.rs', 'collections & container helpers', collections.blocks, 24],
  ['validation.rs', 'input validation', validation.blocks, 24],
  ['data_processing.rs', 'data processing & parsing', dataProcessing.blocks, 24],
  ['filesystem.rs', 'filesystem helpers', filesystem.blocks, 22],
  ['networking.rs', 'networking & URL helpers', networking.blocks, 22],
  ['formatting.rs', 'formatting & rendering', formatting.blocks, 22],
  ['data_structures.rs', 'data structures', dataStructures.blocks, 24],
  ['algorithms.rs', 'algorithms', algorithms.blocks, 24],
  ['concurrency.rs', 'concurrency & threads', concurrency.blocks, 22],
  ['models.rs', 'domain models', models.blocks, 22],
  ['crypto_time.rs', 'hashing, encoding & time', cryptoTime.blocks, 20],
  ['misc.rs', 'misc utilities', misc.blocks, 22],
];

const HERE = path.dirname(fileURLToPath(import.meta.url));
const OUT_DIR = path.resolve(HERE, '../../dictionary/rust');

// ---------------------------------------------------------------------------
// Checks
// ---------------------------------------------------------------------------

// Filler the task forbids: no TODO/placeholder/lorem/exampleNNN/foo/bar names.
const FILLER = /\b(TODO|FIXME|XXX|placeholder|lorem|asdf|dummy|example)\b|\bfoo\b|\bbar\b|\bfoobar\b/i;

// Brace-balance scan that ignores // comments and "..." / '...' literals —
// mirrors the scanner in server/blockSplitter.js (comments are per-line), so a
// unit that passes here is guaranteed to split as a single block.
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
// A stray `'` (e.g. a Rust lifetime like `<'a>`) is silently misread by the
// server splitter as an unterminated char literal, which would split one block
// into several — so we refuse to emit such code.
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
      if (q === "'") {
        throw new Error(
          `${fileName} #${i}: stray apostrophe (lifetime syntax?) breaks the brace splitter:\n${line}`,
        );
      }
      if (q === '"') {
        throw new Error(`${fileName} #${i}: unterminated string literal:\n${line}`);
      }
    }
    if (seen.has(b)) {
      throw new Error(`${fileName} #${i}: duplicate block: ${b.split('\n')[0].slice(0, 60)}`);
    }
    seen.add(b);
    checkUnitBalance(b, fileName, i);
  }

  const header = `// vibetyper Rust dictionary — ${topic}\n`;
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

console.log('Rust dictionary written to', OUT_DIR);
console.log(written.join('\n'));
console.log('TOTAL RUST BLOCKS:', total);
