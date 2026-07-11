/* =========================================================================
 * usung-tech8.js  —  기술 및 인증현황 > 8대 핵심기술 (원본 인포그래픽 이미지)
 * page-tech 의 #tech-grid 를 8개 원본 인포그래픽 이미지로 교체.
 * 2026-07-11 리디자인: 상단 8대 기술 인덱스(네이비 패널·번호칩·클릭 스크롤)
 *   + 번호 배지가 붙은 대형 슬라이드 카드 + 라이트박스 확대.
 *   이미지 자체는 기존 tiN.js 그대로 유지(제목은 이미지 안에 포함).
 * 이미지: /techimg/ti1.js~ti8.js (webp base64 → window.GB['techimg1..8'])
 * 리디자인 이전 백업: outputs/_backup_tech8/usung-tech8.pre-redesign-20260711.js
 * 되돌리기: 백업본으로 이 파일을 교체하면 원복.
 * ========================================================================= */
(function () {
  'use strict';

  // 원본 인포그래픽 8장의 제목 (인덱스 칩 / alt 용)
  var TITLES = [
    '맞춤형 제작',
    '360도 스윙',
    'FVD 방화댐퍼',
    'VD 풍량조절댐퍼',
    '양옆태엽 / 듀얼(더블) 다이캐스팅',
    '와이어 없는 텐션 구조',
    '분리 청소 가능 구조',
    '기름낙하방지필터'
  ];

  var IMG_V = '20260711img640b';

  function pad(n) { return n < 10 ? '0' + n : '' + n; }

  function injectStyle() {
    if (document.getElementById('t8-style')) return;
    var css = ''
      + '#tech-grid.t8-wrap{display:block;max-width:900px;margin:0 auto;padding:2px 0 6px;}'
      // ── 상단 인덱스(8대 기술 한눈에) ──
      + '.t8-index{background:linear-gradient(135deg,#0b1e4d 0%,#123a86 100%);border-radius:24px;'
      +   'padding:26px 26px 22px;margin:0 0 34px;box-shadow:0 22px 48px -28px rgba(11,30,77,.65);}'
      + '.t8-index-h{color:#e0f2fe;font-size:12px;font-weight:800;letter-spacing:.24em;'
      +   'text-transform:uppercase;margin:0 0 4px;opacity:.9;}'
      + '.t8-index-s{color:#fff;font-size:20px;font-weight:800;letter-spacing:-.02em;margin:0 0 16px;}'
      + '.t8-chips{display:grid;grid-template-columns:repeat(4,1fr);gap:12px;}'
      + '.t8-chip{display:flex;align-items:center;gap:10px;text-align:left;background:rgba(255,255,255,.06);'
      +   'border:1px solid rgba(255,255,255,.14);border-radius:14px;padding:11px 13px;cursor:pointer;'
      +   'color:#f1f5f9;font:inherit;transition:transform .15s,background .15s,border-color .15s;}'
      + '.t8-chip:hover{transform:translateY(-2px);background:rgba(255,255,255,.13);border-color:rgba(125,211,252,.6);}'
      + '.t8-chip-n{flex:0 0 auto;width:26px;height:26px;border-radius:8px;'
      +   'background:linear-gradient(135deg,#38bdf8,#0ea5e9);color:#04203f;font-size:12px;font-weight:900;'
      +   'display:flex;align-items:center;justify-content:center;}'
      + '.t8-chip-t{font-size:13px;font-weight:700;line-height:1.25;letter-spacing:-.01em;}'
      // ── 슬라이드 카드 ──
      + '.t8-slide{position:relative;background:#fff;border:1px solid #e5e9f0;border-radius:22px;padding:16px;'
      +   'margin:0 0 22px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 18px 40px -24px rgba(15,23,42,.24);'
      +   'scroll-margin-top:96px;overflow:hidden;}'
      + '.t8-badge{position:absolute;top:16px;left:16px;z-index:2;min-width:46px;height:34px;padding:0 12px;'
      +   'border-radius:11px;background:linear-gradient(135deg,#0b1e4d,#1d4ed8);color:#fff;font-size:15px;'
      +   'font-weight:900;letter-spacing:.04em;display:flex;align-items:center;justify-content:center;'
      +   'box-shadow:0 6px 16px -6px rgba(29,78,216,.7);}'
      + '.t8-imgbox{border-radius:12px;overflow:hidden;background:#fff;}'
      + '.t8-imgbox img{display:block;width:100%;max-width:760px;height:auto;margin:0 auto;'
      +   'cursor:zoom-in;transition:filter .18s;}'
      + '.t8-imgbox img:hover{filter:brightness(.985);}'
      + '.t8-imgbox.t8-loading{min-height:240px;display:flex;align-items:center;justify-content:center;'
      +   'color:#94a3b8;font-size:13px;}'
      // ── 라이트박스 ──
      + '.t8-lb{position:fixed;inset:0;background:rgba(15,23,42,.85);display:none;align-items:center;'
      +   'justify-content:center;z-index:99999;padding:20px;}'
      + '.t8-lb.on{display:flex;}'
      + '.t8-lb img{max-width:96vw;max-height:92vh;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.5);background:#fff;}'
      + '.t8-lb-x{position:absolute;top:18px;right:22px;width:42px;height:42px;border-radius:50%;'
      +   'background:rgba(255,255,255,.16);color:#fff;border:0;font-size:24px;line-height:1;cursor:pointer;'
      +   'display:flex;align-items:center;justify-content:center;}'
      // ── 반응형 ──
      + '@media(max-width:860px){'
      +   '#tech-grid.t8-wrap{padding:0;}'
      +   '.t8-index{border-radius:18px;padding:18px 15px 15px;margin-bottom:22px;}'
      +   '.t8-index-s{font-size:17px;}'
      +   '.t8-chips{grid-template-columns:repeat(2,1fr);gap:9px;}'
      +   '.t8-chip{padding:9px 10px;border-radius:12px;}'
      +   '.t8-chip-t{font-size:12px;}'
      +   '.t8-slide{border-radius:16px;padding:9px;margin-bottom:14px;}'
      +   '.t8-badge{top:11px;left:11px;height:30px;min-width:40px;font-size:14px;}'
      + '}';
    var s = document.createElement('style');
    s.id = 't8-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  function loadImageScripts() {
    if (window.__t8imgLoad) return;
    window.__t8imgLoad = true;
    for (var i = 1; i <= 8; i++) {
      var sc = document.createElement('script');
      sc.src = '/techimg/ti' + i + '.js?v=' + IMG_V;
      sc.defer = true;
      document.head.appendChild(sc);
    }
  }

  function fillImages() {
    var GB = window.GB || {};
    var cards = document.querySelectorAll('#tech-grid .t8-slide');
    if (!cards.length) return false;
    var done = true;
    for (var k = 0; k < cards.length; k++) {
      var c = cards[k];
      if (c.getAttribute('data-loaded') === '1') continue;
      var idx = parseInt(c.getAttribute('data-i'), 10);
      var key = 'techimg' + idx;
      var box = c.querySelector('.t8-imgbox');
      if (GB[key] && box) {
        box.innerHTML = '<img alt="유성에이스 핵심기술 ' + idx + '. ' + TITLES[idx - 1]
          + '" src="data:image/webp;base64,' + GB[key] + '">';
        box.className = 't8-imgbox';
        c.setAttribute('data-loaded', '1');
      } else {
        done = false;
      }
    }
    return done;
  }

  function ensureLightbox() {
    if (document.getElementById('t8-lb')) return;
    var lb = document.createElement('div');
    lb.id = 't8-lb';
    lb.className = 't8-lb';
    lb.innerHTML = '<button class="t8-lb-x" aria-label="닫기">×</button><img src="" alt="핵심기술 이미지 확대">';
    document.body.appendChild(lb);
    function close() { lb.className = 't8-lb'; }
    lb.addEventListener('click', function (e) {
      if (e.target === lb || (e.target.className && String(e.target.className).indexOf('t8-lb-x') > -1)) close();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    if (!window.__t8lbClick) {
      window.__t8lbClick = true;
      document.addEventListener('click', function (e) {
        var t = e.target;
        if (t && t.tagName === 'IMG' && t.closest && t.closest('.t8-imgbox')) {
          var box = document.getElementById('t8-lb');
          if (!box) return;
          box.querySelector('img').src = t.src;
          box.className = 't8-lb on';
        }
      });
    }
  }

  // 상단 인덱스 칩 클릭 → 해당 슬라이드로 부드럽게 스크롤
  function wireIndex() {
    if (window.__t8idx) return;
    window.__t8idx = true;
    document.addEventListener('click', function (e) {
      var t = e.target;
      var chip = t && t.closest ? t.closest('.t8-chip') : null;
      if (!chip) return;
      var n = chip.getAttribute('data-go');
      var target = document.getElementById('t8-slide-' + n);
      if (target) {
        try { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        catch (err) { target.scrollIntoView(); }
      }
    });
  }

  // tech 페이지 진입 시, 하단 고정 스크롤 휠마크가 인포그래픽을 가리지 않도록 숨김
  function hideScrollMark() {
    var page = document.getElementById('page-tech');
    if (page && page.classList.contains('active')) {
      var mk = document.getElementById('usung-scrollmark');
      if (mk) { mk.style.opacity = '0'; mk.style.pointerEvents = 'none'; }
    }
  }

  function loadImages() {
    ensureLightbox();
    wireIndex();
    loadImageScripts();
    var tries = 0;
    (function poll() {
      tries++;
      if (fillImages()) return;
      if (tries < 60) setTimeout(poll, 150);
    })();
  }

  function render() {
    var grid = document.getElementById('tech-grid');
    if (!grid) return;
    injectStyle();
    grid.className = 't8-wrap';

    var html = ''
      + '<div class="t8-index">'
      +   '<div class="t8-index-h">CORE TECHNOLOGY</div>'
      +   '<div class="t8-index-s">유성에이스 8대 핵심 기술</div>'
      +   '<div class="t8-chips">';
    for (var j = 1; j <= 8; j++) {
      html += '<button type="button" class="t8-chip" data-go="' + j + '">'
        + '<span class="t8-chip-n">' + pad(j) + '</span>'
        + '<span class="t8-chip-t">' + TITLES[j - 1] + '</span>'
        + '</button>';
    }
    html += '</div></div>';

    for (var i = 1; i <= 8; i++) {
      html += '<figure class="t8-slide" id="t8-slide-' + i + '" data-i="' + i + '" data-loaded="0">'
        + '<span class="t8-badge">' + pad(i) + '</span>'
        + '<div class="t8-imgbox t8-loading">핵심기술 이미지 불러오는 중…</div>'
        + '</figure>';
    }
    grid.innerHTML = html;
    hideScrollMark();
    loadImages();
  }

  // 원래 렌더러가 다시 다크카드로 덮어쓰지 못하도록 오버라이드
  try { window.renderTechGrid = render; } catch (e) {}

  function boot() {
    render();
    setTimeout(render, 300);
    setTimeout(render, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // 탭 전환(navigate)으로 tech 페이지에 진입할 때도 보장
  try {
    var _nav = window.navigate;
    if (typeof _nav === 'function' && !_nav.__t8) {
      window.navigate = function (id) {
        var r = _nav.apply(this, arguments);
        if (id === 'tech') { setTimeout(render, 30); setTimeout(hideScrollMark, 60); }
        return r;
      };
      window.navigate.__t8 = true;
    }
  } catch (e) {}
})();
