/* usung-r25.js — LED조명 제품 나열 순서를 PPT 순서에 맞춘다
 * ---------------------------------------------------------------------------
 * 근거 : 260722_유성에이스/260809 라스트/260807_홈페이지_수정2.pptx
 *        S15~S26 의 **슬라이드 제목**. 수정1최종 대비 바뀐 것은 제목뿐이고
 *        본문 지시문(부품 목록 · 표기 주의 · 색상표)은 한 글자도 안 바뀌었다.
 *        (zip 멤버 CRC 대조 : slide14~26 만 변경 · 추가/삭제 0)
 *
 * ★ 왜 지금까지 못 잡혔나
 *   구 덱은 갓등 4슬라이드 제목이 전부 「LED 갓등」으로 같아 **모델별 귀속이 불가능**했다.
 *   그래서 r19b 는 중분류 묶음 순서(갓등→우주선,아크릴→디자인등)까지만 확인했고
 *   **중분류 안쪽의 모델 순서는 한 번도 안 봤다.** S14 의
 *   「LED 제품 보이는 순서가 전달해드린 것과 달라서 다시 언급 드립니다」가 그 지적이다.
 *
 * ★ 실제로 바뀌는 것은 자리 교환 1건이 전부다
 *   현행 : 600Ø우주선 → 450Ø우주선 → 450Ø우주선(아크릴) → 400Ø원형(아크릴)
 *   PPT  : 450Ø우주선 → 600Ø우주선 → 450Ø우주선(아크릴) → 400Ø원형(아크릴)
 *   갓등 4종 · 디자인등 4종 · 중분류 묶음 순서는 이미 PPT 와 일치한다.
 *   그래도 12종 전량을 표로 적어 둔다 — 나중에 UP_DATA 행이 움직여도 표가 정답을 붙든다.
 *
 * ★ 왜 usung-catalog-data.js 를 안 고치고 오버레이로 하나
 *   LED 표시 순서는 별도 배열이 아니라 **UP_DATA 행 순서** 그 자체다.
 *   그런데 usung-r8-prod-a.js 는 build_graft.py **생성물이라 수기 수정 금지**다.
 *   → 같은 파일의 reorderGalB() 와 **똑같은 방식**으로, 빌드가 끝난 뒤
 *     MODELS 의 LED 자리만 재정렬한다(다른 대분류는 손대지 않는다).
 *
 * ★ 이름 표기는 건드리지 않는다
 *   PPT S18 은 「500Ø갓등」, 카탈로그는 「500Ø항아리등」, r20 덱은 「500Ø항아리갓등」 —
 *   같은 모델에 표기가 셋이다. 이건 **순서 문제가 아니라 표기 문제**이고(잔여업무 A-38 b)
 *   지시도 없다 → 카탈로그 표기를 그대로 쓴다. §3 「PPT 에 없는 값은 지어내지 말 것」.
 *
 * 되돌리기 : 이 파일 삭제 + api/inject.js 의 링크 1줄 삭제.
 */
(function () {
  'use strict';

  /* 중분류 묶음 순서 (PPT S14 : 갓등 / 우주선 / 디자인등) — 공백 제거한 형태로 비교한다.
     카탈로그는 '우주선, 아크릴'(공백 있음), PPT 는 '우주선,아크릴'(공백 없음)이다. */
  var MID_ORDER = ['갓등', '우주선,아크릴', '디자인등'];

  /* 중분류 안쪽 모델 순서 — 값은 **카탈로그 표기**(modelName) 기준이다. */
  var GRP_ORDER = {
    '갓등': [
      '350Ø갓등(슬림)',        // S15
      '350Ø갓등(반달)',        // S16
      '450Ø갓등',              // S17
      '500Ø항아리등'           // S18 (PPT 표기는 '500Ø갓등' — A-38 b, 이름은 안 건드린다)
    ],
    '우주선,아크릴': [
      '450Ø우주선',            // S19  ← 현행보다 앞으로 (이번 변경의 전부)
      '600Ø우주선',            // S20
      '450Ø우주선(아크릴)',    // S21
      '400Ø원형(아크릴)'       // S22
    ],
    '디자인등': [
      '원형아크릴등',          // S23
      '사각원형아크릴등',      // S24
      '사각아크릴등',          // S25
      '사각등'                 // S26
    ]
  };

  var CAT = 'LED조명';
  var MISS = 99; // 표에 없는 값은 뒤로 밀되, 동순위끼리는 원래 순서를 유지한다

  function norm(s) {
    return String(s == null ? '' : s).replace(/\s+/g, '');
  }

  /* usung-r8-prod-a.js 의 modelName(m) 과 같은 규칙.
     LED 디자인등은 grp 가 baseOf(it) 로 채워지므로 여기서도 grp 가 먼저 걸린다. */
  function nameOf(m) {
    return (m && (m.grp || m.mid || (m.rep && m.rep.name))) || '';
  }

  function midRank(m) {
    var i = MID_ORDER.indexOf(norm(m.mid));
    return i < 0 ? MISS : i;
  }

  function grpRank(m) {
    var list = GRP_ORDER[norm(m.mid)];
    if (!list) return MISS;
    var want = norm(nameOf(m));
    for (var i = 0; i < list.length; i++) {
      if (norm(list[i]) === want) return i;
    }
    return MISS;
  }

  /* MODELS 의 LED 자리만 뽑아 정렬한 뒤 **같은 자리에** 되꽂는다.
     reorderGalB() 와 같은 수법 — 다른 대분류의 인덱스가 흔들리지 않는다.
     Array#sort 는 안정 정렬이라 동순위는 원본 순서를 지키고,
     이미 정렬된 배열을 다시 정렬해도 결과가 같다(멱등). */
  function reorder(MODELS) {
    var slots = [], sub = [], i;
    for (i = 0; i < MODELS.length; i++) {
      if (MODELS[i] && MODELS[i].cat === CAT) {
        slots.push(i);
        sub.push(MODELS[i]);
      }
    }
    if (sub.length < 2) return 0;

    sub.sort(function (a, b) {
      return (midRank(a) - midRank(b)) || (grpRank(a) - grpRank(b));
    });
    for (i = 0; i < slots.length; i++) MODELS[slots[i]] = sub[i];
    return sub.length;
  }

  /* MODELS 를 손댔으면 파생 캐시인 byCatM 을 다시 만들어야 한다.
     byCatM 을 읽는 곳은 넷인데 성격이 갈린다(usung-r8-prod-b.js) —
       renderCatNav(:23) · renderTree(:131) → mid 목록만 쓴다 → 이번 변경과 무관
       renderBands(:95)                     → byCatM[c] 순서를 그대로 그린다 → 다시 그려야 함
       renderCatMain(:139)                  → 클릭 시점에 byCatM 을 읽는다 → 갱신만으로 충분 */
  function apply() {
    var MODELS, byCatM, R8_CATS;
    /* 셋 다 최상위 let/const 라 window 에 없다. 데이터 파일 미실행이면
       typeof 조차 TDZ 로 던지므로 반드시 try 안에서 이름으로 만진다. */
    try {
      MODELS = window.MODELS || eval('MODELS');
      byCatM = window.byCatM || eval('byCatM');
      R8_CATS = window.R8_CATS || eval('R8_CATS');
    } catch (e) { return false; }

    if (!MODELS || !MODELS.length || !byCatM || !R8_CATS) return false;

    var n = reorder(MODELS);
    if (!n) return false;

    for (var i = 0; i < R8_CATS.length; i++) {
      (function (c) {
        byCatM[c] = MODELS.filter(function (m) { return m.cat === c; });
      })(R8_CATS[i]);
    }

    try {
      if (typeof window.renderBands === 'function') window.renderBands();
    } catch (e) { /* 밴드 재렌더 실패해도 순서 자체는 이미 고쳐졌다 */ }

    document.documentElement.setAttribute('data-r25', String(n));
    return true;
  }

  /* r8Build 는 **함수 선언**이라 window 속성이다 → 재대입하면
     usung-r8-mount.js 의 무자격 호출 r8Build() 도 교체본을 쓴다(r19·r23 과 같은 수법). */
  function wrapBuild() {
    if (window.__r25wrap) return true;
    if (typeof window.r8Build !== 'function') return false;
    var orig = window.r8Build;
    window.r8Build = function () {
      var r = orig.apply(this, arguments);
      try { apply(); } catch (e) { }
      return r;
    };
    window.__r25wrap = true;
    return true;
  }

  /* 부팅 경쟁 대비 — r25 가 빌드보다 먼저 실릴 수도, 늦게 실릴 수도 있다.
     래핑(앞으로의 빌드)과 즉시 적용(이미 끝난 빌드)을 둘 다 챙긴다.
     usung-r8-mount.js 가 UP_DATA 를 최대 6초까지 기다리므로 상한을 넉넉히 잡는다. */
  var tries = 0;
  (function tick() {
    var wrapped = false, applied = false;
    try { wrapped = wrapBuild(); } catch (e) { }
    try { applied = apply(); } catch (e) { }
    if (wrapped && applied) return;
    if (++tries > 300) return;
    setTimeout(tick, 100);
  })();
})();
