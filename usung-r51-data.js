/* usung-r51-data.js — r51 전역 검색 · 색인과 매칭 (UI 없음)
 *
 * ★ 목록을 하드코딩하지 않는다 (KNOWLEDGE 41 — 하드코딩 목록은 반드시 썩는다).
 *   세 출처를 런타임에 읽어 색인을 만든다:
 *     제품   window.UP_DATA        → usung-review.js 의 upBuildModels() 를 **그대로 재현**
 *     갤러리 galItems('전체')       → usung-r8-gal.js 의 렉시컬 전역(window 에는 없다)
 *     부품   #parts-grid 의 자식들  → 카드 순서 i 가 곧 openPartModal(i) 의 인자
 *
 * ★ 제품 id 재현은 「믿고 쓰기」가 아니라 「검산하고 쓰기」다.
 *   upBuildModels() 가 앞으로 바뀌면 내 id 가 조용히 어긋나 **엉뚱한 제품에 착지**한다.
 *   그래서 대분류별 모델 수를 #up-side 사이드바가 실제로 그린 숫자와 대조하고,
 *   하나라도 다르면 exact 착지를 끄고 대분류 착지로만 내려간다 (idsOk=false).
 */
(function () {
  'use strict';

  var UP_CATS = ['갤럭시', 'LED조명', '파이프', '후레쉬볼', '코브라후드'];

  /* 정규화 — 206개 제품명 중 194개에 공백이 있어 「공백 무시」가 필수다.
   * 「갤럭시D520갓등」으로 쳐도 「갤럭시D 520Ø갓등 스파이얼 동함마」가 잡혀야 한다.
   *
   * ★ Ø(U+00D8) 는 아예 지운다. 데이터에는 43개 제품명에 들어 있지만 방문자는
   *   키보드로 못 치는 글자다. 양쪽에서 똑같이 지우면 「520갓등」이 「520Ø갓등」을 잡는다.
   * ★ 「125파이」는 Ø 의 구어 표기라 숫자 뒤일 때만 Ø 로 본다.
   *   `(?!프)` 가 없으면 「125파이프」가 「125Ø프」로 망가진다 — 파이프는 대분류 이름이다.
   * ★ 담파/담퍼→댐퍼 는 이 바닥의 실제 표기 흔들림이다 (r48 에서 관리자 5곳을 고쳤다). */
  function norm(s) {
    return String(s == null ? '' : s)
      .toLowerCase()
      .replace(/\s+/g, '')
      .replace(/(\d)파이(?!프)/g, '$1ø')
      .replace(/ø/g, '')
      .replace(/담파|담퍼/g, '댐퍼')
      .replace(/[·・,()\[\]{}<>\-_/|.]/g, '');
  }

  /* ── 제품 ──────────────────────────────────────────────────────────
   * usung-review.js:524 upBuildModels() 의 그룹핑을 한 글자도 바꾸지 않고 옮겼다.
   * id = upModels.length 순번이므로 순서가 같으면 id 도 같다. */
  function buildProducts() {
    var D = window.UP_DATA;
    if (!D || !D.length) return { rows: [], byCat: {} };
    var UP = D.map(function (d) {
      return { img: 'products/final/' + d[0] + '.png', cat: d[1], type: d[2],
               grp: d[3], name: d[4], finish: d[5] };
    });
    var order = [], sec = {};
    UP.forEach(function (p) {
      var lbl = p.cat === '코브라후드' ? '코브라후드'
              : ((p.type && p.type.replace(/[()]/g, '').trim()) || p.cat);
      var key = p.cat + '||' + lbl;
      if (!sec[key]) { sec[key] = { cat: p.cat, label: lbl, gmap: {}, groups: [], seen: {} }; order.push(key); }
      var s = sec[key];
      if (s.seen[p.name]) return;
      s.seen[p.name] = 1;
      var gk = p.grp || '';
      if (!s.gmap[gk]) { s.gmap[gk] = []; s.groups.push(gk); }
      s.gmap[gk].push(p);
    });
    var rows = [], byCat = {}, n = 0;
    UP_CATS.forEach(function (c) { byCat[c] = 0; });
    order.forEach(function (key) {
      var s = sec[key];
      s.groups.forEach(function (gk) {
        var items = s.gmap[gk], id = n++;
        if (byCat[s.cat] != null) byCat[s.cat]++;
        items.forEach(function (p, k) {
          rows.push({ t: 'p', id: id, k: k, cat: p.cat, sec: s.label,
                      title: p.name, sub: p.cat + ' › ' + s.label, img: p.img,
                      key: norm(p.name),
                      aux: norm(p.cat + s.label + (gk || '') + (p.finish || '')) });
        });
      });
    });
    return { rows: rows, byCat: byCat };
  }

  /* 검산 — #up-side 가 실제로 그린 대분류 개수와 내 계산이 같은가 */
  function verifyIds(byCat) {
    var side = document.getElementById('up-side');
    if (!side) return false;
    var ok = true, seen = 0;
    UP_CATS.forEach(function (c) {
      var btns = side.querySelectorAll('button[onclick*="upGoCat("]'), hit = null;
      [].forEach.call(btns, function (b) {
        if ((b.getAttribute('onclick') || '').indexOf("'" + c + "'") >= 0) hit = b;
      });
      if (!hit) { ok = false; return; }
      seen++;
      var sp = hit.querySelectorAll('span');
      var live = parseInt((sp[sp.length - 1] || {}).textContent, 10);
      if (!(live === byCat[c])) ok = false;
    });
    return ok && seen === UP_CATS.length;
  }

  /* ── 갤러리 ────────────────────────────────────────────────────────
   * galItems('전체') = 스타일 4종을 spec|site 로 중복 제거한 50건.
   * 인덱스가 곧 openLbox(i) 의 인자다. 「전체」탭이 기본이라 스타일 탭을 안 건드려도 된다
   * (QUESTIONS C1 「스타일별」 존폐 결정과 분리해 둔다). */
  function buildGallery() {
    var items;
    try { items = galItems('전체'); } catch (e) { return []; }
    if (!items || !items.length) return [];
    return items.map(function (it, i) {
      var name = it.site || it.spec;
      return { t: 'g', i: i, title: name, sub: '시공갤러리 › ' + it.cat,
               img: 'proto_assets/gallery/' + it.src,
               key: norm(name), aux: norm(it.spec + it.site + it.cat) };
    });
  }

  /* ── 부품 ──────────────────────────────────────────────────────────
   * #parts-grid 는 index_v6.html 이 직접 갖고 있고 usung-review.js:390 이
   * 그 자식 순서대로 openPartModal(i) 를 건다. 그래서 DOM 순서 = NP 인덱스다. */
  function buildParts() {
    var grid = document.getElementById('parts-grid');
    if (!grid || !grid.children.length) return [];
    var out = [];
    [].forEach.call(grid.children, function (card, i) {
      var kids = card.children;
      var cat = kids[1] ? kids[1].textContent.trim() : '';
      var name = kids[2] ? kids[2].textContent.trim() : '';
      if (!name) {                                   // 마크업이 바뀐 경우의 최후 수단
        var txt = (card.innerText || '').trim();
        name = cat && txt.indexOf(cat) === 0 ? txt.slice(cat.length).trim() : txt;
      }
      if (!name) return;
      var im = card.querySelector('img');
      out.push({ t: 'n', i: i, title: name, sub: '부품 › ' + (cat || '-'),
                 img: im ? im.getAttribute('src') : '',
                 key: norm(name), aux: norm(cat) });
    });
    return out;
  }

  var IDX = null;

  function build(force) {
    if (IDX && !force) return IDX;
    var pr = buildProducts();
    IDX = { p: pr.rows, g: buildGallery(), n: buildParts(),
            idsOk: pr.rows.length ? verifyIds(pr.byCat) : false, byCat: pr.byCat };
    if (IDX.p.length && !IDX.idsOk && window.console) {
      console.warn('[r51] 제품 모델 id 재현이 라이브와 어긋난다 — 정확 착지를 끄고 대분류로만 이동한다.');
    }
    return IDX;
  }

  /* ── 매칭 ──────────────────────────────────────────────────────────
   * 토큰 AND. 공백은 이미 제거되므로 「갤럭시 동함마」처럼 순서가 뒤집혀도 잡힌다. */
  function scoreOne(row, toks) {
    var total = 0;
    for (var t = 0; t < toks.length; t++) {
      var q = toks[t], i = row.key.indexOf(q);
      if (i === 0) { total += 100; }
      else if (i > 0) { total += 55 - Math.min(i, 20); }
      else if (row.aux.indexOf(q) >= 0) { total += 12; }
      else return 0;
    }
    return total + Math.max(0, 24 - row.key.length / 3);
  }

  function search(q, limitEach) {
    var lim = limitEach || 6;
    var toks = String(q || '').trim().split(/\s+/).map(norm).filter(Boolean);
    var res = { p: [], g: [], n: [], total: 0 };
    if (!toks.length) return res;
    var idx = build();
    ['p', 'g', 'n'].forEach(function (kind) {
      var hits = [];
      idx[kind].forEach(function (row) {
        var s = scoreOne(row, toks);
        if (s > 0) hits.push({ s: s, row: row });
      });
      hits.sort(function (a, b) { return b.s - a.s || a.row.title.length - b.row.title.length; });
      res.total += hits.length;
      res[kind + 'All'] = hits.length;
      res[kind] = hits.slice(0, lim).map(function (h) { return h.row; });
    });
    return res;
  }

  window.R51 = { norm: norm, build: build, search: search, get index() { return IDX; } };
})();
