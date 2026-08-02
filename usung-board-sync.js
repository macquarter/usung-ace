/* usung-board-sync.js — 서버 게시판(/api/board) 글을 공지게시판에 병합 (PPT slide6·7)
 *   slide6 : 관리자가 쓴 글이 방문자에게도 보이게 (localStorage → 서버 저장소)
 *   slide7 : 상단고정 글을 맨 위로 + 행 바탕색 한 톤 진하게
 *
 * 원본 index_v6.html 불변. 런타임 병합만 한다.
 *
 * ★ index_v6.html 의 `const boardItems` / `const boardCategories` 는 최상위 const 라
 *   window 에 붙지 않는다(전역 렉시컬 환경). 이 파일도 클래식 스크립트라 이름으로 닿지만,
 *   선언 전이면 TDZ 로 throw 하므로 반드시 try 로 감싼다.
 *   inject.js 가 defer 로 넣으므로 실제로는 인라인 스크립트가 먼저 끝난 뒤 실행된다.
 * ★ 재할당은 불가(const) → splice/unshift 로 제자리 변형한다.
 */
(function () {
  'use strict';
  if (window.__usungBoardSync) return;
  window.__usungBoardSync = true;

  var NEW_MS = 14 * 24 * 60 * 60 * 1000;
  var COLOR = { '기술정보': 'blue', '시공사례': 'emerald', '제품소식': 'amber', '업계동향': 'slate', '일반': 'slate' };
  var pinnedTitles = [];

  function items() { try { return boardItems; } catch (e) { return null; } }
  function cats() { try { return boardCategories; } catch (e) { return null; } }

  function injectCss() {
    if (document.getElementById('usung-board-sync-css')) return;
    var st = document.createElement('style');
    st.id = 'usung-board-sync-css';
    // rgba 로 '깔린 색을 어둡게' — 배경이 흰색이든 회색이든 항상 한 톤 진해진다.
    st.textContent =
      '#page-board #board-list > .usung-pin{background:rgba(15,23,42,.055) !important;' +
      'box-shadow:inset 3px 0 0 #2563eb !important;}';
    (document.head || document.documentElement).appendChild(st);
  }

  var pad = function (n) { return n < 10 ? '0' + n : '' + n; };

  function toRow(p, num) {
    var ts = Number(p.createdAt) || Date.now();
    var d = new Date(ts);
    return {
      num: num,
      cat: p.cat || '일반',
      catColor: COLOR[p.cat] || 'slate',
      title: p.title || '',
      author: p.author || '유성에이스',
      date: d.getFullYear() + '.' + pad(d.getMonth() + 1) + '.' + pad(d.getDate()),
      views: 0,
      isNew: (Date.now() - ts) < NEW_MS,
      comments: ((num * 7 + 3) % 9) + 1,   // index_v6 와 같은 결정식
      pin: !!p.pin,
      srv: true
    };
  }

  // '블로그' 는 RSS 가 늦게 만들어 붙이는 탭이라 보존한다.
  function rebuildCats(list) {
    var c = cats();
    if (!c) return;
    var blog = null, i;
    for (i = 0; i < c.length; i++) if (c[i].name === '블로그') blog = c[i];

    var seen = {}, next = [{ name: '전체', count: list.length }];
    list.forEach(function (b) {
      // 블로그 글도 boardItems 안에 cat='블로그' 로 들어있다(실측 50건). 여기서 만들면
      // 아래에서 한 번 더 붙어 탭이 두 개가 된다 → 맨 뒤에 한 번만 붙인다.
      if (!b.cat || b.cat === '블로그' || seen[b.cat]) return;
      seen[b.cat] = 1;
      next.push({ name: b.cat, count: list.filter(function (x) { return x.cat === b.cat; }).length });
    });
    var nblog = list.filter(function (x) { return x.cat === '블로그'; }).length;
    if (blog) next.push(blog);
    else if (nblog) next.push({ name: '블로그', count: nblog });
    c.length = 0;
    c.push.apply(c, next);
  }

  function merge(posts) {
    var list = items();
    if (!list) return false;
    for (var i = list.length - 1; i >= 0; i--) if (list[i].srv) list.splice(i, 1);  // 재호출 대비

    var maxNum = list.reduce(function (m, b) { return Math.max(m, b.num || 0); }, 0);
    var rows = posts.map(function (p, i) { return toRow(p, maxNum + posts.length - i); });
    list.unshift.apply(list, rows);
    // Array#sort 는 안정적이라 동순위는 기존 순서를 지킨다 → 고정글만 위로 올라온다.
    list.sort(function (a, b) { return (b.pin ? 1 : 0) - (a.pin ? 1 : 0); });
    rebuildCats(list);
    return true;
  }

  // 고정 행 표시 — renderBoard 는 제목을 텍스트로 넣으므로 제목으로 찾는다.
  function tagPinned() {
    var el = document.getElementById('board-list');
    if (!el || !pinnedTitles.length) return;
    Array.prototype.forEach.call(el.children, function (r) {
      if (!r.classList || !r.classList.contains('grid')) return;
      var t = r.textContent || '';
      var hit = pinnedTitles.some(function (k) { return k && t.indexOf(k) > -1; });
      r.classList.toggle('usung-pin', hit);
    });
  }

  // usung-board.js 가 행을 다시 그리면 클래스가 날아간다 → childList 만 감시해 재부착.
  // (여기서는 class 만 건드리므로 그쪽 childList 관찰자를 되울리지 않는다.)
  function observe() {
    var el = document.getElementById('board-list');
    if (!el || el.__usungPinObserved) return;
    el.__usungPinObserved = true;
    new MutationObserver(function () { tagPinned(); }).observe(el, { childList: true });
  }

  function apply(posts) {
    pinnedTitles = posts.filter(function (p) { return p.pin; }).map(function (p) { return p.title; });
    if (!merge(posts)) return;
    injectCss();
    try { if (typeof window.renderBoard === 'function') window.renderBoard(); } catch (e) {}
    tagPinned();
    observe();
  }

  function sync() {
    fetch('/api/board', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        // 미설정(configured:false)이면 아무것도 하지 않는다 — 기존 화면 그대로.
        if (!j || !j.configured || !Array.isArray(j.posts) || !j.posts.length) return;
        apply(j.posts);
      })
      .catch(function () {});
  }

  // 환경변수가 설정되기 전에는 API 가 항상 configured:false 라 병합 경로를 실행할 수 없다.
  // 라이브에서 그 경로를 눈으로 확인하려면 이 훅에 글 배열을 직접 넘긴다.
  window.__usungBoardSyncApply = apply;

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', sync);
  else sync();
})();
