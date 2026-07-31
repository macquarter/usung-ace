/* usung-docent-wz.js — 도슨트 추천 위저드 "30초 내 취향 후드 찾기" (데이터 + 점수)
 * 프로토타입 _proto_catalog_r8.html 의 wz* 계열을 라이브로 옮긴 것.
 * Spec: 「0. 챗봇 질문내용정리」 + 「260713_홈페이지수정_r5」 챗봇 구성 제안.
 *  - 고객에게 모델명·전문용어를 입력시키지 않는다 → 고정 5문항 선택형
 *  - 모든 문항에 '잘 모르겠어요' → 막다른 길이 아니라 비교/인기 제품으로 연결
 *  - 점수는 실제 MODELS 배열 위에서 계산 → 카탈로그에 없는 제품은 추천되지 않는다
 * ★ classic script 로 로드할 것 (MODELS 는 window 가 아니라 전역 렉시컬 환경에 있다).
 */
(function () {
  'use strict';
  var R = window.R8DOC;
  if (!R) return;

  function vModels() { return typeof MODELS !== 'undefined' ? MODELS : []; }

  var WZQ = [
    { id: 'design', t: '어떤 느낌의 후드를 원하시나요?',
      o: [{ v: '갤럭시', t: '클래식한 갓 디자인', d: '공간의 중심이 되는 전통적인 후드', w: '클래식한 갓 디자인 선호' },
          { v: '파이프', t: '슬림한 파이프 디자인', d: '깔끔하고 정돈된 직선형 디자인', w: '슬림한 직선형 디자인 선호' },
          { v: 'LED조명', t: '조명이 있는 디자인', d: '테이블을 밝히는 LED 후드', w: '조명이 있는 디자인 선호' },
          { v: '후레쉬볼', t: '유연하고 개성 있는 디자인', d: '후렉시블 자바라를 활용한 디자인', w: '유연한 자바라 디자인 선호' },
          { v: '코브라후드', t: '테이블 아래로 숨기는 디자인', d: '천장 후드가 없는 하향식 구조', w: '하향식(테이블 아래) 구조 선호' }],
      sk: '인기 디자인부터 추천받기' },
    { id: 'motion', t: '사용할 때 후드의 위치를 움직여야 하나요?',
      o: [{ v: '스윙', t: '좌우로 자유롭게 움직이고 싶어요', d: '360° 스윙 · 자바라 계열', w: '좌우 움직임 필요' },
          { v: '승강', t: '위아래 높이를 조절하고 싶어요', d: '텐션 · 태엽 승강 계열', pop: 1, w: '높이 조절 필요' },
          { v: '고정', t: '움직이지 않아도 괜찮아요', d: '고정형 계열', w: '고정형으로 충분' }],
      sk: '가장 많이 선택하는 방식으로 추천' },
    { id: 'mood', t: '매장 분위기와 가장 가까운 것은 무엇인가요?',
      o: [{ v: '밝고 깔끔', t: '밝고 깔끔한 공간', d: '크롬 · 헤어라인 · 실버 계열', w: '밝고 깔끔한 인테리어' },
          { v: '고급 따뜻', t: '고급스럽고 따뜻한 공간', d: '동도금 · 신주도금 · 브론즈 계열', w: '고급스럽고 따뜻한 인테리어' },
          { v: '모던 어두운', t: '모던하고 어두운 공간', d: '흑도금 · 검정 계열', pop: 1, w: '어두운 모던 인테리어' },
          { v: '색감 개성', t: '색감 있는 개성적인 공간', d: '빨강 · 주황 · 황색 · 초록 도장', w: '색감 있는 개성적 인테리어' }],
      sk: '인기 색상 계열로 추천' },
    { id: 'light', t: '후드에 조명 기능이 필요한가요?',
      o: [{ v: 'y', t: '필요해요', d: '테이블 조명까지 함께 사용하고 싶어요', w: '조명 기능 필요' },
          { v: 'n', t: '필요하지 않아요', d: '후드 디자인에 집중하고 싶어요', pop: 1, w: '조명 불필요' },
          { v: '', t: '상관없어요', d: '디자인이 더 잘 맞는 제품으로 추천', w: '조명 여부는 상관없음' }],
      sk: '디자인이 더 잘 맞는 제품으로 추천' },
    { id: 'prio', t: '가장 중요하게 생각하는 기준을 선택해 주세요.',
      o: [{ v: '디자인', t: '디자인', d: '공간과 가장 잘 어울리는 형태', pop: 1, w: '디자인 우선' },
          { v: '움직임', t: '움직임과 사용 편의', d: '스윙 · 높이 조절 중심', w: '움직임·사용 편의 우선' },
          { v: '외관', t: '깔끔한 외관', d: '장치가 적게 보이는 구조', w: '깔끔한 외관 우선' },
          { v: '색상', t: '다양한 색상', d: '인테리어 색상에 맞춘 마감', w: '다양한 색상 선택 우선' },
          { v: '인기', t: '가장 많이 선택하는 제품', d: '검증된 인기 제품 우선', w: '검증된 인기 제품 우선' }],
      sk: '가장 많이 선택하는 기준으로 추천' }
  ];
  // finish tokens per mood — matched as substrings against the real colorOf() values
  var WZMOOD = {
    '밝고 깔끔': ['크롬', '헤어라인', '스텐도금', '스텐도장', '실버', '흰색'],
    '고급 따뜻': ['동도금', '신주도금', '브론즈', '동함마'],
    '모던 어두운': ['흑도금', '검정'],
    '색감 개성': ['빨강', '주황', '황색', '초록', '노랑']   // 황색: r5 spec lists it as a 도장 accent
  };
  // curated bests (same keys the main page uses for its "대표 제품" band)
  var WZBEST = ['갤럭시|갤럭시B|304스텐-양옆태엽(반후지)', '파이프|양옆태엽|스텐도금',
    'LED조명|갓등|450Ø갓등', 'LED조명|디자인등|원형아크릴등'];

  function wzText(m) {
    return (m.mid || '') + ' ' + (m.grp || '') + ' ' + m.items.map(function (i) { return i.name; }).join(' ');
  }
  // catalog has 태엽/텐션 (승강) and 코브라·자바라 (스윙); there is no literal '스윙' token
  function wzMotion(m) {
    var s = wzText(m);
    if (/텐션|태엽/.test(s)) return '승강';
    if (m.cat === '코브라후드' || m.cat === '후레쉬볼' || /코브라|자바라/.test(s)) return '스윙';
    return '고정';
  }
  function wzLit(m) { return m.cat === 'LED조명' || /등|LED/i.test(wzText(m)); }
  function wzFin(m) {
    return R.uniq(m.items.map(function (i) { return R.color(i); }).filter(Boolean));
  }
  function wzMoodHit(m, mood) {
    var pal = WZMOOD[mood] || [];
    return wzFin(m).filter(function (f) {
      return pal.some(function (p) { return f.indexOf(p) >= 0; });
    });
  }
  function wzScore(m, a) {
    var s = 0;
    if (a.design) s += (m.cat === a.design ? 46 : -14);
    if (a.motion) s += (wzMotion(m) === a.motion ? 20 : -4);
    if (a.mood) s += Math.min(wzMoodHit(m, a.mood).length, 3) * 8;
    if (a.light === 'y') s += wzLit(m) ? 16 : -9;
    if (a.light === 'n') s += wzLit(m) ? -9 : 7;
    if (a.prio === '움직임' && a.motion && wzMotion(m) === a.motion) s += 10;
    if (a.prio === '외관' && (m.cat === '파이프' || m.cat === '코브라후드')) s += 10;
    if (a.prio === '색상') s += Math.min(wzFin(m).length, 6) * 2.5;
    if (a.prio === '인기' || a.prio === '디자인') s += (WZBEST.indexOf(m.key) >= 0 ? (a.prio === '인기' ? 18 : 7) : 0);
    s += Math.min(m.items.length, 8) * 0.6;      // tie-break: more finish choices
    return s;
  }
  // some MODELS rows under '파이프 | 기타옵션' are components (motors, bare 갓, 측향 자재),
  // not standalone hoods — they must never appear as a recommendation
  function wzHide(m) {
    var n = '';
    try { n = R.mname(m) || ''; } catch (e) {}
    return /모터/.test(n) || /^\s*\d{2,3}\s*Ø?\s*갓\s*$/.test(n) || /^\s*측향[\d,\s.Ø]*$/.test(n);
  }
  function wzRank(a) {
    var l = vModels().filter(function (m) { return !wzHide(m); })
      .map(function (m) { return { m: m, s: wzScore(m, a) }; });
    l.sort(function (x, y) { return y.s - x.s; });
    return l;
  }
  // 2~3 finishes: mood matches first, then padded with the model's other finishes
  function wzColors(m, mood) {
    var hit = mood ? wzMoodHit(m, mood) : [], all = wzFin(m), out = hit.slice(0, 3);
    for (var i = 0; i < all.length && out.length < 3; i++) {
      if (out.indexOf(all[i]) < 0) out.push(all[i]);
    }
    return out;
  }
  function wzIdxOf(m, fin) {
    for (var i = 0; i < m.items.length; i++) { if (R.color(m.items[i]) === fin) return i; }
    return 0;
  }
  // which of the customer's stated criteria this model does NOT satisfy
  function wzMiss(m, a) {
    var out = [];
    if (a.design && m.cat !== a.design) out.push('디자인 계열');
    if (a.motion && wzMotion(m) !== a.motion) out.push('움직임');
    if (a.light === 'y' && !wzLit(m)) out.push('조명');
    if (a.light === 'n' && wzLit(m)) out.push('조명');
    if (a.mood && !wzMoodHit(m, a.mood).length) out.push('색감');
    return out;
  }

  R.WZQ = WZQ;
  R.WZBEST = WZBEST;
  R.vModels = vModels;
  R.wz = {
    motion: wzMotion, lit: wzLit, fin: wzFin, moodHit: wzMoodHit,
    score: wzScore, hide: wzHide, rank: wzRank, colors: wzColors,
    idxOf: wzIdxOf, miss: wzMiss
  };
})();
