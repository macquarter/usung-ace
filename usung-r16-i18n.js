/* usung-r16-i18n.js — r8 이식 페이지·푸터·전화카드의 5개국어 치환 엔진 (260803 6차 ④)
 *
 * ★ 왜 이런 방식인가
 *   i18n.js 는 `[data-i18n]` 속성이 붙은 요소만 번역한다. 그런데 r8 이식 4개 페이지
 *   (#v-main/#v-cat · #v-parts · #v-tech · #v-gallery)는 `usung-r8-*.js` 가 통째로
 *   그려내는 마크업이고 그 파일들은 **build_graft.py 생성물이라 손대면 안 된다**.
 *   → 화면에 이미 그려진 **텍스트 노드**를 한국어 원문으로 찾아 치환한다.
 *   사전은 usung-r16-i18n-a/b/c.js 가 `window.__R16D` 에 [ko,en,ja,zh,vi] 로 쌓아 둔다.
 *
 * ★ 되돌리기 — 사전 파일 3개를 inject.js 에서 빼면 즉시 한국어 고정으로 돌아간다.
 *   사전에 없는 문구는 손대지 않으므로 **부분 번역이 안전한 기본값**이다.
 */
(function(){
  'use strict';
  var LANGS = {en:1, ja:2, zh:3, vi:4};
  var MAP = null, MAPN = 0;

  function buildMap(){
    var d = window.__R16D || [];
    if (MAP && MAPN === d.length) return MAP;
    MAP = Object.create(null);
    for (var i = 0; i < d.length; i++){
      var r = d[i];
      if (r && r.length >= 5 && r[0]) MAP[r[0]] = r;
    }
    MAPN = d.length;
    return MAP;
  }

  function lang(){
    try{ return (window.getLang && window.getLang()) || 'ko'; }catch(e){ return 'ko'; }
  }

  /* 건너뛸 곳 — 스크립트/스타일, 숨겨진 legacy 마크업(.r8-original), 입력 요소 */
  var SKIP = {SCRIPT:1, STYLE:1, NOSCRIPT:1, TEXTAREA:1, TITLE:1};
  function skipNode(el){
    while (el && el !== document.body){
      if (SKIP[el.nodeName]) return true;
      if (el.classList && el.classList.contains('r8-original')) return true;
      el = el.parentNode;
    }
    return false;
  }

  /* ── ① 태그가 섞인 문구는 **엘리먼트 단위**로 갈아끼운다 ──────────────
   * ★ `"와이어 없이 구조만으로<br>부드러운 상하 작동"` 같은 항목은 DOM 에서 <br> 로
   *   **두 개의 텍스트 노드**로 쪼개진다 → 텍스트 노드 치환으로는 영원히 안 맞는다.
   *   <br>·<b> 를 가진 부모만 모아 innerHTML 을 통째로 비교·교체한다.
   * ★ 교체 후에도 원문을 el.__r16koh 에 들고 있으므로 재적용이 멱등이다. */
  function applyHtml(code){
    var m = buildMap();
    var marks = document.querySelectorAll('br, b'), seen = [], i;
    for (i = 0; i < marks.length; i++){
      var p = marks[i].parentNode;
      if (!p || p.nodeType !== 1 || seen.indexOf(p) >= 0) continue;
      seen.push(p);
    }
    for (i = 0; i < seen.length; i++){
      var el = seen[i];
      var src = (el.__r16koh !== undefined) ? el.__r16koh : el.innerHTML;
      if (code === 'ko'){
        if (el.__r16koh !== undefined){ el.innerHTML = el.__r16koh; delete el.__r16koh; }
        continue;
      }
      var row = m[src.replace(/\s+/g, ' ').trim()];
      if (!row || !row[LANGS[code]]) continue;
      if (skipNode(el)) continue;
      if (el.__r16koh === undefined) el.__r16koh = src;
      var next = row[LANGS[code]];
      if (el.innerHTML !== next) el.innerHTML = next;   /* 관찰자 무한루프 차단 */
    }
  }

  function inHtmlBlock(el){
    while (el && el !== document.body){
      if (el.__r16koh !== undefined) return true;
      el = el.parentNode;
    }
    return false;
  }

  /* ── ② 텍스트 노드 치환 ──────────────────────────────────────────────
   * 원문은 node.__r16ko 에 보관한다. 다시 한국어로 돌아갈 때 복원하고,
   * 언어를 연달아 바꿔도 항상 **원문 기준**으로 치환하므로 누적 오염이 없다. */
  function applyText(code){
    var m = buildMap();
    var w = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var n, hit = 0;
    while ((n = w.nextNode())){
      var src = (n.__r16ko !== undefined) ? n.__r16ko : n.nodeValue;
      var key = src.replace(/\s+/g, ' ').trim();
      if (!key || key.length > 400) continue;
      if (code === 'ko'){
        if (n.__r16ko !== undefined){ n.nodeValue = n.__r16ko; delete n.__r16ko; hit++; }
        continue;
      }
      var row = m[key];
      if (!row) continue;
      var out = row[LANGS[code]];
      if (!out) continue;
      if (skipNode(n.parentNode) || inHtmlBlock(n.parentNode)) continue;
      if (n.__r16ko === undefined) n.__r16ko = src;
      /* 앞뒤 공백은 그대로 두고 알맹이만 바꾼다 (인라인 배치 보존) */
      var lead = src.match(/^\s*/)[0], tail = src.match(/\s*$/)[0];
      var next = lead + out + tail;
      if (n.nodeValue !== next){ n.nodeValue = next; hit++; }
    }
    return hit;
  }

  /* ── 속성 치환 (alt · title · placeholder) ──────────────────────────── */
  var ATTRS = ['alt', 'title', 'placeholder'];
  function applyAttrs(code){
    var m = buildMap();
    for (var a = 0; a < ATTRS.length; a++){
      var name = ATTRS[a], els = document.querySelectorAll('[' + name + ']');
      for (var i = 0; i < els.length; i++){
        var el = els[i], bak = '__r16a_' + name;
        var src = (el[bak] !== undefined) ? el[bak] : el.getAttribute(name);
        if (!src) continue;
        if (code === 'ko'){
          if (el[bak] !== undefined){ el.setAttribute(name, el[bak]); delete el[bak]; }
          continue;
        }
        var row = m[src.trim()];
        if (!row || !row[LANGS[code]]) continue;
        if (el[bak] === undefined) el[bak] = src;
        el.setAttribute(name, row[LANGS[code]]);
      }
    }
  }

  var busy = false;
  function apply(){
    if (busy) return;
    busy = true;
    var c = lang();
    try{ applyHtml(c); applyText(c); applyAttrs(c); }
    catch(e){ /* 번역 실패가 페이지를 죽이면 안 된다 */ }
    busy = false;
  }

  /* ── 재적용 시점 ──────────────────────────────────────────────────────
   * ★ characterData 는 관찰하지 않는다 — 우리가 바꾼 nodeValue 가 다시 콜백을 불러
   *   무한 루프가 된다. r8 뷰·푸터는 innerHTML 을 통째로 갈아끼우므로 childList 로 충분하다.
   *   (usung-r8-gal.js renderGalTabs · usung-r14.js 푸터 재구성 모두 innerHTML 교체다) */
  var timer = null;
  function schedule(){
    if (timer) clearTimeout(timer);
    timer = setTimeout(apply, 160);
  }

  function start(){
    apply();
    document.addEventListener('langchange', schedule);
    try{
      new MutationObserver(schedule)
        .observe(document.body, {childList: true, subtree: true});
    }catch(e){}
    /* r8 마운트가 최대 6초까지 늦어질 수 있다(usung-r8-mount.js boot 재시도).
     * 관찰자가 잡지 못하는 초기 경합에 대비해 저비용 재시도를 몇 번 더 돌린다. */
    var n = 0;
    var t = setInterval(function(){ apply(); if (++n >= 12) clearInterval(t); }, 700);
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start);
  else start();

  window.__r16Retranslate = apply;   /* 콘솔 디버깅용 */
})();
