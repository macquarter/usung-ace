/* usung-r51-data.js — r51 전역 검색 · 색인과 매칭 (UI 없음)
 *
 * ★★ 제품·부품의 「화면」은 r8 카탈로그다. index_v6.html 원래 마크업이 아니다.
 *   #page-products 안에는 트리가 **둘** 있다:
 *     DIV.r8-original  display:none  ← index_v6 원본(#up-main·#products-grid·#parts-grid)
 *     DIV.r8x          display:block ← r8 카탈로그(v-main·v-cat·v-parts) = 실제 화면
 *   r51 첫 판은 앞의 죽은 트리를 색인·착지 대상으로 삼았다. innerText 는 display:none
 *   에서도 글자를 돌려주기 때문에 계측이 통과한 것처럼 보였다 (CLAUDE.md §3 KNOWLEDGE 47
 *   「기준은 파일이 아니라 서빙된 DOM」— 여기선 「보이는 DOM」까지 봐야 했다).
 *
 * 색인 출처 — 전부 런타임에 읽는다 (KNOWLEDGE 41 하드코딩 목록은 반드시 썩는다)
 *   제품   MODELS            usung-r8-prod-a.js r8Build() 가 만든 62모델 · 206변형
 *   갤러리 galItems('전체')   usung-r8-gal.js
 *   부품   R8_PARTS/PART_ORDER + 그려진 #parts-body 그리드
 *
 * ★ MODELS·R8_PARTS·PART_ORDER 는 window 속성이 아니라 최상위 let/const 다.
 *   같은 classic script 들이 공유하는 전역 렉시컬 환경에 있어 **맨이름으로 읽힌다**.
 *   다만 실행 순서가 밀리면 TDZ 로 ReferenceError 가 나므로 전부 try 로 감싼다.
 *   (색인은 첫 검색 때 만들어진다 — 로드 직후가 아니라 사람이 타이핑을 시작한 뒤다)
 */
(function () {
  'use strict';

  /* 전역 렉시컬 값 읽기 — 없거나 아직 초기화 전이면 null */
  function lex(fn) { try { return fn(); } catch (e) { return null; } }

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
   * 카드 1장(MODELS[i]) 안에 마감 변형이 여러 개 들어 있고, 모달은 그 중 하나를
   * 골라 연다: openModel(key, idx). 그래서 색인 단위는 모델이 아니라 **변형**이다.
   * key 는 'cat|mid|grp' 문자열이라 순번과 달리 데이터가 늘어도 어긋나지 않는다
   * — 첫 판이 순번 id 를 재현하느라 달았던 검산 장치(verifyIds)가 통째로 필요 없어졌다. */
  function buildProducts() {
    var MS = lex(function () { return MODELS; });
    if (!MS || !MS.length) return [];
    var out = [];
    MS.forEach(function (m) {
      var mid = m.mid || m.title || '';
      var sub = m.cat + (mid ? ' › ' + mid : '') + (m.grp && m.grp !== mid ? ' › ' + m.grp : '');
      var aux = norm(m.cat + mid + (m.grp || ''));
      (m.items || []).forEach(function (it, k) {
        out.push({ t: 'p', mk: m.key, k: k, cat: m.cat,
                   title: it.name, sub: sub, img: it.img,
                   key: norm(it.name),
                   aux: aux + norm((it.finish || '') + ((it.tags || []).join(''))) });
      });
    });
    return out;
  }

  /* ── 갤러리 ────────────────────────────────────────────────────────
   * galItems('전체') = 스타일 4종을 spec|site 로 중복 제거한 50건.
   * 인덱스가 곧 openLbox(i) 의 인자다. 「전체」탭이 기본이라 스타일 탭을 안 건드려도 된다
   * (QUESTIONS C1 「스타일별」 존폐 결정과 분리해 둔다). */
  function buildGallery() {
    var items = lex(function () { return galItems('전체'); });
    if (!items || !items.length) return [];
    return items.map(function (it, i) {
      var name = it.site || it.spec;
      return { t: 'g', i: i, title: name, sub: '시공갤러리 › ' + it.cat,
               img: 'proto_assets/gallery/' + it.src,
               key: norm(name), aux: norm(it.spec + it.site + it.cat) };
    });
  }

  /* ── 부품 ──────────────────────────────────────────────────────────
   * R8_PARTS 는 51종인데 부품 페이지는 50칸이다 — r45 가 p52(반후지 150Ø)를
   * p01(반후지 150·125Ø)과 같은 부품이라고 뺐다(usung-r23.js ORDER).
   * 그 ORDER 표는 IIFE 지역변수라 읽을 수 없다. 그래서 **그려진 그리드**를 읽는다.
   * 타일→id 는 이미지 경로로 되짚는다 — partSrc(id) 가 id 마다 유일하기 때문이다
   * (뱃지 .px 는 표시번호라 id 가 아니다 — CLAUDE.md 「부품번호=리포내부번호」).
   * ★ r23 배치 완료 표식(g.__r23)이 없으면 판단을 보류하고 51종 전부 쓴다.
   *   덜 그려진 그리드를 보고 멀쩡한 부품을 검색에서 지워버리는 쪽이 더 나쁘다. */
  function shownPartIds() {
    var g = document.querySelector('#parts-body .pp-grid');
    if (!g && document.getElementById('parts-body')) {
      lex(function () { return window.renderPartsPage(); });   // 아직 안 그렸으면 그리게 한다
      g = document.querySelector('#parts-body .pp-grid');
    }
    if (!g || !g.__r23) return null;
    var order = lex(function () { return PART_ORDER; });
    if (!order || typeof window.partSrc !== 'function') return null;
    var bySrc = {};
    order.forEach(function (id) { bySrc[window.partSrc(id)] = id; });
    var set = {}, n = 0;
    [].forEach.call(g.querySelectorAll('.pt img'), function (im) {
      var id = bySrc[im.getAttribute('src')];
      if (id && !set[id]) { set[id] = 1; n++; }
    });
    return n ? set : null;
  }

  function buildParts() {
    var order = lex(function () { return PART_ORDER; });
    var P = lex(function () { return R8_PARTS; });
    if (!order || !P) return [];
    var grpOf = lex(function () { return PART_GROUP_OF; }) || {};
    var shown = shownPartIds();
    var out = [];
    order.forEach(function (id) {
      if (shown && !shown[id]) return;
      var p = P[id];
      if (!p || !p.nm) return;
      var grp = grpOf[id] || '부품 · 구성품';
      out.push({ t: 'n', id: id, title: p.nm,
                 sub: '부품 › ' + grp + (p.sp ? ' · ' + p.sp : ''),
                 img: window.partSrc ? window.partSrc(id) : '',
                 key: norm(p.nm), aux: norm(grp + (p.sp || '')) });
    });
    return out;
  }

  var IDX = null;

  /* 색인은 첫 검색 때 만든다. 그때까지 r8 빌드가 안 끝났을 수는 없지만
   * (r8Build 는 부팅 직후 돈다) 세 갈래 중 하나가 비면 다음 호출에 다시 만든다. */
  function build(force) {
    if (IDX && !force && IDX.p.length && IDX.g.length && IDX.n.length) return IDX;
    IDX = { p: buildProducts(), g: buildGallery(), n: buildParts() };
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
