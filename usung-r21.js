/* usung-r21.js — 260810 추가 지시 2건
 *  ① 제품소개 하단 부품 티저 4종을 유성 부품번호 1·2·3·4 로 교체
 *  ② 상단 메가메뉴 좌측 캡션(CATEGORIES) → '제품 전체 보기' + 제품소개 대문 이동
 * index_v6.html · chatbot.js · usung-r8-* 생성물 모두 불변. */
(function () {
  'use strict';

  /* ── ① 부품 티저 4종 교체 ──────────────────────────────────────────────
   * PPT slide13 원문: 「제품소개 – 부품 대표 4종 멘트 삭제 / 순번대로 1,2,3,4
   * 이렇게 뜨게해주세요. / ← 해당제품이 대표적인 부품 x」
   * r20 은 이 지시를 '뱃지 숫자만 1·2·3·4 로 다시 쓰기'로 읽었는데,
   * 그러면 화면의 숫자와 실제 부품번호가 어긋난다(13·09·40·46 인데 1·2·3·4 로 표시).
   * 「해당제품이 대표적인 부품 x」 는 타일 자체를 가리키므로 **부품을 바꿔야** 맞다.
   *
   * 근거 — 슬라이드별 부품 목록 L(17종) 에서의 등장 빈도(usung-r19-parts-data.js):
   *   #2 측향캡 15/17 · #3 VD댐퍼 12/17 · #4 FVD댐퍼 12/17 ·
   *   #1 계열 반후지(1 / 1-1 / 1-2 합산) 17/17.
   * 즉 유성이 매긴 1~4번이 객관적으로 가장 보편적인 부품이다.
   *
   * PN 표(usung-r19-parts-data.js) 기준 1→p01 · 2→p02 · 3→p03 · 4→p04.
   * 뱃지는 partTileHTML 의 id.slice(1) 이라 '01'~'04' 로 찍히고,
   * r20 의 fixParts() 가 앞의 0 을 떼어 1·2·3·4 로 만든다(그 처리는 그대로 둔다).
   *
   * ★ 원본은 usung-r8-prod-a.js:137 의 `const PART_TEASER` 인데 그 파일은
   *   build_graft.py 생성물이라 수기 수정 금지(§3)다. 또 const 는 전역 렉시컬이라
   *   window 로 못 닿는다 → r19 가 renderParts 를 갈아끼운 것과 같은 방식으로
   *   함수 선언(=window 속성)인 renderPartsTeaser 를 통째로 교체한다. */
  var TEASER = ['p01', 'p02', 'p03', 'p04'];

  function drawTeaser() {
    var el = document.getElementById('parts-cat-grid');
    if (!el) return false;
    if (typeof window.partTileHTML !== 'function') return false;
    var h = '', i;
    for (i = 0; i < TEASER.length; i++) h += window.partTileHTML(TEASER[i]);
    el.innerHTML = h;
    el.setAttribute('data-r21', '1');
    /* 티저는 화면 하단이라 lazy 로 두면 비활성 탭·iframe 에서 영구 pending 이 된다(§3).
       4장뿐이라 즉시 로드로 바꾼다. */
    var im = el.querySelectorAll('img');
    for (i = 0; i < im.length; i++) im[i].setAttribute('loading', 'eager');
    return true;
  }

  /* r8Build() 안의 무자격 호출도 이 교체본으로 해석된다(함수 선언 = window 속성). */
  window.renderPartsTeaser = drawTeaser;

  function syncTeaser() {
    var el = document.getElementById('parts-cat-grid');
    if (!el) return;
    if (el.getAttribute('data-r21') === '1') return;   // 이미 우리 것 — 재렌더 금지(루프 방지)
    if (!el.innerHTML) return;                          // 아직 안 그려짐 — r8Build 가 그릴 것
    drawTeaser();
  }

  function watchTeaser() {
    var host = document.getElementById('page-products');
    if (!host) return false;
    if (!host.__r21t) {
      host.__r21t = 1;
      try {
        new MutationObserver(function () { syncTeaser(); })
          .observe(host, { childList: true, subtree: true });
      } catch (e) { console.warn('[r21] observe', e); }
    }
    syncTeaser();
    return true;
  }

  /* ── ② 메가메뉴 캡션 → '제품 전체 보기' ────────────────────────────────
   * 문구는 i18n.js 의 mega_categories 5개 언어를 바꿔 처리했다.
   * setLang() 이 DOMContentLoaded 와 navigate 직후(+60ms)마다 textContent 를
   * 다시 쓰므로 문구 자체는 자기치유된다 → 여기서는 **동작과 접근성만** 얹는다.
   *
   * ★ 클릭은 반드시 document 캡처 위임으로 잡는다.
   *   usung-overlay.js 의 installCleanMegaMenu() 가 200ms 마다 #mega-cat-list 를
   *   다시 그리고, setLang() 도 이 캡션의 textContent 를 계속 덮는다.
   *   요소별 리스너는 그 사이 빈틈에서 죽는다(r20 S10 · 홈 USE CASE 와 같은 처방). */
  var CAP = '[data-i18n="mega_categories"]';

  function goAllProducts() {
    /* ★ 진행 중인 대분류 라우팅을 먼저 취소한다(2026-08-10 신고 ②).
       usung-r5-fixes.js 의 정착 루프가 110ms 마다 goCat 을 다시 쏘고 있으면
       여기서 대문을 켜도 곧바로 되끌려간다(실측 최종 v-cat).
       취소 함수가 없는 옛 배포본에서도 조용히 넘어간다(안전한 열화). */
    try {
      if (typeof window.__usungRouteCancel === 'function') window.__usungRouteCancel();
    } catch (e) { console.warn('[r21] cancel', e); }
    try {
      if (typeof window.navigate === 'function') window.navigate('products');
    } catch (e) { console.warn('[r21] navigate', e); }
    /* mount 래퍼가 +60ms 뒤 syncFromPage(true) → goMain() 으로 v-main 을 켠다.
       늦은 부트에 덮이는 경우를 대비해 한 번만 더 확인 사살한다. */
    setTimeout(function () {
      var v = document.getElementById('v-main');
      if (v && v.classList.contains('on')) return;
      try { if (typeof window.goMain === 'function') window.goMain(); }
      catch (e) { console.warn('[r21] goMain', e); }
    }, 220);
  }

  function bindCap() {
    if (window.__r21cap) return;
    window.__r21cap = true;
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest(CAP) : null;
      if (!t) return;
      e.preventDefault();
      e.stopPropagation();
      goAllProducts();
    }, true);
    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Enter' && e.key !== ' ') return;
      var t = e.target && e.target.closest ? e.target.closest(CAP) : null;
      if (!t) return;
      e.preventDefault();
      goAllProducts();
    }, true);
  }

  /* 접근성 표식 — 문구는 i18n 이 맡고, 여기서는 역할만 붙인다. */
  function markCap() {
    var els = document.querySelectorAll(CAP), i, el;
    for (i = 0; i < els.length; i++) {
      el = els[i];
      if (el.getAttribute('data-r21c') === '1') continue;
      el.setAttribute('data-r21c', '1');
      el.setAttribute('role', 'button');
      el.setAttribute('tabindex', '0');
      el.classList.add('r21-allbtn');
    }
    return els.length > 0;
  }

  /* ── 부트 ─────────────────────────────────────────────────────────────
   * r8 뷰는 지연 렌더라 언제 심길지 모른다 → 100ms × 최대 8초 재시도.
   * 티저 감시자가 붙은 뒤에도 캡션은 언제든 다시 그려질 수 있어 계속 표식한다. */
  function tick() {
    watchTeaser();
    markCap();
  }

  function boot() {
    bindCap();
    tick();
    var n = 0;
    var iv = setInterval(function () {
      tick();
      if (++n > 80) clearInterval(iv);
    }, 100);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.addEventListener('load', tick);
})();
