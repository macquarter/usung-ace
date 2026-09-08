/* usung-r41-ui.js — r41 admin side (screen)
 *
 * Frames the real site inside /admin and lets the operator click any visible
 * text to change it. Same-origin, so contentDocument / navigate() are usable
 * (verified empirically before writing this).
 *
 * Nothing here is a copy of the site. The editable list IS the live DOM, so it
 * cannot drift the way admin.html's hard-coded 104-field list did.
 *
 * r67 — the 「국내 최초」 hood photos are swapped by clicking the photo itself.
 *   승연: 「해당 페이지도 아직 예전 내용들이 다수 있어 여기에 국내최초 4장 사진
 *          넣어놓으면 헷갈려. 화면에서 편집으로 인터렉티브하게 해줘」
 *   r66 put four upload slots inside 「페이지 편집 → 코어 기술」. That view is full of
 *   stale text (this file's whole reason for existing), so the slots read as more
 *   stale content. Here the preview IS the site, so there is nothing to mistrust.
 *
 *   ★ No fetch lives in this file. window.pickTechPhoto / resetTechPhoto in
 *     admin.html do the upload; copying them here would rot one side (KNOWLEDGE 41).
 *   ★ Two lifecycles share one screen — text edits stage and need 🚀 발행,
 *     photos upload immediately and never need it. Say so in the panel or the
 *     operator will press 발행 and think nothing happened.
 */
(function () {
  'use strict';

  var EDIT = true;
  var CUR = null;          // {from, node}
  /* r70d — 「N곳 전부 바꾸기」 확인을 기다리는 문구.
     용어 통일(반후지→상부 처럼)은 전역 치환이 **맞다**. 전면 차단만 하면
     라이브에 이미 발행된 그 방식의 수정을 관리자가 다시는 못 하게 된다. */
  var PEND = null;
  var WARMING = false;     // r70 워밍업 중에는 클릭을 받지 않는다 (계수가 아직 거짓말한다)
  /* r76 — 지금 열려 있는 갤러리 사진 {src, twins, before}.
     ★ CUR(글자)과 **따로 둔다.** 한 칸을 나눠 쓰면 r41Put 이 갤러리 상태를 글자 앵커로 읽는다. */
  var GAL = null;
  var frame = null;

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }
  function norm(s) { return window.R41.norm(s); }
  function win() { try { return frame && frame.contentWindow; } catch (e) { return null; } }
  function doc() { try { return frame && frame.contentDocument; } catch (e) { return null; } }
  function api() { var w = win(); return (w && w.__r41) ? w.__r41 : null; }

  var CSS = '<style>' +
    '.r41-bar{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-bottom:12px}' +
    '.r41-bar select,.r41-bar button{padding:7px 12px;border-radius:8px;border:1px solid #334155;' +
    'background:#1e293b;color:#e2e8f0;font-size:13px;cursor:pointer}' +
    '.r41-bar button.on{background:#2563eb;border-color:#2563eb;color:#fff;font-weight:700}' +
    '.r41-bar .hint{font-size:12px;color:#94a3b8}' +
    '.r41-body{display:flex;gap:14px;align-items:flex-start}' +
    '.r41-fw{flex:1 1 auto;min-width:0;border:1px solid #334155;border-radius:10px;overflow:hidden;background:#0f172a}' +
    '#r41Frame{width:100%;height:72vh;border:0;display:block;background:#fff}' +
    '.r41-side{flex:0 0 320px;max-height:72vh;overflow:auto}' +
    '.r41-card{background:#1e293b;border:1px solid #334155;border-radius:10px;padding:12px;margin-bottom:10px}' +
    '.r41-card h4{margin:0 0 8px;font-size:13px;color:#e2e8f0}' +
    '.r41-card textarea{width:100%;box-sizing:border-box;min-height:80px;padding:8px;border-radius:8px;' +
    'border:1px solid #475569;background:#0f172a;color:#e2e8f0;font-size:13px;font-family:inherit;resize:vertical}' +
    '.r41-org{font-size:12px;color:#94a3b8;background:#0f172a;border-radius:6px;padding:7px;margin-bottom:8px;' +
    'white-space:pre-wrap;word-break:break-all;max-height:90px;overflow:auto}' +
    '.r41-it{border-bottom:1px solid #334155;padding:8px 0;font-size:12px;color:#cbd5e1}' +
    '.r41-it:last-child{border-bottom:0}' +
    '.r41-it b{display:block;color:#f1f5f9;font-weight:600;word-break:break-all}' +
    '.r41-it .st{font-size:11px;font-weight:700}' +
    '.r41-it .x{float:right;cursor:pointer;color:#f87171}' +
    '@media(max-width:1100px){.r41-body{flex-direction:column}.r41-side{flex:1 1 auto;width:100%;max-height:none}}' +
    '</style>';

  window.rLiveEdit = function () {
    var opts = '';
    for (var i = 0; i < R41.pages.length; i++) {
      var p = R41.pages[i];
      opts += '<option value="' + p[0] + '"' + (p[0] === R41.page ? ' selected' : '') + '>' + esc(p[1]) + '</option>';
    }
    return CSS +
      '<div class="r41-bar">' +
      '<select id="r41Page" onchange="r41Go(this.value)">' + opts + '</select>' +
      '<button id="r41Mode" class="on" onclick="r41Mode()">✏️ 편집 모드</button>' +
      '<button onclick="r41Reload()">🔄 새로고침</button>' +
      '<button onclick="publishCms()">🚀 홈페이지에 발행</button>' +
      '<span class="hint" id="r41Hint">글자를 클릭하면 고칠 수 있습니다. 기술력 「국내 최초」 사진은 <b>사진을 직접 클릭</b>하세요. 메뉴·모달을 열려면 🖱 탐색 모드로 바꾸세요.</span>' +
      '</div>' +
      '<div class="r41-body">' +
      '<div class="r41-fw"><iframe id="r41Frame" src="/"></iframe></div>' +
      '<div class="r41-side"><div id="r41Edit"></div><div id="r41List"></div></div>' +
      '</div>';
  };

  window.r41Mount = function () {
    frame = document.getElementById('r41Frame');
    CUR = null;
    if (!frame) return;
    frame.onload = function () { setTimeout(hook, 250); };
    // 이미 로드가 끝난 뒤였다면 onload 는 안 온다
    try {
      var d0 = frame.contentDocument;
      if (d0 && d0.readyState === 'complete' && d0.body && d0.body.children.length) setTimeout(hook, 250);
    } catch (e) { }
    renderList();
  };

  function hook() {
    var d = doc();
    if (!d || !d.body) return;
    if (!d.getElementById('r41-style')) {
      var st = d.createElement('style');
      st.id = 'r41-style';
      st.textContent = '.r41-hi{outline:2px dashed #2563eb!important;outline-offset:2px;cursor:text!important;' +
        'background:rgba(37,99,235,.10)!important}' +
        /* ★ 사진은 색·굵기·커서를 전부 다르게 준다 — 「글자」와 「사진」은 다른 일이고,
             그 차이가 누르기 **전에** 보여야 한다.
           ★★ cursor 에 !important 가 꼭 있어야 한다 — usung-r32.js 가 이 카드에서
             클릭을 일부러 벗기면서 usung-r32.css 로 `cursor:default` 를 걸어 뒀다.
             (내 핸들러는 문서 capture 리스너라 r32 의 onclick 제거와는 무관하다.
              무관한 건 동작이고, 안 무관한 건 **누를 수 있어 보이는가**다) */
        '.r41-hip{outline:3px solid #f59e0b!important;outline-offset:3px;cursor:pointer!important;' +
        'background:rgba(245,158,11,.14)!important}';
      d.head.appendChild(st);
    }
    d.addEventListener('click', onClick, true);
    d.addEventListener('mouseover', onOver, true);
    d.addEventListener('mouseout', onOut, true);
    warmup(function () {
      if (R41.page && win() && typeof win().navigate === 'function' && curPage() !== R41.page) {
        try { win().navigate(R41.page); } catch (e) { }
      }
      preview();
      // 사이트 스크립트(defer + fetch)가 늦게 뜬다 — 보험
      [400, 1200, 2500].forEach(function (ms) { setTimeout(preview, ms); });
    });
  }

  /* ── 워밍업 (r70) ────────────────────────────────────────────────────────
     ★★★ 계수기는 「지금 그려진 DOM」만 센다. 갤러리·부품·기술력 격자는 그
     페이지를 한 번 열기 전에는 노드가 아예 없다. 그래서 홈에서 「국내 최초」를
     누르면 **1곳**이라 나와 편집이 통과되는데, 방문자가 기술력에 들어가는 순간
     **5곳**이 된다(프리뷰 실측 1→5 · 갤러리 0→26 · 부품 0→8).
     ★ 세는 쪽이 적게 세면 막아야 할 것을 통과시킨다 — 그래서 붙자마자 모든
       페이지를 한 번 돌아 DOM 을 다 지어 놓고 센다.
     ★ 7개(PAGES_R41)가 아니라 **문서의 .page 전부**를 돈다. 치환은 편집 가능
       여부와 무관하게 body 전체에서 일어나기 때문이다. */
  function warmup(done) {
    var w = win(), d = doc();
    // hook() 은 frame.onload 와 readyState 검사 양쪽에서 불릴 수 있다.
    // 두 번 겹치면 두 순회가 서로 페이지를 빼앗아 둘 다 어긋난다.
    if (WARMING) return;
    if (!w || !d || typeof w.navigate !== 'function') { done(); return; }
    var els = d.querySelectorAll('.page'), ids = [], i;
    for (i = 0; i < els.length; i++) {
      var id = String(els[i].id || '').replace(/^page-/, '');
      if (id) ids.push(id);
    }
    if (ids.length < 2) { done(); return; }

    WARMING = true;
    msg('화면을 준비하는 중입니다… 잠시만 기다려 주세요.');
    var k = 0;
    (function step() {
      if (k >= ids.length) {
        WARMING = false;
        msg('글자를 클릭하면 고칠 수 있습니다. 사진은 사진을 클릭하세요.');
        done();
        return;
      }
      try { w.navigate(ids[k]); } catch (e) { }
      k++;
      setTimeout(step, 380);
    })();
  }

  function curPage() {
    var a = api();
    if (a) { try { return a.page(); } catch (e) { } }
    var d = doc();
    var e = d && d.querySelector('.page.active');
    return e ? String(e.id || '').replace(/^page-/, '') : '';
  }

  function preview() {
    repaintPending();   // ★ 적용기(__r41)가 없어도 사진은 덮어야 한다 — 아래 return 보다 앞
    var a = api();
    if (!a) { renderList(); return; }
    try { a.set(R41.entries); } catch (e) { }
    renderList();
  }

  function onOver(ev) {
    if (!EDIT) return;
    var t = ev.target;
    if (t && t.classList && t.nodeType === 1) t.classList.add(hood(ev) ? 'r41-hip' : 'r41-hi');
  }
  function onOut(ev) {
    var t = ev.target;
    if (t && t.classList && t.nodeType === 1) { t.classList.remove('r41-hi'); t.classList.remove('r41-hip'); }
  }

  function onClick(ev) {
    if (!EDIT) return;
    ev.preventDefault();
    ev.stopPropagation();
    if (WARMING) { msg('화면을 준비하는 중입니다… 끝나면 클릭할 수 있습니다.'); return; }
    /* ★★★ 이미지 분기는 반드시 pick() **앞**이다. caretRangeFromPoint 는 <img> 위에서도
       근처 텍스트 노드를 돌려준다 — 뒤에 붙이면 이 분기가 영영 안 타고,
       후드를 눌렀는데 배지·제목 글자 편집기가 조용히 열린다. */
    var slot = hood(ev);
    if (slot) { openPhoto(slot); return; }
    /* r76) 갤러리 타일도 **pick() 앞**이다 — 후드와 같은 이유이고, 갤러리는 더 급하다.
       타일 안에는 figcaption 글자(분류 kicker·제목·규격 세 줄)가 있다.
       ★ 프리뷰 실측: gc01 타일의 「클래식」 글자 위에서 caretRangeFromPoint 가
         그 글자를 그대로 돌려줬다. 즉 이 분기가 없으면 **반드시** 글자 편집기가 열린다.
         (r10 이 「003 · 시공갤러리」 자리표시자를 실제 규격으로 갈아 끼웠으므로
          옛 문구를 여기 적어 두면 썩는다 — 지금 무엇이 잡히는지만 적는다.) */
    var gsrc = gtile(ev);
    if (gsrc) { openGal(gsrc); return; }
    var n = pick(ev);
    if (!n) { msg('그 자리에는 고칠 글자가 없습니다. 글자 위를 정확히 클릭하세요.'); return; }

    /* ★★★ 열기 전에 「몇 곳인가」를 먼저 묻는다 (r70).
       적용기는 같은 문구를 문서 전체에서 전부 바꾼다. 여기서 안 막으면
       갤러리 후드 이름 하나를 고쳤을 때 26장이 조용히 같이 바뀐다. */
    var cur = norm(n.nodeValue);
    var c = hits(cur);
    if (c < 0) { msg('지금은 확인할 수 없습니다. 🔄 새로고침 후 다시 눌러주세요.'); return; }
    if (c === 0) { msg('그 자리는 고칠 수 없는 글자입니다.'); return; }
    if (c > 1) { warnMulti(cur, c); return; }
    open(cur, c);   // 여기 오면 c === 1 이다
  }

  /* 세는 일은 적용기(__r41.count)에게 맡긴다 — 여기서 따로 세면 세는 규칙과
     바꾸는 규칙이 갈라진다. 못 물어보면 -1 을 돌려 **편집을 막는다**(열어주는
     쪽이 위험하다 · 적용기가 없으면 어차피 방문자 화면에 반영도 안 된다). */
  function hits(s) {
    var a = api();
    if (!a || typeof a.count !== 'function') return -1;
    try { return a.count(s); } catch (e) { return -1; }
  }

  /* 「그럼 어디서 고치나」의 답은 페이지마다 다르다. ★ 없는 기능을 안내하면
     안 된다 — 부품·갤러리·홈·기술력은 글자 발행 경로가 실제로 없다. */
  var WHERE = {
    products: '제품 이름·특징은 왼쪽 <b>「제품 관리」</b> 메뉴에서 고칩니다.',
    about: '회사소개 글자는 <b>「페이지 편집 → 회사소개」</b>에서 고칩니다.',
    board: '공지 글은 <b>「공지사항」</b>, 문의 글은 <b>「고객 게시판」</b> 메뉴에서 고칩니다.'
  };

  function warnMulti(cur, c) {
    var p = curPage() || R41.page;
    var box = document.getElementById('r41Edit');
    if (!box) return;
    CUR = null;
    PEND = cur;
    box.innerHTML =
      '<div class="r41-card" style="border-color:#fbbf24">' +
      '<h4 style="color:#fbbf24">⚠ 이 문구는 한 곳이 아닙니다</h4>' +
      '<div class="r41-org">' + esc(cut(cur)) + '</div>' +
      '<div style="font-size:12px;line-height:1.7;margin-top:8px">' +
      '홈페이지 안에 <b style="color:#fbbf24">' + c + '곳</b> 있습니다. ' +
      '여기서 고치면 <b>' + c + '곳이 한꺼번에</b> 바뀝니다.<br>' +
      '<b>한 곳만</b> 바꾸는 것은 안 됩니다 — ' +
      (WHERE[p] || '이 자리는 관리자에서 따로 고칠 수 없습니다. 개발자에게 알려주세요.') +
      /* r70e) 예시는 **실제로 있었던 일**로 적는다. 09-03 에 「반후지」를 「상부」로
         사이트 전체에서 바꾼 적이 있고, 그게 이 버튼의 정당한 쓰임새다.
         ★ 앞의 예시는 「갓등」→「갓등」이라 같은 말이었다 — 예시 구실을 못 했다. */
      '<br><br>「반후지」→「상부」처럼 <b>사이트 전체에서 같은 말을 한꺼번에 바꾸는 것이 목적</b>이라면 ' +
      '아래 노란 버튼으로 진행하세요.' +
      '</div>' +
      '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">' +
      '<button class="tb-btn" style="border-color:#fbbf24;color:#fbbf24" onclick="r41Force()">' +
      '⚠ ' + c + '곳 전부 바꾸기</button>' +
      '<button class="tb-btn" onclick="r41Close()">취소</button>' +
      '</div></div>';
  }

  /* 눌린 것이 「국내 최초」 후드 사진이면 슬롯 번호(1부터), 아니면 0.
     ★ 후드 사진만 본다. 제품·부품·갤러리 이미지는 배관도 슬롯 개념도 달라서
       같이 열면 없는 기능을 있는 것처럼 보이게 한다. */
  function hood(ev) {
    var el = ev.target;
    if (!el || el.nodeType !== 1 || el.tagName !== 'IMG') return 0;
    if (!el.classList || !el.classList.contains('tf-hood')) return 0;
    var d = doc(), host = d && d.getElementById('th-first');
    var card = el.closest ? el.closest('.tf-card') : null;
    if (!host || !card || card.parentElement !== host) return 0;
    /* ★ 슬롯 번호를 src 로 판별하면 안 된다 — onerror 가 src 를 proto_assets/* 로 바꿔 쓴다
         (r66 에서 그게 「대체가 실제로 돈다」는 증거였다).
       ★ 상한(4)을 여기 박지 않는다 — api/tech-image.js 의 SLOTS 가 단일 출처다.
         두 곳에서 세면 반드시 한쪽이 썩는다(KNOWLEDGE 41). */
    var cards = host.querySelectorAll('.tf-card');
    for (var i = 0; i < cards.length; i++) if (cards[i] === card) return i + 1;
    return 0;
  }

  /* ── r76) 눌린 것이 시공갤러리 타일이면 그 사진의 파일명, 아니면 ''. ─────────────
     ★★★ 여기가 이 리비전의 요점이다. r41 은 **글자**로 고칠 곳을 가리켜서
       같은 글자가 여러 장에 있으면 손댈 수 없었다(그게 승연이 말한 「하나 바꾸면 다 바뀐다」).
       갤러리 타일은 `dataset.key` 에 **파일명**을 이미 달고 있다(usung-r8-gal.js `galMakeTile`).
       파일명은 69행 전체에서 **중복이 0** 이라, 이걸 쓰면 한 장을 정확히 가리킨다.
     ★ `galInner`/`galSyncTile` 은 usung-r10.js 가 덮어쓰지만 `galMakeTile` 은 안 덮는다 —
       그래서 `data-key` 는 r10 이 있어도 없어도 그대로 있다. */
  function gtile(ev) {
    var el = ev.target;
    if (!el || !el.closest) return '';
    var f = el.closest('.gtile');
    /* ★ dataset 을 바로 읽지 않고 getAttribute 로 읽는다 — 이 노드는 **iframe 안**의
         문서라 부모창의 DOMStringMap 과 프로토타입이 다를 수 있다. 속성은 언제나 문자열이다. */
    var k = f && f.getAttribute ? f.getAttribute('data-key') : '';
    return k || '';
  }

  /* 사이트 쪽 갤러리 창구(usung-r76-gal.js 가 내준다). api() 와 같은 꼴이다.
     ★ GALLERY 는 최상위 const 라 window 에 없다 — 이 창구 말고는 밖에서 닿을 길이 없다. */
  function gapi() { var w = win(); return (w && w.__r76) ? w.__r76 : null; }

  function pick(ev) {
    var d = doc();
    if (!d) return null;
    var r = null;
    try { r = d.caretRangeFromPoint ? d.caretRangeFromPoint(ev.clientX, ev.clientY) : null; } catch (e) { }
    var n = r && r.startContainer;
    if (n && n.nodeType === 3 && n.nodeValue && n.nodeValue.trim()) return n;
    var el = ev.target, best = null;
    if (el && el.childNodes) {
      for (var c = el.firstChild; c; c = c.nextSibling) {
        if (c.nodeType === 3 && c.nodeValue && c.nodeValue.trim() &&
          (!best || c.nodeValue.length > best.nodeValue.length)) best = c;
      }
    }
    return best;
  }

  // 이미 바꿔둔 글자를 다시 클릭하면 화면에는 새 문구가 있다.
  // 앵커는 원문이므로 역으로 찾아준다.
  function anchorOf(cur) {
    var p = curPage() || R41.page;
    for (var i = 0; i < R41.entries.length; i++) {
      var e = R41.entries[i];
      if (e.p === p && norm(e.t) === cur) return e.f;
    }
    return cur;
  }

  /* c 를 넘기면(r70d 「전부 바꾸기」 경로) 편집기 안에 몇 곳인지 계속 띄워 둔다.
     경고를 한 번 지나쳤다고 잊으면 안 되는 정보다. */
  function open(cur, c) {
    if (!cur) return;
    R41.page = curPage() || R41.page;
    var from = anchorOf(cur);
    CUR = { from: from };
    var box = document.getElementById('r41Edit');
    if (!box) return;
    box.innerHTML =
      '<div class="r41-card"' + (c > 1 ? ' style="border-color:#fbbf24"' : '') + '>' +
      '<h4>✏️ ' + esc(R41.name(R41.page)) + ' — 글자 수정</h4>' +
      (c > 1
        ? '<div style="font-size:12px;color:#fbbf24;margin:-2px 0 6px">' +
          '⚠ 적용하면 <b>' + c + '곳이 전부</b> 바뀝니다.</div>'
        : '') +
      '<div class="r41-org">' + esc(from) + '</div>' +
      '<textarea id="r41Txt">' + esc(cur) + '</textarea>' +
      '<div style="margin-top:8px;display:flex;gap:6px">' +
      '<button class="tb-btn pri" onclick="r41Put()">적용</button>' +
      '<button class="tb-btn" onclick="r41Undo()">원문으로</button>' +
      '<button class="tb-btn" onclick="r41Close()">닫기</button>' +
      '</div></div>';
    var t = document.getElementById('r41Txt');
    if (t) t.focus();
  }

  function msg(s) {
    var box = document.getElementById('r41Edit');
    if (box) box.innerHTML = '<div class="r41-card" style="color:#94a3b8;font-size:12px">' + esc(s) + '</div>';
  }

  /* ── 「국내 최초」 사진 (r67) ──────────────────────────────────────────────
     ★ 이 파일에는 fetch 가 한 줄도 없다. 업로드·되돌리기는 admin.html 의
       pickTechPhoto / resetTechPhoto 가 한다(r66 이 만든 것을 그대로 부른다).
       복사해 오면 반드시 한쪽만 썩는다(KNOWLEDGE 41).
     ★★ 한 화면에 수명이 다른 두 가지가 있다 — 글자는 담아 뒀다가 🚀 발행,
       사진은 즉시 올라가고 발행이 필요 없다. 그 차이를 카드에 적어야
       조작자가 발행을 누르고 「아무 일도 안 일어났다」고 판단하지 않는다. */
  function openPhoto(slot) {
    CUR = null;   // ★ 글자 편집 상태와 섞이면 r41Put 이 엉뚱한 앵커에 쓴다
    var box = document.getElementById('r41Edit');
    if (!box) return;
    box.innerHTML =
      '<div class="r41-card"><h4>🖼 「국내 최초」 ' + slot + '번 사진</h4>' +
      '<div class="r41-org">지금 액자 안에 보이는 그 사진입니다. 바꾸면 이 자리에서 바로 확인됩니다.</div>' +
      '<div style="display:flex;gap:6px;flex-wrap:wrap">' +
      '<button class="tb-btn pri" onclick="r41Adjust(' + slot + ')">지금 사진 조정</button>' +
      '<button class="tb-btn" onclick="r41Pick(' + slot + ')">사진 바꾸기</button>' +
      '<button class="tb-btn" onclick="r41Reset(' + slot + ')">기본 사진으로</button>' +
      '<button class="tb-btn" onclick="r41Close()">닫기</button>' +
      '</div>' +
      '<div style="font-size:11px;color:#94a3b8;margin-top:10px;line-height:1.7">' +
      '<b>지금 사진 조정</b> — 새 파일을 고르지 않고 <b>지금 이 사진</b>을 다시 자릅니다. ' +
      '자를 자리를 끌어서 맞춘 뒤 「이 모양으로 올리기」를 누르세요.<br>' +
      'PNG·JPG 둘 다 됩니다 (올릴 때 자동으로 PNG 로 바꿔 저장합니다).<br>' +
      '배경이 없는 <b>투명 PNG</b> 를 권합니다 — 카드 위에 그대로 얹히기 때문입니다.<br>' +
      '자리는 <b>4장 모두 같은 크기</b>라 비율이 달라도 카드 글자를 덮지 않습니다.<br>' +
      '★ 사진은 <b>🚀 발행이 필요 없습니다</b> — 바로 올라가고 사이트 반영까지 <b>1~2분</b> 걸립니다.' +
      '</div></div>';
  }

  /* ── r76) 시공갤러리 한 장 ────────────────────────────────────────────────────
     ★★★ 이 편집기가 r41 글자 편집기와 다른 점은 **가리키는 방법** 하나뿐이다.
       r41 은 「이 글자」로 가리켜서 같은 글자가 여러 장에 있으면 전부 바뀐다.
       여기는 「이 파일」로 가리킨다 — 파일명은 69행에서 중복이 0 이라 늘 한 장이다.
       그래서 **전체치환이 구조적으로 일어날 수 없다.** 승연이 「전체치환 버그 없이」라고
       못박은 것이 이것이고, 조심해서 되는 게 아니라 **가리키는 방법을 바꿔야** 되는 일이었다.

     ★★ 그런데 「한 장만 바뀐다」가 곧 「화면이 안 어긋난다」는 아니다.
       galItems('전체') 가 **이름+내용이 같은 사진을 한 장으로 접는다.** 쌍둥이 한쪽만 고치면
       접힘이 풀려 전체 탭 장수가 **늘어난다**(하네스 실측: 5 → 6). 그래서 쌍둥이가 있으면
       **같이 바꾸기를 기본값**으로 두고 그 결과를 숫자로 미리 말해 준다.

     ★ 수명: 저장하면 **바로 올라간다 — 🚀 발행이 필요 없다.** 공지사항과 같은 방식이다.
       (글자인데 발행이 없는 건 이 화면과 공지 둘뿐이라 반드시 카드에 적는다.) */
  function openGal(src) {
    CUR = null;   // ★ 글자 편집 상태와 섞이면 r41Put 이 엉뚱한 앵커에 쓴다
    var box = document.getElementById('r41Edit');
    if (!box) return;
    var g = gapi();
    if (!g) { msg('갤러리 정보를 읽지 못했습니다 — 🔄 새로고침 후 다시 눌러주세요.'); return; }

    var cur = null, twins = [], cats = [];
    try { cur = g.get(src); twins = g.twins(src) || []; cats = g.cats() || []; } catch (e) { cur = null; }
    if (!cur) { msg('그 사진을 목록에서 찾지 못했습니다 — 🔄 새로고침 후 다시 눌러주세요.'); return; }

    GAL = { src: src, twins: twins, before: cur };

    var opts = cats.map(function (c) {
      return '<option value="' + esc(c) + '"' + (c === cur.cat ? ' selected' : '') + '>' + esc(c) + '</option>';
    }).join('');

    /* ★ 쌍둥이 경고 — 숫자를 **여기서 세지 않는다.** 사이트 쪽 __r76.count() 가 센다.
         r70 이 hits() 를 적용기에 맡긴 것과 같은 이유다: 세는 규칙과 바꾸는 규칙이 갈라지면 안 된다. */
    var now = -1;
    try { now = g.count(); } catch (e) { now = -1; }
    var warn = '';
    if (twins.length) {
      warn =
        '<div style="border:1px solid #fbbf24;border-radius:8px;padding:8px;margin:8px 0;background:#3b2f0b">' +
        '<div style="color:#fbbf24;font-size:12px;font-weight:600;margin-bottom:6px">' +
        '⚠ 내용이 똑같은 사진이 ' + twins.length + '장 더 있습니다</div>' +
        '<div style="font-size:11px;color:#e2e8f0;line-height:1.7">' +
        esc(twins.join(' · ')) + '<br><br>' +
        '갤러리 <b>「전체」</b> 탭은 <b>이름과 내용이 같은 사진을 한 장으로 묶어</b> 보여줍니다. ' +
        /* ★ 숫자를 못 재면(count() 가 -1) 숫자를 지어내지 않고 문장만 낸다 — KNOWLEDGE 61 의 ★측정무효.
             ★ 「늘어납니다」를 삼항 밖에 두면 못 잰 쪽에서 두 번 나온다. 안에 둔다. */
        '한 장만 바꾸면 묶임이 풀려서 <b>전체 탭 사진이 ' +
        (now > 0 ? now + '장에서 ' + (now + twins.length) + '장으로 늘어납니다' : '늘어납니다') +
        '</b>. 보통은 <b>같이 바꾸는 쪽</b>이 맞습니다.' +
        '</div>' +
        /* ★★ 체크상자에 픽셀을 못박고 글자에 min-width:0 을 준다 — r73 에서 겪은 병이다.
             안 박으면 체크상자가 줄을 독차지하고 한글이 한 글자씩 세로로 쌓인다(KNOWLEDGE 65). */
        '<label style="display:flex;align-items:center;gap:6px;margin-top:8px;cursor:pointer">' +
        '<input type="checkbox" id="r41GalAll" checked style="flex:0 0 16px;width:16px;height:16px;margin:0">' +
        '<span style="flex:1 1 auto;min-width:0;font-size:12px;color:#fbbf24">' +
        '같은 내용인 ' + twins.length + '장도 같이 바꾸기 <b>(권장)</b><br>' +
        /* ★ 분류는 안 옮긴다 — 쌍둥이가 **일부러 다른 분류에** 놓인 경우가 있다(클래식/gc02 ↔ 레트로/gr01).
             체크상자 하나로 그것까지 끌고 가면 사람이 예상 못 한 이동이 일어난다. 그래서 여기 적어 둔다. */
        '<span style="color:#94a3b8">분류는 이 사진만 바뀝니다</span>' +
        '</span></label>' +
        '</div>';
    }

    box.innerHTML =
      '<div class="r41-card"><h4>🖼 시공갤러리 사진</h4>' +
      '<div class="r41-org">파일 ' + esc(src) + ' — 이 사진 <b>한 장</b>만 바뀝니다.</div>' +
      '<div style="font-size:11px;color:#94a3b8;margin:8px 0 4px">분류</div>' +
      '<select id="r41GalCat" style="width:100%;box-sizing:border-box;padding:7px;border-radius:8px;' +
      'background:#0f172a;color:#e2e8f0;border:1px solid #334155;font-size:13px">' + opts + '</select>' +
      '<div style="font-size:11px;color:#94a3b8;margin:8px 0 4px">이름 (현장 이름)</div>' +
      '<input id="r41GalSite" value="' + esc(cur.site || '') + '" style="width:100%;box-sizing:border-box;' +
      'padding:7px;border-radius:8px;background:#0f172a;color:#e2e8f0;border:1px solid #334155;font-size:13px">' +
      '<div style="font-size:11px;color:#94a3b8;margin:8px 0 4px">내용 (규격·설명)</div>' +
      '<input id="r41GalSpec" value="' + esc(cur.spec || '') + '" style="width:100%;box-sizing:border-box;' +
      'padding:7px;border-radius:8px;background:#0f172a;color:#e2e8f0;border:1px solid #334155;font-size:13px">' +
      warn +
      '<div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">' +
      '<button class="tb-btn pri" onclick="r41GalSave()">저장</button>' +
      '<button class="tb-btn" onclick="r41GalPrev()">미리보기</button>' +
      '<button class="tb-btn" onclick="r41Close()">닫기</button>' +
      '</div>' +
      /* ★★ 「적은 그대로 나오지 않는다」는 인상이 아니라 코드다. 지어내지 말 것 —
           `usung-r8-gal.js:132 parseSpec()` 이 spec 에서 size·struct·color·body·fvd 만 뽑고,
           `usung-r10.js` 의 tileTitle/tileKick/tileSub 와 `renderLbox()` 가 **그 다섯 개로만** 글을 짓는다.
           spec 원문이 화면에 그대로 나오는 자리는 **한 곳도 없다.**
           site 는 renderLbox 의 `📍 ${it.site}` 에서만 원문 그대로 나오고,
           타일에서는 r10 의 `NOT_A_PLACE` 정규식(숫자·괄호로 시작하거나 갓·원통등 등)에 걸리면 빠진다.
         ★ 그래서 사람에게 규칙을 외우게 하지 않고 **「미리보기」로 실물을 보라**고 한다 —
           미리보기는 방문자와 **같은 applyEdit·renderGallery** 를 태우므로 갈라질 수가 없다. */
      '<div style="font-size:11px;color:#94a3b8;margin-top:10px;line-height:1.7">' +
      '<b>미리보기</b> — 이 화면에서만 바꿔 봅니다. 새로고침하면 되돌아가고 <b>사이트에는 안 올라갑니다</b>.<br>' +
      '<b>저장</b> — 진짜로 올립니다. ★ <b>🚀 발행이 필요 없습니다</b> — 공지사항과 같습니다. ' +
      '사이트 반영까지 <b>20~30초</b> 걸립니다.<br>' +
      '★ <b>적은 그대로 나오지 않습니다.</b> 사이트가 「내용」에서 규격(125Ø)·구조(스윙텐션·코브라·자바라)·' +
      '색상(괄호 안)만 뽑아 카드 글자를 다시 씁니다. 「이름」은 사진을 <b>크게 열었을 때</b> 📍 옆에 그대로 나오고, ' +
      '작은 카드에서는 제품 이름처럼 읽히면 빠집니다.<br>' +
      '→ <b>저장하기 전에 「미리보기」를 눌러 실제로 어떻게 나오는지 보세요.</b>' +
      '</div></div>';
  }

  /* 액자 안 <img> 한 장만 갈아끼운다. ★ 액자를 다시 만들면 안 된다 —
     그게 「인터렉티브」와 정면충돌이라 admin.html 의 techApplied() 가 R() 대신 이걸 부른다. */
  function paintPhoto(slot, url) {
    var d = doc(), host = d && d.getElementById('th-first');
    if (!host || !url) return false;
    var card = host.querySelectorAll('.tf-card')[slot - 1];
    var img = card && card.querySelector('img.tf-hood');
    if (!img) return false;
    img.style.opacity = '';   // 옛 onerror 가 0 으로 눕혀 놨을 수 있다
    img.src = (url.indexOf('data:') === 0 || url.charAt(0) === '/') ? url : '/' + url;
    return true;
  }

  /* ★ 액자를 다시 띄우거나 새로고침하면 **진짜 사이트가 새로 로드돼** 옛 사진이 돌아온다
       (배포가 아직 안 끝났다). 그래서 mount·preview 마다 다시 덮는다.
     ★ 못 찾으면 그냥 넘어간다 — 그때 보이는 건 「배포된 진짜」라 틀린 화면이 아니다. */
  function repaintPending() {
    if (typeof window.techPending !== 'function') return;
    var pend = null;
    try { pend = window.techPending(); } catch (e) { }
    if (!pend) return;
    for (var k in pend) if (Object.prototype.hasOwnProperty.call(pend, k)) paintPhoto(+k, pend[k]);
  }

  function renderList() {
    var box = document.getElementById('r41List');
    if (!box) return;
    var a = api();
    var st = {};
    if (a) { try { st = a.stat() || {}; } catch (e) { } }
    var p = curPage() || R41.page;
    var mine = [], other = 0;
    for (var i = 0; i < R41.entries.length; i++) {
      if (R41.entries[i].p === p) mine.push(R41.entries[i]); else other++;
    }
    var h = '<div class="r41-card"><h4>이 페이지 수정 ' + mine.length + '건' +
      (other ? ' <span style="color:#94a3b8;font-weight:400">(다른 페이지 ' + other + '건)</span>' : '') + '</h4>';
    if (!a) {
      h += '<div style="font-size:12px;color:#fbbf24">사이트에서 적용 스크립트를 못 찾았습니다. 🔄 새로고침 해보세요.</div>';
    } else if (!mine.length) {
      h += '<div style="font-size:12px;color:#94a3b8">아직 없습니다. 화면의 글자를 클릭하세요.</div>';
    }
    /* ★★ r70 이전에 저장된 항목은 다중 일치일 수 있다. entries 는 서버가 아니라
       이 브라우저의 S.content 에서 오므로, 여기서 안 잡으면 🚀 발행 때 라이브로
       나간다. 초록 「● 반영됨」은 26곳을 바꿔도 그냥 반영됨이라 오라클이 못 된다. */
    var hit = {};
    if (a && typeof a.counts === 'function') {
      var want = [];
      for (var m = 0; m < mine.length; m++) want.push(mine[m].t);
      try { hit = a.counts(want) || {}; } catch (e2) { hit = {}; }
    }

    for (var j = 0; j < mine.length; j++) {
      var e = mine[j], s = st[norm(e.f)] || '';
      var hc = hit[norm(e.t)] || 0;
      var tag = hc > 1
        ? '<span class="st" style="color:#fbbf24">⚠ ' + hc + '곳이 함께 바뀝니다 — 의도한 것이 아니면 ✕</span>'
        : s === 'applied' ? '<span class="st" style="color:#34d399">● 반영됨</span>'
        : s === 'conflict' ? '<span class="st" style="color:#fbbf24">⚠ 다른 항목과 충돌</span>'
          : s === 'missing' ? '<span class="st" style="color:#fbbf24">⚠ 원문이 바뀌어 적용 중단됨</span>'
            : '<span class="st" style="color:#94a3b8">· 확인 중</span>';
      h += '<div class="r41-it"><span class="x" title="삭제" onclick="r41Del(' + j + ')">✕</span>' +
        '<b>' + esc(cut(e.t)) + '</b>' +
        '<span style="color:#64748b">원문 ' + esc(cut(e.f)) + '</span><br>' + tag + '</div>';
    }
    h += '</div>';
    box.innerHTML = h;
  }

  function cut(s) { s = String(s || ''); return s.length > 46 ? s.slice(0, 46) + '…' : s; }

  // ---- 버튼 -------------------------------------------------------------
  window.r41Put = function () {
    var t = document.getElementById('r41Txt');
    if (!CUR || !t) return;
    R41.page = curPage() || R41.page;
    R41.put(R41.page, CUR.from, t.value);
    R41.save();
    preview();
    try { toast('적용했습니다 — 방문자에게 반영하려면 🚀 발행'); } catch (e) { }
  };
  window.r41Undo = function () {
    if (!CUR) return;
    R41.page = curPage() || R41.page;
    R41.remove(R41.page, CUR.from);
    R41.save();
    var d = doc();
    if (d) d.location.reload();   // 이미 바뀐 글자는 다시 그려야 원문이 돌아온다
    r41Close();
  };
  window.r41Close = function () { CUR = null; PEND = null; GAL = null; msg('글자를 클릭하면 고칠 수 있습니다. 사진은 사진을 클릭하세요.'); };

  /* ── r76) 갤러리 저장·미리보기 ─────────────────────────────────────────────
     ★ 이 파일의 규칙은 그대로다 — **여기엔 fetch 가 없다.** 칸에서 값을 읽어
       admin.html 의 saveGallery() 에 넘긴다(r75 가 사진 주소로 한 것과 같은 꼴).

     ★★ 「같이 바꾸기」를 **서버가 아니라 여기서** 편다. 쌍둥이 목록은 데이터가
       바뀌면 같이 바뀌므로 서버에 굳혀 두면 반드시 썩는다(KNOWLEDGE 41).
       서버는 받은 edit 항목을 그대로 저장할 뿐이고, 몇 개를 보낼지는 화면이 정한다. */
  function galRead() {
    if (!GAL) return null;
    var cat = document.getElementById('r41GalCat');
    var site = document.getElementById('r41GalSite');
    var spec = document.getElementById('r41GalSpec');
    if (!cat || !site || !spec) return null;
    var all = document.getElementById('r41GalAll');
    return {
      src: GAL.src,
      cat: cat.value,
      site: String(site.value || '').trim(),
      spec: String(spec.value || '').trim(),
      /* ★ 분류는 쌍둥이에게 옮기지 않는다 — 쌍둥이가 **다른 분류에 일부러 놓인** 경우가 있다
           (클래식/gc02 와 레트로/gr01 이 그렇다). 이름·내용만 맞추면 「전체」 탭 묶임이 유지되고,
           분류는 각자 자리를 지킨다. 묶임의 열쇠가 이름+내용뿐이라 이걸로 충분하다. */
      also: (all && all.checked) ? GAL.twins.slice() : []
    };
  }

  window.r41GalPrev = function () {
    var v = galRead(), g = gapi();
    if (!v || !g) { try { toast('입력칸을 찾지 못했습니다 — 다시 열어주세요', true); } catch (e) { } return; }
    if (!v.site && !v.spec) { try { toast('이름과 내용이 모두 비어 있습니다', true); } catch (e) { } return; }
    try {
      g.set(v.src, { cat: v.cat, site: v.site, spec: v.spec });
      v.also.forEach(function (s) { g.set(s, { site: v.site, spec: v.spec }); });
      toast('미리보기입니다 — 아직 사이트에는 올라가지 않았습니다');
    } catch (e) { try { toast('미리보기 실패 — 🔄 새로고침 후 다시', true); } catch (e2) { } }
  };

  window.r41GalSave = function () {
    var v = galRead();
    if (!v) { try { toast('입력칸을 찾지 못했습니다 — 다시 열어주세요', true); } catch (e) { } return; }
    if (!v.site && !v.spec) { try { toast('이름과 내용이 모두 비어 있습니다', true); } catch (e) { } return; }
    tech('saveGallery', v);
  };

  /* admin.html 의 saveGallery() 가 **저장에 성공한 뒤** 부른다 —
     r75 의 r41PhotoDone 과 같은 꼴이다. ★ 화면 갱신을 admin.html 에 두지 않는 이유:
     GALLERY 에 닿는 길(__r76)이 이 파일에만 있고, 두 곳에 두면 반드시 한쪽이 썩는다. */
  window.r41GalDone = function (v) {
    var g = gapi();
    if (!g || !v) return;
    try {
      g.set(v.src, { cat: v.cat, site: v.site, spec: v.spec });
      (v.also || []).forEach(function (s) { g.set(s, { site: v.site, spec: v.spec }); });
    } catch (e) { }
  };

  /* r70d — 다중 일치를 「알고」 진행한다. 개수는 여기서 다시 센다:
     경고를 띄운 뒤 화면이 다시 그려졌을 수 있고, 그 사이 개수가 변했다면
     낡은 숫자로 확인받는 셈이 된다. */
  window.r41Force = function () {
    var cur = PEND;
    PEND = null;
    if (!cur) return;
    var c = hits(cur);
    if (c < 0) { msg('지금은 확인할 수 없습니다. 🔄 새로고침 후 다시 눌러주세요.'); return; }
    if (c === 0) { msg('그 글자가 화면에서 사라졌습니다. 다시 클릭해 주세요.'); return; }
    open(cur, c);
  };

  /* ★ admin.html 의 전역을 그대로 부른다(선언된 function 은 window 에 붙는다).
       없으면 조용히 실패하지 말고 왜 못 하는지 말한다 — 「눌렀는데 아무 일도 없다」가 제일 나쁘다. */
  function tech(fn, slot, extra) {
    if (typeof window[fn] === 'function') { window[fn](slot, extra); return; }
    try { toast('사진 기능을 못 찾았습니다 — 페이지를 새로고침 해주세요'); } catch (e) { }
  }
  window.r41Pick = function (slot) { tech('pickTechPhoto', slot); };
  window.r41Reset = function (slot) { tech('resetTechPhoto', slot); };

  /* ── r75) 「지금 사진 조정」 ────────────────────────────────────────────────
     r73 은 **새 파일을 고를 때만** 크롭 편집기를 띄웠다(uploadTechPhoto 안). 그래서
     이미 올라간 사진을 다시 만질 입구가 없었고, 승연에게 「아직 조정 불가」로 보였다.
     ★ 이 파일의 규칙은 그대로다 — 여기엔 fetch 가 없다. 주소만 읽어 admin.html 에 넘긴다.
     ★★ 주소를 `/tech/first<N>.png` 로 **지어내지 않는다.** 화면의 <img> 에서 읽어야
        ① 되돌린 뒤의 기본 사진(proto_assets/tf_*.png) ② 방금 올려 아직 배포 안 된
        dataURL 까지 같은 길로 간다. r8-tech 의 onerror 가 src 를 갈아치우기 때문에
        「지금 보이는 것」은 currentSrc 만이 안다. */
  window.r41Adjust = function (slot) {
    var d = doc(), host = d && d.getElementById('th-first');
    var card = host && host.querySelectorAll('.tf-card')[slot - 1];
    var img = card && card.querySelector('img.tf-hood');
    var src = img && (img.currentSrc || img.src);
    if (!src) {
      try { toast('지금 사진을 찾지 못했습니다 — 🔄 새로고침 후 다시 눌러주세요'); } catch (e) { }
      return;
    }
    tech('adjustTechPhoto', slot, src);
  };
  /* admin.html 의 techApplied() 가 부른다 — 액자를 살려 둔 채 그 <img> 만 바꾼다 */
  window.r41PhotoDone = function (slot, url) { paintPhoto(slot, url); };
  window.r41Del = function (i) {
    var p = curPage() || R41.page, n = -1;
    for (var k = 0; k < R41.entries.length; k++) {
      if (R41.entries[k].p === p && ++n === i) { R41.entries.splice(k, 1); break; }
    }
    R41.save();
    var d = doc();
    if (d) d.location.reload();
  };
  window.r41Mode = function () {
    EDIT = !EDIT;
    var b = document.getElementById('r41Mode');
    if (b) { b.textContent = EDIT ? '✏️ 편집 모드' : '🖱 탐색 모드'; b.className = EDIT ? 'on' : ''; }
    var hint = document.getElementById('r41Hint');
    /* ★ textContent 가 아니라 innerHTML 이다 — 툴바 원문에 <b> 가 있어서
         textContent 로 쓰면 모드를 한 번 토글한 뒤부터 태그가 글자로 보인다. */
    if (hint) hint.innerHTML = EDIT
      ? '글자를 클릭하면 고칠 수 있습니다. 기술력 「국내 최초」 사진은 <b>사진을 직접 클릭</b>하세요. 메뉴·모달을 열려면 🖱 탐색 모드로 바꾸세요.'
      : '사이트를 평소처럼 조작하세요. 고칠 화면이 나오면 ✏️ 편집 모드로 되돌립니다.';
    if (!EDIT) {
      var d = doc();
      if (d) [].forEach.call(d.querySelectorAll('.r41-hi,.r41-hip'), function (el) {
        el.classList.remove('r41-hi'); el.classList.remove('r41-hip');
      });
    }
  };
  window.r41Go = function (v) {
    R41.page = v;
    var w = win();
    if (w && typeof w.navigate === 'function') { try { w.navigate(v); } catch (e) { } }
    setTimeout(preview, 400);
  };
  window.r41Reload = function () {
    var d = doc();
    if (d) d.location.reload();
  };
})();
