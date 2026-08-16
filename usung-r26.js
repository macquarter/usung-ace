/* usung-r26.js — 제품 표기 「500Ø항아리등」 → 「500Ø갓등」 (2026-08-16)
 *
 * 근거: 260807_홈페이지_수정2.pptx S18 제목이 「LED조명- 갓등- 500Ø갓등」.
 *       승연 결정 — 「슬라이드 제목이 제품 기준이야.」
 *
 * ★ 표기만 바꾼다. 내부 키 '500Ø항아리등' 은 절대 건드리지 않는다.
 *   그 문자열은 아래 네 곳에서 **조회 키**로 쓰인다:
 *     usung-r24.js:80          'LED조명|갓등|500Ø항아리등'  → 규격(접속경)·기장 행 조회
 *     usung-r19-parts-data.js  COLPOL['500Ø항아리등']='paint' → 색상정책
 *     usung-r25.js:46          LED 12종 나열 순서표
 *     usung-catalog-data.js:76,77  카탈로그 원본 행(led009/led010)
 *   데이터를 고치면 r24 의 key() 가 'LED조명|갓등|500Ø갓등' 을 만들어 표를 못 찾고
 *   **규격(접속경)·기장 행이 조용히 사라진다**. r24 의 표는 IIFE 내부라 밖에서 못 고친다.
 *   그래서 화면에 다 찍힌 **뒤에** DOM 텍스트 노드만 갈아끼운다.
 *
 * ★ 모달은 반드시 r24 **뒤에** 감싼다(= 최외곽).
 *   r24 는 #m-crumb 의 <b> 를 읽어 키를 만든다. r26 이 안쪽이면 r24 가 바뀐 이름을 읽는다.
 *   그래서 window.__r24sel 이 설 때까지 기다렸다가 감싼다. 안 서면 아예 안 감싼다.
 *
 * 안전성 메모
 *   - 치환은 텍스트 노드 한정. 속성(value/data-*)·스크립트·스타일은 안 건드린다.
 *   - 멱등. '500Ø갓등' 안에 '500Ø항아리등' 이 없으므로 몇 번 돌려도 같은 결과다.
 *   - 항목명 「500Ø항아리등 스텐도장 동함마」 → 「500Ø갓등 스텐도장 동함마」.
 *     r21 이 규격 줄을 뽑는 정규식 /\d{2,4}\s?Ø/g 는 '500Ø' 를 그대로 찾는다 — 무영향.
 *   - 리포 소스는 전부 NFC 다(확인함). NFD 변형 대응 불필요.
 */
(function () {
  'use strict';

  var SRC = '500Ø항아리등';
  var DST = '500Ø갓등';
  var SKIP = { SCRIPT: 1, STYLE: 1, TEXTAREA: 1, NOSCRIPT: 1 };

  /* 텍스트 노드만 치환. 바꾼 노드 수를 돌려준다. */
  function swap(root) {
    if (!root) return 0;
    var w = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: function (n) {
        var p = n.parentNode;
        if (p && SKIP[p.nodeName]) return NodeFilter.FILTER_REJECT;
        return n.nodeValue.indexOf(SRC) < 0
          ? NodeFilter.FILTER_REJECT
          : NodeFilter.FILTER_ACCEPT;
      }
    });
    var hit = [], n, i;
    while ((n = w.nextNode())) hit.push(n);
    for (i = 0; i < hit.length; i++) {
      hit[i].nodeValue = hit[i].nodeValue.split(SRC).join(DST);
    }
    return hit.length;
  }

  /* 렌더 함수를 감싸 그린 직후 치환한다. 이미 감쌌으면 건너뛴다. */
  var wrapped = {};
  function wrapFn(name) {
    if (wrapped[name]) return true;
    var orig = window[name];
    if (typeof orig !== 'function') return false;
    window[name] = function () {
      var r = orig.apply(this, arguments);
      try { swap(document.body); } catch (e) {}
      return r;
    };
    wrapped[name] = 1;
    return true;
  }

  /* 목록·상세 진입점. r8Build 는 r25(정렬) 뒤에 감싸야 정렬 결과 위에서 돈다 —
     r26 이 inject.js 의 마지막 링크라 자연히 그렇게 된다. */
  var LIST = ['r8Build', 'renderBands', 'renderCatMain'];

  function tick() {
    var done = true, i;
    for (i = 0; i < LIST.length; i++) if (!wrapFn(LIST[i])) done = false;
    if (window.__r24sel) { if (!wrapFn('renderModalSel')) done = false; }
    else done = false;
    try { swap(document.body); } catch (e) {}
    return done;
  }

  var booted = false;
  function boot() {
    if (booted) return;
    booted = true;
    if (tick()) return;
    var n = 0;
    var iv = setInterval(function () {
      if (tick() || ++n > 80) clearInterval(iv);   // 최대 8초
    }, 100);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
  window.addEventListener('load', boot);

  window.__r26 = true;
})();
