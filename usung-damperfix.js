/* 유성에이스 표기 통일 오버레이 (#169)
   문제: 홈 CORE TECHNOLOGY / 공지·이벤트 영역에 'F.V.D 방화담파', '방화담퍼' 등
        옛(스테일) 표기가 남아 있어, 같은 사이트에서 정본 '방화댐퍼'(15곳)와 뒤섞임.
   원인: 일부는 i18n 사전(window.I18N.ko) 값, 일부는 usung-notice.js/usung-board.js
        렌더 텍스트에 하드코딩.
   해결: (1) i18n 사전 문자열의 '담파/담퍼' → '댐퍼' 사전 보정(첫 렌더부터 정본)
        (2) DOM 텍스트 노드 1회 스윕 + MutationObserver 로 지연/재렌더까지 상시 교정.
   안전: 전부 try/catch. '방화담파'·'방화담퍼' 부분문자열만 치환(그 외 텍스트 불변).
   되돌리기: inject.js 의 <script src="/usung-damperfix.js"> 한 줄 제거 + 이 파일 삭제. */
(function () {
  if (window.__usungDamperFix) return;
  window.__usungDamperFix = true;

  // 정본 통일: '방화담파'·'방화담퍼' → '방화댐퍼' (댐퍼 = damper 표준 표기)
  function norm(s) {
    return s.replace(/방화담파/g, '방화댐퍼').replace(/방화담퍼/g, '방화댐퍼');
  }
  function isStale(s) { return /방화담파|방화담퍼/.test(s); }

  // (1) i18n 사전 값 보정 — 모든 언어 순회, 담파/담퍼 포함 문자열만 교정
  function fixDict() {
    try {
      var I = window.I18N; if (!I) return false;
      for (var L in I) {
        var d = I[L]; if (!d) continue;
        for (var k in d) {
          if (typeof d[k] === 'string' && isStale(d[k])) d[k] = norm(d[k]);
        }
      }
      return true;
    } catch (e) { return false; }
  }

  // (2) DOM 텍스트 노드 스윕
  function sweep(root) {
    try {
      var base = root || document.body; if (!base) return;
      var tw = document.createTreeWalker(base, NodeFilter.SHOW_TEXT, null), n;
      while (n = tw.nextNode()) {
        var p = n.parentNode;
        if (p && (p.tagName === 'SCRIPT' || p.tagName === 'STYLE')) continue;
        if (isStale(n.nodeValue)) n.nodeValue = norm(n.nodeValue);
      }
    } catch (e) {}
  }

  // i18n 로드 대기 후 사전 보정
  if (!fixDict()) {
    var c = 0, iv = setInterval(function () { if (fixDict() || ++c > 60) clearInterval(iv); }, 50);
  }

  function boot() {
    sweep(document.body);
    // 지연/재렌더(공지·게시판·언어전환) 상시 교정
    try {
      var mo = new MutationObserver(function (muts) {
        for (var i = 0; i < muts.length; i++) {
          var m = muts[i];
          if (m.type === 'characterData') {
            if (m.target && isStale(m.target.nodeValue)) m.target.nodeValue = norm(m.target.nodeValue);
          } else if (m.addedNodes) {
            for (var j = 0; j < m.addedNodes.length; j++) {
              var a = m.addedNodes[j];
              if (a.nodeType === 3) { if (isStale(a.nodeValue)) a.nodeValue = norm(a.nodeValue); }
              else if (a.nodeType === 1) { sweep(a); }
            }
          }
        }
      });
      mo.observe(document.body, { childList: true, subtree: true, characterData: true });
    } catch (e) {}
    // 초기 몇 초간 안전 재스윕(비동기 렌더 대비)
    var s = 0, sv = setInterval(function () { sweep(document.body); if (++s > 8) clearInterval(sv); }, 400);
  }

  if (document.body) boot();
  else document.addEventListener('DOMContentLoaded', boot);
})();
