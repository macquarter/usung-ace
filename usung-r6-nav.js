/* usung-r6-nav.js — 0730 "6번째 수정" 반영 (메인페이지·고객센터 PPT S4)
 *   S4-1  고객센터 드롭다운의 '견적 상담' 항목 삭제
 *         ('공지사항'은 usung-r5-nav.js 가 이미 숨김 — 여기서는 중복 처리하지 않음)
 *   S4-2  상단 내비게이션 타이틀 '고객센터' → '공지게시판' (5개 언어 전부)
 *         · 데스크톱 상단 버튼: data-i18n="nav_customer" → I18N 사전을 getter 로 잠가
 *           setLang() 이 매번 '공지게시판' 을 렌더하도록 한다(깜빡임 0, i18n.js 미수정).
 *         · 모바일 메뉴 그룹 헤딩: data-i18n 이 없는 하드코딩 <div> 라 텍스트로 직접 치환.
 *
 * 원본 index_v6.html 불변. 런타임 오버레이만 사용.
 * 되돌리기: api/inject.js 에서 이 파일 script 1줄 제거 + 파일 삭제.
 */
(function () {
  'use strict';
  if (window.__usungR6Nav) return;
  window.__usungR6Nav = true;

  /* 상단 내비 새 라벨 — usung-r5-nav.js 의 BOARD 맵과 동일한 표기를 사용한다 */
  var BOARD = {
    ko: '공지게시판',
    en: 'Notice Board',
    ja: 'お知らせ掲示板',
    vi: 'Bảng thông báo',
    zh: '公告栏'
  };

  /* i18n / 다른 오버레이가 되돌리려는 옛 '고객센터' 라벨(전 언어) */
  var CUSTOMER_OLD = ['고객센터', 'Support', 'お客様センター', 'Hỗ trợ', '客户中心', 'Customer Center'];

  function curLang() {
    try {
      return (typeof window.getLang === 'function' && window.getLang()) || 'ko';
    } catch (e) { return 'ko'; }
  }
  function boardVal() { return BOARD[curLang()] || BOARD.ko; }

  /* ---- S4-2 : I18N 사전의 nav_customer 를 '공지게시판' 으로 잠금 ---- */
  function lockNavCustomer() {
    try {
      var I = window.I18N;
      if (!I) return false;
      for (var L in BOARD) {
        if (!I[L]) continue;
        var dict = I[L];
        var d = Object.getOwnPropertyDescriptor(dict, 'nav_customer');
        if (d && typeof d.get === 'function') continue;   // 이미 잠김
        (function (dd, val) {
          try {
            Object.defineProperty(dd, 'nav_customer', {
              configurable: true, enumerable: true,
              get: function () { return val; },
              set: function () {}
            });
          } catch (e) { try { dd.nav_customer = val; } catch (_) {} }
        })(dict, BOARD[L]);
      }
      return true;
    } catch (e) { return false; }
  }

  /* ---- S4-2 : 실제 엘리먼트 반영 (사전 잠금 직후 1회 렌더가 늦을 때 대비) ---- */
  function relabelDesktop() {
    try {
      var want = boardVal();
      var els = document.querySelectorAll('[data-i18n="nav_customer"]');
      for (var i = 0; i < els.length; i++) {
        var t = (els[i].textContent || '').trim();
        if (t !== want) els[i].textContent = want;
      }
    } catch (e) {}
  }

  /* ---- S4-2 : 모바일 메뉴의 하드코딩 그룹 헤딩 '고객센터' 처리 ----
     data-i18n 이 없어 언어 전환에 반응하지 않으므로, 한 번 처리한 엘리먼트에
     __r6cust 플래그를 남겨 이후 langchange 마다 현재 언어로 다시 쓴다.
     그룹 안에 이미 같은 이름('공지게시판')의 항목이 보이면 헤딩은 중복이므로 숨긴다. */
  function groupHasSameLabel(hdr, want) {
    try {
      var p = hdr.parentElement;
      if (!p) return false;
      var bs = p.querySelectorAll('button');
      for (var i = 0; i < bs.length; i++) {
        if (bs[i].style.display === 'none') continue;
        if ((bs[i].textContent || '').trim() === want) return true;
      }
    } catch (e) {}
    return false;
  }

  function relabelMobileHeading() {
    try {
      var want = boardVal();
      var hdrs = document.querySelectorAll('header div, #mobile-menu div, nav div');
      for (var i = 0; i < hdrs.length; i++) {
        var el = hdrs[i];
        if (el.children.length !== 0) continue;            // 리프 노드만
        if (el.getAttribute('data-i18n')) continue;        // 사전이 관리하는 건 제외
        var t = (el.textContent || '').trim();
        if (el.__r6cust || CUSTOMER_OLD.indexOf(t) >= 0) {
          el.__r6cust = 1;
          if (t !== want) el.textContent = want;
          var dup = groupHasSameLabel(el, want);
          el.style.display = dup ? 'none' : '';
        }
      }
    } catch (e) {}
  }

  /* ---- S4-1 : '견적 상담' 항목 숨김 ---- */
  function hideInquiry() {
    try {
      var els = document.querySelectorAll('[data-i18n="nav_inquiry"], [data-i18n="nav_inquiry_desc"]');
      for (var i = 0; i < els.length; i++) {
        var btn = els[i].closest('button') || els[i];
        var li = btn.closest('li');
        if (li) li.style.display = 'none';
        else btn.style.display = 'none';
      }
    } catch (e) {}
  }

  function apply() {
    relabelDesktop();
    relabelMobileHeading();
    hideInquiry();
  }

  function run() {
    lockNavCustomer();
    // 사전을 잠근 직후 현재 언어로 한 번 재렌더 → 옛 라벨이 남아 있지 않게 한다
    try {
      if (typeof window.setLang === 'function' && typeof window.getLang === 'function') {
        window.setLang(window.getLang());
      }
    } catch (e) {}
    apply();
  }

  run();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);

  /* i18n.js 및 다른 오버레이의 늦은 재렌더를 흡수 (약 4초간) */
  var n = 0, iv = setInterval(function () { apply(); if (++n > 40) clearInterval(iv); }, 100);

  /* 언어 전환 — i18n.js 는 document 에 dispatch 한다 */
  try { document.addEventListener('langchange', apply); } catch (e) {}
  try { window.addEventListener('langchange', apply); } catch (e) {}

  /* 다른 스크립트가 내비를 재렌더해도 다시 적용 */
  try {
    var pend = false;
    var mo = new MutationObserver(function () {
      if (pend) return;
      pend = true;
      setTimeout(function () { pend = false; apply(); }, 120);
    });
    mo.observe(document.body, { childList: true, subtree: true });
  } catch (e) {}

  /* 페이지 이동 후에도 재적용 (기존 래퍼 플래그 보존) */
  try {
    var orig = window.navigate;
    if (typeof orig === 'function' && !orig.__r6nav) {
      var w = function () {
        var r = orig.apply(this, arguments);
        setTimeout(apply, 60);
        return r;
      };
      w.__r6nav = true;
      try {
        w.__usungNav = orig.__usungNav; w.__t8 = orig.__t8;
        w.__r5company = orig.__r5company; w.__r5nav = orig.__r5nav;
        w.__boardNavWrapped = orig.__boardNavWrapped;
      } catch (e) {}
      window.navigate = w;
    }
  } catch (e) {}
})();
