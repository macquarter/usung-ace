/* usung-r14.js — 기술력 히어로 콘텐츠 + 푸터 메뉴 복원 (260803 4차 ①③)
 *
 * ① 히어로가 문구 3줄뿐이라 실측 내용 301px 에 여백 290px 였다. 통계 4종을 칩으로 올리고
 *    스크롤 유도 버튼을 붙인다. 표시는 usung-r14-hero.css.
 * ③ 푸터 메뉴 4개 중 2개가 usung-r5-nav.js 의 hideByI18n 으로 inline display:none 이라
 *    실제로는 2개만 보였다(부품소개·사용방법은 r5 때 의도적으로 뺀 섹션이다).
 *    헤더에 실제로 보이는 5개로 다시 세운다.
 *
 * ★ 숫자를 화면에서 긁지 말 것 — #th-stats .st-n 은 0 부터 카운트업한다.
 *   최종값은 data-t 속성에 있다(usung-r8-tech.js:171).
 * ★ 헤더 상단 내비 버튼은 data-i18n 이 없다(라이브 실측) → 푸터도 한국어 고정으로 맞춘다.
 *   언어 전환 시 헤더와 같은 상태가 되므로 새로 생기는 불일치는 없다(잔여업무 A-9 와 같은 성격).
 */
(function () {
  'use strict';
  if (window.__usungR14) return;
  window.__usungR14 = true;

  /* ── ① 히어로 ─────────────────────────────────────────────── */
  function statChips() {
    var ns = document.querySelectorAll('#th-stats .st-n');
    if (!ns.length) return null;
    var out = [];
    [].forEach.call(ns, function (n) {
      var t = n.getAttribute('data-t');
      var em = n.querySelector('em');
      var l = n.parentNode.querySelector('.st-l');
      if (!t || !l) return;
      var num = n.getAttribute('data-comma') ? (+t).toLocaleString('en-US') : t;
      out.push({ v: num + (em ? em.textContent : ''), l: l.textContent });
    });
    return out.length ? out : null;
  }
  // behavior:'smooth' 는 이 페이지에서 시작조차 하지 않는다(CLAUDE.md §3) → 직접 보간한다
  function glide(to) {
    var from = window.scrollY, d = to - from, t0 = 0;
    function step(ts) {
      if (!t0) t0 = ts;
      var p = Math.min(1, (ts - t0) / 520);
      var e = p < .5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
      window.scrollTo(0, from + d * e);
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }
  function hero() {
    var wrap = document.querySelector('#v-tech .th-hero .wrap');
    if (!wrap || wrap.querySelector('.r14-chips')) return true;
    var st = statChips();
    if (!st) return false;

    var box = document.createElement('div');
    box.className = 'r14-chips';
    st.forEach(function (s) {
      var c = document.createElement('div');
      c.className = 'r14-chip';
      c.appendChild(document.createElement('i'));
      var b = document.createElement('b'); b.textContent = s.v; c.appendChild(b);
      var sp = document.createElement('span'); sp.textContent = s.l; c.appendChild(sp);
      box.appendChild(c);
    });
    wrap.appendChild(box);

    var cue = document.createElement('button');
    cue.type = 'button';
    cue.className = 'r14-cue';
    cue.appendChild(document.createTextNode('국내 최초의 기술 보기 '));
    var bb = document.createElement('b'); bb.textContent = '↓'; cue.appendChild(bb);
    cue.addEventListener('click', function () {
      var el = document.querySelector('#v-tech .th-firsts');
      if (el) glide(Math.max(0, el.getBoundingClientRect().top + window.scrollY - 76));
    });
    wrap.appendChild(cue);
    return true;
  }

  /* ── ③ 푸터 ───────────────────────────────────────────────── */
  // 라이브 헤더 실측 순서. 부품소개는 헤더에서도 숨겨져 있어 뺀다.
  var MENU = [
    ['about', '회사소개'], ['products', '제품소개'], ['gallery', '시공갤러리'],
    ['tech', '기술력'], ['board', '공지게시판']
  ];
  function footerCol() {
    var us = document.querySelectorAll('footer ul');
    for (var i = 0; i < us.length; i++) {
      if (us[i].querySelector('button[onclick*="navigate("]')) return us[i];
    }
    return null;
  }
  function footer() {
    var ul = footerCol();
    if (!ul) return false;
    if (ul.getAttribute('data-r14') === '1') return true;

    var cls = 'hover:text-white transition-colors';
    var first = ul.querySelector('button');
    if (first) cls = first.className || cls;

    ul.innerHTML = '';
    MENU.forEach(function (m) {
      var li = document.createElement('li');
      var b = document.createElement('button');
      b.type = 'button';
      b.className = cls;
      b.textContent = m[1];
      b.addEventListener('click', function () {
        try { if (typeof window.navigate === 'function') window.navigate(m[0]); } catch (e) {}
      });
      li.appendChild(b);
      ul.appendChild(li);
    });
    ul.setAttribute('data-r14', '1');

    var col = ul.parentNode;
    var h = col && col.querySelector('h4');
    if (h) h.textContent = 'MENU';
    watch(col);
    return true;
  }
  // 푸터가 다시 그려지면 원본 4줄로 되돌아간다 → 부모를 감시해 다시 세운다
  function watch(col) {
    if (!col || col.__r14) return;
    col.__r14 = 1;
    new MutationObserver(function () {
      var ul = footerCol();
      if (ul && ul.getAttribute('data-r14') !== '1') footer();
    }).observe(col, { childList: true, subtree: true });
  }

  /* ── 배선 ─────────────────────────────────────────────────── */
  // 히어로는 r8 기술력 렌더 뒤에야 잡힌다. 뷰가 다시 그려지면 칩도 같이 날아가므로
  // 성공 뒤에도 한동안 지켜본다(기술력 진입이 늦을 수 있다).
  var t = 0, fDone = false;
  (function boot() {
    if (!fDone) fDone = footer();
    hero();
    if (++t < 300) setTimeout(boot, 200);
  })();
})();
