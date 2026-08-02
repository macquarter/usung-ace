/* 유성에이스 상세페이지 보정 오버레이 (Phase 3b · #144 재확대)
   문제: 이전 max-height 상향만으로는 세로형 제품이미지가 "폭(그리드 50/50 칼럼)"에
        막혀 실제 크기 변화가 없었음(933x1400 이미지가 435x653으로 폭 제한됨).
   해결: 상세 히어로 그리드를 이미지쪽으로 넓힘(1.5fr : 1fr) + max-height 상향.
   - 데스크톱: 이미지 칼럼 폭 확대 + max-height 780 -> 실제로 크게 렌더
   - 모바일: 카드 풀블리드 + 여백 최소 + 88vh
   되돌리기: inject.js 에서 본 파일 <script> 한 줄 제거 + 파일 삭제
   ※ 상담 문의 버튼을 tel: 대신 문의 페이지로 보내던 가로채기는 제거했다(2026-08-02).
     260729 회의록 2번이 "무조건 전화연결로만" 으로 뒤집었고 문의 폼 자체가 사라졌다.
   * usung-review.js(핵심 렌더)는 전혀 건드리지 않음 */
(function () {
  if (window.__usungDetailFix) return;
  window.__usungDetailFix = true;

  /* ---- 1) 상세 이미지 크기 보정 (CSS) ----
     핵심: 히어로 이미지가 든 md:grid-cols-2 그리드를 이미지쪽으로 넓힌다.
     :has(#up-hero) 로 "이미지가 실제로 들어있는 그 그리드"만 정확히 타겟팅. */
  var css = ''
    + '@media (min-width:768px){'
    +   '#up-main .md\\:grid-cols-2:has(#up-hero){grid-template-columns:1.5fr 1fr!important;gap:2rem!important;align-items:stretch!important}'
    +   '#up-hero{max-height:780px!important}'
    +   '#up-main div:has(> #up-hero){padding:1.5rem!important;min-height:720px!important}'
    + '}'
    + '@media (max-width:767px){'
    +   '#up-main > div.bg-white.rounded-3xl{margin-left:-1rem!important;margin-right:-1rem!important;border-radius:1rem!important}'
    +   '#up-main div:has(> #up-hero){padding:0.25rem!important;min-height:0!important}'
    +   '#up-hero{max-height:88vh!important}'
    + '}';
  var st = document.createElement('style');
  st.id = 'usung-detail-fix-css';
  st.textContent = css;
  (document.head || document.documentElement).appendChild(st);

})();
