/* usung-r76-gal.js — 관리자가 발행한 시공갤러리 차이분을 화면에 얹는다.
 *
 * 짝: api/gallery.js(저장) · api/inject.js(window.GAL_PATCH 인라인 주입) · admin.html(편집기)
 *
 * ── ★ 덮어쓰기 층(shadow layer)을 만들지 않는다 ──────────────────────
 *   처음 설계는 「GALLERY 가 const 라 못 고치니 그 위에 층을 하나 얹자」였다. **틀렸다.**
 *   const 는 **재바인딩**만 막는다. 내용은 그대로 바뀐다 — 라이브에서 실측했다:
 *     GALLERY['모던'][0][1] = '…'   → 된다
 *     GALLERY['모던'].push([...])   → 된다
 *   그래서 이 파일은 GALLERY 를 **제자리에서 고친다.** 층이 하나 없는 만큼
 *   galItems·galCount·renderGallery·renderLbox 가 **전부 저절로** 맞는다.
 *   (층을 얹었다면 그 넷을 하나하나 가로채야 했고, 하나만 빠뜨려도 탭 숫자와
 *    타일 개수가 어긋난다 — r48/r58 에서 겪은 「한 곳만 고치면 되살아난다」와 같은 병.)
 *
 * ── ★ GALLERY 는 window 에 없다 ──────────────────────────────────────
 *   최상위 const 는 전역 렉시컬 환경에 들어갈 뿐 window 프로퍼티가 아니다.
 *   그래서 window.GALLERY 는 undefined 이고, **맨이름 GALLERY 로만** 닿는다.
 *   → 이 파일은 반드시 **모듈이 아닌 고전 스크립트**로, **usung-r8-gal.js 다음에** 실려야 한다.
 *     (KNOWLEDGE 61 의 「못 재면 0 말고 ★측정무효」와 같은 이유로, 못 닿으면 조용히 물러난다.)
 *
 * ── ★ 멱등해야 한다 ──────────────────────────────────────────────────
 *   r55 에서 배운 것: 적용기가 두 번 돌 수 있다(스크립트 중복 주입·핫리로드).
 *   edit·del 은 본래 멱등이고, add 는 **이미 있는 src 를 건너뛰어** 멱등으로 만든다.
 */
(function () {
  'use strict';

  var P = window.GAL_PATCH;

  // GALLERY 가 없으면(스크립트 순서가 깨졌거나 r8-gal 이 파싱에 실패했으면) 아무것도 하지 않는다.
  // ★ typeof 로 물어야 한다 — 맨이름을 그냥 읽으면 ReferenceError 로 페이지가 죽는다.
  if (typeof GALLERY === 'undefined' || !GALLERY) return;
  var G = GALLERY;

  var CATS = (typeof GAL_ORDER !== 'undefined' && GAL_ORDER) ? GAL_ORDER : Object.keys(G);

  /* src 로 행을 찾는다. 실측: 전체 69행 중 src 중복 0 — 그래서 첫 번째가 곧 유일한 답이다. */
  function find(src) {
    for (var i = 0; i < CATS.length; i++) {
      var c = CATS[i], arr = G[c];
      if (!arr) continue;
      for (var j = 0; j < arr.length; j++) {
        if (arr[j] && arr[j][0] === src) return { cat: c, arr: arr, idx: j, row: arr[j] };
      }
    }
    return null;
  }

  /* 한 행에 수정 세 칸을 얹는다. ★★ 이 함수는 **두 곳이 같이 쓴다** —
     아래의 실제 패치 적용과, 관리자 미리보기(__r76.set)다.
     미리보기를 따로 짜면 「관리자에서 본 것」과 「방문자가 볼 것」이 갈라진다.
     같은 함수를 태우면 갈라질 수가 없다(KNOWLEDGE 41 과 같은 이유 · 코드판). */
  function applyEdit(f, p) {
    var touched = false, moved = false;
    if (p.spec) { f.row[1] = p.spec; touched = true; }
    if (p.site) { f.row[2] = p.site; touched = true; }
    if (p.cat && p.cat !== f.cat && G[p.cat]) {
      // 분류를 옮긴다 — 원래 배열에서 빼고 새 배열 끝에 붙인다.
      f.arr.splice(f.idx, 1);
      G[p.cat].push(f.row);
      moved = true; touched = true;
    }
    return { touched: touched, moved: moved };
  }

  function redraw() {
    var grid = document.getElementById('gal-grid');
    if (grid && typeof renderGallery === 'function') {
      try { renderGallery(typeof galCat !== 'undefined' ? galCat : '전체'); } catch (e) {}
    }
  }

  /* ── ★ 관리자에게 내주는 창구 ────────────────────────────────────────
     usung-r41-apply.js 가 window.__r41 을 내주는 것과 같은 꼴이다.
     관리자(usung-r41-ui.js)는 iframe 너머에서 이걸 부른다 — GALLERY 는 window 에 없어
     밖에서 맨이름으로 못 닿기 때문이다.
     ★ set() 은 **저장이 아니라 미리보기**다. 진짜 저장은 admin.html 이 /api/gallery 로 한다. */
  window.__r76 = {
    // 분류 목록. ★ 관리자 드롭다운이 이걸 읽는다 — 거기 네 개를 손으로 적어 두면 반드시 썩는다.
    //   (api/gallery.js 에도 분류 목록이 있지만 그건 **문지기**다. 서버는 손님을 믿으면 안 되니
    //    따로 있어야 하고, 어긋나면 저장이 눈에 띄게 거절된다 — 조용히 썩는 쪽이 아니다.)
    cats: function () { return CATS.slice(); },
    // 한 행의 지금 값. 관리자 입력칸의 초기값이 된다.
    get: function (src) {
      var f = find(src);
      return f ? { src: src, cat: f.cat, spec: f.row[1], site: f.row[2] } : null;
    },
    // 같은 spec|site 를 가진 **다른** 행들. 이게 있으면 관리자가 「두 곳 다 바꾸기」를 권한다.
    // ★ 목록을 관리자에 굳혀 두지 않는 이유: 데이터가 바뀌면 쌍둥이도 바뀐다(KNOWLEDGE 41).
    twins: function (src) {
      var f = find(src);
      if (!f) return [];
      var key = f.row[1] + '|' + f.row[2], out = [];
      CATS.forEach(function (c) {
        (G[c] || []).forEach(function (r) {
          if (r[0] !== src && (r[1] + '|' + r[2]) === key) out.push(r[0]);
        });
      });
      return out;
    },
    // 미리보기 — 화면에만 얹고 다시 그린다. 새로고침하면 사라진다.
    set: function (src, p) {
      var f = find(src);
      if (!f || !p) return false;
      var r = applyEdit(f, p);
      if (r.touched) redraw();
      return r.touched;
    },
    // '전체' 탭에 실제로 몇 장이 뜨는가. 쌍둥이 경고 문구의 숫자가 여기서 나온다.
    count: function () {
      try { return galItems('전체').length; } catch (e) { return -1; }
    },
    redraw: redraw
  };

  if (!P || typeof P !== 'object') return;
  var n = { add: 0, edit: 0, del: 0, moved: 0, skip: 0 };

  /* ── ① 삭제 ── 먼저 지운다. 지운 자리에 같은 src 를 다시 추가하는 경우를 허용하기 위해서다. */
  if (Array.isArray(P.del)) {
    P.del.forEach(function (src) {
      var f = find(src);
      if (!f) return;                 // 이미 없다 — 멱등
      f.arr.splice(f.idx, 1);
      n.del++;
    });
  }

  /* ── ② 수정 ── spec(내용) · site(이름) 는 제자리에서, cat(분류)은 배열 사이 이동이다.
     ★ 배열 자리(1·2)를 쓰는 이유: usung-r8-gal.js 의 mk() 가 [src,spec,site,w,h] 로 읽는다.
       객체로 바꾸면 mk() 부터 고쳐야 하고, 그건 이 리비전의 사고 반경을 크게 넓힌다. */
  if (P.edit && typeof P.edit === 'object') {
    Object.keys(P.edit).forEach(function (src) {
      var f = find(src), p = P.edit[src];
      if (!f || !p) { n.skip++; return; }
      var r = applyEdit(f, p);
      if (r.moved) n.moved++;
      if (r.touched) n.edit++;
    });
  }

  /* ── ③ 추가 ── 사진 파일은 이미 리포에 커밋돼 있다(api/gallery-image.js).
     ★ 사진 커밋은 재배포를 부르므로 1~2분 늦다. 그 사이에 이 행이 먼저 들어오면
       타일은 뜨는데 그림이 404 다. 그래서 관리자 화면이 「사진은 1~2분 뒤 보입니다」를 안내한다.
       여기서 막지 않는 이유: 막으면 영영 안 들어온다(무엇이 먼저인지 알 방법이 없다). */
  if (Array.isArray(P.add)) {
    P.add.forEach(function (r) {
      if (!r || !r.src || !G[r.cat]) { n.skip++; return; }
      if (find(r.src)) { n.skip++; return; }        // 이미 있다 — 멱등
      G[r.cat].push([r.src, r.spec || '', r.site || '', r.w || 0, r.h || 0]);
      n.add++;
    });
  }

  /* ── ④ 이미 그려져 있으면 다시 그린다 ──
     보통은 여기까지 오기 전에 GALLERY 가 고쳐지므로 할 일이 없다(defer 순서상 r8-gal 직후).
     하지만 스크립트가 늦게 실리는 경우가 있어 안전판을 둔다.
     ★ filterGallery 가 아니라 renderGallery 를 부른다 — filterGallery 는 `cat===galCat` 이면
       일찍 반환하고, 지금이 정확히 그 경우다(같은 탭을 다시 그리려는 것). */
  if (n.add + n.edit + n.del) {
    var grid = document.getElementById('gal-grid');
    if (grid && grid.children.length) redraw();
  }

  /* 진단용. 「발행했는데 안 바뀐다」가 오면 콘솔 한 줄로 어디까지 왔는지 갈린다:
     로그가 없다 → 주입이 안 됐다(api/inject.js) · 0 0 0 → 패치가 비었다(api/gallery.js) */
  try {
    console.log('[r76] 갤러리 패치 적용 — 추가 ' + n.add + ' 수정 ' + n.edit +
      '(분류이동 ' + n.moved + ') 삭제 ' + n.del + ' 건너뜀 ' + n.skip);
  } catch (e) {}
})();
