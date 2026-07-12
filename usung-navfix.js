/* 유성에이스 네비게이션 방어 오버레이 (Phase 3, #5)
   목적: 메뉴 이동 시 이전 페이지의 잔존/스테일 콘텐츠 방지 (예방적 안전장치)
   - navigate 원본을 감싸 항상 최상단으로 스크롤(섹션 지정 시 제외)
   - tech(코어기술) 진입 시 renderTechGrid 재호출로 최신 렌더 보장
   전부 try/catch 로 감싸 사이트를 절대 깨지 않음. 되돌리기: <script> 한 줄 제거 + 파일 삭제 */
(function () {
  if (window.__usungNavFix) return;
  window.__usungNavFix = true;
  function wrap() {
    try {
      var orig = window.navigate;
      if (typeof orig !== 'function') return false;
      if (orig.__usungNav) return true;
      var wrapped = function (id, section) {
        var r;
        try { r = orig.apply(this, arguments); } catch (e) { r = undefined; }
        try {
          if (!section) { window.scrollTo(0, 0); }
          if (id === 'tech' && typeof window.renderTechGrid === 'function') {
            setTimeout(function () { try { window.renderTechGrid(); } catch (e) {} }, 40);
          }
        } catch (e) {}
        return r;
      };
      wrapped.__usungNav = true;
      try { wrapped.__t8 = orig.__t8; } catch (e) {}
      window.navigate = wrapped;
      return true;
    } catch (e) { return false; }
  }
  if (!wrap()) {
    var n = 0, iv = setInterval(function () { if (wrap() || ++n > 40) clearInterval(iv); }, 100);
  }
})();
