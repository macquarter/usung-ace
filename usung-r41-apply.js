/* usung-r41-apply.js — r41 site side: text-anchor override applier
 *
 * Reads overrides from /api/cms keys r41_ov_0, r41_ov_1, ... (a chunked JSON
 * blob) and rewrites matching text nodes on the live site.
 *
 * Entry shape: { p:'tech', f:'original text', t:'new text' }
 *   p = page id ('home'|'tech'|... or '*' for any page)
 *   f = anchor (the original text, whitespace-normalized)
 *   t = replacement
 *
 * Why anchors instead of selectors: overlays r8~r40 redraw whole regions, so
 * any CSS path or data-cms attribute goes stale. The text itself survives.
 * When the original text really does change, the anchor stops matching and we
 * report it as '원문바뀜' instead of silently corrupting the page.
 *
 * Timing conventions are copied verbatim from usung-r37-cms.js — see the
 * comments there. Diverging from them reintroduces observer loops.
 */
(function () {
  'use strict';

  var OV = [];          // [{p,f,t}] — active overrides
  var TO = {};          // normalized(t) -> f   (reverse map, for status)
  var STAT = {};        // f -> 'applied' | 'missing' | 'conflict'
  var timer = null;
  var applying = false;
  var booted = false;

  // 공백을 한 칸으로 접어 비교한다. 관리자 측(usung-r41-live.js)도 같은 규칙을
  // 쓴다 — 양쪽이 어긋나면 앵커가 영원히 안 맞는다.
  function norm(s) {
    return String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  }

  function lang() {
    try { return (typeof window.getLang === 'function') ? window.getLang() : 'ko'; }
    catch (e) { return 'ko'; }
  }

  function curPage() {
    var e = document.querySelector('.page.active');
    return e ? String(e.id || '').replace(/^page-/, '') : '';
  }

  var SKIP_TAG = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1, TITLE: 1 };

  function eachTextNode(fn) {
    var w;
    try {
      w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    } catch (e) { return; }
    var n;
    while ((n = w.nextNode())) {
      var p = n.parentNode;
      if (!p || SKIP_TAG[p.nodeName]) continue;
      if (!n.nodeValue || !n.nodeValue.trim()) continue;
      fn(n);
    }
  }

  function apply() {
    if (!OV.length || applying) return 0;
    if (lang() !== 'ko') return 0;   // ★ 외국어 화면은 건드리지 않는다 (r34~r36 이 0건으로 만든 영역)

    applying = true;
    var page = curPage();

    // 이번 화면에 해당하는 것만 추린다
    var map = {};        // norm(f) -> t
    var scope = {};      // norm(f) -> true  (이 화면 대상)
    for (var i = 0; i < OV.length; i++) {
      var o = OV[i];
      if (o.p && o.p !== '*' && o.p !== page) continue;
      map[o.f] = o.t;
      scope[o.f] = true;
    }

    var seen = {};
    var changed = 0;

    eachTextNode(function (n) {
      var raw = n.nodeValue;
      var s = norm(raw);
      if (!s) return;

      if (map.hasOwnProperty(s)) {
        var val = map[s];
        seen[s] = 1;
        if (norm(val) === s) return;                       // ★ 같은 값이면 안 건드린다 = 옵저버 무한루프 차단
        var lead = raw.match(/^\s*/)[0];
        var tail = raw.match(/\s*$/)[0];
        n.nodeValue = lead + val + tail;
        changed++;
        return;
      }

      // 이미 적용된 노드 — 원문은 사라졌지만 정상이다
      if (TO.hasOwnProperty(s) && scope[TO[s]]) seen[TO[s]] = 1;
    });

    for (var k in scope) {
      if (!scope.hasOwnProperty(k)) continue;
      if (STAT[k] === 'conflict') continue;
      STAT[k] = seen[k] ? 'applied' : 'missing';
    }

    applying = false;
    return changed;
  }

  function schedule() {
    if (timer) return;
    timer = setTimeout(function () { timer = null; apply(); }, 200);
  }

  function load(content) {
    var parts = [];
    for (var i = 0; i < 200; i++) {
      var k = 'r41_ov_' + i;
      if (!content.hasOwnProperty(k)) break;
      parts.push(content[k]);
    }
    if (!parts.length) return [];
    var arr;
    try { arr = JSON.parse(parts.join('')); } catch (e) { return []; }
    if (!Array.isArray(arr)) return [];

    var out = [];
    for (var j = 0; j < arr.length; j++) {
      var o = arr[j];
      if (!o || typeof o !== 'object') continue;
      var f = norm(o.f), t = String(o.t == null ? '' : o.t);
      if (!f || !norm(t)) continue;
      if (f === norm(t)) continue;
      out.push({ p: String(o.p || '*'), f: f, t: t });
    }

    // 연쇄 차단: 어떤 항목의 결과(t)가 다른 항목의 원문(f)이면 A→B→C 로 계속
    // 덧칠된다. 그런 항목은 적용하지 않고 'conflict' 로 보고한다.
    var froms = {};
    for (var a = 0; a < out.length; a++) froms[out[a].f] = 1;
    var safe = [];
    for (var b = 0; b < out.length; b++) {
      if (froms.hasOwnProperty(norm(out[b].t))) { STAT[out[b].f] = 'conflict'; continue; }
      safe.push(out[b]);
      TO[norm(out[b].t)] = out[b].f;
    }
    return safe;
  }

  function start() {
    apply();
    try {
      var mo = new MutationObserver(schedule);
      mo.observe(document.body, { childList: true, subtree: true });
    } catch (e) { }
    // 늦게 뜨는 오버레이(r8 마운트·모달·갤러리 탭) 보험
    [300, 900, 2000, 4000].forEach(function (ms) { setTimeout(apply, ms); });
    document.addEventListener('langchange', function () { setTimeout(apply, 260); });
  }

  function boot() {
    if (booted) return;
    booted = true;
    fetch('/api/cms', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.configured || !j.content) return;
        OV = load(j.content);
        if (!OV.length) return;   // 오버라이드가 없으면 화면은 1바이트도 안 바뀐다
        start();
      })
      .catch(function () { /* API 실패로 홈페이지가 바뀌면 안 된다 */ });
  }

  // 관리자(iframe 부모)가 물어보는 창구. 저장 직후 즉시 반영, 상태 조회.
  window.__r41 = {
    apply: apply,
    norm: norm,
    page: curPage,
    list: function () { return OV.slice(); },
    stat: function () { return JSON.parse(JSON.stringify(STAT)); },
    // 관리자가 저장 없이 미리보기할 때 쓴다
    set: function (arr) {
      TO = {}; STAT = {};
      OV = load({ r41_ov_0: JSON.stringify(arr || []) });
      if (!booted) { booted = true; start(); } else { apply(); }
      return OV.length;
    }
  };

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
