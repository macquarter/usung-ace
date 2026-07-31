/* usung-docent-ask.js — 에이스봇 도슨트: 규칙 응답기 (Layer 2)
 * 카탈로그에 실제로 들어있는 데이터만 근거로 답한다. 모르면 모른다고 말하고 전화로 넘긴다.
 * 지어내지 않는 것이 이 모듈의 유일한 설계 원칙이다.
 *
 * answer(q) -> {html, act} | null   ( act 는 doAct 가 실행할 화면 이동 지시 )
 * GENERATED-FROM: _proto_catalog_r8.html 의 도슨트 answer()/doAct() 를 라이브 전역명으로 옮김.
 * 260731) 모델/제품 총계를 말하던 문장은 전부 수치 없이 다시 썼다 — 승연 지시.
 */
(function () {
  'use strict';
  var R = window.R8DOC;
  if (!R) return;
  var esc = R.esc, uniq = R.uniq, cnt = R.cnt, isOn = R.isOn;

  var CATALIAS = [['갤럭시', '갤럭시'], ['led', 'LED조명'], ['엘이디', 'LED조명'], ['조명', 'LED조명'],
    ['파이프', '파이프'], ['후레쉬볼', '후레쉬볼'], ['후레시볼', '후레쉬볼'],
    ['코브라', '코브라후드'], ['하향식', '코브라후드']];

  // part-group keyword lookup
  var PGQ = [['모터', '모터'], ['댐퍼', '댐퍼 · 휴즈'], ['휴즈', '댐퍼 · 휴즈'], ['유지망', '유지망'],
    ['기름받이', '기름받이'], ['자바라', '후레쉬볼 · 자바라'], ['태엽', '구동부 · 태엽감속기'],
    ['구동', '구동부 · 태엽감속기'], ['감속', '구동부 · 태엽감속기'], ['led부속', 'LED 부속'],
    ['후지', '후지 · 측향 · 캡 · 나팔'], ['나팔', '후지 · 측향 · 캡 · 나팔'],
    ['측향', '후지 · 측향 · 캡 · 나팔'], ['갓', '갓 (Ø 규격별)']];

  function answer(q) {
    var raw = String(q || '').trim();
    if (!raw) return null;
    var t = raw.toLowerCase().replace(/\s+/g, ''), c = R.ctx();

    // 1) inquiry — honest handoff to the phone line, no fake backend
    if (/문의|견적|상담|연락|구매|가격|얼마/.test(t)) {
      var who = (c.scope === 'product' || c.scope === 'part') ? ('‘' + esc(c.title) + '’ 기준으로 ') : '';
      var link = R.telLink();
      return {
        html: who + '견적·상담은 <b>전화상담</b>으로 바로 연결해 드리는 것이 가장 빠릅니다.' +
          (link ? '<br>' + link : '') +
          '<br>규격·수량을 말씀해 주시면 담당자가 바로 확인해 드립니다.'
      };
    }
    // 2) gallery style filter
    var st = t.match(/모던|클래식|프리미엄|레트로/);
    if (st && /스타일|사진|시공|갤러리|보여|보고|볼래|찾|더/.test(t)) {
      return { html: '‘<b>' + st[0] + '</b>’ 스타일 시공 사진 <b>' + cnt(st[0]) + '장</b>으로 걸러 드릴게요.', act: ['gal', st[0]] };
    }
    // 3) same-style follow-up from a photo
    if (/같은스타일|비슷한시공|비슷한사례|시공사례|시공사진|현장사진/.test(t)) {
      var ps = c.style || null;   // only a photo/gallery context carries a style
      if (ps && /모던|클래식|프리미엄|레트로/.test(ps)) {
        return { html: '‘<b>' + esc(ps) + '</b>’ 스타일 사진 <b>' + cnt(ps) + '장</b>을 보여드릴게요.', act: ['gal', ps] };
      }
      return { html: '시공 갤러리로 안내할게요. 총 <b>' + cnt('전체') + '장</b>이고 스타일별로 걸러 볼 수 있습니다.', act: ['gal', '전체'] };
    }
    // 3.5) style -> products carrying that finish. 260731) 종수 대신 시리즈 이름만 말한다.
    if (/스타일제품|이스타일|같은마감|마감제품/.test(t) || (c.scope === 'photo' && /제품/.test(t))) {
      var sty = c.style || (st ? st[0] : null), fin = sty ? R.vStyles()[sty] : null;
      if (fin) {
        var byc = {};
        R.vItems().forEach(function (it) {
          var cc = R.color(it);
          if (fin.indexOf(cc) >= 0) byc[it.cat] = (byc[it.cat] || 0) + 1;
        });
        var ks = Object.keys(byc).sort(function (a, b) { return byc[b] - byc[a]; });
        if (ks.length) {
          return {
            html: '‘<b>' + esc(sty) + '</b>’ 마감(' + esc(fin.join(' · ')) + ') 제품은 <b>' +
              esc(ks.join(' · ')) + '</b> 시리즈에 있습니다.<br>가장 많은 <b>' + esc(ks[0]) + '</b> 시리즈부터 보여드릴게요.',
            act: ['cat', ks[0]]
          };
        }
      }
    }
    // 3.6) series characteristics (META only)
    if (/특징|장점|차별|어떤제품|무슨제품|설명해/.test(t) && (c.scope === 'catalog' || c.cat)) {
      var MM = R.vMeta()[c.cat];
      if (MM) return { html: '<b>' + esc(MM.kr) + '</b> — ' + esc(MM.desc) + '<br>특징: <b>' + esc(MM.feats.join(' · ')) + '</b>' };
    }
    // 4) category jump. 260731) 'N종을 보여드릴게요' 에서 수치 제거.
    for (var i = 0; i < CATALIAS.length; i++) {
      if (t.indexOf(CATALIAS[i][0]) >= 0 && /보여|보고|볼래|알려|찾|뭐|어떤|라인업|시리즈|제품/.test(t)) {
        var cat = CATALIAS[i][1], M = R.vMeta()[cat];
        return {
          html: '<b>' + esc((M && M.kr) || cat) + '</b> 라인업을 보여드릴게요.' + ((M && M.desc) ? '<br>' + esc(M.desc) : ''),
          act: ['cat', cat]
        };
      }
    }
    // 5) spec
    if (/규격|사이즈|치수|지름|파이|mm|ø/.test(t)) {
      var sp = c.facts.filter(function (f) { return f[0] === '규격'; })[0];
      if (sp) return { html: '‘' + esc(c.title) + '’ 규격은 <b>' + esc(sp[1]) + '</b>입니다.' };
      if (c.scope === 'catalog') return { html: '‘' + esc(c.title) + '’는 형식별로 규격이 달라요. 제품을 하나 열어주시면 정확한 규격을 알려드릴게요.' };
      if (c.scope === 'product') return { html: '‘' + esc(c.title) + '’는 제품명에 규격 표기가 없는 모델이에요.<br>정확한 치수는 <b>견적·상담 문의</b>로 확인해 드리겠습니다.' };
      return { html: '제품을 열어주시면 해당 모델의 규격을 바로 알려드릴게요. 규격은 제품마다 다릅니다.' };
    }
    // 6) colors / finishes
    if (/색상|컬러|마감|도금|도장|함마/.test(t)) {
      var cm = R.vModel();
      if (c.scope === 'product' && cm && cm.items.length) {
        var cols = uniq(cm.items.map(function (o) { return R.color(o); }).filter(Boolean));
        return { html: '‘' + esc(c.title) + '’는 색상·마감 <b>' + cols.length + '종</b>이 있어요.<br>' + esc(cols.join(' · ')) };
      }
      var S = R.vStyles();
      var sl = Object.keys(S).map(function (k) { return k + ' — ' + S[k].join(', '); });
      return { html: '마감은 스타일 4계열로 나뉩니다.<br>' + esc(sl.join(' / ')) };
    }
    // 6.5) open part — where is it used (from PART_USEDBY, already in ctx facts)
    if (c.scope === 'part' && /어디|쓰|사용|용도|어느|들어가/.test(t)) {
      var uf = c.facts.filter(function (f) { return f[0] === '사용 제품'; })[0];
      var gf = c.facts.filter(function (f) { return f[0] === '분류'; })[0];
      if (uf) return { html: '‘' + esc(c.title) + '’는 <b>' + esc(uf[1]) + '</b>에 사용됩니다.' + (gf ? '<br>분류 — ' + esc(gf[1]) : '') };
    }
    // 6.6) part group lookup by keyword (part counts are exact — kept)
    for (var gi = 0; gi < PGQ.length; gi++) {
      if (t.indexOf(PGQ[gi][0]) < 0) continue;
      var gt = PGQ[gi][1], grp = null;
      try { grp = PART_GROUPS.filter(function (g) { return g.t === gt; })[0]; } catch (e) {}
      if (!grp) continue;
      var P = R.vParts();
      var gn = grp.ids.map(function (id) { return P[id] ? P[id].nm : null; }).filter(Boolean);
      var gd = '';
      try { gd = PART_GROUP_DESC[gt] || ''; } catch (e) {}
      return { html: '<b>' + esc(gt) + '</b> 그룹 ' + gn.length + '종입니다.<br>' + esc(gn.join(' · ')) + (gd ? '<br>' + esc(gd) : ''), act: ['parts'] };
    }
    // 7) parts
    if (/부품|옵션|파츠/.test(t)) {
      if (c.scope === 'product' || c.cat) {
        var ids = [];
        try { ids = CATPARTS[c.cat] || []; } catch (e) {}
        if (ids.length) {
          var PP = R.vParts();
          var nm = ids.map(function (id) { return PP[id] ? PP[id].nm : null; }).filter(Boolean);
          return { html: '<b>' + esc(c.cat) + '</b>에 들어가는 주요 부품 ' + nm.length + '종입니다.<br>' + esc(nm.join(' · ')) };
        }
      }
      return { html: '부품 페이지로 안내할게요. 그룹별로 정리되어 있습니다.', act: ['parts'] };
    }
    // 8) technology. 260731) 'N가지' 수치 제거.
    if (/기술|최초|스윙|텐션|와이어|구조/.test(t)) {
      var fl = R.vFirsts().map(function (f) { return f.t; });
      return {
        html: '유성에이스가 국내 최초로 구현한 기술입니다.<br>' + esc(fl.join(' · ')) +
          '<br>기술력 페이지에서 자세히 보실 수 있어요.', act: ['tech']
      };
    }
    // 9) certification
    if (/인증|특허|iso|kc|haccp|시험|성적서|등록/.test(t)) {
      var cb = [], ce = [];
      try { cb = CBADGES.map(function (b) { return b.t; }); } catch (e) {}
      try { ce = CERTS.map(function (x) { return x.c; }); } catch (e) {}
      return { html: '보유 인증은 <b>' + esc(cb.join(' · ')) + '</b>입니다.' + (ce.length ? '<br>특허·등록: ' + esc(ce.join(' · ')) : '') };
    }
    // 10) counts — 260731) 제품 총계는 답하지 않는다. 사진 수만 답한다.
    if (/몇|개수|수량|종류|얼마나|총/.test(t)) {
      var ord = R.vGalOrder();
      return {
        html: '시공 사진은 <b>' + cnt('전체') + '장</b>(중복 제외)입니다.' +
          (ord.length ? '<br>스타일별: ' + esc(ord.map(function (s) { return s + ' ' + cnt(s); }).join(' · ')) : '') +
          '<br>제품 라인업은 시리즈별로 직접 보시는 편이 정확합니다. 어떤 시리즈가 궁금하세요?'
      };
    }
    // 11) navigation helpers
    if (/처음|메인|홈|첫페이지/.test(t)) return { html: '제품소개 첫 화면으로 이동할게요.', act: ['main'] };
    if (/갤러리|시공/.test(t)) return { html: '시공 갤러리로 이동할게요. 총 <b>' + cnt('전체') + '장</b>입니다.', act: ['gal', '전체'] };

    // 12) no grounded answer — let the existing KB bot take over
    return null;
  }

  function doAct(a) {
    if (!a) return;
    try {
      if (a[0] === 'gal') {
        if (isOn('lbox') && typeof closeLbox === 'function') closeLbox();
        var onG = R.viewId() === 'v-gallery';
        if (!onG && typeof goGallery === 'function') {
          goGallery();
          if (a[1] !== '전체') setTimeout(function () { try { filterGallery(a[1]); } catch (e) {} }, 90);
        } else if (typeof filterGallery === 'function') filterGallery(a[1]);
      } else if (a[0] === 'cat') {
        if (isOn('mask') && typeof r8CloseModal === 'function') r8CloseModal();
        if (typeof goCat === 'function') goCat(a[1]);
      } else if (a[0] === 'tech' && typeof goTech === 'function') goTech();
      else if (a[0] === 'parts' && typeof goParts === 'function') goParts();
      else if (a[0] === 'main' && typeof goMain === 'function') goMain();
    } catch (e) {}
  }

  R.answer = answer;
  R.doAct = doAct;
})();
