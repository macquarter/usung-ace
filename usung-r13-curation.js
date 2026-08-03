/* usung-r13-curation.js — 챗봇 큐레이션 엔진 (260803 챗봇기능 정의서 slide1~3)
 *
 * "30초 내 취향 후드 찾기" — 질문 5개로 추천 1개 + 대안 2개 + 추천 색상 2~3개를 낸다.
 * 질문 스펙은 usung-r13-curation-data.js, 채점은 usung-r13-curation-score.js,
 * 표시는 usung-r13-curation.css. 이 파일은 표시와 흐름만 맡는다.
 *
 * ★ chatbot.js 를 고치지 않는다. 그 파일은 IIFE 라 내부가 전부 사유(private)이고,
 *   밖에서 닿는 것은 window.UsungBot 하나뿐이다. send() 가 sendText() 를 부르므로
 *   sendText 하나만 감싸면 입력창 타이핑과 빠른답변 버튼을 동시에 잡는다.
 */
(function () {
  'use strict';
  if (window.__usungR13C) return;
  window.__usungR13C = true;

  var SPEC = null, SC = null, ST = null, origSend = null;
  var TRIGGER = '🎯 30초 제품 추천받기';

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }
  function body() { return document.getElementById('usungBotBody'); }
  // .ub-msg 는 max-width:85% + white-space:pre-wrap 이다. 큐레이션 카드는 그 폭에 눌리고
  // 태그 사이 공백이 그대로 찍히므로, 우리 마크업이 든 말풍선에만 폭·공백을 되돌린다.
  function say(role, html) {
    var bd = body(); if (!bd) return;
    var d = document.createElement('div');
    d.className = 'ub-msg ' + role + (html.indexOf('r13c-') >= 0 ? ' r13c-wide' : '');
    d.innerHTML = html;
    bd.appendChild(d);
    bd.scrollTop = bd.scrollHeight;
  }
  function optListHTML(items) {
    return '<div class="r13c-opts">' + items.map(function (o) {
      return '<button type="button" class="r13c-opt' + (o.cls ? ' ' + o.cls : '') +
        '" data-r13c="' + esc(o.act) + '">' + esc(o.t) + '</button>';
    }).join('') + '</div>';
  }

  /* ── 결과 표시 ───────────────────────────────────────────────────── */
  // 마감이 없는 계열(코브라후드)에까지 '색상·마감 N종' 을 붙이면 없는 선택지를 있다고 말하는 셈이다
  function cardHTML(r, kind) {
    var m = r.m, fin = SC.finishesOf(m);
    var tag = fin.length ? '색상·마감 ' + fin.length + '종' : '규격 ' + m.items.length + '종';
    return '<div class="r13c-card ' + kind + '" data-r13c="open:' + esc(m.cat) + '|' + esc(m.mid || '') + '">' +
      '<img loading="lazy" alt="" src="' + esc(m.rep && m.rep.img || '') + '">' +
      '<div class="r13c-ct"><b>' + esc(SC.mName(m)) + '</b>' +
      '<span>' + esc(m.cat + (m.mid ? ' · ' + m.mid : '')) + '</span>' +
      '<span class="r13c-var">' + tag + '</span></div></div>';
  }
  function showResult(ans, list) {
    var t = SC.tally(ans), win = list[0];
    if (!win) { say('bot', '지금은 제품 목록을 불러오지 못했어요. 대표전화로 안내해 드릴게요.' + telHTML()); return; }
    var A = SC.alts(list, win), cols = SC.colorsOf(win, t.fin);
    var why = ans.map(function (a) { return a.opt.why; }).filter(Boolean);

    var h = '<div class="r13c-res"><div class="r13c-rh">🏆 추천 제품</div>' + cardHTML(win, 'win');
    if (why.length) {
      h += '<div class="r13c-why"><b>추천 이유</b><ul>' +
        why.map(function (w) { return '<li>' + esc(w) + '</li>'; }).join('') +
        '</ul></div>';
    }
    if (cols.length) {
      h += '<div class="r13c-cols"><b>추천 색상</b><div>' +
        cols.map(function (c) { return '<span>' + esc(c) + '</span>'; }).join('') + '</div></div>';
    }
    if (A.length) {
      h += '<div class="r13c-rh alt">⚖️ 대안 제품</div>' +
        A.map(function (r) { return cardHTML(r, 'alt'); }).join('');
    }
    h += '<div class="r13c-note">' + esc(SPEC.NOTE) + '</div></div>';
    h += optListHTML([
      { t: '📄 추천 제품 자세히 보기', act: 'open:' + win.m.cat + '|' + (win.m.mid || ''), cls: 'go' },
      { t: '🔁 다시 추천받기', act: 'start' }
    ]);
    h += telHTML();
    say('bot', h);
  }
  function telHTML() {
    return '<div><a class="ub-cta" href="tel:' + esc(SPEC.TEL) + '">📞 ' + esc(SPEC.TEL) + ' 전화 상담</a></div>';
  }

  /* ── 흐름 ────────────────────────────────────────────────────────── */
  // 지난 선택지는 잠근다. 살려 두면 아래에 이미 새 질문·결과가 있는데도 눌려서
  // 같은 단계가 두 번 보인다(실측: 5문항을 다 지나도 후보 버튼이 26개로 누적).
  function lockOpts() {
    var bd = body(); if (!bd) return;
    [].forEach.call(bd.querySelectorAll('.r13c-opts'), function (g) { g.classList.add('done'); });
  }
  function ask(i) {
    ST.i = i;
    var q = SPEC.Q[i];
    var items = q.opts.map(function (o, k) { return { t: o.t, act: 'a:' + i + ':' + k, cls: o.vague ? 'vague' : '' }; });
    if (q.escape) items.push({ t: q.escape.t, act: 'pop', cls: 'vague' });
    say('bot', '<div class="r13c-q"><span class="r13c-step">' + q.n + ' / ' + SPEC.Q.length + '</span>' +
      q.icon + ' ' + esc(q.title) + '</div>' + optListHTML(items));
  }
  function answer(qi, oi) {
    var q = SPEC.Q[qi], o = q.opts[oi];
    if (!q || !o) return;
    say('user', esc(o.t));
    ST.ans[qi] = { q: q, opt: o };
    ST.ans.length = qi + 1;
    if (qi + 1 < SPEC.Q.length) setTimeout(function () { ask(qi + 1); }, 260);
    else setTimeout(function () { finish(); }, 320);
  }
  // MODELS 는 r8 부팅 뒤에야 찬다. 아직이면 잠깐 기다렸다가 낸다(최대 ~4초).
  function finish() {
    var n = 0;
    (function w() {
      if (SC.models().length) { showResult(ST.ans, SC.score(ST.ans)); return; }
      if (++n < 40) { setTimeout(w, 100); return; }
      showResult(ST.ans, []);
    })();
  }
  function start() {
    ST = { i: -1, ans: [] };
    say('bot', '좋아요! 질문 ' + SPEC.Q.length + '개만 답해주시면 딱 맞는 후드를 찾아드릴게요. 🔎');
    setTimeout(function () { ask(0); }, 300);
  }
  function showPopular() {
    var n = 0;
    (function w() {
      var L = SC.popular(SPEC.POP_N);
      if (L.length) {
        say('bot', '<div class="r13c-res"><div class="r13c-rh">🔥 인기 제품 ' + L.length + '개</div>' +
          L.map(function (r) { return cardHTML(r, 'alt'); }).join('') +
          '<div class="r13c-note">' + esc(SPEC.NOTE) + '</div></div>' +
          optListHTML([{ t: '🔁 질문으로 추천받기', act: 'start' }]) + telHTML());
        return;
      }
      if (++n < 40) setTimeout(w, 100);
      else say('bot', '지금은 제품 목록을 불러오지 못했어요.' + telHTML());
    })();
  }
  // 시작 갈래 — PPT slide1: "제품을 알고 있어요" / "잘 모르겠어요"
  function intro() {
    say('bot', '<div class="r13c-q">🤖 어떻게 도와드릴까요?</div>' + optListHTML([
      { t: '제품을 알고 있어요 · 전체 제품 보기', act: 'all' },
      { t: '잘 모르겠어요 · 30초 제품 추천받기', act: 'start', cls: 'go' }
    ]));
  }

  function act(a) {
    // 누르는 즉시 잠근다. 다음 화면이 그려질 때 잠그면 그 사이 260~300ms 동안
    // 방금 답한 질문이 그대로 눌린다(실측: 260ms 간격 클릭으로 같은 문항 2회 응답).
    lockOpts();
    if (a === 'start') { start(); return; }
    if (a === 'pop') { say('user', '인기 제품 5개 보기'); setTimeout(showPopular, 260); return; }
    if (a === 'all') {
      say('user', '전체 제품 보기');
      try { if (typeof window.navigate === 'function') window.navigate('products'); } catch (e) {}
      return;
    }
    if (a.indexOf('a:') === 0) { var p = a.split(':'); answer(+p[1], +p[2]); return; }
    if (a.indexOf('open:') === 0) {
      var s = a.slice(5).split('|');
      // usung-r5-fixes.js 의 검증된 라우터 — r8 준비 대기·중분류 착지 재시도가 들어 있다
      try { if (typeof window.__usungRoute === 'function') window.__usungRoute(s[0], s[1] || ''); } catch (e) {}
    }
  }

  /* ── 배선 ────────────────────────────────────────────────────────── */
  function bind() {
    var bd = body();
    if (bd && !bd.__r13c) {
      bd.__r13c = 1;
      bd.addEventListener('click', function (e) {
        var el = e.target && e.target.closest ? e.target.closest('[data-r13c]') : null;
        if (!el) return;
        e.preventDefault();
        act(el.getAttribute('data-r13c'));
      });
    }
    // 빠른답변 줄에 진입 버튼을 심는다. renderQuickReplies() 가 innerHTML 을 통째로
    // 갈아끼우므로 childList 로 감시해 지워질 때마다 다시 넣는다(r9 갤러리 CTA 와 같은 함정).
    var qk = document.getElementById('usungBotQk');
    if (qk) {
      pin(qk);
      if (!qk.__r13c) {
        qk.__r13c = 1;
        new MutationObserver(function () { pin(qk); }).observe(qk, { childList: true });
      }
    }
  }
  function pin(qk) {
    if (qk.querySelector('.r13c-pin')) return;
    var b = document.createElement('button');
    b.className = 'r13c-pin';
    b.type = 'button';
    b.textContent = TRIGGER;
    // origSend 는 래핑 '이전'의 원본이다 — 여기서 부르면 FAQ 엔진으로 새어 큐레이션이 안 열린다.
    b.addEventListener('click', function () { enter(TRIGGER); });
    qk.insertBefore(b, qk.firstChild);
  }
  function enter(s) {
    lockOpts();
    say('user', esc(s));
    setTimeout(intro, 260);
  }
  function hook() {
    var B = window.UsungBot;
    if (!B || B.__r13c) return !!(B && B.__r13c);
    origSend = B.sendText.bind(B);
    B.sendText = function (t) {
      var s = String(t || '');
      if (s === TRIGGER || /추천\s*받|큐레이션|30초/.test(s)) { enter(s); return; }
      return origSend(t);
    };
    B.__r13c = 1;
    B.startCuration = start;   // 외부에서 바로 열 수 있는 진입점
    return true;
  }

  var tries = 0;
  (function boot() {
    SPEC = window.R13C_SPEC; SC = window.R13C_SCORE;
    if (SPEC && SC && window.UsungBot && document.getElementById('usungBotQk')) {
      try { hook(); bind(); } catch (e) {}
      return;
    }
    if (++tries < 120) setTimeout(boot, 100);
  })();
})();
