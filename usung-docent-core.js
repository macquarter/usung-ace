/* usung-docent-core.js — 에이스봇 도슨트: 화면 맥락 파악 + 규칙 응답
 * 프로토타입 _proto_catalog_r8.html 의 독립 도슨트(#doc-panel)를 라이브 챗봇으로 옮긴 것.
 * 플로팅 버튼을 하나 더 띄우지 않고 기존 에이스봇 안에서 동작한다.
 *
 * 이름 대응 (프로토타입 -> 라이브): PARTS->R8_PARTS · CATS->R8_CATS · closeModal->r8CloseModal
 *
 * ★ 이 파일은 반드시 classic script 로 로드해야 한다.
 *   r8 모듈들은 MODELS/ITEMS/curModel 등을 top-level `let` 으로 선언하는데, `let` 은 window 에
 *   붙지 않고 스크립트 간에 공유되는 전역 렉시컬 환경에 들어간다. 그래서 window.MODELS 는
 *   undefined 지만 맨이름 MODELS 는 스코프 체인으로 해결된다. 모든 참조를 typeof 로 감싼 것은
 *   r8 모듈이 아직 로드되지 않은 페이지(비이식 7개)에서 ReferenceError 를 내지 않기 위함이다.
 *
 * 260731) 모델 총계 표기는 전부 걷어냈다 — 승연 지시. 부품 수·사진 수는 정확하므로 남긴다.
 */
(function () {
  'use strict';

  function uniq(a) { return a.filter(function (v, i) { return a.indexOf(v) === i; }); }
  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function isOn(id) { var e = document.getElementById(id); return !!(e && e.classList.contains('on')); }
  function viewId() { var v = document.querySelector('.r8x .view.on'); return v ? v.id : null; }

  // --- guarded accessors for the r8 script-scope bindings -------------------
  function vModel() { return typeof curModel !== 'undefined' ? curModel : null; }
  function vIdx() { return typeof curIdx !== 'undefined' ? curIdx : 0; }
  function vItems() { return typeof ITEMS !== 'undefined' ? ITEMS : []; }
  function vByCat() { return typeof byCatM !== 'undefined' ? byCatM : {}; }
  function vParts() { return typeof R8_PARTS !== 'undefined' ? R8_PARTS : {}; }
  function vCats() { return typeof R8_CATS !== 'undefined' ? R8_CATS : []; }
  function vMeta() { return typeof META !== 'undefined' ? META : {}; }
  function vStyles() { return typeof STYLES !== 'undefined' ? STYLES : {}; }
  function vFirsts() { return typeof FIRSTS !== 'undefined' ? FIRSTS : []; }
  function vGalList() { return typeof galList !== 'undefined' ? galList : []; }
  function vLbIdx() { return typeof lbIdx !== 'undefined' ? lbIdx : 0; }
  function vGalCat() { return typeof galCat !== 'undefined' ? galCat : '전체'; }
  function vGalOrder() { return typeof GAL_ORDER !== 'undefined' ? GAL_ORDER : []; }

  function mname(m) {
    try { if (typeof modelName === 'function') return modelName(m); } catch (e) {}
    return (m && (m.grp || m.mid || m.cat)) || '';
  }
  function color(it) {
    try { if (typeof colorOf === 'function') return colorOf(it) || ''; } catch (e) {}
    return '';
  }
  function cnt(c) {
    try { if (typeof galCount === 'function') return galCount(c); } catch (e) {}
    return 0;
  }
  function tel() {
    try {
      var t = (window.UsungBot.getSettings().tel || '').trim();
      if (t) return t;
    } catch (e) {}
    return '';
  }
  function telLink() {
    var t = tel();
    if (!t) return '';
    return '<a class="ub-cta" href="tel:' + esc(t.replace(/[^0-9+]/g, '')) + '">📞 대표전화 ' + esc(t) + ' 걸기</a>';
  }
  // active category is read from the rendered tree (its onclick carries the canonical name)
  function curCat() {
    var e = document.querySelector('.r8x #cv-tree .cat.on');
    if (!e) return null;
    var m = (e.getAttribute('onclick') || '').match(/goCat\(["']([^"']+)["']\)/);
    return m ? m[1] : null;
  }

  /* ---------- Layer 1: context extraction (LLM swap point) ---------- */
  var D = { part: null, first: null };

  function cProduct() {
    var m = vModel(), idx = vIdx();
    var it = m.items[idx] || m.items[0], f = [], col = color(it);
    var dim = uniq(String(it.name || '').match(/\d{2,4}\s?Ø/g) || []);
    f.push(['시리즈', m.cat === '코브라후드' ? '하향식후드 / 코브라' : m.cat]);
    if (m.mid) f.push(['형식', m.mid]);
    if (dim.length) f.push(['규격', dim.join(' · ')]);
    if (col) f.push(['색상·마감', col]);
    if (m.items.length > 1) f.push(['선택 가능', m.items.length + '종']);
    return {
      scope: 'product', title: mname(m), cat: m.cat,
      lead: '‘' + mname(m) + '’ 상세를 보고 계세요.' + (m.items.length > 1
        ? ' 색상·마감 ' + m.items.length + '종 중 ' + (idx + 1) + '번째입니다.'
        : ' 단일 마감 제품입니다.'),
      facts: f, chips: ['이 제품 규격', '색상 뭐가 있어?', '들어가는 부품', '비슷한 시공사례', '견적 문의']
    };
  }
  function cPart() {
    var p = null;
    try { p = D.part ? vParts()[D.part] : null; } catch (e) {}
    if (!p) return cParts();
    var f = [];
    if (p.sp) f.push(['규격', p.sp]);
    try { var g = PART_GROUP_OF[D.part]; if (g) f.push(['분류', g]); } catch (e) {}
    try { var u = uniq(PART_USEDBY[D.part] || []); if (u.length) f.push(['사용 제품', u.join(' · ')]); } catch (e) {}
    return {
      scope: 'part', title: p.nm, lead: '‘' + p.nm + '’ 부품을 보고 계세요.', facts: f,
      chips: ['이 부품 어디에 쓰여?', '부품 전체 보기', '견적 문의']
    };
  }
  function cFirst() {
    var f = null;
    try { f = D.first != null ? vFirsts()[D.first] : null; } catch (e) {}
    if (!f) return cTech();
    var a = [];
    if (f.sub) a.push(['기술명', f.sub]);
    if (f.cat) a.push(['적용 시리즈', f.cat]);
    return {
      scope: 'first', title: f.t, cat: f.cat, lead: '‘' + f.t + '’ 기술을 보고 계세요.', facts: a,
      chips: ['이 기술 적용 제품', '다른 기술도 볼래', '견적 문의']
    };
  }
  function cPhoto() {
    var i = vLbIdx(), it = vGalList()[i];
    if (!it) return cGallery();
    var f = [];
    if (it.cat) f.push(['스타일', it.cat]);
    if (it.spec) f.push(['제품', it.spec]);
    if (it.site) f.push(['현장', it.site]);
    return {
      scope: 'photo', title: '시공 현장 ' + String(i + 1).padStart(2, '0'), style: it.cat,
      lead: (it.cat ? '‘' + it.cat + '’ 스타일 시공 사진입니다.' : '시공 사진입니다.') +
        ' 사용된 제품과 현장 정보를 함께 보여드려요.',
      facts: f, chips: ['이 스타일 제품 보기', '같은 스타일 사진 더', '견적 문의']
    };
  }
  function cCat() {
    // 260731) '모델 수 N종' 사실과 '총 N종을 보고 계세요' 꼬리말 제거 — 모델 총계 비노출 원칙
    var c = curCat() || vCats()[0] || '갤럭시', M = vMeta()[c], mids = [];
    try { mids = uniq(vByCat()[c].map(function (m) { return m.mid; }).filter(Boolean)); } catch (e) {}
    var f = [];
    if (mids.length) f.push(['형식', mids.slice(0, 4).join(' · ')]);
    if (M && M.feats) f.push(['특징', M.feats.join(' · ')]);
    return {
      scope: 'catalog', title: (M && M.kr) || c, cat: c,
      lead: (M && M.desc) || ('‘' + c + '’ 라인업입니다.'),
      facts: f, chips: ['이 시리즈 특징', '색상 뭐가 있어?', '시공사례 보여줘', '견적 문의']
    };
  }
  function cParts() {
    // part counts are exact and stable (48 deployed crops) — kept on purpose
    var t = Object.keys(vParts()).length, g = 0;
    try { g = PART_GROUPS.length; } catch (e) {}
    return {
      scope: 'parts', title: '부품 소개',
      lead: '후드에 들어가는 부품 ' + t + '종을 ' + g + '개 그룹으로 정리했습니다.',
      facts: [['부품', t + '종'], ['그룹', g + '개']],
      chips: ['모터 부품 알려줘', '댐퍼가 뭐야?', '제품별 부품', '견적 문의']
    };
  }
  function cTech() {
    // 260731) '기술 N가지' 카운트 제거
    return {
      scope: 'tech', title: '기술력',
      lead: '유성에이스가 국내 최초로 구현한 기술을 소개합니다.',
      facts: [], chips: ['어떤 기술이 있어?', '특허 있어?', '기술 적용 제품', '견적 문의']
    };
  }
  function cGallery() {
    var c = vGalCat();
    // '전체' dedups installs shared by two styles, so it is smaller than the style sum
    var n = cnt(c), f = [['현재 필터', c], ['사진', n + '장' + (c === '전체' ? ' (중복 제외)' : '')]];
    var ord = vGalOrder();
    if (ord.length) f.push(['스타일별', ord.map(function (s) { return s + ' ' + cnt(s); }).join(' · ')]);
    return {
      scope: 'gallery', title: '시공 갤러리', style: c,
      lead: '‘' + c + '’ 기준 ' + n + '장을 보고 계세요. 원하는 스타일을 말씀하시면 바로 걸러 드립니다.',
      facts: f, chips: ['모던 스타일 보여줘', '클래식 보여줘', '프리미엄 보여줘', '레트로 보여줘']
    };
  }
  function cMain() {
    // 260731) 제품 총계·시리즈 개수 제거. 시공 사진 수는 모델 수치가 아니므로 유지.
    return {
      scope: 'main', title: '유성에이스 제품 안내',
      lead: '후드 제품을 시리즈별로 보실 수 있습니다. 찾으시는 걸 말씀해 주세요.',
      facts: [['시공 사진', cnt('전체') + '장']],
      chips: ['갤럭시 보여줘', '시공사례 보여줘', '어떤 기술이 있어?', '견적 문의']
    };
  }
  function ctx() {
    try {
      if (isOn('mask') && vModel()) return cProduct();
      if (isOn('pmask')) return cPart();
      if (isOn('fmask')) return cFirst();
      if (isOn('lbox')) return cPhoto();
      var v = viewId();
      if (v === 'v-cat') return cCat();
      if (v === 'v-parts') return cParts();
      if (v === 'v-tech') return cTech();
      if (v === 'v-gallery') return cGallery();
      return cMain();
    } catch (e) {
      return {
        scope: 'main', title: '유성에이스', lead: '페이지를 안내해 드립니다.', facts: [],
        chips: ['시공사례 보여줘', '어떤 기술이 있어?', '견적 문의']
      };
    }
  }

  window.R8DOC = {
    D: D, uniq: uniq, esc: esc, isOn: isOn, viewId: viewId, ctx: ctx,
    mname: mname, color: color, cnt: cnt, tel: tel, telLink: telLink, curCat: curCat,
    vModel: vModel, vItems: vItems, vByCat: vByCat, vParts: vParts, vCats: vCats,
    vMeta: vMeta, vStyles: vStyles, vFirsts: vFirsts, vGalOrder: vGalOrder
  };
})();
