/* usung-r41-ui.js — r41 admin side (screen)
 *
 * Frames the real site inside /admin and lets the operator click any visible
 * text to change it. Same-origin, so contentDocument / navigate() are usable
 * (verified empirically before writing this).
 *
 * Nothing here is a copy of the site. The editable list IS the live DOM, so it
 * cannot drift the way admin.html's hard-coded 104-field list did.
 */
(function () {
  'use strict';

  var EDIT = true;
  var CUR = null;          // {from, node}
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
      '<span class="hint" id="r41Hint">글자를 클릭하면 고칠 수 있습니다. 메뉴·모달을 열려면 🖱 탐색 모드로 바꾸세요.</span>' +
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
        'background:rgba(37,99,235,.10)!important}';
      d.head.appendChild(st);
    }
    d.addEventListener('click', onClick, true);
    d.addEventListener('mouseover', onOver, true);
    d.addEventListener('mouseout', onOut, true);
    if (R41.page && win() && typeof win().navigate === 'function' && curPage() !== R41.page) {
      try { win().navigate(R41.page); } catch (e) { }
    }
    preview();
    // 사이트 스크립트(defer + fetch)가 늦게 뜬다 — 보험
    [400, 1200, 2500].forEach(function (ms) { setTimeout(preview, ms); });
  }

  function curPage() {
    var a = api();
    if (a) { try { return a.page(); } catch (e) { } }
    var d = doc();
    var e = d && d.querySelector('.page.active');
    return e ? String(e.id || '').replace(/^page-/, '') : '';
  }

  function preview() {
    var a = api();
    if (!a) { renderList(); return; }
    try { a.set(R41.entries); } catch (e) { }
    renderList();
  }

  function onOver(ev) {
    if (!EDIT) return;
    var t = ev.target;
    if (t && t.classList && t.nodeType === 1) t.classList.add('r41-hi');
  }
  function onOut(ev) {
    var t = ev.target;
    if (t && t.classList && t.nodeType === 1) t.classList.remove('r41-hi');
  }

  function onClick(ev) {
    if (!EDIT) return;
    ev.preventDefault();
    ev.stopPropagation();
    var n = pick(ev);
    if (!n) { msg('그 자리에는 고칠 글자가 없습니다. 글자 위를 정확히 클릭하세요.'); return; }
    open(norm(n.nodeValue));
  }

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

  function open(cur) {
    if (!cur) return;
    R41.page = curPage() || R41.page;
    var from = anchorOf(cur);
    CUR = { from: from };
    var box = document.getElementById('r41Edit');
    if (!box) return;
    box.innerHTML =
      '<div class="r41-card"><h4>✏️ ' + esc(R41.name(R41.page)) + ' — 글자 수정</h4>' +
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
    for (var j = 0; j < mine.length; j++) {
      var e = mine[j], s = st[norm(e.f)] || '';
      var tag = s === 'applied' ? '<span class="st" style="color:#34d399">● 반영됨</span>'
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
  window.r41Close = function () { CUR = null; msg('글자를 클릭하면 고칠 수 있습니다.'); };
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
    if (hint) hint.textContent = EDIT
      ? '글자를 클릭하면 고칠 수 있습니다. 메뉴·모달을 열려면 🖱 탐색 모드로 바꾸세요.'
      : '사이트를 평소처럼 조작하세요. 고칠 화면이 나오면 ✏️ 편집 모드로 되돌립니다.';
    if (!EDIT) {
      var d = doc();
      if (d) [].forEach.call(d.querySelectorAll('.r41-hi'), function (el) { el.classList.remove('r41-hi'); });
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
