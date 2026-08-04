/* usung-r17.js — 260804 브랜드스토리 헤더 배치 (r18 에서 내용 변경)
 *
 * 하는 일
 *   `.r8x .bs-open .bs-tx` 안에서 한 줄에 나란히 있는 `.bs-k`(BRAND STORY)와
 *   `.bs-since`(SINCE1979) 를 flex 래퍼(`.r17-bshead`)로 감싸고,
 *   그 **왼쪽**에 장식 레일(`.r17-bsmark`)을 넣어 두 라벨을 오른쪽으로 민다.
 *   스타일은 usung-r17.css(래퍼) + usung-r18.css(우측 정렬·레일 재도색).
 *
 * r18 변경 (260804 8차 ①)
 *   · r17 의 'USUNG ACE / PAJU · KOREA' 씰을 **제거**했다(사용자 요청).
 *     마크는 이제 그라디언트 레일 하나뿐이고, 래퍼 맨 앞으로 들어가 여백을 먹는다.
 *   · 이미 씰이 심긴 DOM 도 만날 수 있다(뷰 재렌더 전 상태) → 발견 시 innerHTML 을
 *     현재 MARK 로 되맞춘다. 그래야 되돌아온 뷰에 옛 씰이 남지 않는다.
 *
 * 설계 메모
 *   1. 마크 내용은 **영문·기호만** 쓴다. r16 다국어 엔진(`usung-r16-i18n.js`)은 한국어
 *      원문을 키로 치환하므로, 새 한국어 문구를 넣으면 사전 5개 언어를 같이 늘려야 한다.
 *      언어중립 문구(지금은 아예 텍스트 없음)를 쓰면 그 작업 자체가 사라진다.
 *   2. `#v-tech` 는 다른 뷰로 갔다 오면 다시 그려질 수 있다 → MutationObserver 로 재적용.
 *      `__r17mark` 플래그로 멱등을 보장한다.
 *   3. `.bs-k`/`.bs-since` 는 `.reveal` 클래스를 달고 있다. 노드를 옮겨도 클래스는
 *      그대로라 IntersectionObserver 상태(`in`)가 보존된다.
 */
(function () {
  'use strict';
  if (window.__usungR17) return;
  window.__usungR17 = true;

  var MARK = '<i class="r17-rail"></i><i class="r17-dia"></i>';

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
        var mk = head.querySelector('.r17-bsmark');
        if (!mk) {
          mk = document.createElement('span');
          mk.className = 'r17-bsmark';
          mk.setAttribute('aria-hidden', 'true');
          mk.innerHTML = MARK;
        }
        // r17 씰이 남아 있으면 현재 MARK 로 되맞춘다 (레일 1개만 남긴다)
        if (mk.querySelector('.r17-seal')) mk.innerHTML = MARK;
        // 레일은 두 라벨 **왼쪽**에서 여백을 먹어야 한다 → 항상 첫 자식
        if (head.firstChild !== mk) head.insertBefore(mk, head.firstChild);

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
