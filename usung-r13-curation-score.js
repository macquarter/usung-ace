/* usung-r13-curation-score.js — 챗봇 큐레이션 채점부 (260803 챗봇기능 정의서 slide3)
 *
 * DOM 을 전혀 만지지 않는 순수 계산부다. 표시·흐름은 usung-r13-curation.js,
 * 질문 스펙은 usung-r13-curation-data.js.
 *
 * ★ 제품 데이터는 MODELS(usung-r8-prod-a.js 가 채우는 클래식 스크립트 전역)를 그대로 읽는다.
 *   window 속성이 아니라 전역 렉시컬 환경에 있어 window.MODELS 로는 못 읽고, 데이터 파일이
 *   아직 안 돌았으면 typeof 조차 TDZ 로 던진다 → 반드시 try 로 감쌀 것.
 */
(function () {
  'use strict';
  if (window.R13C_SCORE) return;

  function models() {
    try { return (typeof MODELS !== 'undefined' && MODELS && MODELS.length) ? MODELS : []; }
    catch (e) { return []; }
  }
  function mName(m) {
    try { if (typeof modelName === 'function') return modelName(m); } catch (e) {}
    return m.title || m.grp || m.mid || m.cat;
  }
  // 한 모델이 실제로 갖는 마감 종류. 코브라후드는 카탈로그에 마감 값이 아예 없다
  // (실측 9모델 9항목 마감 0) → 호출측이 '색상·마감' 대신 '규격' 으로 적을 수 있게 한다.
  function finishesOf(m) {
    var out = [];
    m.items.forEach(function (it) { if (it.finish && out.indexOf(it.finish) < 0) out.push(it.finish); });
    return out;
  }

  /* 대분류 가중치 + 중분류 적중(+3) + 마감 적중(색상 1종당 +2) + 색상 다양성/인기 보너스.
   * 마지막 항의 0.05 는 점수가 완전히 같을 때만 갈리는 tie-break 다. */
  function tally(ans) {
    var t = { cat: {}, mid: {}, fin: {}, vary: 0, pop: 0 };
    ans.forEach(function (a) {
      var o = a.opt;
      if (o.w) Object.keys(o.w).forEach(function (k) { t.cat[k] = (t.cat[k] || 0) + o.w[k]; });
      (o.mid || []).forEach(function (m) { t.mid[m] = 1; });
      (o.fin || []).forEach(function (f) { t.fin[f] = 1; });
      if (o.vary) t.vary = 1;
      if (o.pop) t.pop = o.pop;
      // Q5 '디자인' → Q1 에서 고른 대분류를 한 번 더 밀어준다
      if (o.boost1 && ans[0] && ans[0].opt.w) {
        Object.keys(ans[0].opt.w).forEach(function (k) { t.cat[k] = (t.cat[k] || 0) + o.boost1; });
      }
    });
    return t;
  }
  function score(ans) {
    var t = tally(ans);
    return models().map(function (m) {
      var s = t.cat[m.cat] || 0;
      if (m.mid && t.mid[m.mid]) s += 3;
      var hit = finishesOf(m).filter(function (f) { return t.fin[f]; });
      s += hit.length * 2;
      var nv = m.items.length;
      if (t.vary) s += Math.min(nv, 4) * 0.5;
      if (t.pop) s += Math.min(nv, 6) * 0.6;
      return { m: m, s: s + Math.min(nv, 6) * 0.05, colors: hit };
    }).sort(function (a, b) { return b.s - a.s; });
  }
  // 인기 = 규격 선택지가 많은 순. 판매 데이터가 없어 쓰는 대용 지표다(잔여업무 A-18).
  // 그냥 상위 n개를 자르면 안 된다 — 실측 상위 8종이 전부 파이프인데다 modelName 이
  // 마감 이름이라 '스텐도장 · 스텐도장 · 스파이얼 · 스파이얼 …' 로 같은 이름이 겹쳐 보인다.
  // 대분류 1종씩 먼저 채우고(5개 = POP_N), 모자라면 이름 중복만 피해 마저 채운다.
  function popular(n) {
    var by = models().slice().sort(function (a, b) { return b.items.length - a.items.length; });
    var out = [], cats = {}, seen = {};
    function take(m, onePerCat) {
      var nm = mName(m);
      if (seen[nm] || (onePerCat && cats[m.cat])) return;
      seen[nm] = 1; cats[m.cat] = 1;
      out.push({ m: m, s: 0, colors: [] });
    }
    by.forEach(function (m) { if (out.length < n) take(m, true); });
    by.forEach(function (m) { if (out.length < n) take(m, false); });
    return out;
  }
  // 대안은 서로 다른 시리즈에서 뽑는다. 카테고리만 비교하면 갤럭시 두 개가 나란히 서서
  // '대안'이라는 말이 무색해진다(실측: 갤럭시A 양옆태엽 · 갤럭시A 내부태엽).
  function alts(list, win) {
    var out = [], used = {}, cats = {};
    used[win.m.key] = 1; cats[win.m.cat] = 1;
    list.forEach(function (r) {
      if (out.length < 2 && !used[r.m.key] && !cats[r.m.cat]) {
        used[r.m.key] = 1; cats[r.m.cat] = 1; out.push(r);
      }
    });
    list.forEach(function (r) { if (out.length < 2 && !used[r.m.key]) { used[r.m.key] = 1; out.push(r); } });
    return out;
  }
  // 매장 분위기에 맞는 마감이 하나라도 있으면 그것만 낸다. 남는 자리를 무관한 마감으로
  // 채우면 '밝고 깔끔한 공간'이라 답한 사람에게 동함마를 추천색으로 내미는 꼴이 된다.
  function colorsOf(r, fin) {
    var all = finishesOf(r.m);
    var pref = all.filter(function (f) { return fin[f]; });
    return (pref.length ? pref : all).slice(0, 3);
  }

  window.R13C_SCORE = {
    models: models, mName: mName, finishesOf: finishesOf,
    tally: tally, score: score, popular: popular, alts: alts, colorsOf: colorsOf
  };
})();
