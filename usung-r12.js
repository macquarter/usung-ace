/* usung-r12.js — 260803 화면검토 2차
 *   ②  제품 카테고리에서 브라우저 뒤로가기를 누르면 사이트 밖으로 튕기던 문제
 *   ③  제품소개 대문 — PRODUCT CATEGORY 와 BEST & NEW 위치 교환
 *
 * index_v6.html 불변. 런타임 오버레이만 사용한다.
 * api/inject.js 의 defer 목록 맨 뒤에 실려 navigate / go* 가 모두 정의된 뒤 돈다.
 */
(function () {
  'use strict';

  /* ================= ② 히스토리 ==================================
   * 이 사이트는 SPA 흉내만 낼 뿐 history 항목을 전혀 만들지 않는다
   * (실측: navigate·goCat 전후로 history.length 50→50, history.state 는 null).
   * 그래서 카테고리 화면에서 뒤로가기를 누르면 첫 진입 항목까지 한 번에
   * 되돌아가 사이트를 벗어난다.
   *
   * URL 은 바꾸지 않고 state 만 쌓는다. 해시나 경로를 건드리면
   * navigate('about','inquiry-section') 같은 기존 앵커 이동과
   * Vercel 라우팅에 새로운 변수를 들이게 된다.
   */

  var ENTER = { 'v-main': 'goMain', 'v-parts': 'goParts', 'v-tech': 'goTech', 'v-gallery': 'goGallery' };
  var lastCat = '';        // goCat 인자 기억 — v-cat 은 DOM 만으로 어느 대분류인지 알 수 없다
  var restoring = false;   // popstate 복원 중에는 새 항목을 쌓지 않는다
  var last = null;         // 마지막으로 기록한 위치
  var timer = null;

  function snap() {
    var active = document.querySelector('.page.active');
    var page = active ? active.id.replace(/^page-/, '') : '';
    /* .view.on 은 숨은 페이지에도 남아 있다(#v-main 은 마크업부터 on).
       반드시 활성 페이지 안에서만 찾을 것. */
    var on = active ? active.querySelector('.r8x .view.on') : null;
    var view = on ? on.id : '';
    return { p: page, v: view, c: (view === 'v-cat' ? lastCat : '') };
  }

  function same(a, b) { return !!a && !!b && a.p === b.p && a.v === b.v && a.c === b.c; }

  function commit() {
    timer = null;
    if (restoring) return;
    var s = snap();
    if (!s.p || same(s, last)) return;
    try {
      if (!last) history.replaceState({ __r12: s }, '', location.href);
      else history.pushState({ __r12: s }, '', location.href);
    } catch (e) { return; }
    last = s;
  }

  /* 한 번의 조작이 navigate → syncFromPage → go* 로 이어지므로(실측 최대 3연쇄)
     디바운스로 묶어 항목 1개만 남긴다. */
  function schedule() { if (timer) clearTimeout(timer); timer = setTimeout(commit, 160); }

  function applyState(t) {
    restoring = true;
    var active = document.querySelector('.page.active');
    var cur = active ? active.id.replace(/^page-/, '') : '';

    function view() {
      try {
        if (t.v === 'v-cat') {
          if (typeof window.goCat === 'function') { lastCat = t.c; window.goCat(t.c); }
        } else if (t.v && typeof window[ENTER[t.v]] === 'function') {
          window[ENTER[t.v]]();
        }
      } catch (e) { }
      setTimeout(function () { restoring = false; last = snap(); }, 280);
    }

    if (t.p && t.p !== cur && typeof window.navigate === 'function') {
      try { window.navigate(t.p); } catch (e) { }
      /* usung-r8-mount.js 의 navigate 래퍼가 60ms 뒤 syncFromPage 로 기본 뷰를
         켠다. 그보다 늦게 덮어써야 v-cat 복원이 v-main 에 먹히지 않는다. */
      setTimeout(view, 220);
    } else {
      view();
    }
  }

  window.addEventListener('popstate', function (e) {
    var t = e.state && e.state.__r12;
    if (!t) return;            // 우리가 심은 항목이 아니면 브라우저 기본 동작
    applyState(t);
  });

  /* ---- 전역 함수 래핑 ----
     r5/r6/r8 모듈과 같은 규약: 기존 래퍼 플래그를 그대로 옮겨 단다. */
  function wrap(name, before) {
    var o = window[name];
    if (typeof o !== 'function' || o.__r12) return typeof o === 'function';
    var w = function () {
      if (before) { try { before.apply(null, arguments); } catch (e) { } }
      var r = o.apply(this, arguments);
      schedule();
      return r;
    };
    w.__r12 = true;
    try { for (var k in o) if (k.indexOf('__') === 0) w[k] = o[k]; } catch (e) { }
    window[name] = w;
    return true;
  }

  var TARGETS = ['navigate', 'goCat', 'goMain', 'goParts', 'goTech', 'goGallery'];
  /* 한 번 감고 끝내면 안 된다. defer 스크립트가 전부 실행된 뒤 DOMContentLoaded 에서
     navfix·r8-mount·docent 가 window.navigate 등을 다시 대입해 우리 래퍼를 날린다
     (실측: 부팅 후 navigate 에 __r12 없음). 매 틱마다 다시 감되, wrap() 이 __r12 로
     자기 중복을 막고 다른 모듈의 __ 플래그는 그대로 옮겨 달아 그쪽 가드도 유지된다. */
  function wrapAll() {
    for (var i = 0; i < TARGETS.length; i++) {
      var t = TARGETS[i];
      wrap(t, t === 'goCat' ? function (cat) { lastCat = cat; } : null);
    }
  }

  /* ================= ③ BEST & NEW 를 PRODUCT CATEGORY 앞으로 ==========
   * .filterrow(PRODUCT CATEGORY) 와 #bands 는 #v-main 의 형제지만,
   * BEST & NEW(.bn-sec)는 #bands 안에서 생성된다. 부모가 달라 CSS order 로는
   * 순서를 바꿀 수 없어 DOM 이동이 필요하다.
   *
   * renderBands() 는 #bands.innerHTML 을 통째로 갈아끼우고, 스타일 필터가
   * 걸리면 .bn-sec 자체를 만들지 않는다. 한 번 옮기고 끝내면 재렌더에 되돌아가고
   * 옮겨둔 노드가 남아 중복되므로 childList 를 감시한다.
   */
  var bandsObs = null, bandsNode = null;

  function bestSwap(rerendered) {
    var main = document.getElementById('v-main');
    var row = document.getElementById('filterrow');
    var bands = document.getElementById('bands');
    if (!main || !row || !bands || row.parentNode !== main) return;
    var fresh = bands.querySelector('.bn-sec');
    var moved = main.querySelector('[data-r12-bn]');
    if (fresh) {
      if (moved && moved !== fresh && moved.parentNode) moved.parentNode.removeChild(moved);
      fresh.setAttribute('data-r12-bn', '1');
      main.insertBefore(fresh, row);
    } else if (rerendered && moved && moved.parentNode) {
      moved.parentNode.removeChild(moved);   // 스타일 필터가 걸려 BEST & NEW 가 빠진 경우
    }
  }

  function watchBands() {
    var bands = document.getElementById('bands');
    if (!bands) return;
    if (bands === bandsNode) { bestSwap(false); return; }
    if (bandsObs) bandsObs.disconnect();
    bandsNode = bands;
    bandsObs = new MutationObserver(function (muts) {
      /* 노드를 밖으로 옮기면 #bands 에는 removedNodes 만 남는다 →
         addedNodes 가 있을 때만 재렌더로 보고 반응해 재귀를 피한다. */
      for (var i = 0; i < muts.length; i++) {
        if (muts[i].addedNodes.length) { bestSwap(true); return; }
      }
    });
    bandsObs.observe(bands, { childList: true });
    bestSwap(true);
  }

  /* ================= 부트 ============================================
   * r8 은 UP_DATA 를 기다리느라 최대 6초까지 늦게 뜬다(393px 실측 7.3초).
   * 짧게 끊지 말고 넉넉히 확인한다. */
  var n = 0;
  function tick() {
    wrapAll();
    watchBands();
    if (!last) commit();          // 최초 1회 기준점(replaceState)
  }

  tick();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', tick);
  window.addEventListener('load', tick);
  var iv = setInterval(function () { tick(); if (++n > 60) clearInterval(iv); }, 400);
})();
