/* usung-r19-parts.js — 제품 상세 모달의 부품 구성을 「모델별 정확 리스트」로 교체
 * 260809「라스트」PPT 반영. 데이터는 usung-r19-parts-data.js (window.R19).
 *
 * 기존 동작: renderParts(cat) 이 CATPARTS[대분류] 의 대표 12종을 보여줬다 (제품과 무관).
 * 바뀐 동작: 현재 모델(curModel)로 정확한 부품 목록·순서를 뽑는다. 부품이 없는 제품은 섹션째 숨긴다.
 *
 * ★ renderParts 는 함수 선언이라 전역 객체 속성이다 → window.renderParts 재대입으로 교체된다.
 *   openModel 안의 무자격 호출 renderParts(...) 도 교체본으로 해석된다.
 * ★ curModel 은 let 선언(전역 렉시컬)이라 window.curModel 로는 못 읽는다. 맨 이름으로 읽되
 *   데이터 파일 미실행 시 typeof 조차 TDZ 로 던지므로 반드시 try 로 감싼다.
 */
(function () {
  'use strict';

  var obs = null;

  function model() {
    try { return curModel || null; } catch (e) { return null; }
  }

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  }

  function label(id, over) {
    var b = {};
    try { b = (R8_PARTS && R8_PARTS[id]) || {}; } catch (e) { b = {}; }
    var o = over[id] || {};
    return { nm: o.nm != null ? o.nm : (b.nm || id), sp: o.sp != null ? o.sp : (b.sp || '') };
  }

  function tile(id, over) {
    var t = label(id, over), lo = '';
    try { lo = (PART_LOWRES && PART_LOWRES.has && PART_LOWRES.has(id)) ? ' lowres' : ''; } catch (e) { }
    return '<div class="pt' + lo + '">' +
      '<div class="pi"><img loading="lazy" crossorigin="anonymous" onload="trimImg(this)"' +
      ' src="' + esc(window.R19.src(id)) + '" alt="' + esc(t.nm) + '"></div>' +
      '<div class="pn">' + esc(t.nm) + '</div>' +
      '<div class="ps">' + (t.sp ? esc(t.sp) : '&nbsp;') + '</div>' +
      '</div>';
  }

  function swatches(names, from) {
    return names.map(function (nm, i) {
      var k = from + i;
      return '<figure class="r19-sw" style="--c:' + (k % 5) + ';--r:' + Math.floor(k / 5) + '">' +
        '<i></i><figcaption>' + esc(nm) + '</figcaption></figure>';
    }).join('');
  }

  function colorChart() {
    var C = window.R19.COLORS;
    return '<div class="r19-cc">' +
      '<h4><span class="en">COLOR &amp; FINISH</span> 파이프 색상표</h4>' +
      '<p class="hint">파이프는 아래 15종 마감 중에서 선택하실 수 있습니다.</p>' +
      '<div class="r19-grp"><span class="r19-tag">도금</span><b>' + C.plate.length + '종</b></div>' +
      '<div class="r19-row">' + swatches(C.plate, 0) + '</div>' +
      '<div class="r19-grp"><span class="r19-tag">도장</span><b>' + C.paint.length + '종</b></div>' +
      '<div class="r19-row">' + swatches(C.paint, C.plate.length) + '</div>' +
      '<p class="r19-note">※ 화면 및 조명 환경에 따라 실제 제품 색상과 차이가 있을 수 있습니다.</p>' +
      '</div>';
  }

  function reveal(el) {
    if (obs) obs.disconnect();
    var root = document.getElementById('mask');
    var cards = [].slice.call(el.querySelectorAll('.pt,.r19-sw'));
    if (!('IntersectionObserver' in window)) {
      cards.forEach(function (c) { c.classList.add('in'); });
      return;
    }
    obs = new IntersectionObserver(function (ents, o) {
      ents.forEach(function (e) {
        if (!e.isIntersecting) return;
        var c = e.target;
        c.style.transitionDelay = ((cards.indexOf(c) % 6) * 60) + 'ms';
        c.classList.add('in');
        o.unobserve(c);
      });
    }, { root: root, rootMargin: '0px 0px -8% 0px', threshold: 0.12 });
    cards.forEach(function (c) { obs.observe(c); });
  }

  function render() {
    var el = document.getElementById('m-parts');
    if (!el || !window.R19) return;
    var p = window.R19.plan(model());
    if (!p.ids.length && !p.color) { el.style.display = 'none'; el.innerHTML = ''; return; }
    el.style.display = '';
    var html = '';
    if (p.ids.length) {
      html += '<h4><span class="en">PARTS &amp; COMPONENTS</span> 부품 구성</h4>' +
        '<p class="hint">※ 해당 제품에 사용되는 부품 구성입니다. 설치 환경에 따라 일부 옵션이 달라질 수 있습니다.</p>' +
        '<div class="pt-grid r19-grid">' + p.ids.map(function (id) { return tile(id, p.over); }).join('') + '</div>';
    }
    if (p.color) html += colorChart();
    el.innerHTML = html;
    reveal(el);
  }

  // renderParts(cat) 시그니처 유지 — 인자는 무시하고 현재 모델로 판단한다.
  window.renderParts = function () { try { render(); } catch (e) { console.warn('[r19] renderParts', e); } };
})();
