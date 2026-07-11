/* =========================================================================
 * usung-tech8.js  —  기술 및 인증현황 > 8대 핵심기술 (원본 인포그래픽 이미지)
 * page-tech 의 #tech-grid 를 8개 원본 인포그래픽 이미지로 교체(최상단, 대형).
 * 요청: "각 파트로 해석하지 말고 최상단에 최대한 이미지를 차용" (2026-07-11)
 * 이미지: /techimg/ti1.js~ti8.js (webp base64 → window.GB['techimg1..8'])
 * 이전 텍스트패널 버전 백업: outputs/_backup_tech8/usung-tech8.remote.js
 * 되돌리기: 백업본으로 이 파일을 교체하면 원복.
 * ========================================================================= */
(function () {
  'use strict';

  // 원본 인포그래픽 8장의 제목 (alt / 캡션용)
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

  var IMG_V = '20260711img640';

  function injectStyle() {
    if (document.getElementById('t8-style')) return;
    var css = ''
      + '#tech-grid.t8-wrap{display:flex;flex-direction:column;gap:22px;max-width:720px;margin:0 auto;}'
      + '.t8-imgcard{background:#fff;border:1px solid #e5e9f0;border-radius:22px;padding:14px;'
      +   'box-shadow:0 1px 2px rgba(15,23,42,.04),0 16px 36px -22px rgba(15,23,42,.22);overflow:hidden;}'
      + '.t8-imgcard img{display:block;width:100%;max-width:660px;height:auto;margin:0 auto;border-radius:12px;cursor:zoom-in;background:#fff;'
      +   'transition:filter .18s;}'
      + '.t8-imgcard img:hover{filter:brightness(.985);}'
      + '.t8-imgcard.t8-loading{min-height:220px;display:flex;align-items:center;justify-content:center;color:#94a3b8;font-size:13px;}'
      + '.t8-lb{position:fixed;inset:0;background:rgba(15,23,42,.85);display:none;align-items:center;justify-content:center;z-index:99999;padding:20px;}'
      + '.t8-lb.on{display:flex;}'
      + '.t8-lb img{max-width:96vw;max-height:92vh;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.5);background:#fff;}'
      + '.t8-lb-x{position:absolute;top:18px;right:22px;width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.16);'
      +   'color:#fff;border:0;font-size:24px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;}'
      + '@media(max-width:860px){#tech-grid.t8-wrap{gap:14px;}.t8-imgcard{border-radius:16px;padding:6px;}}';
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
    var cards = document.querySelectorAll('#tech-grid .t8-imgcard');
    if (!cards.length) return false;
    var done = true;
    for (var k = 0; k < cards.length; k++) {
      var c = cards[k];
      if (c.getAttribute('data-loaded') === '1') continue;
      var idx = parseInt(c.getAttribute('data-i'), 10);
      var key = 'techimg' + idx;
      if (GB[key]) {
        c.innerHTML = '<img alt="유성에이스 핵심기술 ' + idx + '. ' + TITLES[idx - 1]
          + '" src="data:image/webp;base64,' + GB[key] + '">';
        c.className = 't8-imgcard';
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
        if (t && t.tagName === 'IMG' && t.parentNode && t.parentNode.className
            && String(t.parentNode.className).indexOf('t8-imgcard') > -1) {
          var box = document.getElementById('t8-lb');
          if (!box) return;
          box.querySelector('img').src = t.src;
          box.className = 't8-lb on';
        }
      });
    }
  }

  function loadImages() {
    ensureLightbox();
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
    var html = '';
    for (var i = 1; i <= 8; i++) {
      html += '<figure class="t8-imgcard t8-loading" data-i="' + i + '" data-loaded="0">'
        + '핵심기술 이미지 불러오는 중…</figure>';
    }
    grid.innerHTML = html;
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
        if (id === 'tech') setTimeout(render, 30);
        return r;
      };
      window.navigate.__t8 = true;
    }
  } catch (e) {}
})();
