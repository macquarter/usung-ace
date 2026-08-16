/* usung-r29-parts.js — 260812_홈페이지_수정_r2.pptx S12·S13·S14(부품 제외) · S15(부품명)
 *
 * 왜 오버레이인가
 *   부품 목록의 단일 진실 원천은 usung-r19-parts-data.js 의 L 표다. 그런데 그 표는
 *   **여러 제품이 같은 줄을 공유**한다 — BALL_J 한 줄을 「후레쉬볼 자바라」와
 *   「신형 후레쉬볼 자바라」가 같이 쓰고, PIPE_S 한 줄을 파이프 양옆태엽·텐션·기타옵션이
 *   같이 쓴다. 덱은 그중 **한 제품에서만** 빼라고 했다. L 을 직접 고치면 지시하지 않은
 *   제품에서도 조용히 부품이 사라진다. 그래서 R19.plan(model) 결과를 모델별로 거른다.
 *
 * 어떻게 고르나
 *   R19.plan 은 usung-r19-parts.js:108 이 부르는 유일한 입구다. 여기 하나만 감싸면
 *   모달의 부품 구성 전체가 덮인다.
 *
 * ★ 덱 빨간동그라미 → 부품 id 환산은 PPT 번호를 거친다(PPT 번호 != 리포 번호).
 *   환산표는 usung-r19-parts-data.js 의 PN 한 곳뿐이다. 아래 주석의 괄호가 PPT 번호다.
 *
 * 되돌리기: 이 파일 삭제 + api/inject.js 의 링크 1줄 삭제.
 */
(function () {
  'use strict';

  var w = window;

  /* S12 — 파이프 > 기타옵션 > 125Ø고정텐션. 부품 13종 중 첫 줄 7종을 뺀다.
     빨간 타원이 7칸짜리 첫 행 전체를 감싼다. 둘째 줄 6종(갓210·갓250·기름받이속·
     기름받이망·일체형기름받이·기름받이150Ø)은 「유지」라고 본문에 적혀 있다.
     ★ 같은 PIPE_S 를 쓰는 양옆태엽·텐션·파이프옵션·모터옵션은 덱이 지시하지 않았다 —
       건드리지 않는다(그쪽은 이 7종이 실제 구성품이다). */
  var TENSION = ['p01', 'p02', 'p03', 'p04', 'p09', 'p10', 'p11'];
  //              1     2      3      4     (7)    (8)    (9)   ← PPT 번호
  //           반후지 측향캡  VD    FVD  원형상향 원형측향 사각측향

  /* S13 — 「후레쉬볼 자바라」에서 3종 제외. 신형 전용 부품이라는 것이 이유다.
     p22 가 이름부터 「신형 자바라 하부봉대」인 것이 교차검증이다. */
  var BALL_OLD = ['p22', 'p27', 'p26'];
  //              (44)  (20)   (24)
  //          신형자바라하부봉대 · 기름받이114Ø · 유지망114Ø

  /* S14 — 「신형 후레쉬볼 자바라」에서 8종 제외. 구형 전용 부품이라는 것이 이유다.
     빨간동그라미 3개(1행 끝 1칸 + 2행 앞 4칸 + 3행 앞 3칸) = 8칸.
     p21 이 「자바라 하부봉대」(구형)인 것이 S13 과 정확히 대칭이라 교차검증된다. */
  var BALL_NEW = ['p21', 'p28', 'p29', 'p30', 'p31', 'p42', 'p43', 'p44'];
  //              (42)  (26)   (27)   (28)   (29)   (39)   (40)   (41)
  //         자바라하부봉대 · 기름받이150Ø · 기름받이속 · 기름받이망 ·
  //         일체형기름받이 · 교체용후레쉬볼세트 · 후레쉬볼커버상 · 후레쉬볼커버하

  function dropList(m) {
    if (!m) return null;
    var cat = m.cat || '', mid = m.mid || '', grp = m.grp || '';
    if (cat === '파이프' && mid === '기타옵션' && grp === '125Ø고정텐션') return TENSION;
    if (cat === '후레쉬볼') {
      if (mid === '후레쉬볼 자바라') return BALL_OLD;
      if (mid === '신형 후레쉬볼 자바라') return BALL_NEW;
    }
    return null;
  }

  function patch(m, p) {
    if (!p || !p.ids) return p;
    var d = dropList(m);
    if (d) {
      p.ids = p.ids.filter(function (id) { return d.indexOf(id) < 0; });
    }
    /* S15 — 「부품명이 '150Ø기름받이' 단일로 표기해주세요」.
       지금은 nm '기름받이' + sp '150Ø' 두 줄로 뜬다. sp 를 비우고 nm 에 합친다.
       over 는 plan() 이 호출마다 새로 만드는 객체라 덮어써도 안전하다. */
    if (p.over) p.over.p28 = { nm: '150Ø기름받이', sp: '' };
    return p;
  }

  function wrap() {
    if (w.__r29parts) return true;
    if (!w.R19 || typeof w.R19.plan !== 'function') return false;
    var orig = w.R19.plan;
    w.R19.plan = function (m) {
      var p = orig.apply(this, arguments);
      try { return patch(m, p); } catch (e) { console.warn('[r29] plan', e); return p; }
    };
    w.__r29parts = 1;
    return true;
  }

  /* defer 순서상 r19-parts-data 는 이미 실행됐지만, 늦게 붙는 경우를 위한 짧은 재시도. */
  if (!wrap()) {
    var n = 0;
    var iv = setInterval(function () {
      if (wrap() || ++n > 80) clearInterval(iv);
    }, 100);
  }
})();
