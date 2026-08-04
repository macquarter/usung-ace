/* usung-r17.js — 260804 화면검토 7차 ① (브랜드스토리 헤더 마크 마운트)
 *
 * 하는 일
 *   `.r8x .bs-open .bs-tx` 안에서 한 줄에 나란히 있는 `.bs-k`(BRAND STORY)와
 *   `.bs-since`(SINCE1979) 를 flex 래퍼(`.r17-bshead`)로 감싸고,
 *   그 오른쪽 끝에 장식 마크(`.r17-bsmark`)를 붙인다. 스타일은 usung-r17.css.
 *
 * 설계 메모
 *   1. 마크 내용은 **영문·기호만** 쓴다. r16 다국어 엔진(`usung-r16-i18n.js`)은 한국어
 *      원문을 키로 치환하므로, 새 한국어 문구를 넣으면 사전 5개 언어를 같이 늘려야 한다.
 *      언어중립 문구를 쓰면 그 작업 자체가 사라진다.
 *   2. 사실 주장을 새로 만들지 않는다. 'SINCE1979' 는 이미 화면에 있는 문구이고,
 *      'USUNG ACE' / 'PAJU · KOREA' 는 푸터 주소(경기 파주시)와 일치한다.
 *      연차 계산값("47 YEARS")은 사이트 안에 SINCE1979 와 "20년 기술력" 이 공존해
 *      모순이 되므로 넣지 않는다.
 *   3. `#v-tech` 는 다른 뷰로 갔다 오면 다시 그려질 수 있다 → MutationObserver 로 재적용.
 *      `__r17mark` 플래그로 멱등을 보장한다.
 *   4. `.bs-k`/`.bs-since` 는 `.reveal` 클래스를 달고 있다. 노드를 옮겨도 클래스는
 *      그대로라 IntersectionObserver 상태(`in`)가 보존된다.
 */
(function () {
  'use strict';
  if (window.__usungR17) return;
  window.__usungR17 = true;

  var MARK =
    '<i class="r17-rail"></i>' +
    '<span class="r17-seal">' +
      '<i class="r17-dia"></i>' +
      '<span class="r17-seal-t"><b>USUNG ACE</b><em>PAJU &middot; KOREA</em></span>' +
    '</span>';

  function apply() {
    try {
      var txs = document.querySelectorAll('.r8x .bs-open .bs-tx');
      for (var i = 0; i < txs.length; i++) {
        var tx = txs[i];
        if (tx.__r17mark && tx.querySelector('.r17-bsmark')) continue;

        var k = tx.querySelector(':scope > .bs-k');
        var s = tx.querySelector(':scope > .bs-since');
        if (!k) continue;                       // 구조가 다르면 손대지 않는다

        var head = tx.querySelector(':scope > .r17-bshead');
        if (!head) {
          head = document.createElement('div');
          head.className = 'r17-bshead';
          tx.insertBefore(head, k);
          head.appendChild(k);
          if (s) head.appendChild(s);
        }
        if (!head.querySelector('.r17-bsmark')) {
          var mk = document.createElement('span');
          mk.className = 'r17-bsmark';
          mk.setAttribute('aria-hidden', 'true');
          mk.innerHTML = MARK;
          head.appendChild(mk);
        }
        tx.__r17mark = 1;
      }
    } catch (e) {}
  }

  function boot() {
    apply();
    // r8 마운트가 늦을 수 있다 — 약 8초간 재시도
    var n = 0, iv = setInterval(function () {
      apply();
      if (++n > 80) clearInterval(iv);
    }, 100);

    // 뷰 재렌더 대비
    try {
      var pend = false;
      var mo = new MutationObserver(function () {
        if (pend) return;
        pend = true;
        setTimeout(function () { pend = false; apply(); }, 120);
      });
      mo.observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
