/* usung-r6-main.js — 0730 "6번째 수정" 반영 (메인페이지 PPT S1)
 *   S1  메인 2번째 섹션(CORE TECHNOLOGY · 유성에이스 후드의 장점)의
 *       3D 캔버스 애니메이션을 걷어내고 클라이언트 제공 이미지 기반 정적 레이아웃으로 교체.
 *       · 캔버스는 간헐적으로 렌더되지 않는 문제가 있었고(클라이언트 지적),
 *         #hood-3d-wrap 노드를 통째로 교체하면 원본 IntersectionObserver 가
 *         not-intersecting 으로 떨어져 rAF 루프까지 자동 정지한다.
 *       · 01~04 카피는 PPT 이미지와 동일한 문구로 갱신하되, 비트맵 통짜가 아니라
 *         실제 HTML 텍스트로 렌더한다 → 모바일 가독성 + 5개 언어 전환 유지.
 *
 * 자산: usung-r6-core-img.js (data URI) 우선, 없으면 /core/*.webp 폴백
 * 원본 index_v6.html 불변. 런타임 오버레이만 사용.
 * 되돌리기: api/inject.js 에서 이 파일 script 1줄 제거 + 파일·core/ 삭제.
 */
(function () {
  'use strict';
  if (window.__usungR6Main) return;
  window.__usungR6Main = true;

  /* 자산 — usung-r6-core-img.js 가 실어 온 data URI 를 우선 사용하고,
     없으면 정적 파일 경로로 폴백한다(배포 경로에 따라 둘 중 하나만 존재할 수 있음). */
  var IMG = window.__USUNG_R6_CORE_IMG || {};
  var HOOD = IMG.hood || '/core/core-hood.webp';
  var OIL_IN = IMG.oilIn || '/core/core-oil-in.webp';
  var OIL_NET = IMG.oilNet || '/core/core-oil-net.webp';
  /* data URI 는 이미 내려받은 바이트라 lazy 가 무의미하고,
     Chrome 에서 화면 밖 data URI 는 lazy 해제가 트리거되지 않아 영영 디코드되지 않는다. */
  var LAZY = HOOD.indexOf('data:') === 0 ? '' : ' loading="lazy"';

  /* [제목, 설명] × 4 — PPT '메인페이지,고객센터' 이미지의 01~04 카피 */
  var CORE = {
    ko: [
      ['현장에 딱 맞는 맞춤 제작', '현장 절단·연장 작업 최소화, 빠르고 깔끔한 설치'],
      ['설치와 청소가 편리한 360° 스윙', '간편한 수직 정렬, 테이블 이동 없는 손쉬운 청소'],
      ['기름 낙하 방지, 기본 적용', '기름받이속 기본 적용, 필요에 따른 기름받이망 추가'],
      ['교체와 관리가 쉬운 양옆태엽', '두 개의 태엽으로 안정적인 작동, 외부 배치로 손쉬운 교체·관리']
    ],
    en: [
      ['Custom-built to fit your site', 'Minimal on-site cutting or extension — fast, clean installation'],
      ['360° swing for easy setup and cleaning', 'Simple vertical alignment, cleaning without moving the table'],
      ['Oil-drip protection as standard', 'Inner oil tray included; add the oil mesh when needed'],
      ['Dual side springs, easy to replace', 'Two springs for stable motion, mounted outside for simple upkeep']
    ],
    ja: [
      ['現場にぴったりのオーダー製作', '現場での切断・延長作業を最小化、素早く美しい設置'],
      ['設置と清掃が便利な360°スイング', '簡単な垂直調整、テーブルを動かさずに手軽に清掃'],
      ['油だれ防止を標準装備', 'オイルトレイを標準装備、必要に応じてオイルメッシュを追加'],
      ['交換と管理が簡単な両側ゼンマイ', '2つのゼンマイで安定作動、外部配置で交換・管理が容易']
    ],
    vi: [
      ['Chế tạo riêng theo hiện trường', 'Giảm tối đa cắt·nối tại chỗ, lắp đặt nhanh và gọn'],
      ['Xoay 360° tiện lắp đặt và vệ sinh', 'Căn thẳng đứng dễ dàng, vệ sinh không cần di chuyển bàn'],
      ['Chống nhỏ dầu, trang bị tiêu chuẩn', 'Khay hứng dầu tiêu chuẩn, thêm lưới lọc dầu khi cần'],
      ['Lò xo hai bên, dễ thay và bảo trì', 'Hai lò xo vận hành ổn định, đặt bên ngoài nên dễ thay thế']
    ],
    zh: [
      ['量身定制，贴合现场', '最大限度减少现场切割·加长作业，安装快速整洁'],
      ['360°摆动，安装清洁更方便', '垂直对位简单，无需移动餐桌即可轻松清洁'],
      ['标配防滴油设计', '标配集油内盘，可按需加装集油滤网'],
      ['两侧发条，更换维护更轻松', '双发条运行稳定，外置布局便于更换·保养']
    ]
  };

  var OIL_LAB = {
    ko: ['기름받이속', '기름받이망'],
    en: ['Oil tray', 'Oil mesh'],
    ja: ['オイルトレイ', 'オイルメッシュ'],
    vi: ['Khay dầu', 'Lưới lọc dầu'],
    zh: ['集油盘', '集油网']
  };

  function curLang() {
    try {
      return (typeof window.getLang === 'function' && window.getLang()) || 'ko';
    } catch (e) { return 'ko'; }
  }
  function pack() { return CORE[curLang()] || CORE.ko; }
  function oilLab() { return OIL_LAB[curLang()] || OIL_LAB.ko; }

  /* ---------- CSS ---------- */
  function injectCss() {
    if (document.getElementById('usung-r6-core-css')) return;
    var css = [
      '#r6-core-card{background:#fff;}',
      '#r6-core-card .r6c-left{display:flex;align-items:center;justify-content:center;',
      'background:#fff;padding:28px 16px;min-height:420px;}',
      '#r6-core-card .r6c-left img{max-width:100%;max-height:620px;height:auto;display:block;background:#fff;}',
      '#r6-core-card .r6c-right{background:#fff;padding:32px 28px;display:flex;flex-direction:column;justify-content:center;gap:22px;}',
      // Both columns are white now, so a hairline keeps the split readable on desktop.
      '@media (min-width:1024px){#r6-core-card .r6c-right{border-left:1px solid rgba(11,30,77,.08);}}',
      '#r6-core-card .r6c-item{display:flex;gap:14px;align-items:flex-start;}',
      '#r6-core-card .r6c-num{flex:0 0 auto;width:38px;height:32px;border-radius:8px;background:#0b1e4d;color:#fff;',
      'font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center;letter-spacing:.02em;margin-top:2px;}',
      '#r6-core-card .r6c-t{font-size:19px;font-weight:800;color:#0b1e4d;line-height:1.35;letter-spacing:-.01em;}',
      '#r6-core-card .r6c-d{margin-top:6px;font-size:13.5px;color:#5b6478;line-height:1.7;}',
      '#r6-core-card .r6c-oils{display:flex;gap:22px;align-items:center;flex-wrap:wrap;margin-top:12px;}',
      '#r6-core-card .r6c-oil{display:flex;gap:10px;align-items:center;}',
      '#r6-core-card .r6c-oil img{width:64px;height:auto;display:block;}',
      '#r6-core-card .r6c-oil span{font-size:12.5px;color:#5b6478;font-weight:600;}',
      '#r6-core-card .r6c-sep{height:1px;background:rgba(11,30,77,.08);}',
      '@media (max-width:1023px){#r6-core-card .r6c-left{min-height:340px;padding:22px 12px;}',
      '#r6-core-card .r6c-left img{max-height:420px;}',
      '#r6-core-card .r6c-right{padding:26px 20px;gap:18px;}',
      '#r6-core-card .r6c-t{font-size:17px;}#r6-core-card .r6c-d{font-size:13px;}}'
    ].join('');
    var st = document.createElement('style');
    st.id = 'usung-r6-core-css';
    st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  }

  /* ---------- 마크업 ---------- */
  function itemHtml(i) {
    var oils = '';
    if (i === 2) {
      oils = '<div class="r6c-oils">' +
        '<div class="r6c-oil"><img src="' + OIL_IN + '" alt=""><span data-r6oil="0"></span></div>' +
        '<div class="r6c-oil"><img src="' + OIL_NET + '" alt=""><span data-r6oil="1"></span></div>' +
        '</div>';
    }
    return '<div class="r6c-item">' +
      '<div class="r6c-num">0' + (i + 1) + '</div>' +
      '<div><div class="r6c-t" data-r6t="' + i + '"></div>' +
      '<div class="r6c-d" data-r6d="' + i + '"></div>' + oils + '</div>' +
      '</div>' + (i < 3 ? '<div class="r6c-sep"></div>' : '');
  }

  function applyText(card) {
    var p = pack(), lab = oilLab(), i;
    for (i = 0; i < 4; i++) {
      var t = card.querySelector('[data-r6t="' + i + '"]');
      var d = card.querySelector('[data-r6d="' + i + '"]');
      if (t && t.textContent !== p[i][0]) t.textContent = p[i][0];
      if (d && d.textContent !== p[i][1]) d.textContent = p[i][1];
    }
    for (i = 0; i < 2; i++) {
      var s = card.querySelector('[data-r6oil="' + i + '"]');
      if (s && s.textContent !== lab[i]) s.textContent = lab[i];
    }
    var img = card.querySelector('.r6c-left img');
    if (img) img.alt = (p[0] && p[0][0]) || '';
  }

  function build() {
    var card = document.getElementById('r6-core-card');
    if (card) { applyText(card); return true; }

    var wrap = document.getElementById('hood-3d-wrap');
    if (!wrap || !wrap.parentElement) return false;
    card = wrap.parentElement;

    var items = '';
    for (var i = 0; i < 4; i++) items += itemHtml(i);

    // 노드 통째 교체 → 원본 IntersectionObserver 가 해제되어 캔버스 rAF 루프도 멈춘다
    card.id = 'r6-core-card';
    card.innerHTML =
      '<div class="r6c-left"><img src="' + HOOD + '" alt=""' + LAZY + ' decoding="async"></div>' +
      '<div class="r6c-right">' + items + '</div>';

    applyText(card);
    return true;
  }

  function run() {
    try {
      injectCss();
      build();
    } catch (e) {}
  }

  run();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);

  /* 다른 오버레이의 늦은 재렌더 흡수 (약 4초) */
  var n = 0, iv = setInterval(function () { run(); if (++n > 40) clearInterval(iv); }, 100);

  /* 언어 전환 — i18n.js 는 document 에 dispatch 한다 */
  function onLang() {
    var card = document.getElementById('r6-core-card');
    if (card) applyText(card);
  }
  try { document.addEventListener('langchange', onLang); } catch (e) {}
  try { window.addEventListener('langchange', onLang); } catch (e) {}

  /* 홈 섹션이 재렌더되어 원본 캔버스가 되살아나면 다시 교체 */
  try {
    var pend = false;
    var mo = new MutationObserver(function () {
      if (pend) return;
      pend = true;
      setTimeout(function () { pend = false; run(); }, 150);
    });
    mo.observe(document.body, { childList: true, subtree: true });
  } catch (e) {}

  /* 페이지 이동 후에도 재적용 (기존 래퍼 플래그 보존) */
  try {
    var orig = window.navigate;
    if (typeof orig === 'function' && !orig.__r6main) {
      var w = function () {
        var r = orig.apply(this, arguments);
        setTimeout(run, 60);
        return r;
      };
      w.__r6main = true;
      try {
        w.__usungNav = orig.__usungNav; w.__t8 = orig.__t8;
        w.__r5company = orig.__r5company; w.__r5nav = orig.__r5nav;
        w.__r6nav = orig.__r6nav; w.__boardNavWrapped = orig.__boardNavWrapped;
      } catch (e) {}
      window.navigate = w;
    }
  } catch (e) {}
})();
