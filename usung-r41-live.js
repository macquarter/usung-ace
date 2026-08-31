/* usung-r41-live.js — r41 admin side (core)
 *
 * Problem this solves: admin.html hard-codes a ~2-month-old snapshot of the
 * site (PAGES/D, 104 fields). Overlays r8~r40 redrew most of those regions, so
 * 6 of 8 content pages are now 0% editable and 52 of 103 strings no longer
 * exist on the live site at all. A hard-coded list drifts again on every
 * revision — so we stop hard-coding and read the real screen instead.
 *
 * This file owns state + storage. usung-r41-ui.js owns the screen.
 *
 * Storage: overrides ride inside the existing S.content object as chunked JSON
 * under keys r41_ov_0, r41_ov_1, ... That means the existing 🚀 발행 button
 * (publishCms) already publishes them — no second write path, no second key.
 * api/cms.js caps values at 2000 chars and keys at /^[A-Za-z0-9_]{1,40}$/,
 * hence the chunking.
 */
(function () {
  'use strict';

  // r65) 웹사이트 실측 도달 가능한 뷰만 남긴다. 생산공정·사용방법·공지사항·
  // 인증현황은 오버레이(usung-r5-nav.js hideByI18n / usung-r10-fix.css)가
  // 나브에서 지워 방문자가 도달할 길이 없다(1440·393 양쪽 실측 display:none).
  // ★ parts 는 헤더에 없어도 남긴다 — 제품소개 본문 「부품 전체 50종 보기 →」로 2클릭에 닿는다.
  var PAGES_R41 = [
    ['home', '홈'], ['about', '회사소개'], ['products', '제품소개'],
    ['parts', '부품 · 구성품'], ['tech', '기술력'],
    ['gallery', '시공갤러리'], ['board', '공지게시판']
  ];

  var CHUNK = 1800;          // api/cms.js MAX_VAL 2000 보다 낮게 (여유)
  var WARN_BYTES = 60000;    // MAX_BYTES 128KB 중 r37 104필드와 나눠 쓴다

  function norm(s) {
    return String(s == null ? '' : s).replace(/\s+/g, ' ').trim();
  }

  // ---- 저장 형식 --------------------------------------------------------
  function decode(content) {
    var parts = [];
    for (var i = 0; i < 200; i++) {
      var k = 'r41_ov_' + i;
      if (!content || !content.hasOwnProperty(k)) break;
      parts.push(content[k]);
    }
    if (!parts.length) return [];
    try {
      var arr = JSON.parse(parts.join(''));
      return Array.isArray(arr) ? arr : [];
    } catch (e) { return []; }
  }

  function encode(entries, target) {
    // 이전 청크를 먼저 지운다 — 안 지우면 항목을 줄였을 때 옛 꼬리가 남아
    // JSON 이 깨진다 (서버 POST 는 보낸 객체로 전량 교체하므로 로컬만 문제).
    for (var k in target) {
      if (target.hasOwnProperty(k) && /^r41_ov_\d+$/.test(k)) delete target[k];
    }
    var s = JSON.stringify(entries || []);
    var pos = 0, i = 0;
    while (pos < s.length) {
      var end = Math.min(pos + CHUNK, s.length);
      if (end < s.length) {
        var c = s.charCodeAt(end - 1);
        if (c >= 0xD800 && c <= 0xDBFF) end--;   // 서로게이트 페어 분리 방지
      }
      target['r41_ov_' + i] = s.slice(pos, end);
      pos = end; i++;
    }
    return { keys: i, bytes: s.length };
  }

  // ---- 상태 -------------------------------------------------------------
  var R41 = {
    pages: PAGES_R41,
    entries: [],        // [{p,f,t}]
    page: 'home',       // iframe 이 보고 있는 페이지
    dirty: false,
    norm: norm,

    name: function (id) {
      for (var i = 0; i < PAGES_R41.length; i++) {
        if (PAGES_R41[i][0] === id) return PAGES_R41[i][1];
      }
      return id;
    },

    // S.content 에서 읽어온다 (발행본 pullCms + 임시저장 localStorage 양쪽 반영됨)
    pull: function () {
      try { R41.entries = decode(S.content || {}); } catch (e) { R41.entries = []; }
      return R41.entries.length;
    },

    find: function (page, from) {
      var f = norm(from);
      for (var i = 0; i < R41.entries.length; i++) {
        if (R41.entries[i].p === page && norm(R41.entries[i].f) === f) return i;
      }
      return -1;
    },

    put: function (page, from, to) {
      var f = norm(from), t = String(to == null ? '' : to);
      if (!f) return false;
      var i = R41.find(page, f);
      if (!norm(t) || norm(t) === f) {          // 원문과 같으면 = 되돌리기
        if (i >= 0) R41.entries.splice(i, 1);
      } else if (i >= 0) {
        R41.entries[i].t = t;
      } else {
        R41.entries.push({ p: page, f: f, t: t });
      }
      R41.dirty = true;
      return true;
    },

    remove: function (page, from) {
      var i = R41.find(page, from);
      if (i < 0) return false;
      R41.entries.splice(i, 1);
      R41.dirty = true;
      return true;
    },

    // 💾 임시저장 — S.content 에 청크로 굽고 localStorage 로 내린다.
    // 방문자에게 나가는 건 🚀 발행(publishCms) 때다. r37 과 같은 규칙.
    save: function () {
      // ★ S 는 admin.html 에서 `let S` 라 window.S 가 아니다 (전역 렉시컬).
      //    window.S 로 검사하면 항상 실패한다.
      var c = null;
      try { c = (typeof S !== 'undefined' && S.content) ? S.content : null; } catch (e) { }
      if (!c) return { keys: 0, bytes: 0 };
      var r = encode(R41.entries, c);
      try { saveLocal(); } catch (e) { }
      R41.dirty = false;
      if (r.bytes > WARN_BYTES) {
        try { toast('저장 용량이 큽니다 (' + r.bytes + '자) — 항목을 줄이세요', true); } catch (e) { }
      }
      return r;
    },

    encode: encode,
    decode: decode
  };

  window.R41 = R41;

  // ---- 관리자 화면에 메뉴/뷰를 붙인다 ------------------------------------
  // rSidebar / rView 는 admin.html 최상위 function 선언 → window 속성이다.
  // 원본을 지우지 않고 감싼다 (r40 이 rDashboard 를 덮은 것과 같은 방식).
  var origSidebar = window.rSidebar;
  var origView = window.rView;

  window.rSidebar = function () {
    origSidebar.apply(this, arguments);
    var n = document.getElementById('sbNav');
    if (!n) return;
    var ac = (typeof S !== 'undefined' && S.view === 'livedit') ? 'active' : '';
    var btn = '<button class="sb-item ' + ac + '" onclick="nav(\'livedit\')">' +
      '<span class="ic">🖥️</span>화면에서 편집</button>';
    // 「콘텐츠」 섹션의 「페이지 편집」 바로 뒤에 끼운다
    var items = n.querySelectorAll('.sb-item');
    for (var i = 0; i < items.length; i++) {
      if (items[i].getAttribute('onclick') === "nav('pages')") {
        items[i].insertAdjacentHTML('afterend', btn);
        return;
      }
    }
    n.insertAdjacentHTML('beforeend', btn);
  };

  window.rView = function () {
    if (typeof S !== 'undefined' && S.view === 'livedit') {
      var tbm = document.getElementById('tbMode');
      if (tbm) tbm.textContent = (typeof USE_FIREBASE !== 'undefined' && USE_FIREBASE) ? 'Firebase 연결' : '로컬 모드';
      var tbt = document.getElementById('tbTitle');
      if (tbt) tbt.textContent = '화면에서 편집';
      var ct = document.getElementById('ct');
      if (ct) {
        if (typeof window.rLiveEdit === 'function') {
          R41.pull();
          ct.innerHTML = window.rLiveEdit();
          if (typeof window.r41Mount === 'function') window.r41Mount();
        } else {
          ct.innerHTML = '<div style="padding:40px;color:#94a3b8">화면 편집 모듈을 불러오지 못했습니다 (usung-r41-ui.js).</div>';
        }
      }
      return;
    }
    return origView.apply(this, arguments);
  };
})();
