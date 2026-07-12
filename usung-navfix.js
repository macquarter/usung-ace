/* 유성에이스 네비게이션 방어 오버레이 (Phase 3, #5)
   목적: 메뉴 이동 시 이전 페이지의 잔존/스테일 콘텐츠 방지 (예방적 안전장치)
   - navigate 원본을 감싸 항상 최상단으로 스크롤(섹션 지정 시 제외)
   - tech(코어기술) 진입 시 renderTechGrid 재호출로 최신 렌더 보장
   - #146 제품 숫자(148→215 / 11→5) i18n 사전을 로드시 1회 보정 → 첫 렌더부터 215, 숫자 깜빡임 제거
   전부 try/catch 로 감싸 사이트를 절대 깨지 않음. 되돌리기: <script> 한 줄 제거 + 파일 삭제 */
(function () {
  if (window.__usungNavFix) return;
  window.__usungNavFix = true;

  /* ── #146 제품 숫자 플립(148→215) 근본 제거 ─────────────────────────
     i18n.js 는 페이지 이동마다 window.I18N(T) 값을 다시 읽어 textContent 를
     덮어쓴다. 그래서 사전 값 자체를 215/5 로 미리 고쳐두면 첫 렌더부터 215 로
     그려져 148→215 로 깜빡이던 잔상성 숫자 변화가 사라진다.
     (의미가 다른 prod_parts_t1 "148…" 은 건드리지 않는다) */
  var I18N_FIX = {
    ko: { prod_hero_tag: 'PRODUCT LINEUP · 215 MODELS', prod_hero_t1: '215가지 제품,', prod_stat1: '5개 카테고리', prod_stat2: '215종 실제 사진' },
    en: { prod_hero_tag: 'PRODUCT LINEUP · 215 MODELS', prod_hero_t1: '215 products,', prod_stat1: '5 Categories', prod_stat2: '215 Real Photos' },
    ja: { prod_hero_tag: 'PRODUCT LINEUP · 215 MODELS', prod_hero_t1: '215種の製品、', prod_stat1: '5カテゴリ', prod_stat2: '215種の実写真' },
    vi: { prod_hero_tag: 'PRODUCT LINEUP · 215 MODELS', prod_hero_t1: '215 sản phẩm,', prod_stat1: '5 danh mục', prod_stat2: '215 ảnh thực tế' },
    zh: { prod_hero_tag: 'PRODUCT LINEUP · 215 MODELS', prod_hero_t1: '215种产品，', prod_stat1: '5个类别', prod_stat2: '215种实拍照片' }
  };
  function fixI18n() {
    try {
      var I = window.I18N; if (!I) return false;
      for (var L in I18N_FIX) { if (!I[L]) continue; for (var k in I18N_FIX[L]) { if (I[L][k] !== I18N_FIX[L][k]) I[L][k] = I18N_FIX[L][k]; } }
      if (typeof window.getLang === 'function' && typeof window.setLang === 'function') {
        try { window.setLang(window.getLang()); } catch (e) {}
      }
      return true;
    } catch (e) { return false; }
  }
  if (!fixI18n()) {
    var fn = 0, fiv = setInterval(function () { if (fixI18n() || ++fn > 40) clearInterval(fiv); }, 50);
  }

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
