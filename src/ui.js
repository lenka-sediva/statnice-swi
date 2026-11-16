/* ---------- UI HELPERS ---------- */
const ICON = {
  quiz: '<rect x="4" y="3" width="16" height="18" rx="2"/><path d="M8 8.5l1.5 1.5L12 7.5M8 15h8M14 9h2"/>',
  cards: '<rect x="3.5" y="7" width="13" height="13" rx="2"/><path d="M7.5 4h10a3 3 0 0 1 3 3v10"/>',
  match: '<circle cx="5.5" cy="6" r="2.2"/><circle cx="18.5" cy="18" r="2.2"/><circle cx="5.5" cy="18" r="2.2"/><circle cx="18.5" cy="6" r="2.2"/><path d="M7.7 6.4c5 1 3.6 10.2 8.6 11.2M7.7 17.6l8.6-11.2" stroke-dasharray="0"/>',
  speed: '<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.5M10 2.5h4M18.5 6.5l1.5-1.5"/>',
  order: '<path d="M10 6h10M10 12h10M10 18h10M4 5l1.5-1v4M3.8 11.2a1.4 1.4 0 0 1 2.6.8L4 14.5h2.6M4 17h2.2l-1.2 1.6a1.2 1.2 0 1 1-1.1 1.6"/>',
  boss: '<circle cx="5.5" cy="9" r="2.3"/><circle cx="12" cy="6.8" r="2.6"/><circle cx="18.5" cy="9" r="2.3"/><path d="M1.8 19c.3-3.2 1.8-5 3.7-5s3.2 1.4 3.6 3.6M8.3 19.5c.4-4 1.8-6.2 3.7-6.2s3.3 2.2 3.7 6.2M14.9 17.6c.4-2.2 1.7-3.6 3.6-3.6s3.4 1.8 3.7 5"/>',
};
const icon = k => `<svg viewBox="0 0 24 24" aria-hidden="true">${ICON[k]}</svg>`;
function hash(s) { let h = 0; for (const c of s) h = (h * 31 + c.charCodeAt(0)) | 0; return Math.abs(h); }
function stampSVG(a, got) {
  const id = "sp" + hash(a[0] + a[2]) + (got ? "g" : "");
  const rot = got ? (hash(a[0]) % 25) - 12 : 0;
  const ring = (a[2] + " • ").repeat(a[2].length < 12 ? 3 : 2).toUpperCase();
  const fs = a[1].length > 4 ? 15 : a[1].length > 2 ? 19 : 24;
  return `<svg viewBox="0 0 100 100" style="transform:rotate(${rot}deg)" aria-hidden="true"><g ${got ? 'filter="url(#ink)"' : ""} fill="none" stroke="currentColor" ${got ? "" : 'stroke-dasharray="3 3"'}>
  <circle cx="50" cy="50" r="46" stroke-width="3.6"/><circle cx="50" cy="50" r="33" stroke-width="2"/></g>
  <defs><path id="${id}" d="M50 50 m-39.5 0 a39.5 39.5 0 1 1 79 0 a39.5 39.5 0 1 1 -79 0"/></defs>
  <g ${got ? 'filter="url(#ink)"' : ""} fill="currentColor"><text font-family="Archivo,sans-serif" font-size="8.6" font-weight="900" letter-spacing="1.3"><textPath href="#${id}" textLength="244">${esc(ring)}</textPath></text>
  <text x="50" y="50" text-anchor="middle" dominant-baseline="central" font-family="Archivo,sans-serif" font-weight="900" font-size="${fs}" style="font-stretch:70%">${esc(a[1])}</text></g></svg>`;
}
let slamQ = [], slamBusy = false;
function slam(svg, label) {
  slamQ.push([svg, label]); if (slamBusy) return;
  const next = () => {
    const it = slamQ.shift(); if (!it) { slamBusy = false; return; }
    slamBusy = true; const el = $("#slam");
    el.innerHTML = `<div class="big">${it[0]}</div>`; toast(esc(it[1]));
    setTimeout(() => { el.innerHTML = ""; next(); }, 1900);
  };
  next();
}
function toast(html) { const t = document.createElement("div"); t.className = "toast"; t.innerHTML = html; $("#toasts").appendChild(t); setTimeout(() => t.classList.add("out"), 2600); setTimeout(() => t.remove(), 3100); }
function floatXP(n, el) { if (!el) return; const r = el.getBoundingClientRect(); const f = document.createElement("div"); f.className = "fxp"; f.textContent = "+" + n; f.style.left = r.right - 60 + "px"; f.style.top = r.top - 6 + "px"; document.body.appendChild(f); setTimeout(() => f.remove(), 950); }
let timers = [];
function clearTimers() { timers.forEach(t => clearInterval(t)); timers = []; document.onkeydown = null; }
function go(fn) { clearTimers(); window.scrollTo(0, 0); fn(); }
function renderHUD() {
  const L = lvl(S.xp);
  $("#hud").innerHTML = `<button class="mark" id="homebtn">Státnice SWI</button>
  <div class="lvl"><b class="num">Lv ${L.n}</b><span class="stat hide-s">${esc(L.title)}</span><div class="xpbar" title="${L.cur} z ${L.need} XP do dalšího levelu"><i style="width:${L.cur / L.need * 100}%"></i></div></div>
  <span class="stat num"><b>${S.streak}</b> ${S.streak === 1 ? "den" : S.streak >= 2 && S.streak <= 4 ? "dny" : "dní"} v řadě</span>
  <div class="subj" role="tablist" aria-label="Předmět">${SUBJ.map(s => `<button role="tab" aria-selected="${s.id === S.subj}" data-subj="${s.id}" title="${esc(s.full)}">${s.name}<small class="num">${subjMastery(s.id)} %</small></button>`).join("")}</div>`;
  $("#hud").querySelectorAll("[data-subj]").forEach(b => b.onclick = () => { if (S.subj === b.dataset.subj && $(".hero")) return; S.subj = b.dataset.subj; save(); renderHUD(); go(home); });
  $("#homebtn").onclick = () => go(home);
}
const ticket = (c, extra = "") => { const m = Math.round(mastery(c.id) * 100); return `<div class="stub">${c.n}<small>okruh</small></div><div class="body"><div class="t">${esc(c.title)}</div><div class="m"><div class="bar"><i style="width:${m}%"></i></div><span class="num">${m} %</span></div></div>${extra}`; };
const plural = (n, a, b, c) => n === 1 ? a : n >= 2 && n <= 4 ? b : c;

/* ---------- HOME ---------- */
function home() {
  const d = today(); const dayXP = S.dayDate === d ? S.dayXP : 0; const goal = 100;
  const weak = subjCh().slice().sort((a, b) => mastery(a.id) - mastery(b.id) || a.n - b.n).slice(0, 5);
  const fanPos = [[-13, 26, -150], [-6.5, 8, -75], [0, 0, 0], [6.5, 8, 75], [13, 26, 150]];
  const ids = selIds();
  const total = subjCh().reduce((a, c) => a + ALLITEMS[c.id].length, 0);
  const rec = { quiz: S.stats.quizzes + "× odehráno", cards: S.stats.cards + " kartiček", match: S.stats.matches + "× spojeno", speed: "rekord " + S.stats.bestSpeed, order: S.stats.orders + "× seřazeno", boss: S.stats.bosses + "× přesvědčena" };
  const M = [["boss", "Státnice nanečisto", "Vylosuj dva okruhy a přesvědč komisi"], ["quiz", "Kvíz", "Deset otázek, série zvyšuje body"], ["cards", "Kartičky", "Co neumíš, uvidíš příště dřív"], ["match", "Přiřazovačka", "Spoj šest pojmů s definicemi"], ["speed", "Bleskovka", "60 sekund, chyba stojí 3 sekundy"], ["order", "Seřaď postup", "Fáze, cykly a kroky algoritmů"]];
  app.innerHTML = `
  <section class="hero">
    <div>
      <h1${S.subj === "hw" ? ' style="font-size:clamp(36px,5vw,62px)"' : ""}>${S.subj === "hw" ? "Státnice z Technických a softwarových prostředků" : "Státnice ze Softwarového inženýrství"}</h1>
      <p class="lead">${subjCh().length} okruhů a ${total} otázek z tvých poznámek. Vylosuj si okruhy, odpovídej komisi a sbírej razítka do indexu.</p>
      <div class="acts"><button class="btn-main" data-mode="boss">Vylosovat okruhy</button><button class="btn-ghost" data-mode="quiz">Rychlý kvíz</button></div>
      <div class="today"><div class="small"><b class="num">${Math.min(dayXP, goal)} / ${goal} XP</b> <span class="mute">dnešní cíl${dayXP >= goal ? " splněn" : ""}</span></div><div class="line"><i style="width:${Math.min(dayXP / goal, 1) * 100}%"></i></div></div>
    </div>
    <div>
      <div class="fan">${weak.map((c, i) => `<button class="tk" style="--i:${i};--r:${fanPos[i][0]}deg;--y:${fanPos[i][1]}px;--x:${fanPos[i][2]}px" data-ch="${c.id}" aria-label="Otevřít okruh ${c.n}: ${esc(c.title)}">${ticket(c)}</button>`).join("")}</div>
      <p class="small mute" style="text-align:center">Okruhy, které máš zatím nejméně zvládnuté</p>
    </div>
  </section>
  <section>
    <div class="sec-head"><h2>Herní režimy</h2><span class="small mute">${curSel().length ? `Hraješ z ${curSel().length} ${plural(curSel().length, "vybraného okruhu", "vybraných okruhů", "vybraných okruhů")}. <button class="back" id="clr" style="color:var(--stamp)">Zrušit výběr</button>` : "Hraješ ze všech okruhů"}</span></div>
    <div class="modes">${M.map(m => `<button class="mode" data-mode="${m[0]}">${icon(m[0])}<span><b>${m[1]}</b><span class="d">${m[2]}</span></span><span class="rec num">${rec[m[0]]}</span></button>`).join("")}</div>
  </section>
  <section>
    <div class="sec-head"><h2>Okruhy</h2><span class="small mute">Číslem okruh vybereš do her, názvem otevřeš tahák.</span></div>
    <div class="grid-tk">${subjCh().map(c => `<div class="tk ${S.sel.includes(c.id) ? "on" : ""}">${ticket(c, mastery(c.id) === 1 ? '<span class="done-stamp">ZVLÁDNUTO</span>' : "").replace('<div class="stub">', `<button class="stub" data-sel="${c.id}" aria-pressed="${S.sel.includes(c.id)}" aria-label="Vybrat okruh ${c.n} do her">`).replace('okruh</small></div>', 'okruh</small></button>').replace('<div class="body">', `<div class="body" data-ch="${c.id}" role="button" tabindex="0">`)}</div>`).join("")}</div>
  </section>
  <section class="twocol">
    <div><div class="sec-head"><h2>Index</h2><span class="small mute num">${Object.keys(S.ach).length} z ${ACH.length} razítek</span></div>
      <div class="stamps">${ACH.map(a => `<div class="st ${S.ach[a[0]] ? "got" : ""}">${stampSVG(a, !!S.ach[a[0]])}<span class="nm">${esc(a[2])}</span><span class="hint">${esc(a[3])}</span></div>`).join("")}</div></div>
    <div><div class="sec-head"><h2>Vyzvi kamarády</h2></div><div id="lb" class="share"></div></div>
  </section>`;
  app.querySelectorAll("[data-mode]").forEach(b => b.onclick = () => go(MODES[b.dataset.mode].bind(null, ids)));
  app.querySelectorAll("[data-ch]").forEach(el => { el.onclick = () => go(() => chapter(el.dataset.ch)); el.onkeydown = e => { if (e.key === "Enter") el.click(); }; });
  app.querySelectorAll("[data-sel]").forEach(b => b.onclick = () => { const id = b.dataset.sel; S.sel = S.sel.includes(id) ? S.sel.filter(x => x !== id) : [...S.sel, id]; save(); const y = scrollY; home(); scrollTo(0, y); });
  const clr = $("#clr"); if (clr) clr.onclick = () => { S.sel = S.sel.filter(id => !curSel().includes(id)); save(); const y = scrollY; home(); scrollTo(0, y); };
  renderLB();
}

function chapter(id) {
  const c = CHMAP[id]; const m = Math.round(mastery(id) * 100);
  const M = [["quiz", "Kvíz", "Deset otázek z okruhu"], ["cards", "Kartičky", c.t.length + " pojmů"], ["match", "Přiřazovačka", "Pojmy a definice"], ["speed", "Bleskovka", "60 sekund jen z okruhu"]];
  app.innerHTML = `<button class="back">← Přehled</button>
  <div class="chead"><div class="n">${c.n}</div><div><h1 style="font-size:clamp(32px,5vw,54px)">${esc(c.title)}</h1><p class="mute num" style="margin-top:8px">${m} % zvládnuto z ${ALLITEMS[id].length} otázek a pojmů</p></div></div>
  <div class="modes compact">${M.map(x => `<button class="mode" data-mode="${x[0]}">${icon(x[0])}<span><b>${x[1]}</b><span class="d">${x[2]}</span></span><span></span></button>`).join("")}</div>
  <section><div class="sec-head"><h2>Tahák pojmů</h2></div><dl class="cheat">${c.t.map(t => `<dt>${esc(t[0])}</dt><dd>${esc(t[1])}</dd>`).join("")}</dl></section>`;
  $(".back").onclick = () => go(home);
  app.querySelectorAll("[data-mode]").forEach(b => b.onclick = () => go(MODES[b.dataset.mode].bind(null, [id], () => chapter(id))));
}

/* ---------- shared question renderer ---------- */
function qHTML(q, opts) {
  const c = CHMAP[q.ch];
  return `<div class="from">Okruh ${c.n}: ${esc(c.title)}</div><h3>${esc(q.prompt)}</h3>
  <ul class="opts ${q.kind === "tf" ? "tf" : ""}">${opts.map((o, k) => `<li><button class="opt" data-v="${esc(o)}"><span class="k">${k + 1}</span><span><span class="tx">${esc(o)}</span></span></button></li>`).join("")}</ul><div id="fb"></div>`;
}
function mark(btns, chosen, q) {
  const right = chosen.dataset.v === q.correct;
  btns.forEach(x => { x.setAttribute("aria-disabled", "true"); if (x.dataset.v === q.correct) { x.classList.add("good"); x.insertAdjacentHTML("beforeend", '<span class="note">správně</span>'); } });
  if (!right) { chosen.classList.add("bad"); chosen.insertAdjacentHTML("beforeend", '<span class="note">ne</span>'); }
  return right;
}
function fbHTML(q, chosen, right, okWord, btn) {
  const why = q.expl || "";
  const mine = !right && q.meaning && q.meaning[chosen.dataset.v] ? `<span class="mine">${esc(q.meaning[chosen.dataset.v])}</span>` : "";
  const head = right ? okWord : "Správně je: " + q.correct + (q.kind === "tf" ? "." : "");
  return `<div class="fb ${right ? "is-ok" : "is-no"}"><div class="why"><b>${esc(head)}</b>${why ? `<span>${esc(why)}</span>` : ""}${mine}</div>${btn}</div>`;
}
const stepsHTML = (n, res, cur) => `<div class="steps">${Array.from({ length: n }, (_, k) => `<i class="${res[k] === true ? "ok" : res[k] === false ? "no" : k === cur ? "cur" : ""}"></i>`).join("")}</div>`;
const optsFor = q => q.kind === "tf" ? ["Pravda", "Nepravda"] : shuffle([q.correct, ...q.wrong.slice(0, 3)]);

/* ---------- QUIZ ---------- */
function quiz(ids, back = home) {
  const qs = weighted(poolFor(ids), 10); let i = 0, ok = 0, combo = 0, gained = 0; const res = [];
  function show() {
    if (i >= qs.length) return end();
    const q = qs[i];
    app.innerHTML = `<div class="play"><div class="ptop"><button class="back">← Ukončit</button><span class="combo" id="cb">${combo >= 2 ? "série " + combo : ""}</span><span class="small mute num">${i + 1} / ${qs.length}</span></div>
    ${stepsHTML(qs.length, res, i)}<div class="sheet">${qHTML(q, optsFor(q))}</div></div>`;
    $(".back").onclick = () => go(back);
    const btns = [...app.querySelectorAll(".opt")]; let answered = false;
    const next = () => { i++; show(); };
    const answer = b => {
      if (answered) return; answered = true;
      const right = mark(btns, b, q); res[i] = right;
      if (right) { ok++; combo++; S.done[q.id] = 1; const x = 10 + Math.min(combo - 1, 5) * 2; gained += x; addXP(x); floatXP(x, b); S.stats.bestCombo = Math.max(S.stats.bestCombo, combo); if (combo >= 5) unlock("combo5"); if (combo >= 15) unlock("combo15"); if (combo >= 2) { const cb = $("#cb"); cb.textContent = "série " + combo; cb.classList.remove("pop"); void cb.offsetWidth; cb.classList.add("pop"); } }
      else { combo = 0; $("#cb").textContent = ""; delete S.done[q.id]; save(); }
      app.querySelectorAll(".steps i")[i].className = right ? "ok" : "no";
      $("#fb").innerHTML = fbHTML(q, b, right, "Správně.", `<button class="btn-main" id="nx">${i + 1 < qs.length ? "Další otázka" : "Zobrazit výsledek"}<kbd>Enter</kbd></button>`);
      $("#nx").onclick = next; $("#nx").focus({ preventScroll: true });
    };
    btns.forEach(b => b.onclick = () => answer(b));
    document.onkeydown = e => { const n = +e.key; if (n >= 1 && n <= btns.length) answer(btns[n - 1]); };
  }
  function end() {
    document.onkeydown = null; S.stats.quizzes++; unlock("first");
    const pct = Math.round(ok / qs.length * 100); let bonus = 0;
    if (pct === 100) { bonus = 30; S.stats.perfect++; unlock("perfect"); }
    if (bonus) addXP(bonus); else save();
    result(`${ok}/${qs.length}`, pct >= 80 ? "Tohle by komise vzala." : pct >= 50 ? "Solidní základ, ještě kousek." : "Projdi si tahák a zkus to znovu.", `Získáno ${gained + bonus} XP${bonus ? ", z toho 30 za kvíz bez chyby" : ""}.`, () => quiz(ids, back), back);
  }
  show();
}
function result(big, h, p, again, back) {
  app.innerHTML = `<div class="result"><div class="score num">${big}</div><h2>${esc(h)}</h2><p class="mute" style="margin-top:8px">${p}</p><div class="acts"><button class="btn-main" id="ag">Hrát znovu</button><button class="btn-ghost" id="bk">Zpět</button></div></div>`;
  $("#ag").onclick = () => go(again); $("#bk").onclick = () => go(back); $("#ag").focus({ preventScroll: true });
}

/* ---------- FLASHCARDS ---------- */
function cards(ids, back = home) {
  const all = ids.flatMap(id => CHMAP[id].t.map((t, i) => ({ id: id + ":c" + i, ch: id, f: t[0], b: t[1] })));
  const deck = shuffle(all).sort((a, b) => (S.box[a.id] || 0) - (S.box[b.id] || 0)).slice(0, 20); let i = 0, known = 0;
  function show() {
    if (i >= deck.length) { save(); return result(`${known}/${deck.length}`, "Kartičky prošlé.", "Pojmy, které ještě neumíš, ti příště ukážu dřív.", () => cards(ids, back), back); }
    const c = deck[i]; const box = S.box[c.id] || 0; const ch = CHMAP[c.ch];
    app.innerHTML = `<div class="play"><div class="ptop"><button class="back">← Ukončit</button><span class="boxes" title="Jak dobře pojem umíš (0–5)">${Array.from({ length: 5 }, (_, k) => `<i class="${k < box ? "f" : ""}"></i>`).join("")}</span><span class="small mute num">${i + 1} / ${deck.length}</span></div>
    <div class="flip" id="fl" role="button" tabindex="0" aria-label="Otočit kartičku"><div class="inner"><div class="face"><div class="from">Okruh ${ch.n}: ${esc(ch.title)}</div><h2>${esc(c.f)}</h2><div class="tap">Klepni nebo stiskni mezerník</div></div><div class="face back">${esc(c.b)}</div></div></div>
    <div class="rate" id="rate" hidden><button class="btn-ghost" id="no">Ještě neumím<kbd>1</kbd></button><button class="btn-main" id="yes">Umím<kbd>2</kbd></button></div></div>`;
    $(".back").onclick = () => go(back);
    const fl = $("#fl"); const flip = () => { fl.classList.toggle("on"); $("#rate").hidden = false; };
    fl.onclick = flip; fl.focus({ preventScroll: true });
    const rate = y => { S.stats.cards++; if (y) { known++; S.box[c.id] = Math.min(box + 1, 5); addXP(3); } else { S.box[c.id] = 0; save(); } i++; show(); };
    $("#no").onclick = () => rate(false); $("#yes").onclick = () => rate(true);
    document.onkeydown = e => { if (e.key === " " || e.key === "Enter") { e.preventDefault(); flip(); } if (!$("#rate").hidden) { if (e.key === "1") rate(false); if (e.key === "2") rate(true); } };
  }
  show();
}

/* ---------- MATCH ---------- */
function match(ids, back = home) {
  const all = ids.flatMap(id => CHMAP[id].t.map(t => ({ ch: id, t: t[0], d: t[1] })));
  const set = pick(all, 6); const L = shuffle(set), R = shuffle(set);
  let selL = null, selR = null, done = 0, miss = 0; const t0 = Date.now();
  app.innerHTML = `<div class="play" style="max-width:960px"><div class="ptop"><button class="back">← Ukončit</button><span class="small mute num" id="ms">Chyby: 0</span><span class="small mute num" id="tm">0 s</span></div>
  <h2 style="margin-bottom:16px">Spoj pojem s definicí</h2>
  <div class="match"><div class="col">${L.map(x => `<button class="mt" data-k="${set.indexOf(x)}" data-s="L">${esc(x.t)}</button>`).join("")}</div><div class="col">${R.map(x => `<button class="mt def" data-k="${set.indexOf(x)}" data-s="R">${esc(x.d)}</button>`).join("")}</div></div></div>`;
  $(".back").onclick = () => go(back);
  timers.push(setInterval(() => { const e = $("#tm"); if (e) e.textContent = Math.round((Date.now() - t0) / 1000) + " s"; }, 500));
  app.querySelectorAll(".mt").forEach(b => b.onclick = () => {
    if (b.classList.contains("paired")) return;
    if (b.dataset.s === "L") { selL && selL.classList.remove("sel"); selL = b; } else { selR && selR.classList.remove("sel"); selR = b; }
    b.classList.add("sel");
    if (selL && selR) {
      const a = selL, c = selR; selL = selR = null;
      if (a.dataset.k === c.dataset.k) { a.className = c.className = a.className.replace("sel", "") + " paired"; c.className = "mt def paired"; done++; addXP(5); floatXP(5, c); setTimeout(() => { a.classList.add("gone"); c.classList.add("gone"); }, 380); if (done === set.length) fin(); }
      else { miss++; $("#ms").textContent = "Chyby: " + miss; a.classList.add("shake"); c.classList.add("shake"); setTimeout(() => { a.classList.remove("sel", "shake"); c.classList.remove("sel", "shake"); }, 420); }
    }
  });
  function fin() {
    clearTimers(); const s = Math.round((Date.now() - t0) / 1000); S.stats.matches++;
    let bonus = miss === 0 ? 20 : 0; if (s < 40) bonus += 10; if (miss === 0) unlock("match"); if (bonus) addXP(bonus); else save();
    setTimeout(() => result(`${s} s`, miss ? `Hotovo s ${miss} ${plural(miss, "chybou", "chybami", "chybami")}.` : "Všechno napoprvé.", bonus ? `Bonus ${bonus} XP${s < 40 ? " včetně 10 za rychlost pod 40 s" : ""}.` : "Pod 40 sekund a bez chyby dostaneš bonus.", () => match(ids, back), back), 600);
  }
}

/* ---------- SPEED ---------- */
function speed(ids, back = home) {
  const pool = shuffle(poolFor(ids)); let k = 0, score = 0, left = 60, wrong = 0;
  app.innerHTML = `<div class="play"><div class="ptop"><button class="back">← Ukončit</button><span class="small mute">Chyba stojí 3 sekundy</span></div>
  <div class="clock" id="clk"><span class="sec num" id="tl">60</span><div class="track"><i id="tb"></i></div><span class="pts num" id="sc">0</span></div><div class="sheet" id="sq"></div></div>`;
  $(".back").onclick = () => go(back);
  function q() {
    if (k >= pool.length) k = 0; const it = pool[k++];
    $("#sq").innerHTML = qHTML(it, optsFor(it));
    const bs = [...app.querySelectorAll("#sq .opt")];
    const ans = b => { const sq = $("#sq"); sq.classList.remove("flash-ok", "flash-no"); void sq.offsetWidth; if (b.dataset.v === it.correct) { score++; S.done[it.id] = 1; sq.classList.add("flash-ok"); } else { wrong++; left = Math.max(0, left - 3); sq.classList.add("flash-no"); } $("#sc").textContent = score; q(); };
    bs.forEach(b => b.onclick = () => ans(b));
    document.onkeydown = e => { const n = +e.key; if (n >= 1 && n <= bs.length) ans(bs[n - 1]); };
  }
  q();
  timers.push(setInterval(() => {
    left -= .1; if (left <= 0) { left = 0; return end(); }
    $("#tl").textContent = Math.ceil(left); $("#tb").style.transform = `scaleX(${left / 60})`; $("#clk").classList.toggle("low", left <= 10);
  }, 100));
  function end() {
    clearTimers(); const best = score > S.stats.bestSpeed; S.stats.bestSpeed = Math.max(S.stats.bestSpeed, score);
    if (score >= 15) unlock("speed15"); if (score >= 25) unlock("speed25");
    addXP(score * 4);
    result(String(score), best && score ? "Nový osobní rekord." : "Čas vypršel.", `${wrong ? wrong + " " + plural(wrong, "chyba", "chyby", "chyb") + ". " : ""}Rekord ${S.stats.bestSpeed}. Získáno ${score * 4} XP.`, () => speed(ids, back), back);
  }
}

/* ---------- ORDER ---------- */
function order(ids, back = home) {
  const OR = subj().orders; let list = OR.filter(o => ids.includes(o[1])); if (!list.length) list = OR;
  const [name, ch, steps] = pick(list, 1)[0]; const sh = shuffle(steps.map((s, i) => ({ s, i })));
  let built = [], tries = 0;
  function render() {
    app.innerHTML = `<div class="play"><div class="ptop"><button class="back">← Ukončit</button><span class="small mute">Okruh ${CHMAP[ch].n}: ${esc(CHMAP[ch].title)}</span></div><div class="sheet"><h3>Seřaď: ${esc(name)}</h3><p class="small mute">Klepej na kroky ve správném pořadí. Klepnutím na zařazený krok ho vrátíš zpátky.</p>
    <ol class="built">${built.map((b, n) => `<li data-n="${n}">${esc(b.s)}</li>`).join("") || '<li class="ph">Sem se řadí kroky</li>'}</ol>
    <div class="pool">${sh.filter(x => !built.includes(x)).map(x => `<button data-i="${x.i}">${esc(x.s)}</button>`).join("")}</div><div id="fb"></div></div></div>`;
    $(".back").onclick = () => go(back);
    app.querySelectorAll(".pool button").forEach(b => b.onclick = () => { built.push(sh.find(x => x.i == b.dataset.i)); if (built.length === steps.length) check(); else render(); });
    app.querySelectorAll(".built li[data-n]").forEach(li => li.onclick = () => { built.splice(+li.dataset.n, 1); render(); });
  }
  function check() {
    render(); tries++;
    const ok = built.every((b, n) => b.i === n);
    app.querySelectorAll(".built li").forEach((li, n) => { li.classList.add(built[n].i === n ? "good" : "bad"); li.onclick = null; });
    if (ok) { const x = tries === 1 ? 20 : 8; S.stats.orders++; if (tries === 1) unlock("order"); addXP(x); $("#fb").innerHTML = `<div class="fb"><p>Správně, ${x} XP.</p><span style="display:flex;gap:8px"><button class="btn-ghost" id="bk">Zpět</button><button class="btn-main" id="ag">Další postup</button></span></div>`; $("#ag").onclick = () => go(() => order(ids, back)); $("#bk").onclick = () => go(back); }
    else { $("#fb").innerHTML = `<div class="fb"><p>Zelené kroky jsou na správném místě.</p><button class="btn-main" id="rt">Zkusit znovu</button></div>`; $("#rt").onclick = () => { built = []; render(); }; }
  }
  render();
}

/* ---------- BOSS ---------- */
function boss(ids, back = home) {
  const drawn = pick(ids.length >= 2 ? ids : subjCh().map(c => c.id), 2);
  app.innerHTML = `<div class="play"><div class="ptop"><button class="back">← Zpět</button></div><h1 style="font-size:clamp(40px,7vw,64px)">Losování</h1>
  <p class="mute" style="margin-top:10px;max-width:52ch">Komise ti položí 12 otázek z vylosovaných okruhů. Každá správná odpověď ji přesvědčí o kus víc. Máš tři pokusy na chybu.</p>
  <div class="draw"><div class="tk" id="d1"></div><div class="tk" id="d2"></div></div><button class="btn-main" id="go" disabled>Předstoupit před komisi</button></div>`;
  $(".back").onclick = () => go(back);
  let n = 0; const fake = c => ticket(c);
  const sp = setInterval(() => {
    const a = pick(subjCh(), 2); $("#d1").innerHTML = fake(a[0]); $("#d2").innerHTML = fake(a[1]);
    if (++n > 12) { clearInterval(sp); [["#d1", drawn[0]], ["#d2", drawn[1]]].forEach(([s, id], k) => { const el = $(s); el.innerHTML = ticket(CHMAP[id]); el.style.animationDelay = k * 140 + "ms"; el.classList.add("spin"); }); $("#go").disabled = false; $("#go").focus({ preventScroll: true }); }
  }, 85);
  timers.push(sp);
  $("#go").onclick = () => fight();
  function fight() {
    const qs = weighted(poolFor(drawn), 12); let i = 0, conv = 0, lives = 3; const step = 100 / 9;
    const seats = [["Předseda", "Chce vidět přehled"], ["Oponent", "Hledá díry"], ["Člen komise", "Doptává se"]];
    function show() {
      if (conv >= 99.9) return win(); if (lives <= 0 || i >= qs.length) return lose();
      const q = qs[i];
      app.innerHTML = `<div class="play"><div class="ptop"><button class="back">← Odejít</button><span class="tries" title="Pokusy na chybu">${[0, 1, 2].map(k => `<i class="${k >= lives ? "lost" : ""}"></i>`).join("")}</span><span class="small mute num">Otázka ${i + 1} / ${qs.length}</span></div>
      <div class="board">${seats.map((s, k) => `<div class="seat ${conv >= (k + 1) * 33.3 - .5 ? "won" : ""}"><b>${s[0]}</b><span>${conv >= (k + 1) * 33.3 - .5 ? "Přesvědčen" : s[1]}</span></div>`).join("")}</div>
      <div class="convince"><span class="small mute">Komise přesvědčena</span><div class="track"><i id="cv" style="width:${conv}%"></i></div><b class="num" id="cvn">${Math.round(conv)} %</b></div>
      <div class="sheet">${qHTML(q, optsFor(q))}</div></div>`;
      $(".back").onclick = () => go(back);
      const bs = [...app.querySelectorAll(".opt")]; let done = false;
      const next = () => { i++; show(); };
      const ans = b => {
        if (done) return; done = true; const r = mark(bs, b, q);
        if (r) { conv = Math.min(100, conv + step); S.done[q.id] = 1; $("#cv").style.width = conv + "%"; $("#cvn").textContent = Math.round(conv) + " %"; app.querySelectorAll(".seat").forEach((s, k) => { if (conv >= (k + 1) * 33.3 - .5) { s.classList.add("won"); s.querySelector("span").textContent = "Přesvědčen"; } }); }
        else { lives--; app.querySelectorAll(".tries i").forEach((t, k) => t.classList.toggle("lost", k >= lives)); document.body.classList.add("ouch"); setTimeout(() => document.body.classList.remove("ouch"), 360); }
        save();
        $("#fb").innerHTML = fbHTML(q, b, r, "Komise přikyvuje.", `<button class="btn-main" id="nx">Pokračovat<kbd>Enter</kbd></button>`);
        $("#nx").onclick = next; $("#nx").focus({ preventScroll: true });
      };
      bs.forEach(b => b.onclick = () => ans(b));
      document.onkeydown = e => { const n = +e.key; if (n >= 1 && n <= bs.length) ans(bs[n - 1]); };
    }
    function win() { document.onkeydown = null; S.stats.bosses++; unlock("boss"); if (S.stats.bosses >= 3) unlock("boss3"); addXP(100 + lives * 20); result("Prospěla", "Komise je přesvědčená.", `Zbyl${lives === 1 ? "" : "y"} ti ${lives} ${plural(lives, "pokus", "pokusy", "pokusů")}. Získáno ${100 + lives * 20} XP.`, () => boss(ids, back), back); }
    function lose() { document.onkeydown = null; addXP(15); result("Opravný termín", "Tentokrát to komisi nepřesvědčilo.", `Komise přesvědčena na ${Math.round(conv)} %. Projdi si kartičky k okruhům ${CHMAP[drawn[0]].n} a ${CHMAP[drawn[1]].n} a zkus to znovu. Za snahu 15 XP.`, () => boss(ids, back), back); }
    show();
  }
}
const MODES = { quiz, cards, match, speed, order, boss };
