/* usung-r20.js — 260804 취합본 r2 · JS 전용 항목
 *   S8   기술력 브랜드스토리 서명 USUNG ACE → YUSUNG ACE (생성물이라 런타임 보정)
 *   S10  상단 메가메뉴 대분류 5개가 눌러도 안 들어가는 문제 → 링크 연결
 *   S11  BEST & NEW 4장 중 3장이 잘못된 제품 → 첨부 제품으로 교체
 *   S13  부품 티저 — 「대표 4종을 먼저…」 문장 삭제 + 뱃지 번호 1·2·3·4
 *   S21  기술력 인증 — 특허번호 표기 삭제(캡션 + img alt + 챗봇 답변)
 *        (S22 에이스봇 빠른답변 정리는 usung-r20-bot.js 로 분리 — 300줄 상한)
 *
 * index_v6.html 불변. usung-r8-* 는 build_graft.py 생성물이라 손대지 않는다.
 * 전부 런타임 오버레이(전역 재대입 · 배열 제자리 변형 · DOM 보정)로만 처리한다.
 */
(function () {
  'use strict';

  /* ── S10 메가메뉴 대분류 링크 연결 ──────────────────────────────────────
   * PPT: 「탭 하나식 눌러도 안들어가져요 / 링크 연결이 안되어있어서 / 연결부탁드려용」.
   * 무반응의 실체 — usung-overlay.js:175 가 만드는 버튼의 인라인 onclick 은
   *   navigate('products'); setTimeout(()=>window.upGoCat('갤럭시'), 120)
   * 인데 usung-review.js:731 의 upGoCat 은 결과를 #up-main 에 그린다.
   * r8 이식 후 #up-main 은 .r8-original{display:none} 안이라 **사문화 상태**다
   * → 제품소개로 이동은 되지만 대분류가 열리지 않는다(= 사용자가 본 증상).
   * ★ installCleanMegaMenu() 가 200ms setInterval 로 #mega-cat-list 를 통째로
   *   다시 쓰므로 버튼마다 리스너를 붙이는 방법은 원천적으로 불가능하다.
   *   → document 캡처 위임 1개 + stopPropagation() 으로 인라인 자체를 무력화한다
   *     (r5-fixes 의 USE CASE 3카드와 같은 검증된 처방).
   * ★ usung-r5-fixes.js:212 의 __usungRoute(cat[, mid]) 를 재사용한다.
   *   mid 는 `if (mid)` 가드가 있어 1인자 호출이 안전하고, r8 준비까지 최대
   *   15초 대기 + 착지 재시도까지 이미 들어 있다 — 라우팅 지식을 복제하지 않는다.
   * ★ 충돌 없음 — r5-fixes 의 캡처 리스너는 [data-i18n^="www_case"] 스팬을 가진
   *   버튼만 잡는데 메가메뉴 버튼에는 data-i18n 이 없다(실측). */
  function catFromBtn(btn) {
    var oc = btn.getAttribute('onclick') || '';
    // usung-products-order.js:31 과 같은 검증된 정규식
    var m = oc.match(/upGoCat\((['"])(.*?)\1\)/);
    return m ? m[2] : null;
  }

  function bindMega() {
    if (window.__r20mega) return;
    window.__r20mega = true;
    document.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest
        ? e.target.closest('button[onclick*="upGoCat("]') : null;
      if (!btn) return;
      var cat = catFromBtn(btn);
      if (!cat) return;
      // 라우터가 없으면 손대지 않는다 — 인라인 원래 동작을 그대로 둔다(안전한 열화).
      if (typeof window.__usungRoute !== 'function') return;
      e.preventDefault();
      e.stopPropagation();
      try { window.__usungRoute(cat); } catch (err) { console.warn('[r20] route', err); }
    }, true);
  }

  /* ── S11 BEST & NEW 제품 교체 ───────────────────────────────────────────
   * PPT: 「제품이 잘못 들어감 / 아래 첨부한 제품이 들어가야 함」.
   * 첨부 파일명 4개(slide11 image14.png 5배 확대로 판독) —
   *   best_01_galaxyb_fvd / best_02_led / best_03_galaxyb_125 / best_04_design
   * 썸네일을 어두운픽셀 열밀도로 잘라 리포 자산과 대조한 결과
   *   1번 = gal017(머리에 빨간 조작부 + 케이블) → 304스텐-양옆태엽(FVD)
   *   2번 = led006(동색 갓 + 코일 케이블)      → 450Ø갓등  ★ 현행과 동일 = 유지
   *   3번 = 갤럭시B 중 제품명에 「125」가 든 그룹 → 304스텐-90-100
   *   4번 = led022(망 텍스처 사각 본체)        → 사각등
   * ★ 3번은 후보가 둘(90-100 = gal029 / 90-114 = gal031)인데 썸네일 실물이
   *   가로 10px 라 종횡비 0.1580 vs 0.1584 를 구분할 수 없다(양자화 오차 이하).
   *   PPT 파일명의 「125」는 둘 다 공유한다(rep 이름이 「125Ø파이프90 …」).
   *   → 되돌리기가 한 줄인 쪽(키 문자열 1개)으로 가되 잔여업무로 올린다.
   *   지적의 실체인 「3번 자리에 파이프 SKU 가 있다」는 어느 쪽이든 해소된다.
   * ★ bestCardHTML 은 키를 못 찾으면 '' 를 돌리고 renderBands 가 filter(Boolean)
   *   하므로 오타 하나에 카드가 조용히 3장이 된다 → 4개 키 전량 존재 확인 후에만 적용.
   * ★ BEST4 는 const 라 재대입 불가지만 원소 변형은 된다(전역 렉시컬 · TDZ 주의). */
  var B4 = [
    { i: 0, k: '갤럭시|갤럭시B|304스텐-양옆태엽(FVD)',
      pt: '양옆태엽 FVD · 304 스테인리스' },
    { i: 2, k: '갤럭시|갤럭시B|304스텐-90-100',
      cap: '새로 추가된 갤럭시B 양옆태엽 신형', pt: '양옆태엽(신형) · 125Ø 파이프' },
    { i: 3, k: 'LED조명|디자인등|사각등',
      cap: '공간을 깔끔하게 정리하는 사각 라인', pt: '디자인등 · 사각' }
  ];

  // 전역 렉시컬 바인딩이라 window.MODELS 로는 못 읽는다. 데이터 파일 미실행 시
  // typeof 조차 TDZ 로 던지므로 반드시 try 로 감싼다(§3). eval 은 CSP 때문에 안 쓴다.
  function gModels() { try { return MODELS; } catch (e) { return null; } }
  function gBest4() { try { return BEST4; } catch (e) { return null; } }

  function hasKey(M, k) {
    for (var i = 0; i < M.length; i++) if (M[i].key === k) return true;
    return false;
  }

  var bestDone = false;
  function fixBest() {
    if (bestDone) return true;
    var M = gModels(), A = gBest4();
    if (!M || !M.length || !A || A.length < 4) return false;
    for (var i = 0; i < B4.length; i++) {
      if (!hasKey(M, B4[i].k)) { console.warn('[r20] BEST4 키 없음 ' + B4[i].k); return false; }
    }
    var ch = 0;
    B4.forEach(function (b) {
      var t = A[b.i];
      if (!t) return;
      if (t.k !== b.k) { t.k = b.k; ch++; }
      if (b.cap && t.cap !== b.cap) { t.cap = b.cap; ch++; }
      if (b.pt && t.pt !== b.pt) { t.pt = b.pt; ch++; }
    });
    bestDone = true;
    // 이미 그려진 뒤라면 다시 그린다. 아직이면 r8Build 가 바뀐 값으로 처음부터 그린다.
    var el = document.getElementById('bands');
    if (ch && el && el.innerHTML && typeof window.renderBands === 'function') {
      try { window.renderBands(); } catch (e) { console.warn('[r20] renderBands', e); }
    }
    return true;
  }

  /* ── S13 부품 티저 문장 삭제 + 뱃지 번호 ────────────────────────────────
   * PPT: 「대표 4종 멘트 삭제」 · 「순번대로 1,2,3,4」.
   * 빨간박스 위치를 slide13 기하로 확정 — 직사각형 6(FF0000)이 x0.20" y3.19"
   * w5.00" h0.35", 스크린샷 image16.png(1160×487)은 x0.20" y2.63" w7.71"
   * → 배율 150.5px/in → 이미지 픽셀 x[0,752] y[84,137] = 티저 4타일의 뱃지 줄.
   * 실제 뱃지는 partTileHTML(usung-r8-prod-a.js:125)의 `id.slice(1)` 이라
   * PART_TEASER=['p13','p09','p40','p46'] → 화면에 13 / 09 / 40 / 46 으로 찍힌다.
   * ★ 부품 전체 48종 페이지(#parts-body)의 번호는 파일번호와 맞아야 의미가 있으므로
   *   건드리지 않는다 — #parts-cat-grid(티저) 안만 1·2·3·4 로 다시 쓴다.
   * ★ 문장 삭제는 usung-r8-view.js:47 의 정적 마크업이라 뷰가 다시 심길 때마다
   *   되살아난다 → MutationObserver 로 계속 되잡는다.
   *   자기 변경으로 재발화해도 정규식·비교가 이미 만족돼 0건이라 그 자리에서 멎는다.
   * ★ 한국어 사전(usung-r16-i18n-a.js:18)의 원문도 같은 문장을 잘라 맞춘다 —
   *   r16 은 완전일치 조회라 자르지 않으면 5개 언어에서 조용히 미번역이 된다. */
  var PSD = /\s*대표\s*4종을\s*먼저\s*확인해\s*보세요\.\s*$/;

  function fixParts() {
    var n = 0, i;
    var ps = document.querySelectorAll('.r8x .ps-d');
    for (i = 0; i < ps.length; i++) {
      var t = ps[i].textContent;
      if (PSD.test(t)) { ps[i].textContent = t.replace(PSD, ''); n++; }
    }
    var grid = document.getElementById('parts-cat-grid');
    if (grid) {
      var px = grid.querySelectorAll('.pt .px');
      for (i = 0; i < px.length; i++) {
        var v = String(i + 1);
        if (px[i].textContent !== v) { px[i].textContent = v; n++; }
      }
    }
    return n;
  }

  function watchParts() {
    var host = document.getElementById('page-products');
    if (!host) return false;
    if (!host.__r20w) {
      host.__r20w = 1;
      try {
        new MutationObserver(function () { fixParts(); })
          .observe(host, { childList: true, subtree: true });
      } catch (e) { console.warn('[r20] observe', e); }
    }
    fixParts();
    return true;
  }

  /* ── S8 기술력 브랜드스토리 서명 — USUNG ACE → YUSUNG ACE ────────────────
   * PPT slide8: 「USUNGACE → YUSUNGACE로 통일화」, 빨간박스가 `Yes, for You` 아래
   * 파란 소문자 줄(.bs-sign-s)을 가리킨다.
   * ★ 이 문자열만 다른 8곳과 처리 방식이 다르다 — 소스가 usung-r8-view.js:157 인데
   *   그 파일은 build_graft.py 생성물이라 수기 수정 금지(§3)다. 그래서 여기서
   *   런타임으로 되잡는다. 나머지는 api/inject.js 응답시점 치환 + 정적 파일 치환.
   * ★ r16 사전에 없는 문자열이라(사전 ko 키는 전부 한국어) 5개 언어 어디서도
   *   되돌려지지 않는다 → 한 번 고치면 끝이고, 언어 전환과 충돌하지 않는다.
   * ★ 뷰가 다시 심기는 경우를 대비해 부트 루프가 끝날 때까지 매 틱 확인한다. */
  function fixSign() {
    var els = document.querySelectorAll('.r8x .bs-sign-s');
    if (!els.length) return false;
    for (var i = 0; i < els.length; i++) {
      if (els[i].textContent.trim() === 'USUNG ACE') els[i].textContent = 'YUSUNG ACE';
    }
    return true;
  }

  /* ── S21 기술력 인증 — 특허번호 표기 삭제 ───────────────────────────────
   * PPT slide21: 「기술력 / 특허번호 표기 삭제」. 빨간박스 없음 = 슬라이드 전체 지시.
   * image27.png 의 캡션 6개가 대상 —
   *   특허 제10-2743423호 · 제10-2755661호 · 제10-2889700호 · 제10-2916160호
   *   / 특허 출원 진행 / 디자인 등록증
   * ★ 지시는 「특허**번호**」다 — 캡션 줄 자체를 지우라는 말이 아니다.
   *   번호만 걷어 `특허` 로 남긴다. 이 라벨은 지어낸 말이 아니라 usung-cert.js:12
   *   (슬라이드13 「경쟁사 카피 방지」)가 이미 쓰고 있는 승인된 표기다.
   *   번호가 없는 「특허 출원 진행」·「디자인 등록증」은 손대지 않는다.
   * ★ 누출 경로가 둘이다 — DOM 만 고치면 절반만 고친 것이 된다.
   *   (a) usung-r8-tech.js:165 이 #cert-row 에 캡션 + img[alt] 로 그린다.
   *   (b) usung-docent-ask.js:151 이 **답변 시점에** CERTS.map(x=>x.c) 를 읽어
   *       챗봇 「인증/특허」 질문에 번호를 그대로 뱉는다.
   *   → 원본 배열 CERTS 를 제자리 변형해 (b) 를 뿌리에서 막고, 이미 그려진
   *     DOM 은 따로 쓸어낸다. CERTS 는 const 지만 원소 변형은 된다(BEST4 와 동일).
   * ★ usung-r8-tech.js 는 build_graft.py 생성물이라 수기 수정 금지(§3) → 런타임 보정.
   * ★ r16 사전(usung-r16-i18n-e.js)에 5개 언어 번역문이 있어 언어 전환으로
   *   되살아날 수 있다 → 해당 4행을 사전에서 삭제했다. 남은 `특허` 는
   *   usung-r16-i18n-a.js:44 로 조회되어 5개 언어가 그대로 동작한다. */
  var PATNO = /\s*(제|第|No\.|số)\s*10-[\d-]+\s*(호|号)?/gi;

  function gCerts() { try { return CERTS; } catch (e) { return null; } }

  function fixCerts() {
    var C = gCerts(), i;
    if (!C || !C.length) return false;
    for (i = 0; i < C.length; i++) {
      var s = String(C[i].c || '');
      if (PATNO.test(s)) { PATNO.lastIndex = 0; C[i].c = s.replace(PATNO, '').trim(); }
      PATNO.lastIndex = 0;
    }
    var row = document.getElementById('cert-row');
    if (!row) return false;
    var caps = row.querySelectorAll('.cert-cap');
    if (!caps.length) return false;              // 아직 안 그려짐 → 다음 틱
    for (i = 0; i < caps.length; i++) {
      var t = caps[i].textContent;
      PATNO.lastIndex = 0;
      if (PATNO.test(t)) { PATNO.lastIndex = 0; caps[i].textContent = t.replace(PATNO, '').trim(); }
      PATNO.lastIndex = 0;
    }
    var ims = row.querySelectorAll('img[alt]');
    for (i = 0; i < ims.length; i++) {
      var al = ims[i].getAttribute('alt') || '';
      PATNO.lastIndex = 0;
      if (PATNO.test(al)) { PATNO.lastIndex = 0; ims[i].setAttribute('alt', al.replace(PATNO, '').trim()); }
      PATNO.lastIndex = 0;
    }
    return true;
  }

  // ── 부트 — r8 은 mount 재시도로 최대 6초까지 늦어질 수 있다(§3) ──────────
  var tick = 0;
  (function boot() {
    tick++;
    try { bindMega(); } catch (e) { console.warn('[r20] bindMega', e); }
    var a = false, b = false, c = false, d = false;
    try { a = fixBest(); } catch (e) { console.warn('[r20] fixBest', e); }
    try { b = watchParts(); } catch (e) { console.warn('[r20] watchParts', e); }
    try { c = fixSign(); } catch (e) { console.warn('[r20] fixSign', e); }
    try { d = fixCerts(); } catch (e) { console.warn('[r20] fixCerts', e); }
    if ((!a || !b || !c || !d) && tick < 90) setTimeout(boot, 120);
  })();
})();
