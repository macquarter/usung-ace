/* usung-docent-bot.js — 도슨트 ↔ 에이스봇 브릿지 (Layer 3: UI)
 *
 * 설계 원칙 3가지
 *  1) 플로팅 버튼을 하나 더 띄우지 않는다. 도슨트는 기존 에이스봇(#usungBot) 안에서만 산다.
 *  2) 도슨트가 근거를 못 대면(answer()===null) 원래 KB 봇에게 그대로 넘긴다.
 *     문의·전화번호·블로그 흐름은 오늘과 100% 동일하게 남는다.
 *  3) r8 이식 화면이 실제로 떠 있을 때만(.r8x .view.on) 개입한다.
 *     비이식 7개 페이지에서는 에이스봇이 지금과 완전히 똑같이 동작해야 한다.
 *
 * chatbot.js 는 하나의 IIFE 라 chatRespond 를 가로챌 수 없다. 밖으로 나온 것은 UsungBot 뿐이므로
 * UsungBot.sendText 를 감싸는 것이 유일한 후크다. 빠른답변 버튼도 inline onclick 으로
 * UsungBot.sendText 를 부르기 때문에 이 한 곳만 감싸면 모든 입력 경로가 덮인다.
 */
(function () {
  'use strict';
  var R = window.R8DOC;
  if (!R) return;
  var esc = R.esc;
  var WZ_CHIP = '⚡ 30초 내 취향 후드 찾기';
  var origQk = null, bound = false, lastKey = '';

  function bd() { return document.getElementById('usungBotBody'); }
  function qk() { return document.getElementById('usungBotQk'); }
  // ★ '.view.on 이 존재하는가' 만으로는 부족하다. r8 뷰는 이식된 4개 페이지 컨테이너 안에
  // 항상 살아 있고, 다른 페이지에 있을 때 그 컨테이너가 display:none 일 뿐이다.
  // 홈에서도 v-main 이 .on 인 채로 잡혀서 도슨트가 챗봇을 가로채는 사고가 났다(로컬 실측).
  // getClientRects().length 는 '실제로 렌더되는가' 의 표준 판정이다.
  function active() {
    var v = document.querySelector('.r8x .view.on');
    return !!(v && v.getClientRects().length);
  }

  /* ---------- 출력 ---------- */
  function say(html, me, wide) {
    var b = bd();
    if (!b) return;
    var d = document.createElement('div');
    d.className = 'ub-msg ' + (me ? 'user' : 'bot') + ' doc-h' + (wide ? ' doc-w' : '');
    d.innerHTML = html;
    b.appendChild(d);
    b.scrollTop = b.scrollHeight;
  }
  R.say = say;

  function reply(res) {
    say(res.html, false, false);
    if (res.act && typeof R.doAct === 'function') {
      setTimeout(function () { try { R.doAct(res.act); } catch (e) {} refresh(); }, 260);
    } else {
      setTimeout(refresh, 60);
    }
  }
  // 위저드 카드의 '견적 문의' 버튼처럼 도슨트 내부에서 질문을 되던질 때 쓴다
  function ask(q) {
    say(esc(q), true);
    var res = null;
    try { res = R.answer(q); } catch (e) {}
    if (res) setTimeout(function () { reply(res); }, 220);
  }
  R.ask = ask;

  /* ---------- 화면 맥락 바 ---------- */
  function ctxEl() {
    var b = bd();
    if (!b || !b.parentNode) return null;
    var e = document.getElementById('doc-ctx');
    if (!e) {
      e = document.createElement('div');
      e.id = 'doc-ctx';
      b.parentNode.insertBefore(e, b);
    }
    return e;
  }
  function renderCtx(c) {
    var e = ctxEl();
    if (!e) return;
    if (!active()) { e.className = ''; e.innerHTML = ''; return; }
    e.className = 'on';
    e.innerHTML = '<div class="dc-t">' + esc(c.title) + '</div><div class="dc-l">' + esc(c.lead) + '</div>' +
      (c.facts && c.facts.length ? '<div class="dc-f">' + c.facts.map(function (f) {
        return '<div><span>' + esc(f[0]) + '</span><b>' + esc(f[1]) + '</b></div>';
      }).join('') + '</div>' : '');
  }

  /* ---------- 빠른답변 칩 ---------- */
  function renderChips(c) {
    var e = qk();
    if (!e) return;
    if (!active()) {
      if (origQk !== null) { e.innerHTML = origQk; origQk = null; }
      return;
    }
    if (origQk === null) origQk = e.innerHTML;   // 원래 빠른답변을 한 번만 스냅샷
    var list = (c.chips || []).slice(0, 5);
    e.innerHTML = '<button class="doc-wz" data-doc-chip="' + esc(WZ_CHIP) + '">' + esc(WZ_CHIP) + '</button>' +
      list.map(function (q) { return '<button data-doc-chip="' + esc(q) + '">' + esc(q) + '</button>'; }).join('');
  }

  function refresh() {
    var c;
    try { c = R.ctx(); } catch (e) { return; }
    // active() 를 키에 넣어야 이식 페이지를 벗어날 때 도슨트 칩이 남지 않는다.
    // (비이식 페이지에서는 viewId() 가 null 이라 ctx() 가 cMain() 을 돌려주는데,
    //  v-main 에 있다 나가면 scope/title 이 그대로라 키가 안 바뀐다)
    var key = (active() ? 'A' : '-') + '|' + c.scope + '|' + c.title + '|' + (c.style || '');
    renderCtx(c);
    if (key !== lastKey) { lastKey = key; renderChips(c); }
  }
  R.refresh = refresh;

  /* ---------- 입력 후크 ---------- */
  function hookSend() {
    var B = window.UsungBot;
    if (!B || B.__doc) return false;
    var orig = B.sendText.bind(B);
    B.__docOrig = orig;
    B.sendText = function (t) {
      var q = String(t == null ? '' : t).trim();
      if (!active() || !q) return orig(t);
      try {
        if (q === WZ_CHIP) { R.wizard.start(); return; }
        var res = R.answer(q);
        if (res) {
          say(esc(q), true);
          setTimeout(function () { reply(res); }, 260);
          return;
        }
      } catch (e) {
        // 도슨트가 어떤 이유로든 실패하면 기존 봇이 반드시 답하게 둔다
      }
      return orig(t);
    };
    B.__doc = 1;

    if (B.toggle && !B.__docT) {
      var ot = B.toggle.bind(B);
      B.toggle = function () { ot(); setTimeout(function () { lastKey = ''; refresh(); }, 30); };
      B.__docT = 1;
    }
    return true;
  }

  /* ---------- r8 화면 이동 감시 ---------- */
  // 모달/뷰가 바뀌면 맥락 바와 칩을 다시 그린다. openPart/openFirst 는 인자를 D 에 기록해야
  // cPart()/cFirst() 가 어떤 부품·기술을 보고 있는지 알 수 있다.
  var NAV = ['showView', 'goMain', 'goCat', 'goParts', 'goTech', 'goGallery',
    'openModel', 'openLbox', 'stepLbox', 'closeLbox', 'r8CloseModal',
    'closePart', 'closeFirst', 'filterGallery', 'renderGallery', 'selectFinish', 'stepFinish'];
  function hookNav() {
    NAV.forEach(function (n) {
      var f = window[n];
      if (typeof f !== 'function' || f.__doc) return;
      var w = function () {
        var r = f.apply(this, arguments);
        setTimeout(refresh, 40);
        return r;
      };
      w.__doc = 1;
      window[n] = w;
    });
    if (typeof window.openPart === 'function' && !window.openPart.__doc) {
      var op = window.openPart;
      window.openPart = function (id) { R.D.part = id; var r = op.apply(this, arguments); setTimeout(refresh, 40); return r; };
      window.openPart.__doc = 1;
    }
    if (typeof window.openFirst === 'function' && !window.openFirst.__doc) {
      var of = window.openFirst;
      window.openFirst = function (i) { R.D.first = i; var r = of.apply(this, arguments); setTimeout(refresh, 40); return r; };
      window.openFirst.__doc = 1;
    }
  }

  /* ---------- 대화창 내부 버튼 위임 ---------- */
  function bindClicks() {
    var b = bd();
    if (!b || bound) return;
    b.addEventListener('click', function (e) {
      var chip = e.target && e.target.closest ? e.target.closest('[data-doc-chip]') : null;
      if (chip) { e.preventDefault(); window.UsungBot.sendText(chip.getAttribute('data-doc-chip')); return; }
      if (typeof R.wzClick === 'function') R.wzClick(e);
    });
    var q = qk();
    if (q) {
      q.addEventListener('click', function (e) {
        var chip = e.target && e.target.closest ? e.target.closest('[data-doc-chip]') : null;
        if (!chip) return;
        e.preventDefault();
        window.UsungBot.sendText(chip.getAttribute('data-doc-chip'));
      });
    }
    bound = true;
  }

  /* ---------- 부팅 ---------- */
  // 에이스봇 위젯은 chatbot.js 가 DOM 준비 후 주입한다. 주입 시점을 알 수 없으므로
  // 짧게 폴링하고, 붙은 뒤에는 뷰 전환 감시를 MutationObserver 에 맡긴다.
  var tries = 0;
  function boot() {
    tries++;
    hookNav();
    if (bd() && window.UsungBot) {
      hookSend();
      bindClicks();
      refresh();
      watch();
      return;
    }
    if (tries < 60) setTimeout(boot, 250);
  }
  function watch() {
    try {
      var mo = new MutationObserver(function () { refresh(); });
      var host = document.querySelector('.r8x');
      if (host) mo.observe(host, { attributes: true, subtree: true, attributeFilter: ['class'] });
      var ov = document.getElementById('r8-overlay-host');
      if (ov) mo.observe(ov, { attributes: true, subtree: true, attributeFilter: ['class'] });
      // 라이브 라우터(navigate)로 페이지가 통째로 바뀌는 경우까지 잡는다
      setInterval(function () {
        var a = active();
        if (a !== watch.__last) { watch.__last = a; lastKey = ''; refresh(); }
      }, 700);
    } catch (e) {}
  }
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { setTimeout(boot, 300); });
  } else {
    setTimeout(boot, 300);
  }
})();
