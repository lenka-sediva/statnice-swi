/* ---------- SHARE / SYNC ---------- */
function renderLB() {
  const el = $("#lb"); if (!el) return;
  const L = lvl(S.xp);
  const txt = `Státnice SWI: mám level ${L.n} (${L.title}), ${S.xp} XP a ${totalMastery()} % zvládnuto. Bleskovka rekord: ${S.stats.bestSpeed}, razítka ${Object.keys(S.ach).length}/${ACH.length}. Překonáš mě? ` + (location.href.split("#")[0]);
  el.innerHTML = `<blockquote id="sq2">${esc(txt)}</blockquote><button class="btn-main" id="cp">Zkopírovat výzvu</button>
  <p class="small mute" style="margin-top:12px">Pošli kamarádům odkaz na tuhle stránku a jejich výsledek si porovnejte. Každý má svůj vlastní postup${DB ? ", tvůj se ukládá k tvému účtu." : " uložený v prohlížeči."}</p>`;
  $("#cp").onclick = async () => { try { await navigator.clipboard.writeText(txt); toast("Výzva zkopírována"); } catch (e) { const r = document.createRange(); r.selectNodeContents($("#sq2")); const sel = getSelection(); sel.removeAllRanges(); sel.addRange(r); toast("Text je označený, zkopíruj ho přes Ctrl+C"); } };
}
(async () => {
  renderHUD(); home();
  try {
    if (!window.claude || !window.claude.use) return;
    const [db, user] = await Promise.all([claude.use("db"), claude.use("user")]);
    if (!db || !user) return;
    const id = await user.id(); if (!id) return;
    DB = db; UID = id;
    try {
      const d = await DB.doc("data/users/" + UID + "/progress").get();
      const remote = d.exists ? d.data() : null;
      if (remote && remote.s && remote.xp > S.xp) { S = Object.assign(structuredClone(DEF), JSON.parse(remote.s)); S.stats = Object.assign(structuredClone(DEF.stats), S.stats); try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} renderHUD(); if ($(".hero")) home(); }
    } catch (e) {}
    renderLB();
  } catch (e) {}
})();
