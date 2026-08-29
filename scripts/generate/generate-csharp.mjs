// generate-csharp.mjs
// Writes the C# dictionary: one topic file per block pool under
// dictionary/csharp/. Each authored unit is a complete method (or a small
// record/class) with balanced braces, so the braces-mode splitter in
// server/blockSplitter.js yields one typing block per unit.
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

import { strings } from './csharp-data/strings.mjs';
import { math } from './csharp-data/math.mjs';
import { collections } from './csharp-data/collections.mjs';
import { dictionaries } from './csharp-data/dictionaries.mjs';
import { validation } from './csharp-data/validation.mjs';
import { dataProcessing } from './csharp-data/data-processing.mjs';
import { filesystem } from './csharp-data/filesystem.mjs';
import { networking } from './csharp-data/networking.mjs';
import { formatting } from './csharp-data/formatting.mjs';
import { dataStructures } from './csharp-data/data-structures.mjs';
import { algorithms } from './csharp-data/algorithms.mjs';
import { concurrency } from './csharp-data/concurrency.mjs';
import { models } from './csharp-data/models.mjs';
import { textProcessing } from './csharp-data/text-processing.mjs';
import { datesTime } from './csharp-data/dates-time.mjs';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '../../dictionary/csharp');
mkdirSync(outDir, { recursive: true });

const topics = [
  ['strings', strings],
  ['math', math],
  ['collections', collections],
  ['dictionaries', dictionaries],
  ['validation', validation],
  ['data-processing', dataProcessing],
  ['filesystem', filesystem],
  ['networking', networking],
  ['formatting', formatting],
  ['data-structures', dataStructures],
  ['algorithms', algorithms],
  ['concurrency', concurrency],
  ['models', models],
  ['text-processing', textProcessing],
  ['dates-time', datesTime],
];

let totalBlocks = 0;
let totalFiles = 0;

for (const [name, blocks] of topics) {
  if (!blocks.length) continue;
  const file = path.join(outDir, `${name}.cs`);
  writeFileSync(file, blocks.join('\n\n') + '\n');
  totalBlocks += blocks.length;
  totalFiles++;
  console.log(`  wrote ${String(blocks.length).padStart(3)} blocks -> ${path.relative(outDir, file)}`);
}

console.log(`csharp: ${totalBlocks} blocks across ${totalFiles} files`);
if (totalBlocks < 300) {
  throw new Error(`csharp dictionary too small: ${totalBlocks} blocks (need >= 300)`);
}
