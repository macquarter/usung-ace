/* usung-r51-search.js — r51 헤더 전역 검색 · UI 와 착지
 * build-marker: r52-b1
 *
 * ★ 마운트 위치(r52 에서 바뀜): #cta-contact 과 **한 묶음**(.r51-grp) — 돋보기가 왼쪽.
 *   r51 은 #lang-selector 앞에 형제로 꽂았는데, 승연 「돋보기는 contact us 왼쪽으로」.
 *   ★ 형제로 앞에 꽂는 것만으론 안 된다 — 부모가 `justify-between` 이라 자식 사이
 *     여백이 균등 분배돼(1440px 실측 114px) 돋보기와 Contact Us 가 따로 논다.
 *     묶으면 행 입장에선 자식 1개라 여백이 바깥에만 생기고 안쪽은 gap 10px 로 붙는다.
 *   #primary-nav 안에는 넣지 않는다 — usung-r10-fix.css:45 가 그 nav 를 0.7초간
 *   visibility:hidden 으로 덮어두기 때문에 자식으로 넣으면 검색 버튼도 같이 사라진다.
 *   ≤767px 에선 로고·햄버거만 남으므로 `margin-left:auto` 로 햄버거 옆에 붙인다.
 *   ★ 그 auto 마진은 이제 **버튼이 아니라 묶음**이 받는다 (usung-r51.css:47).
 *   767/768 은 Tailwind 의 md 경계 그대로다 — 새 폭을 만들지 않는다 (KNOWLEDGE 31).
 *
 * ★ 패널은 body 직속에 붙인다. id 는 전부 `r51-` 접두사라 라이브 id 와 겹치지 않는다.
 *   z-index 는 10000 — #navbar(z-50) 와 r42 하단 전화바(9500) 위다.
 *
 * ★★ 착지는 전부 r8 카탈로그(DIV.r8x)에 한다. 같은 #page-products 안의
 *   DIV.r8-original(index_v6 원본)은 display:none 이라, 거기 대고 upGoModel() ·
 *   openPartModal() 을 불러 봐야 화면에 아무 일도 안 일어난다. r51 첫 판이 그쪽을
 *   불렀고 393px 실측에서 「스크롤Y:0 · 상세top:0」으로 잡혔다 (usung-r51-data.js 머리말).
 *
 * ★ 착지 경로 — 전부 프리뷰에서 실측 (2026-08-19):
 *     제품   navigate('products') → goMain()  → openModel(key, k)   … #mask
 *     부품   navigate('products') → goParts() → openPart(id)        … #pmask
 *     갤러리 navigate('gallery')  → (전체 탭 확인) → openLbox(i)     … #lbox
 *   제품 key 는 'cat|mid|grp' 문자열이라 데이터가 늘어도 순번처럼 어긋나지 않는다.
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

    var b = document.createElement('button');
    b.id = 'r51-btn';
    b.type = 'button';
    b.className = 'r51-btn';
    b.setAttribute('aria-label', '검색');
    b.title = '검색 (Ctrl+K)';
    b.innerHTML = icon();
    b.addEventListener('click', function (e) { e.preventDefault(); openPanel(); });

    /* ★ 「Contact Us 왼쪽」 — 그냥 앞에 꽂으면 안 된다.
     * 헤더 행은 `justify-between` 이라 자식 사이 여백이 균등 분배된다(1440px 실측 114px).
     * 형제로 넣으면 돋보기와 Contact Us 사이에도 114px 이 벌어져 따로 노는 것처럼 보인다.
     * 둘을 한 묶음(.r51-grp)으로 감싸면 행 입장에선 자식 1개라 여백이 바깥에만 생기고,
     * 묶음 안에서는 gap 10px 로 붙는다. `#cta-contact` 은 clone 이 아니라 노드를 그대로
     * 옮기므로 onclick·data-i18n·Tailwind `hidden lg:inline-flex` 가 전부 살아 있다.
     * (오버레이 어디에서도 `#cta-contact` 를 참조하지 않는 것 확인함 — grep 0건) */
    var cta = document.getElementById('cta-contact');
    if (cta && cta.parentNode) {
      var g = document.createElement('div');
      g.id = 'r51-grp';
      g.className = 'r51-grp';
      cta.parentNode.insertBefore(g, cta);
      g.appendChild(b);
      g.appendChild(cta);                        // 돋보기 → Contact Us 순서
      return true;
    }

    /* 대비책 — Contact Us 가 없으면 예전 자리(언어선택 앞), 그것도 없으면 햄버거 앞 */
    var anchor = document.getElementById('lang-selector');
    var row = anchor && anchor.parentNode;
    if (!row) {
      var tg = document.getElementById('mobile-toggle');
      row = tg && tg.parentNode;
      if (!row) return false;
      anchor = tg;
    }
    row.insertBefore(b, anchor);
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

  /* 페이지 전환 직후엔 대상 뷰가 아직 안 붙어 있을 수 있다 — 100ms 씩 최대 3초 기다린다.
     (goGal 이 #gal-grid 를 기다리는 것과 같은 수법을 셋이 공유한다) */
  function whenReady(ready, run, tries) {
    var n = 0, max = tries || 30;
    (function w() {
      var ok = false;
      try { ok = !!ready(); } catch (e) { ok = false; }
      if (ok) { try { run(); } catch (e) { if (window.console) console.warn('[r51] 착지', e); } return; }
      if (++n < max) later(w, 100);
    })();
  }

  /* 제품 — 모달이 곧 상세다. 카드에서 누른 것과 **완전히 같은 경로**를 탄다.
     goMain() 을 먼저 부르는 이유: 직전 검색이 부품이었으면 배경이 v-parts 로 남아
     모달을 닫는 순간 엉뚱한 화면이 드러난다. 배경을 제품 메인으로 되돌려 둔다. */
  function goProduct(row) {
    window.navigate('products');
    whenReady(
      function () { return typeof window.openModel === 'function' && document.getElementById('mask'); },
      function () {
        if (typeof window.goMain === 'function') window.goMain();
        window.openModel(row.mk, row.k);          // 둘째 인자가 곧 마감 변형 선택이다
      });
  }

  /* 부품 — 부품소개는 별도 페이지가 아니라 제품 페이지 안의 뷰(v-parts)다.
     ★ 부품 타일 자체에는 클릭 핸들러가 없다(usung-r8-prod-a.js:119 「클릭 모달 없음」).
       하지만 openPart() 와 #pmask 마크업은 살아 있고, 분류·그룹 설명·사용 제품군까지
       보여 준다(PART_GROUP_OF / PART_GROUP_DESC / PART_USEDBY 는 전부 채워져 있다).
       검색 결과 셋(제품·갤러리·부품)이 모두 「고르면 상세가 열린다」로 일치한다. */
  function goPart(row) {
    window.navigate('products');
    whenReady(
      function () { return typeof window.goParts === 'function' && document.getElementById('pmask'); },
      function () {
        window.goParts();
        if (typeof window.openPart === 'function') window.openPart(row.id);
      });
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
