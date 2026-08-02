/* usung-r10.js — 260802 화면검토 ② ⑥ ⑦
 *   ②  mark nav items whose dropdown holds a single visible row (.r10-solo)
 *   ⑥  measure #navbar and open the CSS reveal gate (html.r10-navok)
 *   ⑦  rebuild gallery tile captions from real product data
 *
 * index_v6.html stays frozen; runtime overlay only.
 * Loaded after usung-r8-gal.js, which is generated ("Do not edit by hand"),
 * so its galInner/galSyncTile are replaced rather than edited. Top-level
 * function declarations of a classic script are writable window properties,
 * and its top-level const (GAL_DIR / GAL_ZOOM) are reachable by bare name.
 */
(function () {
  'use strict';
  if (window.__usungR10) return;
  window.__usungR10 = true;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  /* ---------- ⑥ nav height ---------- */
  function navH() {
    var n = document.getElementById('navbar');
    if (!n) return;
    var h = Math.round(n.getBoundingClientRect().height);
    if (h > 0) document.documentElement.style.setProperty('--r10-navh', h + 'px');
  }

  /* ---------- ② solo dropdowns ----------
   * A child of a display:none parent still reports its own computed display,
   * so the closed dropdown can be counted without opening it. */
  function markSolo() {
    var items = document.querySelectorAll('#primary-nav .nav-item');
    for (var i = 0; i < items.length; i++) {
      var dd = null, kids = items[i].children;
      for (var k = 0; k < kids.length; k++) {
        if (kids[k].classList && kids[k].classList.contains('dropdown')) { dd = kids[k]; break; }
      }
      if (!dd) { items[i].classList.remove('r10-solo'); continue; }
      var rows = dd.querySelectorAll('button,a'), n = 0;
      for (var j = 0; j < rows.length; j++) {
        if (getComputedStyle(rows[j]).display !== 'none') n++;
      }
      if (n <= 1) items[i].classList.add('r10-solo');
      else items[i].classList.remove('r10-solo');
    }
  }

  function watchNav() {
    var nav = document.getElementById('primary-nav');
    if (!nav || nav.__r10Observed) return;
    nav.__r10Observed = true;
    var t = 0;
    // Language switch re-renders the rows; markSolo() only toggles a class on
    // .nav-item, never inside .dropdown, so this cannot feed back into itself.
    new MutationObserver(function () {
      clearTimeout(t);
      t = setTimeout(markSolo, 40);
    }).observe(nav, { childList: true, subtree: true });
  }

  /* ---------- ⑦ gallery captions ----------
   * The generator emitted "001 · 시공갤러리" / "시공 현장 01" — a placeholder
   * numbering that told the visitor nothing. GALLERY carries the real spec
   * string and, for most rows, the real site name. */
  // Half of GALLERY's site column is a product note rather than a place
  // ("450갓등", "아크릴원통등(빨강)", "레트로감성"). Only a real venue name
  // belongs in the kicker, so anything that reads as a product is dropped.
  var NOT_A_PLACE = /^[\d(]|갓|우주선|원통등|유지망|감성/;

  function siteName(s) {
    s = String(s || '').trim();
    if (!s || NOT_A_PLACE.test(s)) return '';
    return s.replace(/(설치|시공)?\s*사진$/, '').replace(/\d+$/, '').trim();
  }

  function facts(it) {
    if (typeof parseSpec !== 'function') return null;
    try { return parseSpec(it.spec); } catch (e) { return null; }
  }

  function tileTitle(it) {
    var p = facts(it);
    if (!p) return siteName(it.site) || '시공 갤러리';
    return (p.size ? p.size + 'Ø ' : '') + p.struct;
  }

  function tileKick(it) {
    var s = siteName(it.site);
    var c = it.cat || '시공갤러리';
    return s ? c + ' · ' + s : c;
  }

  function tileSub(it) {
    var p = facts(it), a = [];
    if (p) {
      if (p.color) a.push(p.color);
      if (p.body) a.push(p.body);
      if (p.fvd) a.push('FVD 방화댐퍼');
    }
    return a.join(' · ');
  }

  function installGallery() {
    if (typeof GAL_DIR === 'undefined' || typeof GAL_ZOOM === 'undefined') return false;
    if (typeof window.galInner !== 'function') return false;

    window.galInner = function (it) {
      var title = tileTitle(it), sub = tileSub(it);
      return '<img loading="lazy" src="' + GAL_DIR + it.src + '" alt="' + esc(title) + ' 시공 사진">' +
        GAL_ZOOM +
        '<figcaption>' +
        '<span class="gt-cat">' + esc(tileKick(it)) + '</span>' +
        '<span class="gt-site">' + esc(title) + '</span>' +
        (sub ? '<span class="gt-spec">' + esc(sub) + '</span>' : '') +
        '</figcaption>';
    };

    window.galSyncTile = function (el, it, i) {
      el.setAttribute('onclick', 'openLbox(' + i + ')');
      var cap = el.querySelector('figcaption');
      if (!cap) return;
      var k = cap.querySelector('.gt-cat'), t = cap.querySelector('.gt-site'),
          s = cap.querySelector('.gt-spec'), sub = tileSub(it);
      if (k) k.textContent = tileKick(it);
      if (t) t.textContent = tileTitle(it);
      if (!s && sub) {
        s = document.createElement('span');
        s.className = 'gt-spec';
        cap.appendChild(s);
      }
      if (s) {
        s.textContent = sub;
        s.style.display = sub ? '' : 'none';
      }
    };
    return true;
  }

  // Tiles rendered before this module loaded still carry the placeholder text.
  function repaintTiles() {
    var grid = document.getElementById('gal-grid');
    if (!grid || !grid.children.length) return;
    if (typeof galList === 'undefined' || !galList || !galList.length) return;
    var n = Math.min(grid.children.length, galList.length);
    for (var i = 0; i < n; i++) window.galSyncTile(grid.children[i], galList[i], i);
  }

  /* ---------- boot ---------- */
  var installed = false;
  function pass() {
    navH();
    markSolo();
    watchNav();
    if (!installed && installGallery()) { installed = true; repaintTiles(); }
  }

  function run() {
    pass();
    // Revealing on the same frame would put the nav back on screen before the
    // relabel overlays finish; the CSS keyframe still uncovers it at 0.7s if
    // this module ever fails to run.
    setTimeout(function () {
      document.documentElement.classList.add('r10-navok');
    }, 220);
    // usung-r8-mount.js waits up to 6s for UP_DATA before it swaps the views.
    var t = 0;
    (function tick() {
      t++;
      pass();
      if (t < 20) setTimeout(tick, 250);
    })();
    window.addEventListener('resize', navH, { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { try { run(); } catch (e) {} });
  } else {
    try { run(); } catch (e) {}
  }
})();
