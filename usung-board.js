/* usung-board.js — 고객센터 게시판(page-board) 재조정 (슬라이드31, 0708 검토)
 * 과장님 요구:
 *   1) 정렬 탭(최신순 / 조회순 / 번호순) 삭제.
 *   2) '번호' 컬럼 삭제  — 실제 최신번호와 매칭이 안 됨.
 *   3) '조회' 컬럼 삭제  — 블로그 글이 조회 0 으로 떠서 마케팅상 안 좋음.
 *   3-1) r5(S24) '작성자' 컬럼도 삭제 — 전부 동일 계정이라 노출 불필요(→ 분류·제목·등록일 3칸).
 *   4) 하단 페이지 순서번호가 안 눌러짐 → 실제 동작하는 페이지네이션으로 교체(페이지당 10개).
 * 원본 index_v6.html 불변. 런타임 DOM 오버레이 + <style> 주입.
 *   - renderBoard() 는 건드리지 않고, board-list 재렌더를 MutationObserver 로 감지해 매번 재적용.
 * 되돌리기: inject.js 주입 1줄 제거.
 */
(function () {
  'use strict';

  var PAGE_SIZE = 10;
  var page = 1;

  function injectCss() {
    if (document.getElementById('usung-board-css')) return;
    var css = [
      /* 정렬 탭 바 숨김 */
      '#page-board [data-usung-sortbar]{display:none !important;}',
      /* 번호/조회/작성자 제거 후 남는 3칸(분류·제목·등록일) 그리드 재배치 */
      '#page-board #board-list > [data-usung-row]{grid-template-columns:1fr !important;}',
      '@media(min-width:768px){#page-board #board-list > [data-usung-row]{grid-template-columns:90px 1fr 110px !important;}}'
    ].join('');
    var st = document.createElement('style');
    st.id = 'usung-board-css';
    st.textContent = css;
    document.head.appendChild(st);
  }

  // 정렬 탭(최신순/조회순/번호순) 바 숨김
  function hideSortBar() {
    var b = document.getElementById('sort-latest');
    if (b && b.parentElement && !b.parentElement.hasAttribute('data-usung-sortbar')) {
      b.parentElement.setAttribute('data-usung-sortbar', '1');
    }
  }

  // 헤더 행: '번호'(0)+'작성자'(3)+'조회'(끝칸) 제거, 3칸 그리드로
  function fixHeader() {
    var pg = document.getElementById('page-board');
    if (!pg) return;
    var hdr = pg.querySelector('div[class*="md:grid"]');
    if (!hdr || hdr.__usungHdr) return;
    hdr.__usungHdr = true;
    var cells = Array.prototype.slice.call(hdr.children);
    if (cells.length >= 6) {
      hdr.removeChild(cells[cells.length - 1]); // 조회(끝칸)
      hdr.removeChild(cells[3]);                // 작성자(4번째)
      hdr.removeChild(cells[0]);                // 번호(첫칸)
    }
    hdr.style.gridTemplateColumns = '90px 1fr 110px';
  }

  function rowsOf(list) {
    return Array.prototype.slice.call(list.children).filter(function (r) {
      return r.classList && r.classList.contains('grid');
    });
  }

  // 각 행에서 번호/작성자/조회 칸 제거 (한 번만)
  function stripRow(r) {
    if (r.__usungStripped) return;
    r.__usungStripped = true;
    r.setAttribute('data-usung-row', '1');
    var cells = Array.prototype.slice.call(r.children);
    var authorText = '';
    if (cells.length >= 6) {
      authorText = (cells[3].textContent || '').trim();   // 작성자 텍스트 확보(모바일 메타 제거용)
      r.removeChild(cells[cells.length - 1]); // 조회(끝칸)
      r.removeChild(cells[3]);                // 작성자(4번째)
      r.removeChild(cells[0]);                // 번호(첫칸)
    }
    // 모바일 메타의 '조회 N' + '작성자' 조각 제거
    var meta = r.querySelector('div[class*="md:hidden"]');
    if (meta) {
      var spans = meta.querySelectorAll('span');
      for (var i = spans.length - 1; i >= 0; i--) {
        var stx = (spans[i].textContent || '').trim();
        if (/조회/.test(stx)) { spans[i].remove(); continue; }              // 조회 N
        if (authorText && stx === authorText) { spans[i].remove(); }         // 작성자
      }
    }
  }

  function findPager() {
    var pg = document.getElementById('page-board');
    if (!pg) return null;
    if (pg.__usungPager && document.body.contains(pg.__usungPager)) return pg.__usungPager;
    var cands = pg.querySelectorAll('div.mt-8');
    for (var i = 0; i < cands.length; i++) {
      if (/[‹›]/.test(cands[i].textContent || '') || cands[i].className.indexOf('justify-center') > -1) {
        pg.__usungPager = cands[i];
        return cands[i];
      }
    }
    return null;
  }

  function mkBtn(label, target, active, disabled) {
    var b = document.createElement('button');
    b.type = 'button';
    b.textContent = label;
    var base = 'width:36px;height:36px;border-radius:8px;font-weight:700;font-size:13px;' +
      'display:inline-flex;align-items:center;justify-content:center;margin:0 2px;transition:.15s;';
    if (disabled) {
      b.style.cssText = base + 'background:#fff;color:#94a3b8;border:1px solid #e2e8f0;opacity:.5;cursor:default;';
    } else if (active) {
      b.style.cssText = base + 'background:#2563eb;color:#fff;border:1px solid #2563eb;cursor:pointer;';
    } else {
      b.style.cssText = base + 'background:#fff;color:#334155;border:1px solid #cbd5e1;cursor:pointer;';
      b.addEventListener('mouseenter', function () { b.style.background = '#f1f5f9'; });
      b.addEventListener('mouseleave', function () { b.style.background = '#fff'; });
    }
    if (!disabled && target != null) {
      b.addEventListener('click', function () { gotoPage(target); });
    }
    return b;
  }

  function renderPager(pages) {
    var el = findPager();
    if (!el) return;
    el.innerHTML = '';
    if (pages <= 1) { el.appendChild(mkBtn('1', 1, true, false)); return; }
    el.appendChild(mkBtn('‹', page - 1, false, page <= 1));
    for (var i = 1; i <= pages; i++) el.appendChild(mkBtn(String(i), i, i === page, false));
    el.appendChild(mkBtn('›', page + 1, false, page >= pages));
  }

  function gotoPage(n) {
    var list = document.getElementById('board-list');
    if (!list) return;
    var rows = rowsOf(list);
    var pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    page = Math.min(Math.max(1, n), pages);
    for (var i = 0; i < rows.length; i++) {
      rows[i].style.display = (Math.floor(i / PAGE_SIZE) + 1 === page) ? '' : 'none';
    }
    renderPager(pages);
  }

  function processRows() {
    var list = document.getElementById('board-list');
    if (!list) return;
    var rows = rowsOf(list);
    if (!rows.length) { renderPager(1); return; }
    // 새 렌더(필터/검색/블로그로드)면 1페이지로 리셋
    var fresh = rows.some(function (r) { return !r.hasAttribute('data-usung-row'); });
    if (fresh) page = 1;
    rows.forEach(stripRow);
    var pages = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
    if (page > pages) page = pages;
    gotoPage(page);
  }

  var busy = false;
  function fix() {
    if (busy) return;
    busy = true;
    try { injectCss(); hideSortBar(); fixHeader(); processRows(); }
    finally { busy = false; }
  }

  function observe() {
    var list = document.getElementById('board-list');
    if (!list || list.__usungObserved) return;
    list.__usungObserved = true;
    var mo = new MutationObserver(function () { if (!busy) fix(); });
    mo.observe(list, { childList: true });
  }

  function boot() {
    fix();
    observe();
    setTimeout(function () { fix(); observe(); }, 400);
    setTimeout(function () { fix(); observe(); }, 1400);
    // 블로그 RSS 는 늦게 들어오므로 한 번 더
    setTimeout(function () { fix(); }, 3000);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // 게시판으로 이동할 때마다 재적용
  if (typeof window.navigate === 'function' && !window.__boardNavWrapped) {
    window.__boardNavWrapped = true;
    var _nav = window.navigate;
    window.navigate = function (id) {
      var r = _nav.apply(this, arguments);
      if (id === 'board') { setTimeout(fix, 60); setTimeout(observe, 80); setTimeout(fix, 400); }
      return r;
    };
  }
})();
