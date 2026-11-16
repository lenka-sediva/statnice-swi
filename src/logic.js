const SUBJ = [
  { id: "sw", name: "Software", full: "Softwarové inženýrství", ch: [...DATA1, ...DATA2, ...DATA3], orders: ORDERS },
  { id: "hw", name: "Hardware", full: "Technické a softwarové prostředky", ch: [...HW1, ...HW2, ...HW3, ...HW4, ...HW5], orders: HW_ORDERS },
];
SUBJ.forEach(s => s.ch.forEach(c => c.subj = s.id));
const CH = SUBJ.flatMap(s => s.ch);
const CHMAP = Object.fromEntries(CH.map(c => [c.id, c]));
const HLS = ["yellow", "blue", "pink", "green", "orange", "violet"];
const GROUPS = {
  sw: [["Programovací paradigmata", ["fp", "lp"]], ["Databáze", ["db", "er"]], ["Softwarové inženýrství", ["bpm", "oop", "agile", "agent"]], ["Web a architektura", ["ioc", "rest", "web", "mvc"]], ["Algoritmy a grafy", ["sort", "search", "graph", "dist"]], ["Počítačová grafika", ["cg", "rast", "scene", "img"]], ["Umělá inteligence", ["ai1", "ai2"]]],
  hw: [["Hardware počítače", ["h-zpp", "h-mp", "h-arch", "h-mem"]], ["Operační systémy", ["h-os", "h-fs", "h-win", "h-lin"]], ["Počítačové sítě", ["h-osi", "h-net"]], ["Internet věcí", ["h-iot", "h-iotsec"]], ["Programování a data", ["h-oop", "h-om", "h-data", "h-ds"]], ["Aplikace a web", ["h-netapp", "h-ui", "h-web"]]],
};
const $ = (s, el = document) => el.querySelector(s);
const app = $("#app");
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const shuffle = a => { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const pick = (a, n) => shuffle(a).slice(0, n);
const dayStr = t => { const d = new Date(t); return d.getFullYear() + "-" + String(d.getMonth() + 1).padStart(2, "0") + "-" + String(d.getDate()).padStart(2, "0"); };
const today = () => dayStr(Date.now());
function rng(seed) { let h = 2166136261; for (const c of seed) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); } return () => { h += 0x6D2B79F5; let t = h; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }

/* ---------- STATE ---------- */
const KEY = "statnice-se-v1";
const DEF = { xp: 0, done: {}, box: {}, ach: {}, stats: { quizzes: 0, bestSpeed: 0, bosses: 0, cards: 0, bestCombo: 0, perfect: 0, matches: 0, orders: 0 }, streak: 0, lastDay: "", dayXP: 0, dayDate: "", nick: "", sel: [], subj: "sw", miss: {}, daily: {} };
let S = structuredClone(DEF);
try { const r = localStorage.getItem(KEY); if (r) S = Object.assign(structuredClone(DEF), JSON.parse(r)); S.stats = Object.assign(structuredClone(DEF.stats), S.stats); } catch (e) {}
let DB = null, UID = null, saveTimer = null;
function save() {
  try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {}
  clearTimeout(saveTimer);
  saveTimer = setTimeout(syncRemote, 1500);
}
async function syncRemote() {
  if (!DB || !UID) return;
  try { await DB.doc("data/users/" + UID + "/progress").set({ s: JSON.stringify(S), xp: S.xp }); } catch (e) { if (e && e.code === "invalid_argument") DB = null; }
}

/* ---------- LEVELS ---------- */
const TITLES = ["Nováček", "Prvák", "Ranní ptáče", "Pilný student", "Knihomol", "Zkouškový bojovník", "Bakalant", "Mistr poznámek", "Státnicový Padawan", "Algoritmický rytíř", "Grafový guru", "Neuronová legenda", "Státnicový Jedi", "Bc. in spe", "Profesor tajně"];
function lvl(xp) { let n = 1, need = 100, acc = 0; while (xp >= acc + need) { acc += need; n++; need = 100 + (n - 1) * 50; } return { n, cur: xp - acc, need, title: TITLES[Math.min(n - 1, TITLES.length - 1)] }; }

/* ---------- ITEMS ---------- */
function items(ch) {
  const out = [];
  const ex = (k, v) => v || EXPL[ch.id + "|" + k] || "";
  ch.q.forEach((q, i) => out.push({ id: ch.id + ":q" + i, ch: ch.id, kind: "mc", prompt: q[0], correct: q[1], wrong: q[2], expl: ex("q|" + i, q[3]) }));
  ch.tf.forEach((t, i) => out.push({ id: ch.id + ":tf" + i, ch: ch.id, kind: "tf", prompt: t[0], correct: t[1] ? "Pravda" : "Nepravda", wrong: [t[1] ? "Nepravda" : "Pravda"], expl: ex("tf|" + i, t[2]) }));
  ch.t.forEach((t, i) => {
    const others = pick(ch.t.filter((_, j) => j !== i), 3);
    if (i % 2 === 0) out.push({ id: ch.id + ":t" + i, ch: ch.id, kind: "mc", prompt: "Který pojem odpovídá popisu: „" + t[1] + "“?", correct: t[0], wrong: others.map(o => o[0]), expl: t[0] + ": " + t[1] + ".", meaning: Object.fromEntries(others.map(o => [o[0], o[0] + " znamená: " + o[1] + "."])) });
    else out.push({ id: ch.id + ":t" + i, ch: ch.id, kind: "mc", prompt: "Co znamená pojem „" + t[0] + "“?", correct: t[1], wrong: others.map(o => o[1]), expl: t[0] + ": " + t[1] + ".", meaning: Object.fromEntries(others.map(o => [o[1], "Zvolená definice patří k pojmu „" + o[0] + "“."])) });
  });
  return out;
}
const ALLITEMS = Object.fromEntries(CH.map(c => [c.id, items(c)]));
const ITEM = Object.fromEntries(Object.values(ALLITEMS).flat().map(x => [x.id, x]));
function record(q, right) { if (right) { S.done[q.id] = 1; delete S.miss[q.id]; } else { delete S.done[q.id]; S.miss[q.id] = 1; } }
function missItems() { return Object.keys(S.miss).map(id => ITEM[id]).filter(x => x && CHMAP[x.ch].subj === subj().id); }
function dailyQs() { const r = rng(today() + S.subj); const pool = subjCh().flatMap(c => ALLITEMS[c.id]).slice(); for (let i = pool.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [pool[i], pool[j]] = [pool[j], pool[i]]; } return pool.slice(0, 10); }
function mastery(id) { const it = ALLITEMS[id]; return it.filter(x => S.done[x.id]).length / it.length; }
function grpMastery(ids) { let a = 0, b = 0; ids.forEach(id => { a += ALLITEMS[id].filter(x => S.done[x.id]).length; b += ALLITEMS[id].length; }); return Math.round(a / b * 100); }
function subj() { return SUBJ.find(s => s.id === S.subj) || SUBJ[0]; }
function subjCh() { return subj().ch; }
function subjMastery(sid) { let a = 0, b = 0; SUBJ.find(s => s.id === sid).ch.forEach(c => { a += ALLITEMS[c.id].filter(x => S.done[x.id]).length; b += ALLITEMS[c.id].length; }); return Math.round(a / b * 100); }
function totalMastery() { let a = 0, b = 0; CH.forEach(c => { a += ALLITEMS[c.id].filter(x => S.done[x.id]).length; b += ALLITEMS[c.id].length; }); return Math.round(a / b * 100); }
function poolFor(ids) { return ids.flatMap(id => ALLITEMS[id]); }
function weighted(pool, n) { const nd = shuffle(pool.filter(x => !S.done[x.id])), d = shuffle(pool.filter(x => S.done[x.id])); return shuffle([...nd.slice(0, Math.ceil(n * 0.7)), ...d, ...nd.slice(Math.ceil(n * 0.7))].slice(0, n)); }
function curSel() { return S.sel.filter(id => CHMAP[id] && CHMAP[id].subj === subj().id); }
function selIds() { const s = curSel(); return s.length ? s : subjCh().map(c => c.id); }

/* ---------- XP / ACHIEVEMENTS ---------- */
const ACH = [
  ["first", "1.", "První krok", "Dokonči první kvíz"],
  ["combo5", "×5", "Na vlně", "Pět správně za sebou"],
  ["combo15", "×15", "K nezastavení", "Patnáct správně za sebou"],
  ["perfect", "10/10", "Bez chyby", "Kvíz na 100 %"],
  ["cards50", "50", "Kartotéka", "Projdi 50 kartiček"],
  ["match", "A=B", "Párovačka", "Přiřazovačka bez chyby"],
  ["order", "1-2-3", "Smysl pro pořádek", "Seřaď postup napoprvé"],
  ["speed15", "15", "Blesk", "Bleskovka 15+ bodů"],
  ["speed25", "25", "Turbo mozek", "Bleskovka 25+ bodů"],
  ["boss", "Bc.", "Před komisí", "Přesvědč komisi"],
  ["boss3", "3×", "Komise se bojí", "Přesvědč komisi třikrát"],
  ["allch", "vše", "Průzkum terénu", "Odpověz v každém okruhu předmětu"],
  ["master1", "100", "Okruh v malíku", "Jeden okruh na 100 %"],
  ["master50", "50 %", "Půlka hotová", "Předmět zvládnutý na 50 %"],
  ["master100", "100 %", "Na státnice", "Předmět zvládnutý na 100 %"],
  ["lvl5", "L5", "Level 5", "Dosáhni levelu 5"],
  ["lvl10", "L10", "Level 10", "Dosáhni levelu 10"],
  ["streak3", "3 d", "Tři dny v kuse", "Uč se 3 dny po sobě"],
  ["streak7", "7 d", "Týden disciplíny", "Uč se 7 dní po sobě"],
  ["daily", "dnes", "Denní výzva", "Dokonči denní výzvu"],
  ["fixed", "0 chyb", "Čistý stůl", "Oprav všechny chyby v Opakování"],
];
function unlock(id) { if (S.ach[id]) return; S.ach[id] = Date.now(); const a = ACH.find(x => x[0] === id); slam(stampSVG(a, true), "Nové razítko: " + a[2]); save(); }
function checkAch() {
  if (S.stats.cards >= 50) unlock("cards50");
  if (SUBJ.some(s => s.ch.every(c => ALLITEMS[c.id].some(x => S.done[x.id])))) unlock("allch");
  if (CH.some(c => mastery(c.id) === 1)) unlock("master1");
  const tm = Math.max(...SUBJ.map(s => subjMastery(s.id))); if (tm >= 50) unlock("master50"); if (tm >= 100) unlock("master100");
  const L = lvl(S.xp).n; if (L >= 5) unlock("lvl5"); if (L >= 10) unlock("lvl10");
  if (S.streak >= 3) unlock("streak3"); if (S.streak >= 7) unlock("streak7");
}
function addXP(n) {
  const before = lvl(S.xp).n;
  S.xp += n;
  const d = today();
  if (S.dayDate !== d) { S.dayDate = d; S.dayXP = 0; }
  S.dayXP += n;
  if (S.lastDay !== d) { const y = dayStr(Date.now() - 864e5); S.streak = S.lastDay === y ? S.streak + 1 : 1; S.lastDay = d; }
  const after = lvl(S.xp);
  if (after.n > before) { slam(stampSVG(["lv", "L" + after.n, after.title, ""], true), "Level " + after.n + ": " + after.title); }
  checkAch(); save(); renderHUD();
}

