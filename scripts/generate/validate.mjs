// validate.mjs — standalone sanity check for the generated rust/zig dictionaries.
// Runs the real server splitter over every generated file, reports per-file and
// total block counts, flags exact duplicates, and scans for filler text.
//
// Run: node scripts/generate/validate.mjs

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { splitBraced } from '../../server/blockSplitter.js';

const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '../..');

const FILLER = /\b(TODO|FIXME|placeholder|lorem|asdf|dummy|example)\b|\bfoo\b|\bbar\b/i;

for (const [lang, ext] of [['rust', '.rs'], ['zig', '.zig']]) {
  const dir = path.join(ROOT, 'dictionary', lang);
  const files = fs.readdirSync(dir).filter((f) => f.endsWith(ext)).sort();
  let total = 0;
  const seen = new Set();
  let problems = 0;
  console.log(`\n== ${lang} ==`);
  for (const f of files) {
    const src = fs.readFileSync(path.join(dir, f), 'utf8');
    const blocks = splitBraced(src);
    total += blocks.length;
    for (const b of blocks) {
      if (seen.has(b)) {
        console.log(`  DUP in ${f}: ${b.split('\n')[0].slice(0, 70)}`);
        problems++;
      }
      seen.add(b);
      if (FILLER.test(b)) {
        console.log(`  FILLER in ${f}: ${b.split('\n')[0].slice(0, 70)}`);
        problems++;
      }
      const lines = b.split('\n').length;
      if (lines < 3 || lines > 26) {
        console.log(`  LEN(${lines}) in ${f}: ${b.split('\n')[0].slice(0, 70)}`);
        problems++;
      }
    }
    console.log(`  ${f}: ${blocks.length} blocks`);
  }
  console.log(`${lang} total: ${total} blocks in ${files.length} files, problems: ${problems}`);
}
