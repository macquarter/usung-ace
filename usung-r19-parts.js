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

  // 260804 취합본 r2 S16·S17 — 모델별 색상 정책
  //   'all'   : 도금 7 + 도장 8 = 15종            (350·450갓등 · 600·450우주선)
  //   'paint' : 도장 8종만                        (500Ø항아리갓등 「도장만 가능」)
  //   'acryl' : 15종이되 파이프 한정 + 변경불가 안내 (450Ø우주선·400Ø원형 아크릴)
  // ★ 색상 스프라이트 좌표는 COLORS.all 기준 절대 index 다. 도장만 그릴 때도
  //   from 을 plate.length 로 넘겨야 칸이 밀리지 않는다.
  function grp(tag, fin, names, from) {
    return '<div class="r19-grp"><span class="r19-tag">' + tag + '</span>' +
      '<b>' + names.length + '종</b><span class="r19-fin">' + esc(fin) + '</span></div>' +
      '<div class="r19-row">' + swatches(names, from) + '</div>';
  }

  function colorChart(mode) {
    var C = window.R19.COLORS, F = window.R19.FINISH || { plate: '', paint: '' };
    var hint, body;
    if (mode === 'paint') {
      hint = '이 제품은 <b>도장 마감만</b> 가능합니다. 파이프는 아래 ' + C.paint.length + '종 중에서 선택하실 수 있습니다.';
      body = grp('도장', F.paint, C.paint, C.plate.length);
    } else {
      hint = mode === 'acryl'
        ? '이 제품은 <b>파이프 색상만</b> 변경할 수 있습니다. 파이프는 아래 ' + C.all.length + '종 중에서 선택하실 수 있습니다.'
        : '이 제품은 <b>색상 선택이 가능</b>합니다. 파이프는 아래 ' + C.all.length + '종 마감 중에서 선택하실 수 있습니다.';
      body = grp('도금', F.plate, C.plate, 0) + grp('도장', F.paint, C.paint, C.plate.length);
    }
    return '<div class="r19-cc">' +
      '<h4><span class="en">COLOR &amp; FINISH</span> 파이프 색상표</h4>' +
      '<p class="hint">' + hint + '</p>' + body +
      (mode === 'acryl'
        ? '<p class="r19-note warn">※ 아크릴(우주선 · 원형) 부분은 색상 변경이 불가합니다.</p>' : '') +
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
    // ★ r31/S06 — 색상표를 부품 구성보다 **앞**에 그린다.
    //   덱 260812_홈페이지_수정_r2 S06:「색상표가 부품소개 아래에 있어서 보기가 어려워서요 …
    //   전체 제품의 제품소개 옆에 색상표 있게 해주세용」
    //   #m-parts 는 #m-opts(색상·마감 스와치) 바로 다음 블록이다. 색상표를 이 블록 첫머리로
    //   올리면 스와치 → 색상표가 붙어, 부품 그리드를 지나쳐야 보이던 문제가 사라진다.
    //   순서만 바꿨다 — colorChart/부품 그리드의 마크업·데이터는 그대로다.
    var html = '';
    if (p.color) html += colorChart(p.color);
    if (p.ids.length) {
      html += '<h4><span class="en">PARTS &amp; COMPONENTS</span> 부품 구성</h4>' +
        '<p class="hint">※ 해당 제품에 사용되는 부품 구성입니다. 설치 환경에 따라 일부 옵션이 달라질 수 있습니다.</p>' +
        '<div class="pt-grid r19-grid">' + p.ids.map(function (id) { return tile(id, p.over); }).join('') + '</div>';
    }
    el.innerHTML = html;
    reveal(el);
  }

  // renderParts(cat) 시그니처 유지 — 인자는 무시하고 현재 모델로 판단한다.
  window.renderParts = function () { try { render(); } catch (e) { console.warn('[r19] renderParts', e); } };
})();
