/* 유성에이스 네비게이션 방어 오버레이 (Phase 3, #5)
   목적: 메뉴 이동 시 이전 페이지의 잔존/스테일 콘텐츠 방지 (예방적 안전장치)
   - navigate 원본을 감싸 항상 최상단으로 스크롤(섹션 지정 시 제외)
   - tech(코어기술) 진입 시 renderTechGrid 재호출로 최신 렌더 보장
   - #146 제품 숫자(148→215 / 11→5) i18n 사전을 로드시 1회 보정 → 첫 렌더부터 215, 숫자 깜빡임 제거
   - #165 nav_tech 라벨(기술→기술 및 인증현황) 스테일 사전값 보정 → 네비 이동 시 라벨 깜빡임 제거
   전부 try/catch 로 감싸 사이트를 절대 깨지 않음. 되돌리기: <script> 한 줄 제거 + 파일 삭제 */
(function () {
  if (window.__usungNavFix) return;
  window.__usungNavFix = true;

  /* ── #146 제품 숫자 플립(148→215) 근본 제거 ─────────────────────────
     i18n.js 는 페이지 이동마다 window.I18N(T) 값을 다시 읽어 textContent 를
     덮어쓴다. 그래서 사전 값 자체를 215/5 로 미리 고쳐두면 첫 렌더부터 215 로
     그려져 148→215 로 깜빡이던 잔상성 숫자 변화가 사라진다.
     (의미가 다른 prod_parts_t1 "148…" 은 건드리지 않는다)
     ── #165 nav_tech: 사전에 축약값 "기술" 이 저장돼 있어 네비 이동(setLang)마다
        정적 라벨 "기술 및 인증현황" 을 덮어써 깜빡였다. 전체 라벨로 미리 보정한다. */
  var I18N_FIX = {
    ko: { prod_hero_tag: 'PRODUCT LINEUP · 215 MODELS', prod_hero_t1: '215가지 제품,', prod_stat1: '5개 카테고리', prod_stat2: '215종 실제 사진', nav_tech: '기술 및 인증현황' },
    en: { prod_hero_tag: 'PRODUCT LINEUP · 215 MODELS', prod_hero_t1: '215 products,', prod_stat1: '5 Categories', prod_stat2: '215 Real Photos', nav_tech: 'Technology & Certification' },
    ja: { prod_hero_tag: 'PRODUCT LINEUP · 215 MODELS', prod_hero_t1: '215種の製品、', prod_stat1: '5カテゴリ', prod_stat2: '215種の実写真', nav_tech: '技術・認証現況' },
    vi: { prod_hero_tag: 'PRODUCT LINEUP · 215 MODELS', prod_hero_t1: '215 sản phẩm,', prod_stat1: '5 danh mục', prod_stat2: '215 ảnh thực tế', nav_tech: 'Công nghệ & Chứng nhận' },
    zh: { prod_hero_tag: 'PRODUCT LINEUP · 215 MODELS', prod_hero_t1: '215种产品，', prod_stat1: '5个类别', prod_stat2: '215种实拍照片', nav_tech: '技术及认证' }
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

/* ===== USUNG CI LOGO SWAP (real delivered CI, byte-faithful scaled) ===== */
(function(){
  var U="data:image/png;base64,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";
  function swap(){
    var a=document.querySelectorAll('img[alt="유성에이스"]');
    for(var i=0;i<a.length;i++){ if(a[i].src!==U){ a[i].src=U; a[i].srcset=""; } }
  }
  swap();
  try{ new MutationObserver(swap).observe(document.documentElement,{childList:true,subtree:true}); }catch(e){}
  var n=0, iv=setInterval(function(){ swap(); if(++n>60) clearInterval(iv); },250);
})();
