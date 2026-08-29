// generate-bash.mjs
// Generates the Bash typing dictionary for vibetyper: a set of .sh files whose
// functions and script snippets each become one typing block.
//
// The bash language uses "blank" split mode: blocks are separated by one or
// more blank lines and never contain a blank line themselves. Every block here
// is a complete, self-contained unit (a shell function, or a coherent snippet:
// a loop, a case, a pipeline, a here-doc, a short script).
//
// Run from anywhere:
//   node scripts/generate/generate-bash.mjs
//
// Data lives in scripts/generate/bash-data/*.mjs, mirroring the other language
// generators. In those modules `${` is written as `\${` and every other
// backslash is doubled, so the template literals cook to the exact Bash source.

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '../../dictionary/bash');
fs.mkdirSync(outDir, { recursive: true });

const MODULES = [
  './bash-data/strings.mjs',
  './bash-data/text-processing.mjs',
  './bash-data/math.mjs',
  './bash-data/arrays.mjs',
  './bash-data/argument-parsing.mjs',
  './bash-data/file-utils.mjs',
  './bash-data/filesystem-ops.mjs',
  './bash-data/logging.mjs',
  './bash-data/processes.mjs',
  './bash-data/networking.mjs',
  './bash-data/system-info.mjs',
  './bash-data/git-helpers.mjs',
  './bash-data/docker-helpers.mjs',
  './bash-data/json-csv.mjs',
  './bash-data/datetime.mjs',
  './bash-data/error-handling.mjs',
  './bash-data/snippets.mjs',
];

// ---------------------------------------------------------------------------
// Sanity checks — mirror what server/blockSplitter.js splitBlank does so a
// block that passes here will be served as exactly one typing block.
// ---------------------------------------------------------------------------

// "bar" is intentionally excluded: it appears in legitimate Bash contexts
// such as "progress bar" and curl's --progress-bar.
const FILLER = /\b(TODO|FIXME|placeholder|lorem|asdf|dummy)\b|\bfoo\b/i;

function checkBlocks(data, index) {
  const file = data.file;
  const blocks = data.blocks;
  if (!Array.isArray(blocks) || blocks.length === 0) {
    throw new Error(`${file}: no blocks`);
  }
  const seen = new Set();
  for (const block of blocks) {
    if (typeof block !== 'string' || !block.trim()) {
      throw new Error(`${file}: empty block`);
    }
    if (/\n\s*\n/.test(block)) {
      throw new Error(`${file}: block contains a blank line:\n${block}`);
    }
    if (block.includes('`')) {
      throw new Error(`${file}: block contains a backtick (use \$(...)):\n${block}`);
    }
    const lineCount = block.split('\n').length;
    if (lineCount < 3 || lineCount > 30) {
      throw new Error(`${file}: block has ${lineCount} lines (want 3-30):\n${block}`);
    }
    if (FILLER.test(block)) {
      throw new Error(`${file}: block contains filler text:\n${block}`);
    }
    if (seen.has(block)) {
      throw new Error(`${file}: duplicate block:\n${block}`);
    }
    seen.add(block);
  }
  return blocks;
}

let total = 0;
const files = [];
for (let i = 0; i < MODULES.length; i++) {
  const { default: data } = await import(MODULES[i]);
  const blocks = checkBlocks(data, i);
  files.push({ file: data.file, blocks });
  total += blocks.length;
}

for (const { file, blocks } of files) {
  // Blank-mode separator: exactly one blank line between blocks.
  fs.writeFileSync(path.join(outDir, file), blocks.join('\n\n') + '\n');
}

console.log(`Wrote ${files.length} files with ${total} blocks into ${outDir}`);
if (total < 300) {
  console.error(`FAIL: only ${total} blocks, target is 300`);
  process.exit(1);
}
