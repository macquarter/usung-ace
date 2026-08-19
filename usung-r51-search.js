/* usung-r51-search.js — r51 헤더 전역 검색 · UI 와 착지
 *
 * ★ 마운트 위치: #lang-selector 앞 (= #navbar 안쪽 flex 행의 형제).
 *   #primary-nav 안에는 넣지 않는다 — usung-r10-fix.css:45 가 그 nav 를 0.7초간
 *   visibility:hidden 으로 덮어두기 때문에 자식으로 넣으면 검색 버튼도 같이 사라진다.
 *   부모는 `display:flex; justify-content:space-between` (측정값, gap 없음)이라
 *   6번째 자식이 되면 데스크톱 간격만 조금 좁아지고 세로로 서지 않는다 (KNOWLEDGE 46).
 *   ≤767px 에선 로고·햄버거만 남으므로 `margin-left:auto` 로 햄버거 옆에 붙인다.
 *   767/768 은 Tailwind 의 md 경계 그대로다 — 새 폭을 만들지 않는다 (KNOWLEDGE 31).
 *
 * ★ 패널은 body 직속에 붙인다. id 는 전부 `r51-` 접두사라 라이브 id 와 겹치지 않는다.
 *   z-index 는 10000 — #navbar(z-50) 와 r42 하단 전화바(9500) 위다.
 *
 * ★ 착지 경로는 전부 라이브에서 실측한 것들이다 (2026-08-19):
 *     제품   navigate('products') → upGoModel(id) → upDetailVar(k)
 *     갤러리 navigate('gallery')  → (전체 탭 확인) → openLbox(i)
 *     부품   navigate('parts')    → openPartModal(i)
 */
(function () {
  'use strict';

  var panel, input, listEl, open = false, rows = [], cur = -1;

  function icon() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"'
      + ' stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'
      + '<circle cx="11" cy="11" r="7"></circle><line x1="20.5" y1="20.5" x2="16.7" y2="16.7"></line></svg>';
  }

  /* ── 헤더 버튼 ──────────────────────────────────────────────────── */
  function mountBtn() {
    if (document.getElementById('r51-btn')) return true;
    var lang = document.getElementById('lang-selector');
    var row = lang && lang.parentNode;
    if (!row) {                                  // 최후 수단 — 햄버거 앞
      var tg = document.getElementById('mobile-toggle');
      row = tg && tg.parentNode;
      if (!row) return false;
      lang = tg;
    }
    var b = document.createElement('button');
    b.id = 'r51-btn';
    b.type = 'button';
    b.className = 'r51-btn';
    b.setAttribute('aria-label', '검색');
    b.title = '검색 (Ctrl+K)';
    b.innerHTML = icon();
    b.addEventListener('click', function (e) { e.preventDefault(); openPanel(); });
    row.insertBefore(b, lang);
    return true;
  }

  /* ── 패널 ──────────────────────────────────────────────────────── */
  function mountPanel() {
    if (panel) return;
    panel = document.createElement('div');
    panel.id = 'r51-wrap';
    panel.className = 'r51-wrap';
    panel.innerHTML =
      '<div class="r51-dim" id="r51-dim"></div>'
      + '<div class="r51-card" role="dialog" aria-modal="true" aria-label="사이트 검색">'
      +   '<div class="r51-bar">' + icon()
      +     '<input id="r51-q" type="text" autocomplete="off" spellcheck="false"'
      +       ' placeholder="제품 · 시공사례 · 부품 검색  (예: 갤럭시D 520 갓등)">'
      +     '<button type="button" class="r51-x" id="r51-x" aria-label="닫기">ESC</button>'
      +   '</div>'
      +   '<div class="r51-list" id="r51-list"></div>'
      + '</div>';
    document.body.appendChild(panel);
    input = document.getElementById('r51-q');
    listEl = document.getElementById('r51-list');
    document.getElementById('r51-dim').addEventListener('click', closePanel);
    document.getElementById('r51-x').addEventListener('click', closePanel);
    input.addEventListener('input', function () { render(input.value); });
    input.addEventListener('keydown', onKey);
    listEl.addEventListener('click', function (e) {
      var el = e.target.closest ? e.target.closest('.r51-row') : null;
      if (el) go(rows[+el.getAttribute('data-i')]);
    });
  }

  function openPanel() {
    mountPanel();
    if (open) { input.focus(); input.select(); return; }
    open = true;
    panel.classList.add('r51-on');
    document.documentElement.classList.add('r51-lock');
    render(input.value || '');
    setTimeout(function () { input.focus(); input.select(); }, 30);
  }

  function closePanel() {
    if (!open) return;
    open = false;
    panel.classList.remove('r51-on');
    document.documentElement.classList.remove('r51-lock');
  }

  /* ── 결과 그리기 ───────────────────────────────────────────────── */
  var GROUP = { p: '제품', g: '시공갤러리', n: '부품' };

  function esc(s) {
    return String(s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }

  function render(q) {
    rows = [];
    if (!String(q || '').trim()) {
      var idx = window.R51.build();
      listEl.innerHTML = '<div class="r51-empty">제품 <b>' + idx.p.length + '</b> · 시공사례 <b>'
        + idx.g.length + '</b> · 부품 <b>' + idx.n.length + '</b> 에서 찾습니다.<br>'
        + '띄어쓰기는 무시하니 <b>갤럭시D520갓등</b> 처럼 붙여 써도 됩니다.</div>';
      cur = -1; return;
    }
    var r = window.R51.search(q, 6), html = '';
    if (!r.total) {
      listEl.innerHTML = '<div class="r51-empty">‘' + esc(q) + '’ 에 대한 결과가 없습니다.<br>'
        + '제품명 일부만 넣어 보세요 — 예: <b>동함마</b>, <b>갓등</b>, <b>댐퍼</b>.</div>';
      cur = -1; return;
    }
    ['p', 'g', 'n'].forEach(function (k) {
      if (!r[k].length) return;
      var more = r[k + 'All'] - r[k].length;
      html += '<div class="r51-h">' + GROUP[k] + '<span>' + r[k + 'All'] + '</span>'
        + (more > 0 ? '<em>상위 ' + r[k].length + '건</em>' : '') + '</div>';
      r[k].forEach(function (row) {
        var i = rows.push(row) - 1;
        html += '<button type="button" class="r51-row" data-i="' + i + '">'
          + (row.img ? '<img loading="lazy" src="' + esc(row.img) + '" alt="">' : '<span class="r51-noimg"></span>')
          + '<span class="r51-tx"><b>' + esc(row.title) + '</b><i>' + esc(row.sub) + '</i></span></button>';
      });
    });
    listEl.innerHTML = html;
    cur = -1;
  }

  function onKey(e) {
    if (e.key === 'Escape') { e.preventDefault(); closePanel(); return; }
    var items = listEl.querySelectorAll('.r51-row');
    if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
      if (!items.length) return;
      e.preventDefault();
      cur = (cur + (e.key === 'ArrowDown' ? 1 : -1) + items.length) % items.length;
      [].forEach.call(items, function (el, i) { el.classList.toggle('r51-cur', i === cur); });
      items[cur].scrollIntoView({ block: 'nearest' });
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (cur < 0 && items.length) cur = 0;
      if (cur >= 0 && rows[cur]) go(rows[cur]);
    }
  }

  /* ── 착지 ──────────────────────────────────────────────────────── */
  function later(fn, ms) { setTimeout(fn, ms == null ? 60 : ms); }

  function go(row) {
    if (!row) return;
    closePanel();
    try {
      if (row.t === 'p') return goProduct(row);
      if (row.t === 'n') return goPart(row);
      return goGal(row);
    } catch (err) { if (window.console) console.warn('[r51] 착지 실패', err); }
  }

  function goProduct(row) {
    window.navigate('products');
    var idx = window.R51.build();
    // 재현한 id 가 라이브와 어긋나면(검산 실패) 정확 착지를 포기하고 대분류까지만 간다.
    if (!idx.idsOk || typeof window.upGoModel !== 'function') {
      if (typeof window.filterProducts === 'function') later(function () { window.filterProducts(row.cat); });
      return;
    }
    later(function () {
      window.upGoModel(row.id);
      if (row.k > 0 && typeof window.upDetailVar === 'function') {
        later(function () { window.upDetailVar(row.k); }, 40);
      }
    });
  }

  function goPart(row) {
    window.navigate('parts');
    later(function () {
      if (typeof window.openPartModal === 'function') window.openPartModal(row.i);
    }, 220);
  }

  function goGal(row) {
    window.navigate('gallery');
    // 스타일 탭이 「전체」가 아니면 인덱스가 어긋난다 → 전체로 되돌리고 기다린다.
    var onTab = document.querySelector('#gal-tabs .gal-tab.on');
    var needSwap = !onTab || onTab.textContent.indexOf('전체') !== 0;
    if (needSwap && typeof filterGallery === 'function') { try { filterGallery('전체'); } catch (e) {} }
    var tries = 0;
    (function wait() {
      var g = document.getElementById('gal-grid');
      if (g && g.children.length > row.i) {
        try { openLbox(row.i); } catch (e) {}
        return;
      }
      if (++tries < 30) later(wait, 100);
    })();
  }

  /* ── 부팅 ──────────────────────────────────────────────────────── */
  document.addEventListener('keydown', function (e) {
    if ((e.metaKey || e.ctrlKey) && (e.key === 'k' || e.key === 'K')) { e.preventDefault(); openPanel(); return; }
    if (e.key === 'Escape' && open) { e.preventDefault(); closePanel(); return; }
    if (e.key === '/' && !open) {
      var t = e.target, tag = t && t.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || (t && t.isContentEditable)) return;
      e.preventDefault(); openPanel();
    }
  });

  var n = 0;
  (function boot() {
    if (mountBtn()) return;
    if (++n < 40) setTimeout(boot, 150);
  })();
})();
