/* usung-r23.js — 부품소개 페이지(48종) 배치·번호를 유성 「부품 크롭본」 폴더와 일치시킨다.
 *
 * 왜 필요한가
 *   usung-r8-prod-a.js:122 의 PART_ORDER 는 Object.keys(R8_PARTS).sort() = p01…p48 로,
 *   이건 "리포 내부 번호"다. 유성 크롭본 폴더 번호와는 #07 부터 어긋난다
 *   (CLAUDE.md §3 「제품 상세 모달을 건드릴 때의 5대 함정」 1번과 같은 뿌리).
 *   실측 결과 48칸 중 33칸이 다른 자리에 있었고, 뱃지도 20번대부터 한 칸씩 밀려 있었다.
 *
 * 어떻게 고치나
 *   생성물(usung-r8-prod-a.js)은 손대지 않는다. renderPartsPage / partTileHTML 은
 *   함수 선언 = window 속성이므로 renderPartsPage 를 감싸 그리드만 다시 그린다.
 *   (r19 가 renderParts 에, r21 이 renderPartsTeaser 에 쓴 것과 같은 수법)
 *
 * 단일 진실 원천
 *   아래 ORDER 는 usung-r19-parts-data.js 의 PN 표(제품 상세 모달이 이미 쓰는 변환표)와
 *   같은 체계다. 즉 이 반영으로 「부품소개 페이지」와 「제품 상세 모달」이 한 번호를 쓴다.
 *   ★ 번호를 바꿔야 하면 ORDER 와 PN 을 반드시 같이 고칠 것.
 *
 * 건드리지 않는 것
 *   - 제품소개 하단 티저(#parts-cat-grid) — r21 ① 이 p01~p04 로 고정, r20 fixParts() 가 번호 부여.
 *     그쪽은 .pp-grid 클래스를 공유하므로 셀렉터를 반드시 '#parts-body .pp-grid' 로 스코프할 것.
 *   - 제품 상세 모달 부품 목록 — r19 가 PN 으로 이미 정확하다.
 *
 * 되돌리기: 이 파일 삭제 + api/inject.js 의 링크 1줄 삭제.
 */
(function () {
  'use strict';

  var w = window;

  /* [크롭본 번호(표시 그대로), 리포 부품 id] — 48행. 순서가 곧 화면 배치 순서다. */
  var ORDER = [
    ['01', 'p01'], ['02', 'p02'], ['03', 'p03'], ['04', 'p04'],
    ['05', 'p05'], ['06', 'p06'], ['07', 'p09'], ['08', 'p10'],
    ['09', 'p11'], ['10', 'p07'], ['11', 'p08'], ['12', 'p12'],
    ['13-1', 'p13'], ['13-2', 'p14'], ['14', 'p15'], ['15', 'p16'],
    ['16', 'p17'], ['17', 'p18'], ['18', 'p19'], ['19', 'p20'],
    ['20', 'p27'], ['21', 'p23'], ['22', 'p24'], ['23', 'p25'],
    ['24', 'p26'], ['25', 'p33'], ['26', 'p28'], ['27', 'p29'],
    ['28', 'p30'], ['29', 'p31'], ['30', 'p32'], ['31', 'p34'],
    ['32', 'p35'], ['33', 'p36'], ['34', 'p37'], ['35', 'p38'],
    ['36', 'p39'], ['37', 'p40'], ['38', 'p41'], ['39', 'p42'],
    ['40', 'p43'], ['41', 'p44'], ['42', 'p21'], ['43', 'p45'],
    ['43-1', 'p46'], ['43-2', 'p47'], ['43-3', 'p48'], ['44', 'p22']
  ];

  /* 원본 타일 생성기를 그대로 쓰고 뱃지 글자만 갈아끼운다.
     ★ 정규식으로 치환하지 말 것 — 마크업이 조금만 바뀌면 조용히 빗나간다(r22 교훈). */
  function tile(no, id) {
    var box = document.createElement('div');
    box.innerHTML = w.partTileHTML(id);
    var px = box.querySelector('.px');
    if (px) px.textContent = no;
    return box.innerHTML;
  }

  function draw() {
    var g = document.querySelector('#parts-body .pp-grid');
    if (!g) return 0;
    if (typeof w.partTileHTML !== 'function') return 0;
    var html = '', i;
    for (i = 0; i < ORDER.length; i++) html += tile(ORDER[i][0], ORDER[i][1]);
    g.innerHTML = html;
    g.__r23 = 1;
    return ORDER.length;
  }

  /* renderPartsPage 를 감싼다. 원본을 먼저 돌려 머리말(PARTS & COMPONENTS · 48종 설명)을
     그대로 물려받고, 그리드만 우리 순서로 다시 그린다. */
  function wrap() {
    if (w.__r23wrap) return true;
    if (typeof w.renderPartsPage !== 'function') return false;
    if (typeof w.partTileHTML !== 'function') return false;
    var orig = w.renderPartsPage;
    w.renderPartsPage = function () {
      var r = orig.apply(this, arguments);
      try { draw(); } catch (e) { console.warn('[r23] draw', e); }
      return r;
    };
    w.__r23wrap = true;
    return true;
  }

  /* 뷰가 늦게 붙거나 우리가 감싸기 전에 한 번 그려졌을 때를 위한 보정. */
  function heal() {
    var g = document.querySelector('#parts-body .pp-grid');
    if (!g || g.__r23) return;
    if (!g.querySelector('.pt')) return;
    try { draw(); } catch (e) { console.warn('[r23] heal', e); }
  }

  function tick() {
    try { wrap(); } catch (e) { /* TDZ 등 — 다음 틱에 재시도 */ }
    try { heal(); } catch (e) { /* 위와 같음 */ }
  }

  function boot() {
    tick();
    var n = 0;
    var iv = setInterval(function () {
      tick();
      if (++n > 80) clearInterval(iv);
    }, 100);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  w.addEventListener('load', tick);
})();
