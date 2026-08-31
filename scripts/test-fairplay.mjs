// Manual end-to-end test for the fair-play features:
//   dedup leaderboard, server-side replay verification, anti-smash rejection.
// Usage: node scripts/test-fairplay.mjs [baseUrl]
import fs from 'node:fs';

const BASE = process.argv[2] || 'http://localhost:8099';
let failures = 0;

function ok(cond, label) {
  if (cond) console.log(`  ✓ ${label}`);
  else {
    failures++;
    console.log(`  ✗ FAIL: ${label}`);
  }
}

async function api(path, opts) {
  const res = await fetch(BASE + path, opts);
  let body = null;
  try { body = await res.json(); } catch {}
  return { res, body };
}

// Build a keystroke log from target text: type every char correctly at
// `interval` ms apart, optionally inserting `errors` wrong keys (typed once,
// never fixed) at evenly spaced positions.
function buildLog(text, opts = {}) {
  const { interval = 100, errors = 0, start = 0, end = text.length, rate = null } = opts;
  const log = [];
  let t = 0;
  for (let i = start; i < end; i++) {
    const isErr = errors > 0 && i % Math.max(1, Math.floor((end - start) / errors)) === 0 && i > start;
    if (rate) t += rate;
    else t += interval;
    if (isErr) {
      log.push({ t, k: text[i] === 'a' ? 'b' : 'a', ok: false });
      // simulate pressing on (client never fixes the mistake)
    } else {
      log.push({ t, k: text[i], ok: true });
    }
  }
  return log;
}

// A smashing log: burst of fast wrong keys within a tight window.
function buildSmashLog(text) {
  const log = [];
  let t = 0;
  // 2 seconds of normal accurate typing first
  for (let i = 0; i < 20 && i < text.length; i++) {
    t += 100;
    log.push({ t, k: text[i], ok: true });
  }
  // 3 seconds of mashing at ~14 keys/s with ~70% wrong
  const wrongChars = ['x', 'z', 'q', 'j', 'k', 'v', 'b', 'm', 'w', 'p'];
  let ci = 0;
  for (let s = 0; s < 42; s++) {
    t += 70;
    const target = text[20 + ci] || 'a';
    const wrong = wrongChars[s % wrongChars.length];
    const useWrong = s % 3 !== 0; // ~2/3 wrong
    log.push({ t, k: useWrong ? wrong : target, ok: !useWrong });
    ci++;
  }
  // then clean typing to the end
  for (let i = 20 + ci; i < text.length; i++) {
    t += 100;
    log.push({ t, k: text[i], ok: true });
  }
  return log;
}


// Pick the smallest valid test duration that fits the log's time span.
function fitDuration(lastT) {
  const secs = Math.ceil(lastT / 1000) + 1;
  for (const d of [15, 30, 60, 120]) if (secs <= d) return d;
  return 120;
}

// ---- 1. fetch a test ---------------------------------------------------
console.log('\n== 1. /api/test (new session) ==');
const t1 = await api('/api/test?lang=english&len=500');
ok(t1.res.status === 200, 'initial test fetch ok');
ok(t1.body.token && typeof t1.body.token === 'string', 'returns a session token');
const token = t1.body.token;
const text = t1.body.text;
console.log(`    text chars: ${text.length}, token: ${token.slice(0, 8)}…`);

// ---- 2. legit score ----------------------------------------------------
console.log('\n== 2. POST legit score ==');
const legitLog = buildLog(text, { interval: 90, errors: 3 });
const s1 = await api('/api/scores', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice', language: 'english', token, duration: fitDuration(legitLog[legitLog.length - 1].t), log: legitLog }),
});
ok(s1.res.status === 201, `legit score accepted (${s1.res.status})`);
ok(s1.body && s1.body.entry && Number.isFinite(s1.body.entry.wpm), 'entry has server-computed wpm');
ok(s1.body && s1.body.total === 1, 'total = 1 unique entry');
console.log(`    entry: wpm=${s1.body.entry.wpm} cpm=${s1.body.entry.cpm} lpm=${s1.body.entry.lpm} acc=${s1.body.entry.accuracy}% rank=${s1.body.rank}`);

// ---- 3. smash log rejected --------------------------------------------
console.log('\n== 3. POST smashing log ==');
const t3 = await api('/api/test?lang=english&len=500');
const smashLog = buildSmashLog(t3.body.text);
const s3 = await api('/api/scores', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Smasher', language: 'english', token: t3.body.token, duration: fitDuration(smashLog[smashLog.length - 1].t), log: smashLog }),
});
ok(s3.res.status === 422, `smashing rejected with 422 (got ${s3.res.status})`);
ok(/score rejected/.test(s3.body.error || ''), 'rejection carries a clear message');

// ---- 4. implausible rate rejected -------------------------------------
console.log('\n== 4. POST impossible key rate ==');
const t4 = await api('/api/test?lang=english&len=500');
const fastLog = buildLog(t4.body.text, { rate: 5 }); // 200 keys/sec average
const s4 = await api('/api/scores', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Turbo', language: 'english', token: t4.body.token, duration: 15, log: fastLog }),
});
ok(s4.res.status === 422, `impossible rate rejected with 422 (got ${s4.res.status})`);

// ---- 5. forged/order-violating log rejected ----------------------------
console.log('\n== 5. POST malformed log ==');
const t5 = await api('/api/test?lang=english&len=300');
const badLog = buildLog(t5.body.text, { interval: 90 });
badLog.push({ t: 1, k: 'a' }); // timestamp out of order
const s5 = await api('/api/scores', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice', language: 'english', token: t5.body.token, duration: fitDuration(badLog[badLog.length - 1].t), log: badLog }),
});
ok(s5.res.status === 400, `out-of-order log rejected with 400 (got ${s5.res.status})`);

// ---- 6. dedup: same name+lang, better score ----------------------------
console.log('\n== 6. dedup — same user, better score ==');
const t6 = await api('/api/test?lang=english&len=500');
const betterLog = buildLog(t6.body.text, { interval: 70, errors: 1 });
const s6 = await api('/api/scores', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'alice', language: 'english', token: t6.body.token, duration: fitDuration(betterLog[betterLog.length - 1].t), log: betterLog }),
}); // note lowercase "alice" — same user
ok(s6.res.status === 201, 'better score accepted');
ok(s6.body.entry.wpm > s1.body.entry.wpm, `new wpm ${s6.body.entry.wpm} > old ${s1.body.entry.wpm}`);
ok(s6.body.best && s6.body.best.id === s6.body.entry.id, 'best is the new entry');
ok(s6.body.total === 1, 'still only 1 unique entry');

// ---- 7. dedup: worse score, best unchanged -----------------------------
console.log('\n== 7. dedup — worse score keeps best ==');
const t7 = await api('/api/test?lang=english&len=500');
const worseLog = buildLog(t7.body.text, { interval: 200, errors: 10 });
const s7 = await api('/api/scores', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice', language: 'english', token: t7.body.token, duration: fitDuration(worseLog[worseLog.length - 1].t), log: worseLog }),
});
ok(s7.res.status === 201, 'worse score stored (history kept)');
ok(s7.body.best && s7.body.best.id === s6.body.entry.id, 'best entry unchanged');
ok(s7.body.entry.wpm < s6.body.entry.wpm, `stored wpm ${s7.body.entry.wpm} < best ${s6.body.entry.wpm}`);

// ---- 8. different language = separate entry ---------------------------
console.log('\n== 8. same user, different language ==');
const t8 = await api('/api/test?lang=python&len=500');
const pyLog = buildLog(t8.body.text, { interval: 100 });
const s8 = await api('/api/scores', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Alice', language: 'python', token: t8.body.token, duration: fitDuration(pyLog[pyLog.length - 1].t), log: pyLog }),
});
ok(s8.res.status === 201, 'python score accepted');
ok(s8.body.total === 2, 'total now 2 unique entries');

// ---- 9. leaderboard view ----------------------------------------------
console.log('\n== 9. GET /api/leaderboard ==');
const lb = await api('/api/leaderboard');
ok(lb.res.status === 200, 'leaderboard fetch ok');
ok(lb.body.total === 2, `leaderboard total = 2 (got ${lb.body.total})`);
ok(lb.body.entries.length === 2, `entries length = 2 (got ${lb.body.entries.length})`);
const alice = lb.body.entries.filter((e) => e.name.toLowerCase() === 'alice');
ok(alice.length === 2, 'Alice has exactly one row per language (2 langs → 2 rows)');
const pairs = new Set(lb.body.entries.map((e) => e.name.toLowerCase() + '/' + e.language));
ok(pairs.size === lb.body.entries.length, 'no duplicate (name, language) rows on the board');
console.log('    rows:');
for (const e of lb.body.entries) console.log(`    #${lb.body.entries.indexOf(e) + 1} ${e.name} ${e.language} wpm=${e.wpm} acc=${e.accuracy}%`);

// ---- 10. append path ---------------------------------------------------
console.log('\n== 10. append path (token reuse) ==');
const t10a = await api('/api/test?lang=english&len=300');
const tokA = t10a.body.token;
const t10b = await api(`/api/test?lang=english&len=300&token=${tokA}`);
ok(t10b.res.status === 200 && t10b.body.token === tokA, 'append returns same session token');
const fullText = t10a.body.text + '\n\n' + t10b.body.text;
const fullLog = buildLog(fullText, { interval: 90, errors: 2 });
const s10 = await api('/api/scores', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Appender', language: 'english', token: tokA, duration: fitDuration(fullLog[fullLog.length - 1].t), log: fullLog }),
});
ok(s10.res.status === 201, `log spanning two chunks accepted (${s10.res.status})`);

// ---- 11. bad session token --------------------------------------------
console.log('\n== 11. unknown token ==');
const s11 = await api('/api/scores', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ name: 'Ghost', language: 'english', token: 'no-such-token', duration: 15, log: [{ t: 1, k: 'a' }] }),
});
ok(s11.res.status === 404, `unknown token rejected with 404 (got ${s11.res.status})`);

console.log(failures ? `\n${failures} FAILURE(S)` : '\nALL CHECKS PASSED');
process.exit(failures ? 1 : 0);
