# vibetyper

- - - - - -

This webapp, music, libs were made with deepseek v4 pro and v4 flash using deepseek harness. 

Took around 2 hours (while doing other things and watching youtube).

- Deepseek Harness Data
    - Workspace Write
    - DeepSeek-V4-Pro High Effort
    - 82 tok/sec Average
    - Cache hit 99.99%
- Deepseek API Data
    - 128,848,260 Total Tokens
        - 58,369,830 Tokens deepseek-v4-flash
            - 629 API Calls
        - 70,478,430 Tokens deepseek-v4-pro
            - 274 API Calls
- $4.28 Spent

- - - - - -

A retrowave/synthwave typing trainer that measures your **words per minute**,
**characters per minute**, **lines per minute**, and **accuracy** — not on a
random dictionary, but on **real, production-shaped code**.

Train your fingers on whole functions, classes, and code blocks the way they
actually appear in a codebase, with a modular dictionary so you can drop in
Python (and later Go, C++, Odin, …) with zero code changes.

---

## Quick start

```bash
node server/index.js
```

Then open **http://localhost:8080** (set `PORT` to change the port).

Zero dependencies — the server uses only Node's built-in modules.

- Pick a language and a duration (15 / 30 / 60 / 120 seconds).
- The **text size** control in the top bar cycles the typing text between
  16.5px, 20.5px (default), and 24.5px — your choice is remembered.
- Click into the code area and **start typing**. Typing never blocks: wrong
  characters turn glowing red and the cursor keeps moving — hit `Backspace`
  to go back and fix them, or keep going.
- `Tab` (or `Space`) indents, `Ctrl`+`R` restarts the test, `Esc` aborts a running test.
- When the timer ends you'll see your results and can save them to the
  persistent leaderboard.

---

## Scoring

| metric | definition |
| --- | --- |
| **wpm** | correctly-typed characters ÷ 5, per minute (a "word" = 5 chars, standard typing convention) |
| **cpm** | correctly-typed characters per minute |
| **lpm** | fully-completed lines per minute |
| **accuracy** | correct characters ÷ (correct + incorrect) characters in the final text × 100 — fixing a mistake restores accuracy; it only costs you speed |

Speeds are computed live against elapsed time, and the final score uses the
full timed duration. **wpm/cpm count only characters you typed correctly**
(net speed) — wrong keys left unfixed don't inflate the score, so mashing
random keys is worthless.

When a run finishes, the results modal also plots a **speed/accuracy chart**:
per 5-second interval, it graphs your wpm (left axis) against your accuracy
(right axis) from the run's keystroke log.

When you save, the client sends its **keystroke log** and the server *replays*
it against the exact text it served, recomputes the metrics itself, and only
then stores the score. Two fair-play checks apply server-side:

- **Dedup** — the leaderboard shows each user's best score only once per
  language (name matching is case-insensitive); worse attempts are stored in
  history but never shown.
- **Anti-smashing** — runs where a high share of keystrokes are wrong in a
  short span are flagged as button-smashing and rejected server-side
  (HTTP 422), and a live warning appears while you type if a run starts
  looking smashing-like. The exact detection criteria are deliberately
  unpublished so the check can't be calibrated to its limits.

The leaderboard is stored in `data/leaderboard.json` and survives restarts.

---

## The dictionary (modular by design)

```
dictionary/
├── python/      (456 blocks, indent)
├── javascript/  (317 blocks, braces)
├── go/          (387 blocks, braces)
├── c/           (330 blocks, braces)
├── cpp/         (357 blocks, braces)
├── rust/        (322 blocks, braces)
├── zig/         (304 blocks, braces)
├── java/        (312 blocks, braces)
├── csharp/      (311 blocks, braces)
├── odin/        (356 blocks, braces)
├── yaml/        (301 blocks, blank)
├── lua/         (339 blocks, blank)
├── html/        (301 blocks, blank)
├── english/     (270 blocks, blank, wrap)
├── words/       (998 words, word-mode)
└── bash/        (400 blocks, blank)
    └── each folder holds a `setup` file + any number of code files
```

Each **sub-directory is one language**. The webapp:

1. reads that language's `setup` file for metadata,
2. ingests **every other file** in the directory (sub-folders are walked too)
   as that language's dictionary,
3. splits each file into **congruent blocks** — whole functions, classes,
   structs, short runs of top-level statements, or (for `word` mode) individual
   lowercase words — and
4. serves a **randomly-ordered** selection of those intact blocks, so the
   ordering stays fresh for repeat users while never scrambling a block.

The `words/` dictionary is a special monkeytype-style mode: the word list is
shuffled and served as one continuous, space-separated run-on stream — no
punctuation, no line breaks, no periods. `lpm` is 0 for this mode (there are no
lines to complete), which is expected.

### The `setup` file

Plain text, `key = value` per line, `#` for comments:

```
name = Python
ext  = py
comment = #
blockmode = indent
```

| key | purpose | default |
| --- | --- | --- |
| `name` | display name shown in the UI | the folder name |
| `ext` | source file extension (used for inference) | the folder name |
| `comment` | comment marker (informational) | `#` |
| `blockmode` | how to split code into blocks | inferred from `ext` |
| `wrap` | soft-wrap prose lines (paragraphs) instead of one line per `\n` | `false` |

`blockmode` is one of:

- **`indent`** — indentation-based splitting (Python).
- **`braces`** — brace-matching splitting (Go, C, C++, Odin, Rust, Java, JS…).
- **`blank`** — generic blank-line splitting for anything else.
- **`words`** — tokenizes the file into lowercase words (stripping punctuation)
  and serves them as a continuous space-separated stream. Use `wrap = true`.

If you omit `blockmode`, it is inferred from the extension: `.py` → `indent`;
`.go`, `.c`, `.h`, `.cpp`, `.cc`, `.odin`, `.rs`, `.zig`, `.java`, `.cs`, `.js`,
`.ts`, `.mjs`, `.cjs` → `braces`; everything else → `blank`.

### Adding a new language

```bash
mkdir dictionary/rust
# write dictionary/rust/setup  (name = Rust, ext = rs, blockmode = braces)
# drop any .rs files next to it
```

The running server **watches the `dictionary/` tree** and reloads on change, so
you can paste new files and refresh the page — no restart required. (Or hit
`GET /api/reload`.)

### Bundled dictionaries & adding more code

Drop any number of code files into `dictionary/<lang>/` and each top-level
function / class / struct / config section automatically becomes a separate
typing block. The bundled dictionaries ship **6,061 blocks** across 16
languages:

| language | folder | blocks | mode |
| --- | --- | --- | --- |
| Words | `words` | 998 | words |
| Python | `python` | 456 | indent |
| Bash | `bash` | 400 | blank |
| Go | `go` | 387 | braces |
| English | `english` | 270 | blank |
| C++ | `cpp` | 357 | braces |
| Odin | `odin` | 356 | braces |
| Lua | `lua` | 339 | blank |
| C | `c` | 330 | braces |
| Rust | `rust` | 322 | braces |
| JavaScript | `javascript` | 317 | braces |
| Java | `java` | 312 | braces |
| C# | `csharp` | 311 | braces |
| Zig | `zig` | 304 | braces |
| YAML | `yaml` | 301 | blank |
| HTML | `html` | 301 | blank |

The generated corpora are reproducible: each language has a generator under
`scripts/generate/` — run `node scripts/generate/generate-<lang>.mjs` from the
project root to regenerate its files.

---

## Music

Drop your own `.mp3` / `.wav` / `.ogg` / `.flac` / `.m4a` files into the
`music/` folder and they appear in the on-screen player (bottom-right):
play/pause, previous/next track, and a volume slider. Tracks auto-advance on
finish, and your volume + last track are remembered.

The folder is scanned on every page load, so just drop files in and refresh.

---

## API

| route | description |
| --- | --- |
| `GET /api/languages` | available languages + block counts |
| `GET /api/test?lang=python&len=1500[&token=…]` | randomized intact blocks joined as text. No `token`: starts a new test session and returns one (keep it). With `token`: appends another chunk to that session |
| `GET /api/leaderboard` | best score per user per language, ranked by WPM |
| `POST /api/scores` | `{ name, language, token, duration, log }` — `log` is the keystroke list (`{ t, k }`, ms since start); the server replays it, verifies it, computes wpm/cpm/lpm/accuracy itself, and enforces the anti-smash check |
| `GET /api/reload` | re-read the dictionary tree |
| `GET /api/music` | list tracks in the `music/` folder |

---

## Project layout

```
server/          # zero-dependency Node server + dictionary loader + splitter
  index.js
  dictionaryLoader.js
  blockSplitter.js
  leaderboard.js
public/          # static frontend
  index.html
  css/style.css
  js/app.js
  assets/logo.svg
dictionary/      # modular code dictionaries (python, go, cpp, odin, …)
music/           # drop-in music files (.mp3/.wav/…) for the player
thock/           # keyboard sound pack (config.json + sound.ogg)
data/            # persistent leaderboard.json
scripts/         # dictionary generators
```
