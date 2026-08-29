// generate-english.mjs
// Writes the vibetyper English dictionary: natural, topically coherent
// paragraphs in "blank" mode — one paragraph per line (3-5 sentences joined
// by single spaces), a blank line between paragraphs.
//
// Each topic module under ./english-data exports an array of paragraphs.
// The generator validates every paragraph (single line, no tabs, ASCII only,
// starts with a capital, ends with terminal punctuation, 3-5 sentences, no
// filler/placeholder text, no duplicates), deletes any stale topic .txt files,
// renders one .txt file per topic, then re-loads the dictionary through the
// real server loader to confirm the final block count.
//
// Run: node scripts/generate/generate-english.mjs

import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL, fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const outDir = path.resolve(here, '../../dictionary/english');
const dictRoot = path.resolve(here, '../../dictionary');

const TOPICS = [
  { file: 'daily-life.txt',     src: './english-data/daily-life.mjs' },
  { file: 'technology.txt',     src: './english-data/technology.mjs' },
  { file: 'science.txt',        src: './english-data/science.mjs' },
  { file: 'nature.txt',         src: './english-data/nature.mjs' },
  { file: 'cooking.txt',        src: './english-data/cooking.mjs' },
  { file: 'travel.txt',         src: './english-data/travel.mjs' },
  { file: 'business.txt',       src: './english-data/business.mjs' },
  { file: 'health.txt',         src: './english-data/health.mjs' },
  { file: 'arts-culture.txt',   src: './english-data/arts-culture.mjs' },
  { file: 'sports-weather.txt', src: './english-data/sports-weather.mjs' },
];

const MAX_LINE = 600; // a soft-wrapped paragraph may be long; hard cap for sanity
const MIN_SENTENCES = 3;
const MAX_SENTENCES = 5;
const MIN_TARGET = 250;
const FORBIDDEN = /\b(lorem|ipsum|placeholder|tbd|todo|xxx|foobar|asdf|qwerty)\b/i;

// ---------------------------------------------------------------------------
// Validation
// ---------------------------------------------------------------------------

function splitSentences(para) {
  // Sentence = run of text ending in . ! or ?. Avoids counting things like
  // "etc." mid-sentence because the content never uses abbreviations.
  return para.match(/[^.!?]+[.!?]+/g) || [];
}

function normalize(s) {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function validate(paragraphs, file) {
  const seen = new Set();
  const norms = [];
  const warnings = [];

  paragraphs.forEach((p, i) => {
    const where = `${file} #${i + 1}`;
    if (typeof p !== 'string' || p.trim() === '') throw new Error(`${where}: empty paragraph`);
    if (p.includes('\n')) throw new Error(`${where}: paragraph spans multiple lines`);
    if (p.includes('\t')) throw new Error(`${where}: tab character found`);
    if (p !== p.trim()) throw new Error(`${where}: leading/trailing whitespace`);
    if (p.length > MAX_LINE) throw new Error(`${where}: ${p.length} chars (max ${MAX_LINE}): "${p.slice(0, 80)}..."`);
    if (!/^[A-Z]/.test(p)) throw new Error(`${where}: must start with a capital letter: "${p}"`);
    if (!/[.!?]$/.test(p)) throw new Error(`${where}: must end with . ! or ?: "${p}"`);
    if (/[^\x20-\x7E]/.test(p)) throw new Error(`${where}: non-ASCII character: "${p}"`);
    if (FORBIDDEN.test(p)) throw new Error(`${where}: filler/placeholder text: "${p}"`);

    const sentences = splitSentences(p);
    if (sentences.length < MIN_SENTENCES || sentences.length > MAX_SENTENCES) {
      throw new Error(
        `${where}: ${sentences.length} sentences (need ${MIN_SENTENCES}-${MAX_SENTENCES}): "${p}"`
      );
    }

    const norm = normalize(p);
    if (seen.has(norm)) throw new Error(`${where}: duplicate of an earlier paragraph`);
    seen.add(norm);

    // Sentence-level near-duplicate check: no two paragraphs may share more
    // than one full sentence (guards against copy-paste across topics).
    for (const s of sentences) {
      const sNorm = normalize(s);
      for (const [j, other] of norms.entries()) {
        if (other.has(sNorm)) {
          warnings.push(`${where} repeats a sentence from ${file} #${j + 1}: "${s.trim()}"`);
        }
      }
    }
    norms.push(new Set(sentences.map((s) => normalize(s))));
  });

  return warnings;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

// 1. Remove any stale .txt files in the english dictionary folder (never the
//    `setup` file — it is left untouched).
const stale = fs
  .readdirSync(outDir)
  .filter((f) => f.endsWith('.txt') && f !== 'setup');
for (const f of stale) fs.unlinkSync(path.join(outDir, f));
if (stale.length) console.log('Removed %d stale .txt file(s): %s', stale.length, stale.join(', '));

// 2. Write one file per topic.
let total = 0;
const written = [];

for (const topic of TOPICS) {
  const mod = await import(topic.src);
  const paragraphs = mod.default;
  if (!Array.isArray(paragraphs) || paragraphs.length === 0) {
    throw new Error(`${topic.file}: module exports no paragraphs`);
  }
  const warnings = validate(paragraphs, topic.file);
  for (const w of warnings) console.warn(`[warn] ${w}`);

  const content = paragraphs.join('\n\n') + '\n';
  fs.writeFileSync(path.join(outDir, topic.file), content);

  total += paragraphs.length;
  written.push(`${topic.file} (${paragraphs.length})`);
}

console.log('\nWrote %d English dictionary files, %d paragraphs total.', written.length, total);
for (const f of written) console.log('  -', f);

// 3. Cross-file paragraph duplicate check (a paragraph must be unique across
//    the whole dictionary).
const allNorms = new Map();
for (const topic of TOPICS) {
  const mod = await import(topic.src);
  for (const p of mod.default) {
    const norm = normalize(p);
    if (allNorms.has(norm)) {
      throw new Error(`duplicate paragraph across files: "${p}" (also in ${allNorms.get(norm)})`);
    }
    allNorms.set(norm, topic.file);
  }
}

// 4. Confirm through the real server loader that the target was met.
const { loadDictionary } = await import(
  pathToFileURL(path.resolve(here, '../../server/dictionaryLoader.js')).href
);
const { languages, errors } = loadDictionary(dictRoot);
if (errors && errors.length) {
  for (const e of errors) console.warn(`[loader] ${e}`);
}
const eng = languages.find((l) => l.id === 'english');
if (!eng) throw new Error('english dictionary not loaded');
console.log(
  '\nVerified via server/dictionaryLoader.js: english has %d blocks in %d files.',
  eng.blockCount,
  eng.files
);
if (eng.blockCount < MIN_TARGET) {
  throw new Error(`target not met: ${eng.blockCount} < ${MIN_TARGET} blocks`);
}
console.log('Target met: at least %d blocks.', MIN_TARGET);
