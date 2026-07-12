/* 유성에이스 상단 로고 고정 오버레이 (#169)
   증상: 스크롤할 때마다 상단 로고 크기/이미지가 바뀌고(값 변경), 새로고침 시
        이전(원본) 로고가 잠깐/계속 노출됨.
   원인: React SPA 가 스크롤 시 <header> 를 재렌더 → <img id="nav-logo"> 를
        원본 src(네이티브 로고)로 다시 만든다. navfix 의 data-URI 스왑은 이 재렌더와
        경쟁(race)에서 져 원본 로고가 남는다.
   해결(경쟁 자체를 제거):
     1) CSS 로 #nav-logo 치수를 105x40 로 고정 → "값 변경"(크기 점프) 제거.
     2) CSS content:url(정품 data-URI) 로 이미지 자체를 선언적으로 고정 →
        React 가 src 를 원본으로 되돌려도 CSS 가 id 기준으로 항상 정품을 그린다.
        (재렌더로 새 엘리먼트가 생겨도 #nav-logo 규칙이 그대로 적용 → 깜빡임 0)
     3) data-URI 는 navfix.js(단일 출처)에서 런타임 추출 → 중복 저장 없음.
     4) content:url 미지원(Firefox) 대비: MutationObserver + scroll 로 src 강제.
   전부 try/catch. 되돌리기: inject.js <script> 한 줄 제거 + 이 파일 삭제. */
(function () {
  if (window.__usungLogoFix) return;
  window.__usungLogoFix = true;

  var DIM_ID = '__usung-logo-dim';
  var IMG_ID = '__usung-logo-img';
  var GOOD = null;

  function head() { return document.head || document.documentElement; }

  // 1) 치수 고정 CSS — 동기 즉시 주입 (크기 점프 제거, 이미지 무관)
  function lockDims() {
    try {
      if (document.getElementById(DIM_ID)) return;
      var st = document.createElement('style');
      st.id = DIM_ID;
      st.textContent = '#nav-logo{width:105px !important;height:40px !important;max-width:none !important;min-width:0 !important;object-fit:contain !important;}';
      head().appendChild(st);
    } catch (e) {}
  }
  lockDims();

  // 2) content:url 로 정품 로고 이미지 고정 (선언적 → 재렌더 무관)
  function applyContent() {
    try {
      if (!GOOD) return;
      var st = document.getElementById(IMG_ID);
      var rule = '#nav-logo{content:url("' + GOOD + '") !important;}';
      if (!st) { st = document.createElement('style'); st.id = IMG_ID; head().appendChild(st); }
      if (st.textContent !== rule) st.textContent = rule;
    } catch (e) {}
  }

  // 4) Firefox 등 content:url 미적용 브라우저 대비 — src 강제
  function enforceSrc() {
    try {
      if (!GOOD) return;
      var l = document.getElementById('nav-logo');
      if (l && l.getAttribute('src') !== GOOD) l.setAttribute('src', GOOD);
    } catch (e) {}
  }

  function capture(src) {
    if (src && src.slice(0, 10) === 'data:image' && src.length > 5000) {
      GOOD = src; applyContent(); enforceSrc(); return true;
    }
    return false;
  }

  // (a) 이미 navfix 가 스왑해 뒀다면 현재 로고에서 즉시 확보
  try { var l0 = document.getElementById('nav-logo'); if (l0) capture(l0.getAttribute('src')); } catch (e) {}

  // (b) navfix.js 원문에서 data-URI 추출 (단일 출처, 중복 저장 방지)
  if (!GOOD) {
    try {
      fetch('/usung-navfix.js').then(function (r) { return r.text(); }).then(function (t) {
        if (GOOD) return;
        var m = t.match(/data:image\/png;base64,[A-Za-z0-9+\/=]+/);
        if (m) capture(m[0]);
      }).catch(function () {});
    } catch (e) {}
  }

  // 3) 재렌더/스크롤 방어: 원본 로고로 되돌아가면 다시 고정
  try {
    var mo = new MutationObserver(function () {
      if (!GOOD) { var l = document.getElementById('nav-logo'); if (l) capture(l.getAttribute('src')); }
      enforceSrc();
    });
    mo.observe(document.documentElement, { subtree: true, childList: true, attributes: true, attributeFilter: ['src'] });
  } catch (e) {}

  try { window.addEventListener('scroll', function () { enforceSrc(); }, { passive: true, capture: true }); } catch (e) {}
})();
