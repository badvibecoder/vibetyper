// blockSplitter.js
// Splits a source file into "congruent blocks" — self-contained chunks of code
// (a whole function, class, struct, or a short run of top-level statements).
//
// The goal: the typing trainer should hand the user *whole* code units in a
// shuffled order, never scrambled fragments, so it feels like real programming.
//
// Supported modes (set per-language via `blockmode` in that language's `setup`):
//   - "indent" : indentation-based (Python) — top-level def/class/async blocks.
//   - "braces" : brace-matching for C-like languages (Go, C, C++, Odin, Rust…).
//   - "blank"  : generic fallback — split on blank lines.

const INDENT_RE = /^[ \t]*/;

function leadingIndent(line) {
  const m = INDENT_RE.exec(line);
  return m ? m[0].length : 0;
}

function isBlank(line) {
  return line.trim() === '';
}

// ---------------------------------------------------------------------------
// Python (indentation based)
// ---------------------------------------------------------------------------
export function splitPython(source) {
  const lines = source.split('\n');
  const blocks = [];
  const n = lines.length;
  let i = 0;

  while (i < n) {
    const line = lines[i];
    if (isBlank(line)) {
      i++;
      continue;
    }
    if (leadingIndent(line) > 0) {
      // Stray indented line at top level — skip.
      i++;
      continue;
    }

    const trimmed = line.trim();
    const isCompound = /^(async\s+def|def|class)\b/.test(trimmed) || /^@/.test(trimmed);

    const start = i;
    let end = i;

    if (isCompound) {
      // Walk past decorator lines to the def/class header.
      let j = i;
      while (j < n && /^@/.test(lines[j].trim())) j++;

      if (j < n && /^(async\s+def|def|class)\b/.test(lines[j].trim())) {
        end = j;
        // Include the indented body (and internal blank lines).
        let m = j + 1;
        while (m < n) {
          const l = lines[m];
          if (isBlank(l)) {
            m++;
            continue;
          }
          if (leadingIndent(l) > 0) {
            m++;
            continue;
          }
          break;
        }
        end = m - 1;
        i = m;
      } else {
        // Decorator not followed by def/class — emit the decorator line alone.
        i = j + 1;
      }
    } else {
      // Group a short run of top-level simple statements (imports, constants,
      // assignments, comments) until the next compound block or a blank gap.
      let m = i;
      while (m < n) {
        const l = lines[m];
        if (isBlank(l)) break;
        if (leadingIndent(l) > 0) break;
        const t = l.trim();
        if (/^(async\s+def|def|class)\b/.test(t) || /^@/.test(t)) break;
        m++;
      }
      end = m - 1;
      i = m;
    }

    const text = lines.slice(start, end + 1).join('\n').replace(/\s+$/, '');
    if (text.trim() !== '') blocks.push(text);
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// C-like languages (brace matching)
// ---------------------------------------------------------------------------

// Counts `{` and `}` on one line while ignoring braces inside strings,
// char literals, and comments. Supports //, /* */, # (preprocessor line),
// "…", '…', and Go raw strings `…`.
function scanBraces(line) {
  let open = 0;
  let close = 0;
  let i = 0;
  const len = line.length;
  let inBlockComment = false;

  while (i < len) {
    const ch = line[i];
    const next = line[i + 1];

    if (inBlockComment) {
      if (ch === '*' && next === '/') {
        inBlockComment = false;
        i += 2;
      } else {
        i++;
      }
      continue;
    }

    if (ch === '/' && next === '/') break; // line comment -> rest of line
    if (ch === '/' && next === '*') {
      inBlockComment = true;
      i += 2;
      continue;
    }
    if (ch === '#') break; // preprocessor / shell-style comment
    if (ch === '"' || ch === "'" || ch === '`') {
      // Skip a quoted literal.
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
    if (ch === '{') open++;
    else if (ch === '}') close++;
    i++;
  }

  return { open, close };
}

export function splitBraced(source) {
  const lines = source.split('\n');
  const blocks = [];
  const n = lines.length;
  let i = 0;

  while (i < n) {
    if (isBlank(lines[i])) {
      i++;
      continue;
    }

    const start = i;
    let depth = 0;
    let foundOpen = false;
    let blockEnd = -1;

    // Walk until a top-level `{…}` block closes, or a reasonable header limit.
    for (let j = i; j < n && j - i < 60; j++) {
      const { open, close } = scanBraces(lines[j]);
      if (open > 0) foundOpen = true;
      depth += open - close;
      if (foundOpen && depth === 0) {
        blockEnd = j;
        break;
      }
    }

    if (blockEnd !== -1) {
      const text = lines.slice(start, blockEnd + 1).join('\n').replace(/\s+$/, '');
      if (text.trim() !== '') blocks.push(text);
      i = blockEnd + 1;
    } else {
      // No brace block here: group top-level simple lines (includes, using,
      // comments) until the next line that opens a brace or a blank gap.
      let m = i;
      while (m < n) {
        const l = lines[m];
        if (isBlank(l)) break;
        const { open } = scanBraces(l);
        if (open > 0) break;
        m++;
      }
      const text = lines.slice(start, m).join('\n').replace(/\s+$/, '');
      if (text.trim() !== '') blocks.push(text);
      i = m;
    }
  }

  return blocks;
}

// ---------------------------------------------------------------------------
// Generic fallback
// ---------------------------------------------------------------------------
export function splitBlank(source) {
  return source
    .split(/\n\s*\n+/)
    .map((b) => b.replace(/\s+$/, ''))
    .filter((b) => b.trim() !== '');
}

// ---------------------------------------------------------------------------
// Dispatcher
// ---------------------------------------------------------------------------
export function splitSource(source, mode, ext) {
  if (mode === 'indent') return splitPython(source);
  if (mode === 'braces') return splitBraced(source);
  if (mode === 'blank') return splitBlank(source);

  // Infer from extension when no explicit mode is given.
  if (['py'].includes(ext)) return splitPython(source);
  if (['go', 'c', 'h', 'cpp', 'hpp', 'cc', 'hh', 'cxx', 'odin', 'rs', 'zig', 'java', 'cs', 'js', 'ts', 'tsx', 'jsx', 'mjs', 'cjs', 'swift', 'kt'].includes(ext)) {
    return splitBraced(source);
  }
  return splitBlank(source);
}
