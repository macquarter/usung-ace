/* usung-gallery.js — 시공갤러리 흰색테마 재조정 (슬라이드9, 0708 검토)
 * 요구(슬라이드9):
 *   1) 제품 사진이 일부만 보임 → 모달 사진을 object-fit:contain 으로 바꿔 제품 전체가 한눈에 보이도록.
 *   2) 모달 사진 클릭 시 전체 이미지가 크게(풀스크린 라이트박스) 보이도록.
 *   3) 모달 안 폰트가 흰색테마에서 안 보임(제목 #fff, 설명·핵심특징 옅은 회색) → 진한 배색으로 교체.
 *   4) 시공갤러리 썸네일 라벨이 화이트테마 오버라이드로 어둡게 덮여 사진 위에서 안 보임
 *      → 흰색 글씨로 복구 + 하단 어두운 그라디언트 유지.
 * 슬라이드10(핵심특징 개수): 렌더 코드가 (g.features||[]).map(...) 이라 배열 길이만큼만 표시 —
 *   이미 "입력한 개수만큼만" 동적 표시됨(고정 4칸 아님). 현재 데이터가 모두 4개라 4개로 보일 뿐. 코드 변경 불필요.
 * 원본 index_v6.html 불변. 런타임 <style> 주입 + 모달 이미지 클릭 라이트박스. 되돌리기: inject 스크립트 1줄 제거.
 */
(function () {
  'use strict';

  var NAVY = '#0c1e5a', BRAND = '#1e40af';

  function injectCss() {
    if (document.getElementById('usung-gallery-css')) return;
    var css = [
      /* ---- 모달 카드: 흰색 테마 ---- */
      '#gallery-modal .gm-card{background:#ffffff !important;border:1px solid rgba(12,30,90,.12) !important;box-shadow:0 40px 120px rgba(10,20,60,.28) !important;}',
      /* 사진 영역: 밝은 여백 + 제품 전체 노출(contain). 높은 특이도로 review.js의 cover !important 를 이김 */
      '#gallery-modal .gm-card .gm-image{background:#eef2f8 !important;}',
      '#gallery-modal .gm-card .gm-image img{object-fit:contain !important;cursor:zoom-in !important;}',
      '#gallery-modal .gm-card .gm-image::after{display:none !important;}',
      /* ---- 우측 정보 패널: 진한 글씨 ---- */
      '#gallery-modal .gm-content{background:#ffffff !important;color:#1e293b !important;}',
      '#gallery-modal .gm-cat{color:' + BRAND + ' !important;}',
      '#gallery-modal .gm-title{color:' + NAVY + ' !important;}',
      '#gallery-modal .gm-code{color:#475569 !important;background:#f1f5f9 !important;border:1px solid rgba(12,30,90,.12) !important;}',
      '#gallery-modal .gm-desc{color:#475569 !important;}',
      '#gallery-modal .gm-section-label{color:#64748b !important;}',
      '#gallery-modal .gm-features li{color:#334155 !important;}',
      '#gallery-modal .gm-features li::before{background:linear-gradient(90deg,' + BRAND + ',transparent) !important;}',
      '#gallery-modal .gm-tags span{color:' + BRAND + ' !important;background:rgba(30,64,175,.08) !important;border-color:rgba(30,64,175,.25) !important;}',
      /* 사양(gm-specs)은 review.js에서 숨김 처리됨 — 혹시 노출 대비 밝은 톤 */
      '#gallery-modal .gm-specs{background:rgba(12,30,90,.08) !important;border-color:rgba(12,30,90,.10) !important;}',
      '#gallery-modal .gm-specs > div{background:#f8fafc !important;}',
      '#gallery-modal .gm-specs dt{color:#64748b !important;}',
      '#gallery-modal .gm-specs dd{color:#0f172a !important;}',
      /* 인덱스/닫기/좌우 화살표 — 밝은 배경 대비 */
      '#gallery-modal .gm-index{background:rgba(12,30,90,.72) !important;color:#dbeafe !important;border-color:rgba(147,197,253,.40) !important;}',
      '#gallery-modal .gm-close{background:#ffffff !important;color:' + NAVY + ' !important;border:1px solid rgba(12,30,90,.18) !important;}',
      '#gallery-modal .gm-nav{background:#ffffff !important;color:' + NAVY + ' !important;border:1px solid rgba(12,30,90,.18) !important;}',
      /* ---- 시공갤러리 썸네일: 사진 위 라벨 흰색 복구 + 그림자 + 하단 어두운 그라디언트 ----
         theme-white.css '.page:not(#page-home) .text-white'(특이도 1·2·0)를 이기려면
         ID 2개(#page-gallery #gallery-grid)로 특이도를 올려야 함. 밝은 사진 대비용 text-shadow 추가. */
      '#page-gallery #gallery-grid button .text-white{color:#ffffff !important;text-shadow:0 1px 3px rgba(0,0,0,.9),0 0 2px rgba(0,0,0,.75) !important;}',
      '#page-gallery #gallery-grid button .text-blue-400{color:#93c5fd !important;text-shadow:0 1px 3px rgba(0,0,0,.9) !important;}',
      '#page-gallery #gallery-grid button .bg-gradient-to-t{background:linear-gradient(to top, rgba(0,0,0,.88) 0%, rgba(0,0,0,.45) 38%, transparent 70%) !important;}',
      '#page-home #gallery-preview button .text-white{color:#ffffff !important;}',
      '#page-home #gallery-preview button .text-blue-400{color:#93c5fd !important;}',
      /* 풀스크린 라이트박스 */
      '#usung-gm-lightbox{position:fixed;inset:0;z-index:400;display:none;align-items:center;justify-content:center;background:rgba(6,12,30,.94);cursor:zoom-out;padding:24px;}',
      '#usung-gm-lightbox.open{display:flex;}',
      '#usung-gm-lightbox img{max-width:96vw;max-height:94vh;object-fit:contain;box-shadow:0 30px 90px rgba(0,0,0,.6);border-radius:8px;}',
      '#usung-gm-lightbox .lb-close{position:absolute;top:20px;right:24px;width:44px;height:44px;border-radius:999px;background:rgba(255,255,255,.12);border:1px solid rgba(255,255,255,.35);color:#fff;font-size:22px;cursor:pointer;display:flex;align-items:center;justify-content:center;}'
    ].join('');
    var st = document.createElement('style');
    st.id = 'usung-gallery-css';
    st.textContent = css;
    document.head.appendChild(st);
  }

  // 모달 사진 클릭 → 전체 이미지 풀스크린 라이트박스
  function ensureLightbox() {
    var lb = document.getElementById('usung-gm-lightbox');
    if (lb) return lb;
    lb = document.createElement('div');
    lb.id = 'usung-gm-lightbox';
    lb.innerHTML = '<button type="button" class="lb-close" aria-label="닫기">&times;</button><img alt="">';
    document.body.appendChild(lb);
    function close() { lb.classList.remove('open'); }
    lb.addEventListener('click', function (e) {
      if (e.target === lb || e.target.classList.contains('lb-close')) close();
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && lb.classList.contains('open')) close();
    });
    return lb;
  }

  function wireImageZoom() {
    var img = document.getElementById('gm-img-el');
    if (!img || img.__usungZoom) return;
    img.__usungZoom = true;
    img.addEventListener('click', function () {
      var lb = ensureLightbox();
      var big = lb.querySelector('img');
      big.src = img.currentSrc || img.src;
      big.alt = img.alt || '';
      lb.classList.add('open');
    });
  }

  function boot() {
    injectCss();
    wireImageZoom();
    setTimeout(function () { injectCss(); wireImageZoom(); }, 400);
    setTimeout(function () { injectCss(); wireImageZoom(); }, 1400);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // 갤러리로 이동할 때마다 재적용(썸네일 재렌더 대비)
  if (typeof window.navigate === 'function' && !window.__galleryNavWrapped) {
    window.__galleryNavWrapped = true;
    var _nav = window.navigate;
    window.navigate = function (id) {
      var r = _nav.apply(this, arguments);
      injectCss();
      setTimeout(wireImageZoom, 60);
      return r;
    };
  }
})();
