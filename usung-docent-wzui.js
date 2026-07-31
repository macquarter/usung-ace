/* usung-docent-wzui.js — 추천 위저드 진행/렌더 (질문 → 결과 → 비교)
 * 출력은 전부 R8DOC.say(html, isUser, wide) 를 통해 에이스봇 대화창에 찍는다.
 * 버튼은 data-wz 속성으로 위임 처리 → R8DOC.wzClick(e) 을 대화창에 한 번만 바인딩한다.
 */
(function () {
  'use strict';
  var R = window.R8DOC;
  if (!R || !R.wz) return;

  var W = R.wz, esc = R.esc, WZQ = R.WZQ, WZBEST = R.WZBEST;
  var WZ = { on: false, i: 0, a: {}, why: [], res: null };

  function say(h, me, wide) { if (typeof R.say === 'function') R.say(h, me, wide); }
  function telHref() {
    var t = R.tel();
    return t ? 'tel:' + t.replace(/[^0-9+]/g, '') : '#';
  }
  function telBtn(label) {
    return R.tel() ? '<a class="wz-tel" href="' + telHref() + '">' + esc(label) + '</a>' : '';
  }

  function wzCard(m, rank, label, mood, primary) {
    var cols = W.colors(m, mood), idx = W.idxOf(m, cols[0]);
    var sub = [m.cat === '코브라후드' ? '하향식후드' : m.cat, m.mid].filter(Boolean).join(' · ');
    return '<div class="wz-r' + (primary ? ' top' : '') + '">' +
      '<div class="wz-rk">' + esc(rank) + '</div>' +
      '<div class="wz-nm">' + esc(R.mname(m)) + '</div>' +
      '<div class="wz-sub">' + esc(sub) + (label ? ' — ' + esc(label) : '') + '</div>' +
      (cols.length ? '<div class="wz-col">' + cols.map(function (c) {
        return '<i>● ' + esc(c) + '</i>';
      }).join('') + '</div>' : '') +
      '<div class="wz-act">' +
        '<button class="pr" data-wz="open:' + esc(m.key) + ':' + idx + '">제품 상세보기</button>' +
        telBtn('전화로 문의') +
      '</div></div>';
  }

  function wzResult() {
    var a = WZ.a, l = W.rank(a);
    if (!l.length) { say('추천할 제품을 찾지 못했어요. 조건을 바꿔 다시 시도해 주세요.'); return; }
    var top = l[0].m;
    var alt1 = (l.filter(function (x) { return x.m.cat !== top.cat; })[0] || {}).m;
    var alt2 = (l.filter(function (x) {
      return x.m !== top && x.m !== alt1 &&
        (W.motion(x.m) !== W.motion(top) || W.lit(x.m) !== W.lit(top));
    })[0] || {}).m;
    if (!alt2) alt2 = (l.filter(function (x) { return x.m !== top && x.m !== alt1; })[0] || {}).m;
    WZ.res = [top, alt1, alt2].filter(Boolean);
    // never let the reason list contradict the product: state which criteria could not be met
    var miss = W.miss(top, a);
    var why = WZ.why.length ? '<div class="wz-why"><b>추천 이유</b><br>· ' + WZ.why.map(esc).join('<br>· ') +
      (miss.length ? '<br><span class="wz-note">※ 선택하신 조건 중 <b>' + esc(miss.join(' · ')) +
        '</b> 항목은 이 조합에 맞는 제품이 없어 나머지 조건을 우선했습니다.</span>' : '') + '</div>' : '';
    var html = '<div class="wz-q">고객님께 어울리는 후드입니다</div>' + why +
      wzCard(top, '1순위 · 가장 잘 맞는 제품', '', a.mood, true) +
      (alt1 ? wzCard(alt1, '디자인 대안', '다른 형태로 같은 조건을 맞춘 제품', a.mood, false) : '') +
      (alt2 ? wzCard(alt2, '기능 대안', '움직임·조명 조건을 달리한 제품', a.mood, false) : '') +
      '<div class="wz-act">' +
        '<button data-wz="again">다른 조건으로 다시 찾기</button>' +
        (WZ.res.length > 1 ? '<button data-wz="cmp">추천 결과 ' + WZ.res.length + '개 비교하기</button>' : '') +
      '</div>' +
      // 260729) 추천 후 전화 유입으로 마무리 (카카오톡 채널 미운영)
      (R.tel() ? '<div class="wz-call"><b>‘' + esc(R.mname(top)) + '’로 바로 상담하시겠어요?</b>' +
        '<span>규격 · 수량 · 설치 현장만 알려주시면 담당자가 바로 확인해 드립니다.</span>' +
        '<a class="wz-callbtn" href="' + telHref() + '">대표전화 ' + esc(R.tel()) + ' 걸기</a></div>' : '');
    WZ.on = false;
    say(html, false, true);
  }

  function wzCompare() {
    var a = WZ.a, rows = [['제품', function (m) { return R.mname(m); }],
      ['시리즈', function (m) { return m.cat === '코브라후드' ? '하향식후드' : m.cat; }],
      ['형식', function (m) { return m.mid || '-'; }],
      ['움직임', function (m) { return W.motion(m); }],
      ['조명', function (m) { return W.lit(m) ? '있음' : '없음'; }],
      ['색상 수', function (m) { return W.fin(m).length + '종'; }],
      ['추천 색상', function (m) { return W.colors(m, a.mood).join(' · '); }]];
    var h = '<div class="wz-q">추천 결과 비교</div><table class="wz-cmp"><tr><th></th>' +
      WZ.res.map(function (m, i) { return '<th>' + (i === 0 ? '1순위' : '대안 ' + i) + '</th>'; }).join('') + '</tr>' +
      rows.map(function (r) {
        return '<tr><th>' + esc(r[0]) + '</th>' +
          WZ.res.map(function (m) { return '<td>' + esc(r[1](m)) + '</td>'; }).join('') + '</tr>';
      }).join('') + '</table>';
    say(h, false, true);
  }

  function wzAsk(i) {
    WZ.i = i;
    if (i >= WZQ.length) { wzResult(); return; }
    var q = WZQ[i];
    var h = '<div class="wz-step">질문 ' + (i + 1) + ' / ' + WZQ.length + '</div>' +
      '<div class="wz-q">' + esc(q.t) + '</div>' +
      q.o.map(function (o, j) {
        return '<button class="wz-o" data-wz="o:' + i + ':' + j + '"><b>' + esc(o.t) + '</b><span>' + esc(o.d) + '</span></button>';
      }).join('') +
      '<button class="wz-o sk" data-wz="s:' + i + '"><b>잘 모르겠어요</b><span>' + esc(q.sk) + '</span></button>';
    say(h, false, true);
  }

  function wzStart() {
    WZ = { on: true, i: 0, a: {}, why: [], res: null };
    say('30초 내 취향 후드 찾기', true);
    say('몇 가지만 선택하시면 디자인과 설치 조건에 맞는 제품을 추천해 드릴게요. 전문 용어는 몰라도 됩니다.');
    setTimeout(function () { wzAsk(0); }, 220);
  }

  function wzPick(i, j) {
    var q = WZQ[i], o = q.o[j];
    WZ.a[q.id] = o.v;
    WZ.why.push(o.w || o.t);
    say(esc(o.t), true);
    setTimeout(function () { wzAsk(i + 1); }, 200);
  }

  function wzSkip(i) {
    var q = WZQ[i];
    say('잘 모르겠어요', true);
    if (i === 0) {        // Q1 is the branching point — explain the three main directions first
      var h = '<div class="wz-q">처음 선택하신다면 아래 세 가지부터 비교해 보세요.</div>' +
        [['갤럭시', '갓 형태가 강조되어 후드 자체가 인테리어 포인트가 됩니다.'],
         ['파이프', '직선형으로 깔끔하고 공간이 정돈되어 보입니다.'],
         ['LED조명', '후드와 테이블 조명을 한 번에 구성할 수 있습니다.']]
        .map(function (p) {
          var k = p[0] === 'LED조명' ? 'LED' : p[0];
          return '<button class="wz-o" data-wz="p:' + esc(p[0]) + '"><b>' + esc(k) + '</b><span>' + esc(p[1]) + '</span></button>';
        }).join('') +
        '<button class="wz-o sk" data-wz="best"><b>그래도 모르겠어요</b><span>가장 많이 선택하는 제품 5개 보기</span></button>';
      setTimeout(function () { say(h, false, true); }, 200);
      return;
    }
    var pop = q.o.filter(function (o) { return o.pop; })[0] || q.o[0];
    WZ.a[q.id] = pop.v;
    // a skipped answer is still an applied criterion — surface it in the reason list
    WZ.why.push((pop.w || pop.t) + ' — 자동 적용(가장 많이 선택하는 기준)');
    setTimeout(function () {
      say('그럴 땐 <b>' + esc(pop.t) + '</b> 기준으로 좁혀 드릴게요. (' + esc(q.sk) + ')');
      setTimeout(function () { wzAsk(i + 1); }, 220);
    }, 200);
  }

  function wzBest() {
    var l = W.rank({ prio: '인기' }), seen = {}, pick = [], MO = R.vModels();
    WZBEST.forEach(function (k) {
      var m = MO.filter(function (x) { return x.key === k; })[0];
      if (m && !seen[m.key]) { seen[m.key] = 1; pick.push(m); }
    });
    for (var i = 0; i < l.length && pick.length < 5; i++) {
      if (!seen[l[i].m.key]) { seen[l[i].m.key] = 1; pick.push(l[i].m); }
    }
    var h = '<div class="wz-q">가장 많이 선택하는 제품 ' + pick.length + '개</div>' +
      pick.map(function (m) {
        var idx = W.idxOf(m, W.colors(m, null)[0]);
        return '<button class="wz-o" data-wz="open:' + esc(m.key) + ':' + idx + '"><b>' + esc(R.mname(m)) + '</b>' +
          '<span>' + esc((m.cat === '코브라후드' ? '하향식후드' : m.cat) + ' · ' + (m.mid || '')) + '</span></button>';
      }).join('') +
      '<button class="wz-o sk" data-wz="again"><b>조건을 다시 골라볼래요</b><span>처음부터 추천받기</span></button>';
    WZ.on = false;
    say(h, false, true);
  }

  // delegated handler for every button rendered inside the conversation log
  function wzClick(e) {
    var b = e.target && e.target.closest ? e.target.closest('[data-wz]') : null;
    if (!b) return;
    e.preventDefault();
    var p = b.getAttribute('data-wz').split(':');
    if (p[0] === 'o') wzPick(+p[1], +p[2]);
    else if (p[0] === 's') wzSkip(+p[1]);
    else if (p[0] === 'p') {
      WZ.a.design = p[1]; WZ.why.push(p[1] + ' 시리즈 디자인 선호');
      say(esc(p[1]), true);
      setTimeout(function () { wzAsk(1); }, 200);
    } else if (p[0] === 'best') wzBest();
    else if (p[0] === 'again') wzStart();
    else if (p[0] === 'cmp') wzCompare();
    else if (p[0] === 'inq') { if (typeof R.ask === 'function') R.ask('‘' + p.slice(1).join(':') + '’ 견적 문의'); }
    else if (p[0] === 'open') {
      var key = p.slice(1, p.length - 1).join(':'), idx = +p[p.length - 1];
      try { if (typeof openModel === 'function') openModel(key, idx || 0); } catch (e2) {}
    }
  }

  R.wizard = { start: wzStart, best: wzBest, state: function () { return WZ; } };
  R.wzClick = wzClick;
})();
