/* usung-manual.js — 사용방법 페이지 카탈로그 기반 전면 재구성 (슬라이드 8, 0708 검토)
 * 요구: "사용방법은 카다로그 잘 훑어보고 그래픽 요소 빼도되니까 최대한 이해 잘가도록 구성해줘"
 *   → 3D 캔버스 그래픽/애니메이션 전부 제거하고, 카탈로그(사용방법 p34~35) 내용을
 *      텍스트 우선·단계별로 재구성. 흰색 테마에 맞춘 깔끔한 카드 레이아웃.
 * 기존 문제: usung-overlay.js 의 patchFeaturesSection() 이 무소음 카드를 숨기고 스윙 배지를
 *   '02'로 바꾸면서 번호가 01·02·02·03·04 로 깨져 보였음 → #page-manual 내부를 통째로
 *   교체해 그래픽/오버레이 핵과의 충돌을 원천 제거(내 콘텐츠엔 usage-canvas/.reveal 없음 → 오버레이 no-op).
 * 콘텐츠 출처: 카탈로그 '사용방법' 34~35p + index_v6.html manuals 배열(카탈로그 정합).
 * 원본 index_v6.html 불변. 런타임 DOM 재구성. 되돌리기: inject.js 주입 1줄 제거.
 */
(function () {
  'use strict';

  var NAVY = '#0c1e5a', BRAND = '#1e40af', INK = '#1e293b', SUB = '#475569', LINE = 'rgba(12,30,90,.10)';
  var VIDEO = 'https://www.youtube.com/watch?v=VNgsryiCnQY';

  // ── 4가지 핵심 특징 (카탈로그 정합, 과장님 검토 '4가지') ─────────────────
  var FEATURES = [
    { n: '01', t: '기름유도장치 (기름받이속)',
      d: '사용 중에 기름이 전혀 흐르지 않습니다. 일체형 성형 기름받이가 후드 내부의 기름을 안전하게 모아 위생적으로 관리합니다.',
      tag: '기름 흘림 ZERO' },
    { n: '02', t: '360° 자유 스윙',
      d: '파이프가 고정되어 있지 않고 시계추처럼 부드럽게 회전합니다. 테이블을 치우지 않고 후드만 옆으로 옮겨 청소할 수 있어 부러질 염려가 없습니다.',
      tag: '파이프 파손 ZERO' },
    { n: '03', t: '나사타입 간편 분리',
      d: '상·하부를 잇는 파이프링이 나사 방식이라 도구 없이 손으로 분리됩니다. 누구나 손쉽게 내부 청소를 할 수 있습니다.',
      tag: '도구 없이 분리' },
    { n: '04', t: '유지망 필터',
      d: '기름을 여과해 모터와 덕트 내부를 청결하게 유지합니다. 모터 수명을 늘리고 화재를 예방하는 이중 효과가 있습니다.',
      tag: '모터수명 연장 + 화재예방' }
  ];

  // ── 유지관리 가이드 (카탈로그 사용방법 p34) ─────────────────────────────
  var GUIDES = [
    { code: 'GUIDE 01', sub: 'SPRING REDUCER REPLACEMENT', title: '태엽감속기 교체방법',
      key: '사각피스 4개 → 현장에서 직접 교체',
      caption: '외부태엽(A·B 타입)은 사각 피스만 풀면 현장에서 직접 교체할 수 있습니다.',
      steps: [
        '태엽감속기 사각부분 피스 4개를 풀어 태엽을 분리합니다.',
        '가운데 고정 피스 2개는 절대 풀지 않습니다.',
        '새 태엽을 사각구멍에 다시 끼우고 피스를 채운 뒤, 후드 중간 부분을 분리합니다.',
        '파이프 안쪽에서 와이어줄을 당겨 브이(V)고리에 걸어줍니다.'
      ],
      note: '가운데 피스 2개를 풀면 태엽 장력이 풀려 위험합니다. 사각 피스 4개만 푸세요.' },
    { code: 'GUIDE 02', sub: 'INNER / OUTER ROD SEPARATION', title: '속봉 · 겉봉 분리방법',
      key: '볼트만 빼면 분리 완료',
      caption: '내부 청소를 할 때 반드시 거치는 단계입니다.',
      steps: [
        '겉링에 있는 볼트를 풀어 빼냅니다.',
        '겉링을 돌려 잠금을 해제합니다.',
        '속봉과 겉봉을 양손으로 살짝 당겨 분리합니다.',
        '내부 기름때·이물질을 세척한 뒤 역순으로 재조립합니다.'
      ] },
    { code: 'GUIDE 03', sub: 'BEARING RING REPLACEMENT', title: '빠찌링(베어링) 교체방법',
      key: '초기 6개 → 느슨하면 1~2개 추가',
      caption: '베어링 몇 개만 추가하면 안정적인 텐션을 오래 유지할 수 있습니다.',
      steps: [
        '처음에는 6개 정도 끼워서 사용합니다.',
        '수일이 지나 느슨해져 흘러내리면 여분의 빠찌링을 1~2개 추가합니다.',
        '뺄 때는 펜치로 안쪽에서 톡 쳐서 빼냅니다.'
      ],
      note: '빠찌링을 손으로 빼면 손을 벨 수 있습니다. 반드시 펜치 같은 도구를 사용하세요.' },
    { code: 'GUIDE 04', sub: 'TRUMPET CAP & OIL TRAP', title: '나팔 · 기름받이 분리방법',
      key: '도구 없이 손으로 분리',
      caption: '기름받이속 · 기름받이망 · 일체형 모두 동일한 방법입니다.',
      steps: [
        '후드 하단의 나팔을 손으로 돌려 분리합니다. (도구 불필요)',
        '기름받이를 잡고 돌려 빼냅니다.',
        '모아진 기름을 버리고 중성 세제로 세척합니다.',
        '물기를 완전히 닦은 뒤 역순으로 체결합니다.'
      ] },
    { code: 'GUIDE 05', sub: 'LIGHT FIXTURE ASSEMBLY', title: '등제품 조립순서',
      key: '4단계로 간단 조립',
      caption: '아크릴등 · 한지등 · LED 등제품은 모두 같은 순서로 조립합니다.',
      steps: [
        '등받침을 후드 하단에 끼웁니다.',
        '등받침 위에 등 하판을 끼웁니다.',
        '등 하판 위에 갓을 끼웁니다.',
        '조립된 상태를 확인합니다.'
      ] }
  ];

  // ── 양옆태엽 제품의 장점 (카탈로그 p35) ─────────────────────────────────
  var MERITS = [
    '스윙 제품으로, 파이프가 고정되어 있지 않고 시계추 모양으로 360° 스윙되므로 부러지거나 휘어질 염려가 없습니다.',
    '상·하부를 연결하는 파이프가 간단히 분리되어 내부 청소가 가능합니다.',
    '화로와 80~150mm 정도 떨어뜨려 시공하면 화재로부터 안전합니다.',
    '태엽이 바깥에 있어 교체가 편리하고, 양옆에 달려 있어 한쪽 와이어가 끊어져도 나머지 한쪽이 잡아줍니다.'
  ];
  var CAUTIONS = [
    '텐션이 풀리거나 와이어줄이 끊어져 후드가 갑자기 내려와도, 파이프 타입은 스톱바(브레이크) 역할을 하므로 안전합니다.',
    '하부 나팔이 화로에 빠질 정도로 낮게 시공하지 마세요.'
  ];

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  var CHECK = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" style="flex:none"><path d="M20 6 9 17l-5-5"/></svg>';

  function featureCard(f) {
    return '' +
      '<div style="background:#fff;border:1px solid ' + LINE + ';border-radius:20px;padding:26px 24px;box-shadow:0 10px 30px rgba(10,20,60,.06)">' +
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">' +
          '<span style="flex:none;width:40px;height:40px;border-radius:12px;background:rgba(30,64,175,.10);color:' + BRAND + ';font-weight:800;font-size:14px;display:flex;align-items:center;justify-content:center;letter-spacing:.04em">' + f.n + '</span>' +
          '<h3 style="margin:0;font-size:19px;font-weight:800;color:' + NAVY + ';letter-spacing:-.02em">' + esc(f.t) + '</h3>' +
        '</div>' +
        '<p style="margin:0 0 16px;font-size:14px;line-height:1.75;color:' + SUB + '">' + esc(f.d) + '</p>' +
        '<div style="display:inline-flex;align-items:center;gap:6px;color:#059669;font-size:12.5px;font-weight:800">' + CHECK + esc(f.tag) + '</div>' +
      '</div>';
  }

  function stepItem(txt, i) {
    return '' +
      '<li style="display:flex;gap:12px;align-items:flex-start;padding:2px 0">' +
        '<span style="flex:none;width:24px;height:24px;border-radius:999px;background:' + NAVY + ';color:#fff;font-size:12px;font-weight:800;display:flex;align-items:center;justify-content:center;margin-top:1px">' + (i + 1) + '</span>' +
        '<span style="font-size:14px;line-height:1.7;color:' + INK + '">' + esc(txt) + '</span>' +
      '</li>';
  }

  function noteBox(txt) {
    return '' +
      '<div style="display:flex;gap:10px;align-items:flex-start;margin-top:16px;padding:12px 14px;background:#fff7ed;border:1px solid #fed7aa;border-radius:12px">' +
        '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ea580c" stroke-width="2.2" style="flex:none;margin-top:1px"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>' +
        '<span style="font-size:13px;line-height:1.65;color:#9a3412;font-weight:600">' + esc(txt) + '</span>' +
      '</div>';
  }

  function guideCard(g) {
    return '' +
      '<div style="background:#fff;border:1px solid ' + LINE + ';border-radius:24px;padding:28px 26px;box-shadow:0 10px 30px rgba(10,20,60,.06)">' +
        '<div style="display:flex;align-items:flex-start;justify-content:space-between;gap:16px;flex-wrap:wrap;margin-bottom:18px">' +
          '<div>' +
            '<div style="font-size:10.5px;font-weight:800;letter-spacing:.22em;color:' + BRAND + ';margin-bottom:6px">' + esc(g.code) + ' · ' + esc(g.sub) + '</div>' +
            '<h3 style="margin:0;font-size:23px;font-weight:800;color:' + NAVY + ';letter-spacing:-.02em">' + esc(g.title) + '</h3>' +
          '</div>' +
          (g.key ? '<div style="flex:none;background:rgba(14,165,233,.10);border:1px solid rgba(14,165,233,.28);border-radius:999px;padding:7px 14px;font-size:12.5px;font-weight:800;color:#0369a1">' + esc(g.key) + '</div>' : '') +
        '</div>' +
        (g.caption ? '<p style="margin:0 0 18px;font-size:14px;line-height:1.7;color:' + SUB + '">' + esc(g.caption) + '</p>' : '') +
        '<ul style="list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:10px">' +
          g.steps.map(stepItem).join('') +
        '</ul>' +
        (g.note ? noteBox(g.note) : '') +
      '</div>';
  }

  function buildHTML() {
    return '' +
    '<div style="max-width:960px;margin:0 auto;padding:0 20px">' +

      // 헤더
      '<div style="text-align:center;margin-bottom:56px">' +
        '<div style="font-size:11px;font-weight:800;letter-spacing:.32em;color:' + BRAND + ';margin-bottom:14px">HOW TO USE &middot; MAINTENANCE</div>' +
        '<h1 style="margin:0 0 14px;font-size:clamp(34px,5vw,54px);font-weight:800;color:' + NAVY + ';letter-spacing:-.03em">사용방법</h1>' +
        '<p style="margin:0;font-size:17px;color:' + SUB + '">유성에이스 후드의 올바른 사용과 유지관리 방법을 단계별로 안내합니다.</p>' +
      '</div>' +

      // 4가지 핵심 특징
      '<div style="margin-bottom:64px">' +
        '<div style="font-size:11px;font-weight:800;letter-spacing:.28em;color:' + BRAND + ';margin-bottom:8px">PRODUCT FEATURES</div>' +
        '<h2 style="margin:0 0 26px;font-size:clamp(24px,3.4vw,32px);font-weight:800;color:' + NAVY + ';letter-spacing:-.02em">유성에이스 후드, 4가지 핵심 특징</h2>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px">' +
          FEATURES.map(featureCard).join('') +
        '</div>' +
      '</div>' +

      // 유지관리 가이드
      '<div style="margin-bottom:64px">' +
        '<div style="font-size:11px;font-weight:800;letter-spacing:.28em;color:' + BRAND + ';margin-bottom:8px">MAINTENANCE GUIDE</div>' +
        '<h2 style="margin:0 0 10px;font-size:clamp(24px,3.4vw,32px);font-weight:800;color:' + NAVY + ';letter-spacing:-.02em">교체 &middot; 분리 &middot; 조립 가이드</h2>' +
        '<p style="margin:0 0 26px;font-size:15px;color:' + SUB + '">현장에서 자주 쓰는 유지관리 작업을 순서대로 정리했습니다.</p>' +
        '<div style="display:flex;flex-direction:column;gap:20px">' +
          GUIDES.map(guideCard).join('') +
        '</div>' +
      '</div>' +

      // 양옆태엽 제품의 장점 + 주의사항
      '<div style="margin-bottom:56px;background:linear-gradient(135deg,' + NAVY + ' 0%,#12307a 100%);border-radius:28px;padding:40px 34px;color:#fff">' +
        '<div style="font-size:11px;font-weight:800;letter-spacing:.28em;color:#93c5fd;margin-bottom:8px">WHY DUAL-SPRING</div>' +
        '<h2 style="margin:0 0 24px;font-size:clamp(22px,3.2vw,30px);font-weight:800;letter-spacing:-.02em">양옆태엽 제품의 장점</h2>' +
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px 28px;margin-bottom:26px">' +
          MERITS.map(function (m, i) {
            return '<div style="display:flex;gap:12px;align-items:flex-start">' +
              '<span style="flex:none;width:26px;height:26px;border-radius:999px;background:rgba(147,197,253,.18);color:#bfdbfe;font-size:12.5px;font-weight:800;display:flex;align-items:center;justify-content:center;margin-top:1px">' + (i + 1) + '</span>' +
              '<span style="font-size:14px;line-height:1.7;color:#e8eeff">' + esc(m) + '</span>' +
            '</div>';
          }).join('') +
        '</div>' +
        '<div style="border-top:1px solid rgba(147,197,253,.22);padding-top:20px">' +
          '<div style="font-size:12px;font-weight:800;letter-spacing:.1em;color:#93c5fd;margin-bottom:12px">안전 주의사항</div>' +
          CAUTIONS.map(function (c) {
            return '<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px">' +
              '<span style="color:#93c5fd;font-weight:800;flex:none">※</span>' +
              '<span style="font-size:13.5px;line-height:1.65;color:#dbe4ff">' + esc(c) + '</span>' +
            '</div>';
          }).join('') +
        '</div>' +
      '</div>' +

      // 공식 영상
      '<div style="text-align:center;margin-bottom:16px">' +
        '<a href="' + VIDEO + '" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:9px;padding:13px 24px;border-radius:999px;background:#fef2f2;border:1px solid #fecaca;color:#dc2626;font-size:14.5px;font-weight:800;text-decoration:none">' +
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><polygon fill="#fff" points="9.545,15.568 15.818,12 9.545,8.432"/></svg>' +
          '유성에이스 공식 영상 보기' +
        '</a>' +
      '</div>' +

    '</div>';
  }

  function render() {
    var page = document.getElementById('page-manual');
    if (!page) return;
    if (page.dataset.usungManual === 'v1') return;
    var wrap = page.querySelector('.max-w-5xl') || page.firstElementChild;
    if (!wrap) return;
    wrap.outerHTML = buildHTML();
    page.dataset.usungManual = 'v1';
  }

  function boot() {
    render();
    setTimeout(render, 300);
    setTimeout(render, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // 사용방법으로 이동할 때마다 보장(최초 1회 교체 이후엔 플래그로 no-op)
  if (typeof window.navigate === 'function' && !window.__manualNavWrapped) {
    window.__manualNavWrapped = true;
    var _nav = window.navigate;
    window.navigate = function (id) {
      var r = _nav.apply(this, arguments);
      if (id === 'manual') { render(); setTimeout(render, 60); }
      return r;
    };
  }
})();
