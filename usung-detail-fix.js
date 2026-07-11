/* 유성에이스 상세페이지 보정 오버레이 (Phase 2)
   - 데스크톱: 상품 이미지 약 30% 확대 (max-height 440 -> 572, 박스 여백/최소높이 상향)
   - 모바일: 상품 이미지 30%+ 확대 (카드 풀블리드 + 여백 최소화 + 72vh)
   - 상담 문의 버튼: tel: 전화 -> 문의 페이지(navigate)로 연결
   되돌리기: inject.js 에서 본 파일 <script> 한 줄 제거 + 파일 삭제
   * usung-review.js(핵심 렌더)는 전혀 건드리지 않음 */
(function () {
  if (window.__usungDetailFix) return;
  window.__usungDetailFix = true;

  /* ---- 1) 상세 이미지 크기 보정 (CSS, :has 기반) ---- */
  var css = ''
    + '@media (min-width:768px){'
    +   '#up-hero{max-height:572px!important}'
    +   '#up-main div:has(> #up-hero){padding:1.25rem!important;min-height:560px!important}'
    + '}'
    + '@media (max-width:767px){'
    +   '#up-main > div.bg-white.rounded-3xl{margin-left:-1rem!important;margin-right:-1rem!important;border-radius:1rem!important}'
    +   '#up-main div:has(> #up-hero){padding:0.25rem!important;min-height:0!important}'
    +   '#up-hero{max-height:72vh!important}'
    + '}';
  var st = document.createElement('style');
  st.id = 'usung-detail-fix-css';
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

  /* ---- 2) 상담 문의 버튼: 전화 대신 문의 페이지 ---- */
  document.addEventListener('click', function (e) {
    var t = e.target;
    if (!t || !t.closest) return;
    var a = t.closest('#up-main a[href="tel:1588-9123"]');
    if (!a) return;
    e.preventDefault();
    e.stopPropagation();
    if (typeof window.navigate === 'function') {
      window.navigate('about', 'inquiry-section');
    }
  }, true);
})();
