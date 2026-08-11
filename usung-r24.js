/* usung-r24.js — 제품 상세 모달 「규격(접속경)」 · 「기장」 행 추가
 * ---------------------------------------------------------------------------
 * 근거 : 260807_홈페이지_수정1최종.pptx (32슬라이드) 의 제품별 규격/기장 표
 * 생성 : node /tmp/gen_r24_file.js  ← ★ 이 파일은 생성물이다. 손으로 고치지 말 것.
 *        표를 바꾸려면 /tmp/gen_r24_table.js 로 r24_table.json 을 다시 만든 뒤 재실행한다.
 *
 * ★ 왜 기존 「규격」 줄을 바꾸지 않고 새 줄을 더하는가
 *   PPT 규격과 배포본 규격은 **다른 양**이다.
 *     PPT   : 덕트 접속경   (상부150Ø · 파이프 110-125Ø)
 *     배포본: 항목명에서 긁은 본체 Ø (500Ø)
 *   교체하면 지금 맞게 나오던 값이 사라진다 → 새 줄로 **추가**한다.
 *
 * ★ 조회 키가 cat|mid|modelName 인 이유
 *   pick() 은 usung-r19-parts-data.js 의 IIFE 사유라 브라우저에서 못 쓴다.
 *   대신 /tmp/gen_r24_table.js 가 배포본 pick() 을 Node 에서 그대로 호출해
 *   평면표를 만들었고, 그 표에서 **62모델 62키 · 충돌 0** 이 증명됐다.
 *   그래서 DOM(#m-crumb)만으로 안전하게 조회한다.
 *   (#m-crumb 은 usung-r8-prod-b.js:201 에서 #m-spec(:218) **보다 먼저** 쓰인다.)
 *
 * ★ 래핑 순서 — 반드시 r22(usung-r21.js) 래퍼 **바깥**이어야 한다.
 *   r22 의 specRow() 는 렌더 후 「규격」 행을 다시 넣으므로, r24 가 안쪽이면
 *   삭제 대상 13종의 규격 행이 되살아난다 → window.__r22sel 을 기다린다.
 *
 * ★ 행 삽입은 insertRow() 로 — #m-spec 은 <table>(usung-r8-view.js:209)이고
 *   insertAdjacentHTML('afterbegin') 은 암시적 tbody **앞**에 꽂혀 조용히 버려진다(r22 교훈).
 *
 * 되돌리기 : 이 파일 삭제 + api/inject.js 의 링크 1줄 삭제.
 */
(function () {
  'use strict';

  var LBL = '규격(접속경)';           // 새 행의 표제 — 멱등 가드의 판정 문자열이기도 하다
  var LBLJ = '기장';
  var NOTE = '※ 기장 변경은 별도 문의';
  var JANG = '기본기장 L1800 / 접었을 때 L1200';

  /* PPT 표에서 읽은 규격 문자열 — 인덱스가 곧 표 순서다(2행짜리는 배열로 묶인다). */
  var SP = [
    '상부150Ø · 파이프 110-125Ø',
    '상부125/150Ø · 파이프 90-110/100Ø',
    '상부150Ø · 파이프 90-110Ø',
    '상부150Ø · 파이프 110-90Ø',
    '상부125Ø · 파이프 90-75Ø',
    '상부125Ø · 파이프 75-90Ø'
  ];

  /* cat|mid|modelName → 패턴. 값은 SP 인덱스 조합, 'D' 는 규격 행 삭제. */
  var G = {
    /* [2,5] 상부150Ø · 파이프 90-110Ø + 상부125Ø · 파이프 75-90Ø — 20종 */
    '2,5': [
      '파이프|양옆태엽|스텐도금', '파이프|텐션|스텐도금', '파이프|내부태엽|스텐도금', '파이프|양옆태엽|스텐도장', '파이프|텐션|스텐도장',
      '파이프|내부태엽|스텐도장', '파이프|양옆태엽|스파이얼', '파이프|텐션|스파이얼', '파이프|내부태엽|스파이얼', '파이프|기타옵션|원형상향모터',
      '파이프|기타옵션|원형측향모터', '파이프|기타옵션|사각측향모터', '파이프|기타옵션|측향125,100Ø', '파이프|기타옵션|210Ø갓',
      '파이프|기타옵션|250Ø갓', '파이프|기타옵션|125Ø원형측향 FVD 양옆태엽', '파이프|기타옵션|125Ø원형측향 FVD 텐션',
      '파이프|기타옵션|125Ø사각측향 FVD 양옆태엽', '파이프|기타옵션|125Ø사각측향 FVD 텐션', '파이프|기타옵션|125Ø고정텐션'
    ],
    /* [0] 상부150Ø · 파이프 110-125Ø — 12종 */
    '0': [
      '갤럭시|갤럭시A|양옆태엽', '갤럭시|갤럭시A|내부태엽', '갤럭시|갤럭시B|304스텐-양옆태엽(반후지)', '갤럭시|갤럭시B|스파이얼-내부태엽(FVD)',
      '갤럭시|갤럭시B|304스텐-양옆태엽(FVD)', '갤럭시|갤럭시B|304스텐-내부태엽(반후지)', '갤럭시|갤럭시B|304스텐-내부태엽(FVD)',
      '갤럭시|갤럭시B|스파이얼-양옆태엽(반후지)', '갤럭시|갤럭시B|스파이얼-양옆태엽(FVD)', '갤럭시|갤럭시B|스파이얼-내부태엽(반후지)',
      '갤럭시|갤럭시C|양옆태엽', '갤럭시|갤럭시C|내부태엽'
    ],
    /* [4] 상부125Ø · 파이프 90-75Ø — 10종 */
    '4': [
      'LED조명|갓등|350Ø갓등(슬림)', 'LED조명|갓등|350Ø갓등(반달)', 'LED조명|우주선, 아크릴|600Ø우주선',
      'LED조명|우주선, 아크릴|450Ø우주선', 'LED조명|우주선, 아크릴|450Ø우주선(아크릴)', 'LED조명|우주선, 아크릴|400Ø원형(아크릴)',
      'LED조명|디자인등|원형아크릴등', 'LED조명|디자인등|사각원형아크릴등', 'LED조명|디자인등|사각아크릴등', 'LED조명|디자인등|사각등'
    ],
    /* [1] 상부125/150Ø · 파이프 90-110/100Ø — 2종 */
    '1': [
      '갤럭시|갤럭시B|304스텐-90-100', '갤럭시|갤럭시B|304스텐-90-114'
    ],
    /* [2] 상부150Ø · 파이프 90-110Ø — 2종 */
    '2': [
      '갤럭시|갤럭시D|파이프만(반후지)', '갤럭시|갤럭시D|파이프만(FVD)'
    ],
    /* [3,4] 상부150Ø · 파이프 110-90Ø + 상부125Ø · 파이프 90-75Ø — 2종 */
    '3,4': [
      'LED조명|갓등|450Ø갓등', 'LED조명|갓등|500Ø항아리등'
    ],
    /* [3] 상부150Ø · 파이프 110-90Ø — 1종 */
    '3': [
      '갤럭시|갤럭시D|갓등'
    ],
    /* D = 규격 행 삭제 (image51.png 「후레쉬볼 하향식후드는 규격삭제」) — 13종 */
    'D': [
      '후레쉬볼|후레쉬볼 자바라|후레쉬볼 자바라', '후레쉬볼|신형 후레쉬볼 자바라|신형 후레쉬볼 자바라', '후레쉬볼|후레쉬볼 장축자바라|후레쉬볼 장축자바라',
      '후레쉬볼|후레쉬볼 갓 자바라|후레쉬볼 갓 자바라', '코브라후드||90Ø롱망코브라220', '코브라후드||75Ø망대코브라200',
      '코브라후드||사각코브라160', '코브라후드||75Ø주물코브라200Ø갓160', '코브라후드||75Ø주물나팔코브라100', '코브라후드||90Ø 각코브라',
      '코브라후드||75Ø코브라270', '코브라후드||75Ø코브라170(2단캡)', '코브라후드||75Ø코브라170'
    ]
  };

  /* 역인덱스 — 조회는 O(1) */
  var T = {}, p, i;
  for (p in G) if (G.hasOwnProperty(p)) for (i = 0; i < G[p].length; i++) T[G[p][i]] = p;

  /* ── 조회 키 ─────────────────────────────────────────────────────
   * #m-crumb 은 "대분류 > 중분류 > <b>모델명</b>". 중분류가 없으면 '-' 다.
   * 모델명은 <b> 에서 직접 읽는다(모델명에 > 가 섞여도 안전). */
  function key() {
    var c = document.getElementById('m-crumb');
    if (!c) return null;
    var b = c.querySelector('b');
    if (!b) return null;
    var seg = c.textContent.split('>');
    if (seg.length < 2) return null;
    var cat = seg[0].trim(), mid = seg[1].trim();
    if (mid === '-') mid = '';
    return cat + '|' + mid + '|' + b.textContent.trim();
  }

  /* 기존 「규격」(본체 Ø) 행의 위치 — 없으면 -1 */
  function specIdx(tb) {
    var r = tb.rows, i, th;
    for (i = 0; i < r.length; i++) {
      th = r[i].cells[0];
      if (th && th.tagName === 'TH' && th.textContent === '규격') return i;
    }
    return -1;
  }

  function delSpec(tb) {
    var i;
    while ((i = specIdx(tb)) >= 0) tb.deleteRow(i);
  }

  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function apply() {
    var tb = document.getElementById('m-spec');
    if (!tb) return;
    var k = key();
    if (!k) return;
    var pat = T[k];
    if (!pat) return;                       // 표에 없는 모델 — 손대지 않는다

    if (pat === 'D') { delSpec(tb); return; }

    var ths = tb.querySelectorAll('th'), i;
    for (i = 0; i < ths.length; i++) if (ths[i].textContent === LBL) return;  // 이미 있음

    var idx = pat.split(','), lines = [];
    for (i = 0; i < idx.length; i++) lines.push(esc(SP[+idx[i]]));

    var at = specIdx(tb);
    at = at < 0 ? 0 : at + 1;               // 기존 규격 줄 **바로 아래**

    var tr = tb.insertRow(at);
    tr.innerHTML = '<th>' + LBL + '</th><td>' + lines.join('<br>') + '</td>';

    var tj = tb.insertRow(at + 1);
    tj.innerHTML = '<th>' + LBLJ + '</th><td>' + esc(JANG) +
      '<br><span style="font-size:.86em;opacity:.72">' + esc(NOTE) + '</span></td>';
  }

  /* ── 래핑 ────────────────────────────────────────────────────────
   * renderModalSel 은 함수 선언 = window 속성이라 교체된다.
   * #m-spec 은 매 호출마다 innerHTML 이 통째로 갈리므로 누적이 없다. */
  var waited = 0;
  function wrap() {
    if (window.__r24sel) return true;
    if (typeof window.renderModalSel !== 'function') return false;
    if (!window.__r22sel && ++waited < 40) return false;   // r22 바깥을 보장(최대 4초 대기)
    var orig = window.renderModalSel;
    window.renderModalSel = function () {
      var r = orig.apply(this, arguments);
      try { apply(); } catch (e) { console.warn('[r24] spec', e); }
      return r;
    };
    window.__r24sel = true;
    return true;
  }

  function boot() {
    wrap();
    var n = 0;
    var iv = setInterval(function () {
      if (wrap() || ++n > 100) clearInterval(iv);
    }, 100);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
  window.addEventListener('load', wrap);
})();
