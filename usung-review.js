/* =====================================================================
 * usung-review.js  —  "홈페이지내용정리_과장님과검토" 반영 오버레이
 * ---------------------------------------------------------------------
 * 원본(index_v6.html)·theme-white.css·usung-overlay.js 를 건드리지 않고
 * DOM 패치만으로 과장님 검토 요청사항을 적용한다.
 * 이 파일을 inject 목록에서 빼면 즉시 원복(되돌리기 안전).
 *
 * [적용 현황]
 *  slide 3  홈 히어로 — "대한민국 덕트 No.1"만, 하단에 제품라인업/견적문의 버튼
 *  slide 4  FIM 헤딩 "움직임으로"(shimmer) 너무 연함 → 주변과 동일 진한 네이비
 *  slide 5  스탯 스트립 + FIM 카드 그리드(빨간 네모칸) 삭제
 * ===================================================================== */
(function () {
  'use strict';

  var NAVY  = '#0c1e5a';
  var BRAND = '#1e40af';

  function setImp(el, prop, val) { try { el.style.setProperty(prop, val, 'important'); } catch (e) {} }

  /* ---- slide 3 : 홈 히어로 ------------------------------------------ */
  function homeHero() {
    var hero = document.getElementById('anim-hero');
    if (!hero) return;
    // "오늘을 이끄는 원동력." 부제 숨김 → 큰 타이틀은 "대한민국 덕트 No.1"만
    hero.querySelectorAll('[data-cms="h_sub"], [data-i18n="hero_sub"]').forEach(function (el) {
      el.style.display = 'none';
    });
    // 하단에 바로 제품 라인업 / 견적 문의 버튼 (1회 주입)
    if (!hero.querySelector('#ace-hero-cta')) {
      var wrap = document.createElement('div');
      wrap.id = 'ace-hero-cta';
      wrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:14px;justify-content:center;margin-top:32px;';
      wrap.innerHTML =
        '<button type="button" onclick="navigate(\'products\')" ' +
          'style="padding:15px 34px;border-radius:9999px;font-weight:800;font-size:16px;border:none;' +
          'cursor:pointer;background:' + BRAND + ';color:#fff;letter-spacing:-.01em;' +
          'box-shadow:0 12px 32px -8px rgba(30,64,175,.6);transition:transform .15s;" ' +
          'onmouseover="this.style.transform=\'scale(1.05)\'" onmouseout="this.style.transform=\'scale(1)\'">제품 라인업 보기</button>' +
        '<button type="button" onclick="navigate(\'about\',\'inquiry-section\')" ' +
          'style="padding:15px 34px;border-radius:9999px;font-weight:800;font-size:16px;' +
          'cursor:pointer;background:rgba(255,255,255,.9);color:' + NAVY + ';' +
          'border:1.5px solid ' + NAVY + ';letter-spacing:-.01em;transition:transform .15s;" ' +
          'onmouseover="this.style.transform=\'scale(1.05)\'" onmouseout="this.style.transform=\'scale(1)\'">견적 문의</button>';
      hero.appendChild(wrap);
    }
  }

  /* ---- slide 4 : FIM 헤딩 "움직임으로" 진하게 ------------------------ */
  function fimHeading() {
    document.querySelectorAll('#page-home .shimmer-text, #page-home [data-cms="fim_title_b"]').forEach(function (el) {
      setImp(el, 'background', 'none');
      setImp(el, 'background-image', 'none');
      setImp(el, '-webkit-background-clip', 'initial');
      setImp(el, 'background-clip', 'initial');
      setImp(el, 'color', NAVY);
      setImp(el, '-webkit-text-fill-color', NAVY);
      setImp(el, 'animation', 'none');
      setImp(el, 'font-weight', '900');
    });
    var a = document.querySelector('#page-home [data-cms="fim_title_a"]');
    if (a) {
      var head = a.closest('h2');
      if (head) {
        setImp(head, 'color', NAVY);
        setImp(head, '-webkit-text-fill-color', NAVY);
        setImp(head, 'background', 'none');
        setImp(head, 'background-image', 'none');
        setImp(head, 'text-shadow', '0 1px 0 rgba(12,30,90,.30)');
      }
    }
  }

  /* ---- slide 5 : 빨간 네모칸 삭제 (스탯 스트립 + FIM 카드) ----------- */
  function homeRemoveBoxed() {
    // 임팩트 카피 "대한민국의 기술 유성에이스 세계로 나아갑니다."
    var impact = document.querySelector('#page-home [data-i18n="impact_copy"]');
    if (impact) { var box = impact.closest('div'); if (box) box.style.display = 'none'; }
    // 스탯 스트립 28+ / 20y / 360° / 100%
    document.querySelectorAll('#page-home .count').forEach(function (c) {
      var g = c.closest('.grid'); if (g) g.style.display = 'none';
    });
    // FIM 카드 그리드(4장)
    document.querySelectorAll('#page-home .fcard').forEach(function (card) {
      var g = card.closest('.grid'); if (g) g.style.display = 'none';
    });
  }

  /* ---- 실행 하네스 -------------------------------------------------- */
  function applyAll() {
    try { homeHero(); }        catch (e) {}
    try { fimHeading(); }      catch (e) {}
    try { homeRemoveBoxed(); } catch (e) {}
  }

  function init() {
    applyAll();
    var n = 0;
    var iv = setInterval(function () { applyAll(); if (++n > 80) clearInterval(iv); }, 200);
    try {
      new MutationObserver(applyAll).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
