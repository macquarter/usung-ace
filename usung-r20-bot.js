/* usung-r20-bot.js — 260804 취합본 r2 · S22 에이스봇 빠른답변 정리
 * PPT slide22: 「30초 제품 추천받기 기능제외하고 다 삭제.
 *              결국에 유성에이스에 이 모델로 연락하라는 도슨트의 기능을 극대화」
 *
 * chatbot.js 는 한 바이트도 건드리지 않는다(r13·r17·r18 부터 지켜 온 원칙).
 * usung-r20.js 에서 분리한 이유는 300줄 상한과 도메인 분리(카탈로그 vs 챗봇) 둘 다.
 *
 * ★ 빠른답변 줄(#usungBotQk)에 글을 쓰는 주체가 셋이다 — 하나만 보면 되살아난다.
 *   (a) chatbot.js:459 renderQuickReplies() → 인라인 onclick 버튼 5개(기본 설정값)
 *   (b) usung-r13-curation.js:188 pin()    → .r13c-pin (createElement · onclick 없음)
 *   (c) usung-docent-bot.js:86 renderChips() → [data-doc-chip] (이식 페이지 한정)
 *   → 지울 대상은 (a) 뿐이고, 셋 중 **인라인 onclick 을 가진 건 (a) 뿐**이라
 *     `button[onclick]` 이 정확히 (a) 만 집는 외과적 셀렉터가 된다.
 * ★ 도슨트 문맥칩 (c)는 건드리지 않는다 — 지시가 「도슨트의 기능을 극대화」다.
 *   그 칩이 곧 도슨트 기능(제품 규격·색상·부품·시공사례·견적 문의)이라 지우면 정반대다.
 * ★ UsungBot.setSettings 로 지우는 길도 있으나 그건 localStorage 에 영구 저장돼
 *   롤백해도 브라우저에 남는다 → DOM 에서만 지운다. 덕분에 관리자가 설정을
 *   바꿔 놨더라도(출처 무관) 똑같이 지워진다.
 * ★ MutationObserver 콜백은 마이크로태스크라 페인트 전에 돈다 → 깜빡임 없음.
 *   자기 변경으로 재발화해도 지울 게 0건이라 그 자리에서 수렴한다.
 * ★ 잠재 버그 흡수 — usung-docent-bot.js:92 는 이식 페이지를 벗어날 때
 *   `e.innerHTML = origQk` 로 줄을 되돌린다. innerHTML 직렬화는 addEventListener
 *   핸들러를 버리므로 되살아난 .r13c-pin 은 **죽어 있다**. 그런데 r13 의 pin() 은
 *   `.r13c-pin` 이 있으면 조기 반환이라 고쳐주지 않는다. 지금은 옆의 (a) 5개가
 *   살아 있어 가려져 있지만, (a)를 지우면 줄 전체가 죽는다 —
 *   **이 변경이 만드는 회귀**다. → r20 이 알약의 생존을 책임진다.
 *   표식(__r20pin) 없는 알약은 전부 산 것으로 갈아끼운다. 클래스명이 그대로라
 *   r13 의 pin() 은 계속 무동작이고 중복도 생기지 않는다.
 * ★ 되돌리기 — api/inject.js 의 이 파일 한 줄만 지우면 원상복구다(1분).
 */
(function () {
  'use strict';
  if (window.__r20bot) return;
  window.__r20bot = true;

  var R13PIN = '🎯 30초 제품 추천받기';

  function firePin() {
    // r13 의 hook() 이 sendText 를 감싸 TRIGGER 를 enter() 로 가로챈다.
    // r13 부트는 hook() → bind() 순서라 알약이 존재하는 시점엔 이미 감싸져 있다.
    var B = window.UsungBot;
    if (!B || typeof B.sendText !== 'function') return;
    try { B.sendText(R13PIN); } catch (e) { console.warn('[r20bot] pin', e); }
  }

  function livePin(old) {
    var b = document.createElement('button');
    b.className = 'r13c-pin';
    b.type = 'button';
    b.textContent = (old && old.textContent) || R13PIN;
    b.__r20pin = 1;
    b.addEventListener('click', firePin);
    return b;
  }

  function scrubQk(qk) {
    var i, n = 0;
    // (a) chatbot.js 기본 빠른답변 — 이 줄에서 인라인 onclick 을 가진 건 이것뿐이다.
    var kill = qk.querySelectorAll('button[onclick]');
    for (i = 0; i < kill.length; i++) { kill[i].parentNode.removeChild(kill[i]); n++; }
    // (b) 표식 없는 알약(= innerHTML 로 되살아나 죽었을 수 있는 것)을 산 것으로 교체.
    var pins = qk.querySelectorAll('.r13c-pin');
    for (i = 0; i < pins.length; i++) {
      var p = pins[i];
      if (p.__r20pin) continue;
      if (i > 0) { p.parentNode.removeChild(p); n++; continue; }   // 중복분은 버린다
      p.parentNode.replaceChild(livePin(p), p);
      n++;
    }
    // r13 이 아직 안 붙었거나 못 붙는 경우 빈 줄만 남는다 → 그때만 줄을 접는다.
    // 속성 변경은 childList 관찰자를 깨우지 않으므로 되먹임이 없다.
    qk.style.display = qk.querySelector('button') ? '' : 'none';
    return n;
  }

  function watchQk() {
    var qk = document.getElementById('usungBotQk');
    if (!qk) return false;
    if (!qk.__r20qk) {
      qk.__r20qk = 1;
      try {
        new MutationObserver(function () { scrubQk(qk); })
          .observe(qk, { childList: true });
      } catch (e) { console.warn('[r20bot] observe', e); }
    }
    scrubQk(qk);
    return true;
  }

  // 부트 — chatbot.js 는 init 시점에 #usungBotQk 를 만들지만 주입 순서를 단정하지
  // 않는다. r13 부트 상한(120틱 × 100ms)보다 넉넉하게 잡는다.
  var tick = 0;
  (function boot() {
    tick++;
    var ok = false;
    try { ok = watchQk(); } catch (e) { console.warn('[r20bot] boot', e); }
    if (!ok && tick < 150) setTimeout(boot, 120);
  })();
})();
