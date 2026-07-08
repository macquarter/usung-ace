/* usung-products-order.js — 제품소개 대분류 폴더 번호 (슬라이드5)
 * 요구: "폴더는 순서대로 배치되도록 번호를 붙임 (중분류/제품그룹은 번호 표시 X)"
 *   - 대분류(왼쪽 사이드바 폴더)에만 1~5. 번호를 붙인다.
 *   - 5번 폴더 라벨을 "하향식 후드 / 코브라 후드"로 표기(데이터 키 '코브라후드'는 불변).
 *   - 중분류(갤럭시A/B…), 제품그룹(양옆태엽…)은 번호 없음 — 그대로 둔다.
 * 데이터(UP_DATA) 순서는 이미 마스터와 일치하므로 순서 변경 없이 라벨만 패치.
 * 원본 index_v6.html 은 건드리지 않는 런타임 오버레이. 되돌리기: inject.js 주입 1줄 제거.
 */
(function () {
  'use strict';

  var MAP = {
    '갤럭시':     { n: '1', label: '갤럭시' },
    'LED조명':    { n: '2', label: 'LED조명' },
    '파이프':     { n: '3', label: '파이프' },
    '후레쉬볼':   { n: '4', label: '후레쉬볼' },
    '코브라후드': { n: '5', label: '하향식 후드 / 코브라 후드' }
  };

  function keyFromBtn(b) {
    var oc = b.getAttribute('onclick') || '';
    var m = oc.match(/upGoCat\((['"])(.*?)\1\)/);
    return m ? m[2] : null;
  }

  function apply() {
    var page = document.getElementById('page-products');
    if (!page) return;
    var tops = page.querySelectorAll('button[onclick^="upGoCat("]');
    for (var i = 0; i < tops.length; i++) {
      var b = tops[i];
      var key = keyFromBtn(b);
      var info = MAP[key];
      if (!info) continue;
      var span = b.querySelector('span'); // 첫 번째 span = 라벨(두 번째 span = 개수 뱃지)
      if (!span) continue;
      var want = info.n + '. ' + info.label;
      if (span.textContent !== want) span.textContent = want;
    }
  }

  function schedule() { apply(); setTimeout(apply, 60); setTimeout(apply, 300); }

  // 사이드바 재렌더(카테고리 클릭 등) 시 자동 재적용
  function observe() {
    var page = document.getElementById('page-products');
    if (!page || page.__usungNumObserved) return;
    page.__usungNumObserved = true;
    var mo = new MutationObserver(function () { apply(); });
    mo.observe(page, { childList: true, subtree: true });
  }

  function boot() {
    schedule();
    observe();
    setTimeout(observe, 500);
    setTimeout(schedule, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // 제품소개로 이동할 때마다 재적용
  if (typeof window.navigate === 'function' && !window.__prodOrderNavWrapped) {
    window.__prodOrderNavWrapped = true;
    var _nav = window.navigate;
    window.navigate = function (id) {
      var r = _nav.apply(this, arguments);
      if (id === 'products') schedule();
      return r;
    };
  }
})();
