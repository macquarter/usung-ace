/* usung-r42.js — 260817 모바일 최적화 (승연 요청 4번) + F1 문의 안전망
 * build-marker: r56-b1
 *
 * ★★ r56 (260820) — 승연 「모바일 하단에 대표전화 탭 삭제부탁해」
 *   ⑤ 하단 고정 전화 바(#r42-telbar)를 통째로 제거했다. 같이 빠진 것:
 *     buildTelbar() · syncTelbar() · watchCta()(IntersectionObserver) ·
 *     watchModals()(모달 4개 MutationObserver) · 상태 bar/visibleCta/io/MODAL_SEL
 *   CSS 짝인 `#r42-telbar` 규칙과 `body.r42-telbar-on{padding-bottom:56px}` 도
 *   usung-r42.css 에서 같이 뺐다(안 빼면 모바일 문서 끝에 56px 죽은 여백 — r50 함정).
 *   되살릴 땐 CSS/JS 를 따로 고르지 말고 커밋 단위로 되돌린다.
 *
 * ★ ④ 시공갤러리 전폭 문의 카드(.r42-gcta)는 r50 에서 제거했다(승연 지시).
 * ★ ①②③ 레이아웃 보정은 원래부터 usung-r42.css 가 전부 처리한다 — JS 몫이 없다.
 *
 * ★★ 그래서 이 파일에 남은 것은 **F1 안전망 하나뿐**이다. 텔바와 무관하니 같이 지우지 말 것.
 *
 * ★ r56 이후 모바일 전화 진입점(실측 대상):
 *     sticky 탭바의 #usung-r9-gal-cta 알약 · 회사소개 tel: 3개 ·
 *     제품소개 하단 .cta-l .btn(tel:15889123) · 각 모달의 「대표전화 문의하기」
 */
(function () {
  'use strict';

  var TEL = '1588-9123';
  var TEL_HREF = 'tel:1588-9123';

  /* ════════════════════════════════════════════════════
   * F1 안전망 — r9 가 못 떴을 때 문의가 조용히 사라지지 않게
   *
   * index_v6.html:5348 submitInquiry() 는 localStorage 에만 쌓고 성공 메시지를 띄운다.
   * 지금은 r9(usung-r9-excel.js)가 폼을 display:none 처리해 도달 불가지만, r9 로드가
   * 실패하면 폼이 보이고 방문자는 「접수됐다」고 믿은 채 회사에는 아무것도 안 간다.
   * 회사 방침이 「무조건 전화」이므로(260729 미팅) 저장 대신 전화로 보낸다.
   * ════════════════════════════════════════════════════ */
  function guardInquiry() {
    if (typeof window.submitInquiry !== 'function' || window.submitInquiry.__r42) return;
    var guarded = function (e) {
      if (e && e.preventDefault) e.preventDefault();
      alert('죄송합니다. 온라인 문의 접수는 운영하지 않습니다.\n' +
            '대표전화 ' + TEL + ' 로 연락 주시면 바로 상담해 드립니다.');
      window.location.href = TEL_HREF;
      return false;
    };
    guarded.__r42 = 1;
    window.submitInquiry = guarded;
  }

  /* ════════════════════════════════════════════════════
   * 마운트
   *
   * ★ r56 에서 body 전역 MutationObserver 를 뺐다. 그건 텔바가 관찰하던
   *   tel: 링크·모달이 r8 뷰 렌더 뒤에 생겨서 필요했던 것이고, submitInquiry 는
   *   index_v6.html 인라인 함수 선언 하나뿐이라(전 리포 grep 결과 재정의 0건)
   *   DOMContentLoaded 시점에 이미 존재한다. 갤러리 100여 장이 그려질 때
   *   subtree 감시를 계속 도는 비용만 남았을 뿐이라 제거했다.
   *   늦게 로드되는 경로만 load 에서 한 번 더 덮는다(guardInquiry 는 멱등).
   * ════════════════════════════════════════════════════ */
  function start() {
    guardInquiry();
    window.addEventListener('load', guardInquiry);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
