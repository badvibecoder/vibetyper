// generate-java.mjs
// Writes the Java dictionary: one topic file per block pool under
// dictionary/java/. Each authored unit is a complete method (or a small
// class/record) with balanced braces, so the braces-mode splitter in
// server/blockSplitter.js yields one typing block per unit.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { strings } from './java-data/strings.mjs';
import { math } from './java-data/math.mjs';
import { collections } from './java-data/collections.mjs';
import { maps } from './java-data/maps.mjs';
import { validation } from './java-data/validation.mjs';
import { dataProcessing } from './java-data/data-processing.mjs';
import { filesystem } from './java-data/filesystem.mjs';
import { networking } from './java-data/networking.mjs';
import { formatting } from './java-data/formatting.mjs';
import { dataStructures } from './java-data/data-structures.mjs';
import { algorithms } from './java-data/algorithms.mjs';
import { concurrency } from './java-data/concurrency.mjs';
import { models } from './java-data/models.mjs';
import { datesTime } from './java-data/dates-time.mjs';
import { textProcessing } from './java-data/text-processing.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '../../dictionary/java');
mkdirSync(outDir, { recursive: true });

const topics = [
  ['strings', strings],
  ['math', math],
  ['collections', collections],
  ['maps', maps],
  ['validation', validation],
  ['data-processing', dataProcessing],
  ['filesystem', filesystem],
  ['networking', networking],
  ['formatting', formatting],
  ['data-structures', dataStructures],
  ['algorithms', algorithms],
  ['concurrency', concurrency],
  ['models', models],
  ['dates-time', datesTime],
  ['text-processing', textProcessing],
];

let totalBlocks = 0;
let totalFiles = 0;

for (const [name, blocks] of topics) {
  if (!blocks.length) continue;
  const file = path.join(outDir, `${name}.java`);
  writeFileSync(file, blocks.join('\n\n') + '\n');
  totalBlocks += blocks.length;
  totalFiles++;
  console.log(`  wrote ${String(blocks.length).padStart(3)} blocks -> ${path.relative(outDir, file)}`);
}

console.log(`java: ${totalBlocks} blocks across ${totalFiles} files`);
if (totalBlocks < 300) {
  throw new Error(`java dictionary too small: ${totalBlocks} blocks (need >= 300)`);
}
