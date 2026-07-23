/* usung-r5-nav.js — r5 반영 (S18·S20·S21·S23): 네비/푸터 탭 정리·개명
   - S18 부품소개 탭 삭제 (상세 하단 병합은 별건)
   - S20 "기술 및 인증현황" → "기술력" (nav_tech)
        · usung-review.js relabelTechNav() 가 매 패스 textContent 를 '기술 및 인증현황' 으로
          직접 덮어쓰므로, 사전(dict) 잠금만으로는 부족 → 해당 엘리먼트의 textContent setter 를
          가로채 옛 라벨 입력을 현재 언어의 '기술력' 으로 치환한다(깜빡임 0, review.js 미수정).
   - S21 사용방법 탭 삭제
   - S23 공지사항 탭 삭제 + 게시판 → 공지게시판, 고객센터 상단 클릭 시 board로
   전부 try/catch. 되돌리기: inject.js 스크립트 1줄 제거 + 파일 삭제 */
(function () {
  if (window.__usungR5Nav) return;
  window.__usungR5Nav = true;

  var BOARD = { ko:'공지게시판', en:'Notice Board', ja:'お知らせ掲示板', vi:'Bảng thông báo', zh:'公告栏' };
  var BOARD_TAG = { ko:'BOARD · 공지게시판', en:'BOARD', ja:'BOARD · お知らせ掲示板', vi:'BOARD · Bảng thông báo', zh:'BOARD · 公告栏' };
  var NAV_TECH = { ko:'기술력', en:'Technology', ja:'技術力', vi:'Công nghệ', zh:'技术实力' };
  /* usung-review.js / usung-navfix.js 가 되돌리려는 옛 라벨(전 언어) */
  var TECH_OLD = ['기술 및 인증현황', 'Technology & Certification', '技術・認証現況', 'Công nghệ & Chứng nhận', '技术及认证', '기술'];
  /* 게시판 페이지 제목 H1(하드코딩, data-i18n 없음)이 되돌리려는 옛 제목(전 언어) */
  var BOARD_OLD = ['게시판', 'Board', '掲示板', 'Diễn đàn', '论坛'];

  function curLang() { try { return (typeof window.getLang === 'function' && window.getLang()) || 'ko'; } catch (e) { return 'ko'; } }
  function techVal() { return NAV_TECH[curLang()] || NAV_TECH.ko; }
  function boardVal() { return BOARD[curLang()] || BOARD.ko; }

  /* nav_tech 를 각 언어 사전에 '잠금'(getter/setter)으로 고정 (setLang 이 곧바로 기술력 렌더) */
  function lockNavTech() {
    try {
      var I = window.I18N; if (!I) return false;
      for (var L in NAV_TECH) {
        if (!I[L]) continue;
        var dict = I[L];
        var d = Object.getOwnPropertyDescriptor(dict, 'nav_tech');
        if (d && typeof d.get === 'function') continue;
        (function (dd, val) {
          try {
            Object.defineProperty(dd, 'nav_tech', {
              configurable: true, enumerable: true,
              get: function () { return val; },
              set: function () {}
            });
          } catch (e) { try { dd.nav_tech = val; } catch (_) {} }
        })(dict, NAV_TECH[L]);
      }
      return true;
    } catch (e) { return false; }
  }

  /* 각 nav_tech 엘리먼트의 textContent setter 가로채기 → 옛 라벨 입력을 기술력으로 치환 */
  var TCDESC = null;
  try { TCDESC = Object.getOwnPropertyDescriptor(Node.prototype, 'textContent'); } catch (e) {}
  function lockTechText() {
    try {
      if (!TCDESC || typeof TCDESC.set !== 'function' || typeof TCDESC.get !== 'function') return;
      var els = document.querySelectorAll('[data-i18n="nav_tech"]');
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        if (el.__r5techLock) continue;
        el.__r5techLock = 1;
        try {
          Object.defineProperty(el, 'textContent', {
            configurable: true,
            get: function () { return TCDESC.get.call(this); },
            set: function (v) {
              var vv = ('' + v).trim();
              if (TECH_OLD.indexOf(vv) >= 0) vv = techVal();
              TCDESC.set.call(this, vv);
            }
          });
          TCDESC.set.call(el, techVal()); // 즉시 반영
        } catch (e) {}
      }
    } catch (e) {}
  }

  /* 게시판 페이지 제목 H1 을 현재 언어의 '공지게시판' 으로 치환 (하드코딩 H1, 사전으로 못 미침) */
  function relabelBoardTitle() {
    try {
      var pg = document.getElementById('page-board'); if (!pg) return;
      var hs = pg.querySelectorAll('h1');
      for (var i = 0; i < hs.length; i++) {
        var h = hs[i];
        if (h.getAttribute('data-i18n')) continue;   // 사전이 관리하는 건 건드리지 않음
        var t = (h.textContent || '').trim();
        var want = boardVal();
        if (BOARD_OLD.indexOf(t) >= 0 && t !== want) h.textContent = want;
        else if (t !== want && (t === '게시판' || t === 'Board' || t === '掲示板' || t === 'Diễn đàn' || t === '论坛' || Object.keys(BOARD).some(function(k){return BOARD[k]===t;}))) h.textContent = want;
      }
    } catch (e) {}
  }

  function patchDict() {
    try {
      var I = window.I18N; if (!I) return false;
      for (var L in BOARD) {
        if (!I[L]) continue;
        I[L].nav_board = BOARD[L];
        I[L].board_title = BOARD[L];
        I[L].board_tag = BOARD_TAG[L];
      }
      lockNavTech();
      if (typeof window.setLang === 'function' && typeof window.getLang === 'function') {
        try { window.setLang(window.getLang()); } catch (e) {}
      }
      return true;
    } catch (e) { return false; }
  }

  function hideByI18n(key, dropdownChild) {
    var els = document.querySelectorAll('[data-i18n="' + key + '"]');
    for (var i = 0; i < els.length; i++) {
      var btn = els[i].closest('button') || els[i];
      var li = btn.closest('li');
      var navItem = btn.closest('.nav-item');
      if (li) li.style.display = 'none';
      else if (dropdownChild) btn.style.display = 'none';
      else if (navItem) navItem.style.display = 'none';
      else btn.style.display = 'none';
    }
  }

  function apply() {
    try {
      lockTechText();                   // nav_tech textContent setter 잠금 + 기술력 반영
      relabelBoardTitle();              // 게시판 페이지 제목 H1 → 공지게시판
      hideByI18n('nav_parts', false);   // 부품소개 (독립 nav-item / 모바일 버튼 / 푸터 li)
      hideByI18n('nav_manual', true);   // 사용방법 (기술 드롭다운 자식 — 버튼만)
      hideByI18n('nav_notice', true);   // 공지사항 (고객센터 드롭다운 자식 — 버튼만)
      // 고객센터 상단 버튼 → board 로 라우팅
      var cust = document.querySelectorAll('[data-i18n="nav_customer"]');
      for (var i = 0; i < cust.length; i++) {
        var b = cust[i].closest('button');
        if (b && b.getAttribute('onclick') !== "navigate('board')") b.setAttribute('onclick', "navigate('board')");
      }
    } catch (e) {}
  }

  function run() { patchDict(); apply(); }
  run();
  var n = 0, iv = setInterval(function () { run(); if (++n > 40) clearInterval(iv); }, 100);
  try { window.addEventListener('langchange', apply); } catch (e) {}
  try {
    var pend = false;
    var mo = new MutationObserver(function () {
      if (pend) return; pend = true;
      setTimeout(function () { pend = false; apply(); }, 120);
    });
    mo.observe(document.body, { childList: true, subtree: true });
  } catch (e) {}
  try {
    var orig = window.navigate;
    if (typeof orig === 'function' && !orig.__r5nav) {
      var w = function () { var r = orig.apply(this, arguments); setTimeout(run, 60); return r; };
      w.__r5nav = true;
      try { w.__usungNav = orig.__usungNav; w.__t8 = orig.__t8; w.__r5company = orig.__r5company; w.__boardNavWrapped = orig.__boardNavWrapped; } catch (e) {}
      window.navigate = w;
    }
  } catch (e) {}
})();
