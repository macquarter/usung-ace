/* usung-r55-products.js — 관리자 제품 발행분을 카탈로그에 얹는다 (r55)
 *
 * ── 무엇을 하나 ──────────────────────────────────────────────────────
 *   정적 카탈로그 window.UP_DATA(usung-catalog-data.js · 215종)를 **기준선**으로 두고,
 *   관리자가 발행한 차이분 window.UP_PATCH 를 그 위에 적용한다.
 *     del  : stem 목록을 뺀다
 *     edit : stem 의 일부 칸을 덮어쓴다
 *     add  : 새 레코드를 뒤에 붙인다
 *
 * ── ★ 실행 순서가 전부다 ─────────────────────────────────────────────
 *   api/inject.js 가 이 파일을 **usung-catalog-data.js 바로 다음**에 꽂는다.
 *   둘 다 defer 라 문서 순서대로 실행된다 → UP_DATA 가 이미 있고, r8 부트는 아직이다.
 *   ★ 순서가 어긋나면 조용히 아무 일도 안 일어난다(에러도 안 난다). 그래서 이 파일은
 *     UP_DATA 가 없으면 로그를 남긴다 — 무동작과 정상을 구분할 수 있어야 한다.
 *   ★ r8 부트는 usung-r8-mount.js 의 boot() 가 `window.UP_DATA` 를 읽어 r8Build() 를
 *     부르는 시점이다. 그때는 이미 이 파일이 UP_DATA 를 갈아끼운 뒤다.
 *
 * ── ★ 왜 여기서 fetch 하지 않나 ──────────────────────────────────────
 *   클라이언트에서 /api/products 를 부르면 응답이 오기 전에 r8 부트가 먼저 끝난다.
 *   그러면 제품이 한 번 그려진 뒤 다시 그려져 **화면이 번쩍인다**(r53 에서 지도 iframe
 *   src 를 런타임 교체했다가 같은 문제를 봤다). 그래서 api/inject.js 가 **서빙 시점에**
 *   패치를 읽어 window.UP_PATCH 인라인으로 심는다. 첫 페인트부터 옳고, 왕복이 0이다.
 *
 * ── 되돌리기 ─────────────────────────────────────────────────────────
 *   이 파일 + api/inject.js 의 r55 블록. 둘은 **짝**이다. 하나만 되돌리면
 *   UP_PATCH 가 심어지는데 적용하는 쪽이 없거나(무해) 그 반대가 된다.
 *   데이터를 되돌리려면 리포의 data/products.json 을 지우면 정확히 215종으로 돌아간다.
 */
(function () {
  'use strict';

  // usung-catalog-data.js 머리말의 필드순: [stem,대분류,중분류,제품그룹,제품명,마감,태그(|)]
  var IDX = { cat: 1, mid: 2, grp: 3, name: 4, finish: 5, tags: 6 };
  var WIDTH = 7;

  function log(m) { try { console.info('[r55] ' + m); } catch (e) { } }

  /* ── 새 제품의 사진이 아직 없을 때 ──────────────────────────────────
     stem 이 곧 파일명이라(R8_IMG + stem + '.png') 사진을 아직 안 올린 신규 제품은
     이미지가 404 다. 그대로 두면 깨진 아이콘이 카드에 박힌다.
     ★ 카드 렌더러(usung-r8-prod-b.js 의 mcardHTML)는 frozen 인 원본이 아니라 오버레이지만,
       거기 손대면 r8 렌더 경로 전체가 회귀 위험에 들어간다. 대신 **캡처 단계에서** 잡는다
       — error 이벤트는 버블링하지 않으므로 캡처(3번째 인자 true)여야 걸린다.

     ★★ 이 핸들러는 패치 적용보다 **먼저, 무조건** 단다.
       처음엔 파일 맨 아래(패치 적용 뒤)에 뒀는데 그건 틀렸다 — 아래 패치 로직은
       발행분이 없으면 일찍 return 한다. 그러면 「제품 목록은 안 건드리고 **사진만**
       교체한」 경우에 자리표시가 없어 빌드 1~2분 동안 깨진 아이콘이 그대로 남는다.
       사진 경로(api/product-image.js)와 패치 경로(api/products.js)는 **별개**다.
       README 에 「자리표시와 pending 안내는 둘 다 있어야 한다」고 적어 놓고
       정작 한쪽을 패치 유무에 묶어 두고 있었다. */
  var PLACEHOLDER =
    'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(
      '<svg xmlns="http://www.w3.org/2000/svg" width="240" height="240">' +
      '<rect width="240" height="240" fill="#f1f5f9"/>' +
      '<text x="120" y="126" font-family="sans-serif" font-size="15" fill="#94a3b8" ' +
      'text-anchor="middle">사진 준비 중</text></svg>');

  document.addEventListener('error', function (ev) {
    var t = ev && ev.target;
    if (!t || t.tagName !== 'IMG') return;
    if (t.dataset && t.dataset.r55ph === '1') return;      // 자리표시가 또 실패하는 무한루프 차단
    var src = t.getAttribute('src') || '';
    if (src.indexOf('/products/final/') < 0) return;        // 제품 사진만 건드린다
    if (t.dataset) t.dataset.r55ph = '1';
    t.src = PLACEHOLDER;
  }, true);

  var P = window.UP_PATCH;
  var D = window.UP_DATA;

  // ★ 아래 return 들은 전부 「패치를 적용하지 않는다」는 뜻일 뿐이다.
  //   위 자리표시 핸들러는 이미 달렸다 — 그게 이 순서의 이유다.
  if (!Array.isArray(D)) { log('UP_DATA 없음 — 순서가 어긋났다. 적용하지 않는다'); return; }
  // 패치가 없는 건 정상이다(아직 아무것도 발행하지 않은 상태). 조용히 끝낸다.
  if (!P || typeof P !== 'object') return;

  var add = Array.isArray(P.add) ? P.add : [];
  var del = Array.isArray(P.del) ? P.del : [];
  var edit = (P.edit && typeof P.edit === 'object') ? P.edit : {};

  if (!add.length && !del.length && !Object.keys(edit).length) return;

  var before = D.length;
  var out = D;

  /* ── 삭제 ──
     ★ 기준선을 파괴하지 않는다. filter 는 새 배열을 만든다 — 원본 UP_DATA 는 그대로 두고
       마지막에 한 번만 갈아끼운다. 중간에 예외가 나도 반쯤 지워진 목록이 남지 않는다. */
  if (del.length) {
    var dead = {};
    for (var i = 0; i < del.length; i++) dead[String(del[i])] = 1;
    out = out.filter(function (r) { return !dead[String(r && r[0])]; });
  }

  /* ── 수정 ──
     ★ 행을 제자리에서 고치지 않고 복사본을 만든다(slice). UP_DATA 를 다른 모듈이
       이미 참조하고 있어도 그쪽이 보는 값이 몰래 바뀌지 않는다. */
  var editKeys = Object.keys(edit);
  if (editKeys.length) {
    out = out.map(function (r) {
      if (!r || !r[0]) return r;
      var e = edit[String(r[0])];
      if (!e) return r;
      var c = r.slice();
      for (var k in IDX) {
        if (!Object.prototype.hasOwnProperty.call(IDX, k)) continue;
        var v = e[k];
        // 빈 값은 「지우기」가 아니라 「손대지 않음」이다 — api/products.js 의 normalize 와 같은 규칙.
        // 여기서 ''를 넣으면 제품명이 빈 카드가 생긴다.
        if (v == null || v === '') continue;
        c[IDX[k]] = String(v);
      }
      return c;
    });
  }

  /* ── 추가 ──
     객체({stem,name,…})로 오는 걸 7칸 배열로 편다. 이미 있는 stem 은 건너뛴다
     — 같은 stem 이 둘이면 카드가 두 번 뜨고, 이미지도 같은 파일을 가리켜 구분이 안 된다. */
  if (add.length) {
    // del·edit 이 하나도 안 돌았으면 out 은 아직 UP_DATA 원본 그 자체다.
    // 여기서 바로 push 하면 원본을 제자리에서 늘리게 된다 — 한 벌 떠서 작업한다.
    if (out === D) out = D.slice();
    var have = {};
    for (var j = 0; j < out.length; j++) if (out[j] && out[j][0]) have[String(out[j][0])] = 1;

    for (var a = 0; a < add.length; a++) {
      var o = add[a];
      if (!o || typeof o !== 'object') continue;
      var stem = String(o.stem || '').trim();
      if (!stem || have[stem]) continue;
      var name = String(o.name || '').trim();
      if (!name) continue;              // 이름 없는 제품은 빈 카드가 된다

      var row = new Array(WIDTH);
      row[0] = stem;
      for (var k2 in IDX) {
        if (!Object.prototype.hasOwnProperty.call(IDX, k2)) continue;
        row[IDX[k2]] = String(o[k2] == null ? '' : o[k2]);
      }
      /* 태그가 비면 검색 보조키(usung-r51-data.js 의 aux)가 비어 이름으로만 잡힌다.
         ★ 처음엔 여기 「태그가 비면 스타일 필터에서 사라진다」고 적었는데 **틀렸다.**
           실물을 보니 스타일 탭은 태그가 아니라 **finish** 로 거른다
           (usung-r8-prod-b.js:38 `keys.includes(it.finish)`). 태그는 필터에 안 쓰인다.
           그래서 태그가 비어도 제품이 사라지지는 않는다 — 검색만 약해진다.
         ★ mid·grp·finish 가 전부 비면(= 이름과 분류만 채운 신규 제품, 제일 흔한 경우)
           예전 식은 빈 문자열을 만들었다. cat·name 까지 넣어 **절대 비지 않게** 한다. */
      if (!row[IDX.tags]) {
        row[IDX.tags] = [row[IDX.cat], row[IDX.mid], row[IDX.grp], row[IDX.finish], row[IDX.name]]
          .filter(Boolean).join('|');
      }
      have[stem] = 1;
      out.push(row);
    }
  }

  window.UP_DATA = out;
  log('적용 ' + before + ' → ' + out.length
    + ' (추가 ' + add.length + ' · 수정 ' + editKeys.length + ' · 삭제 ' + del.length + ')');
})();
