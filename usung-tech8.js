/* =========================================================================
 * usung-tech8.js  —  기술 및 인증현황 > 8대 핵심기술 상세 콘텐츠
 * page-tech 의 #tech-grid 를 8개 상세 패널(문제원인/해결방법/효과 + 요약)로 교체.
 * 화이트 톤 · 반응형 · 텍스트 기반(모바일 가독성 확보). 2026-07-08 수정본 반영.
 * 되돌리기: api/inject.js 에서 이 스크립트 주입 라인만 제거하면 원복.
 * ========================================================================= */
(function () {
  'use strict';

  var TECH8 = [
    {
      n: '01', title: '맞춤형 제작',
      sub: '매장 환경과 천장 높이에 맞춰 후드 길이를 현장 조건에 맞게 제작합니다.',
      problem: ['매장별 천장고 차이', '현장별 설치 조건 상이', '현장 절단·연장 작업 발생'],
      solve: ['기본기장 L1800 기준 제작', '현장 맞춤 절단·연장 제작', '설치 전 기장 확인 기반 제작'],
      effect: ['현장 작업 부담 감소', '시공 시간 단축', '추가 비용 절감'],
      bar: '유성에이스는 현장 환경을 고려한 최적의 길이로 제작하여 설치 효율과 완성도를 높입니다.'
    },
    {
      n: '02', title: '360도 스윙',
      sub: '후드 각도를 자유롭게 조절하여 설치 정렬과 내부 관리를 더 편리하게 합니다.',
      problem: ['고정식 후드의 각도 불균형', '파이프 손상 위험'],
      solve: ['수직선 기준 360˚ 자유 스윙'],
      effect: ['수직 정렬 용이', '파이프 손상 위험 감소', '내부 관리 편의 향상'],
      bar: '360도 스윙 구조로 후드 위치와 각도를 유연하게 맞춰 설치 완성도를 높입니다.'
    },
    {
      n: '03', title: 'FVD 방화댐퍼',
      sub: '고온 감지 시 자동 폐쇄되는 구조로 덕트 화재 확산 위험을 줄입니다.',
      problem: ['불씨 상승 가능성', '덕트 화재 확산 위험', '배기 풍량 불균형'],
      solve: ['F.V.D 풍량 조절 기능', '고온 감지 자동 폐쇄'],
      effect: ['화재 확산 위험 완화', '매장 환기 밸런스 유지', '소방 안전 관리 보조', '현장 관리 편의성 향상'],
      bar: 'FVD 방화댐퍼는 화재 위험과 풍량 관리를 함께 고려해 안전한 환기 환경을 보호합니다.'
    },
    {
      n: '04', title: 'VD 풍량조절댐퍼',
      sub: '후드별 댐퍼 개방 각도를 조절해 매장 전체 배기 밸런스를 맞춥니다.',
      problem: ['메인관 내 여러 대의 후드 연결', '모터와의 거리별 풍량 편차', '모터 가까운 후드의 과도한 흡기', '모터 먼 후드의 흡기 부족', '매장 전체 배기 밸런스 불균형'],
      solve: ['V.D 풍량조절댐퍼 적용', '후드별 댐퍼 개방 각도 조절'],
      effect: ['매장 전체 배기 효율 향상', '특정 후드의 과흡입·흡입 부족 완화', '안정적인 환기 환경 조성', '시공 후 풍량 조정 편의 향상'],
      bar: 'VD 풍량조절댐퍼는 후드마다 다른 흡입 조건을 보정해 배기 효율을 높입니다.'
    },
    {
      n: '05', title: '양옆태엽 / 듀얼(더블) 다이캐스팅',
      sub: '외부 장착 구조와 양쪽 지지 방식으로 교체와 상하작동을 더 안정적으로 만듭니다.',
      problem: ['내부 태엽 교체 불편', '후드 내부 청소 어려움'],
      solve: ['양쪽 와이어 지지 방식', '태엽 교체가 쉬운 외부 장착 구조', '청소 접근성을 높인 구조 개선'],
      effect: ['태엽 교체 편의 향상', '부드러운 상하작동', '안정적인 사용감 제공'],
      bar: '양옆태엽과 듀얼 다이캐스팅 구조로 유지보수는 쉽게, 작동감은 더 안정적으로 만듭니다.'
    },
    {
      n: '06', title: '와이어 없는 텐션 구조',
      sub: '와이어 없는 특허 텐션 기술로 장력을 안정적으로 유지합니다.',
      problem: ['와이어 끊어짐에 따른 유지관리 부담'],
      solve: ['볼베어링으로 장력을 조절하는 와이어 없는 특허 텐션 기술'],
      effect: ['안정적인 장력 유지', '유지관리 비용 절감'],
      bar: '와이어 없는 텐션 기술로 유지관리 부담을 줄이고 작동 안정성을 높입니다.'
    },
    {
      n: '07', title: '분리 청소 가능 구조',
      sub: '공구 없이 주요 오염 부위를 분리해 청소와 위생관리를 간편하게 합니다.',
      problem: ['후드 내부 기름때 축적', '분리 작업 시 공구 필요', '청소·위생관리 부담 발생'],
      solve: ['손으로 돌려 분리하는 구조', '상하부 파이프 분리 가능 (옵션별 선택)', '나팔캡 분리 가능', '기름받이 간편 분리 구조'],
      effect: ['주요 오염 부위 세척 용이', '공구 없이 간편 관리', '청소 시간 및 부담 감소', '위생적인 후드 관리 가능'],
      bar: '분리청소가능구조는 청소 접근성을 높여 매장 후드를 위생적으로 관리할 수 있게 합니다.'
    },
    {
      n: '08', title: '기름낙하방지필터 (기름받이망 · 기름받이속)',
      sub: '기름받이망과 기름받이속 구조로 기름 낙하와 오염 부담을 줄입니다.',
      problem: ['기름받이 구멍 사이 기름 낙하', '화로 위 음식 오염 가능성', '유증기·이물질 유입', '파이프 내부 오염 발생', '배기 모터 관리 부담 증가'],
      solve: ['기름받이속 기본 적용', '기름 낙하 저감 구조', '기름받이망 선택 적용 (1중망·2중망 변경 가능)', '유증기·이물질 추가 여과'],
      effect: ['음식 위 기름 낙하 감소', '후드 내부 청결 관리', '파이프 오염 부담 감소', '배기 모터 수명 관리에 도움', '매장 위생관리 효율 향상'],
      bar: '기름낙하방지필터는 유증기와 이물질 유입을 줄여 청결한 후드 관리를 돕습니다.'
    }
  ];

  // 카테고리별 아이콘 (문제/해결/효과)
  var ICON = {
    problem: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
    solve: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    effect: '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>'
  };

  function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

  function col(kind, label, en, items, accent) {
    var lis = items.map(function (x) {
      return '<li style="display:flex;gap:8px;align-items:flex-start;line-height:1.5;">'
        + '<span style="margin-top:8px;width:5px;height:5px;border-radius:9px;flex:0 0 auto;background:' + accent + ';"></span>'
        + '<span>' + esc(x) + '</span></li>';
    }).join('');
    return '<div class="t8-col">'
      + '<div class="t8-col-head" style="color:' + accent + ';">'
      + '<span class="t8-ic" style="background:' + accent + '1a;color:' + accent + ';">' + ICON[kind] + '</span>'
      + '<span class="t8-col-title">' + label + '</span>'
      + '<span class="t8-col-en">' + en + '</span>'
      + '</div>'
      + '<ul class="t8-list">' + lis + '</ul></div>';
  }

  function panel(t) {
    return '<article class="t8-card">'
      + '<div class="t8-top">'
      +   '<div class="t8-top-l">'
      +     '<div class="t8-code">TECH ' + t.n + '</div>'
      +     '<h3 class="t8-title">' + esc(t.title) + '</h3>'
      +     '<p class="t8-sub">' + esc(t.sub) + '</p>'
      +   '</div>'
      +   '<div class="t8-num" aria-hidden="true">' + t.n + '</div>'
      + '</div>'
      + '<div class="t8-fig" data-tech="' + t.n + '"></div>'
      + '<div class="t8-cols">'
      +   col('problem', '문제 원인', 'CAUSE', t.problem, '#dc2626')
      +   col('solve', '해결 방법', 'SOLUTION', t.solve, '#2563eb')
      +   col('effect', '효과', 'EFFECT', t.effect, '#059669')
      + '</div>'
      + '<div class="t8-bar"><span class="t8-bar-ic">' + ICON.effect + '</span><span>' + esc(t.bar) + '</span></div>'
      + '</article>';
  }

  function injectStyle() {
    if (document.getElementById('t8-style')) return;
    var css = ''
      + '#tech-grid.t8-wrap{display:flex;flex-direction:column;gap:22px;}'
      + '.t8-card{background:#fff;border:1px solid #e5e9f0;border-radius:26px;padding:26px 26px 22px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 12px 30px -18px rgba(15,23,42,.18);overflow:hidden;position:relative;}'
      + '.t8-top{display:flex;justify-content:space-between;align-items:flex-start;gap:16px;margin-bottom:20px;}'
      + '.t8-code{font-size:11px;font-weight:800;letter-spacing:.24em;color:#2563eb;margin-bottom:8px;}'
      + '.t8-title{font-size:26px;line-height:1.15;font-weight:900;letter-spacing:-.02em;color:#0f172a;margin:0 0 8px;}'
      + '.t8-sub{font-size:14.5px;line-height:1.55;color:#475569;margin:0;max-width:62ch;}'
      + '.t8-num{font-size:66px;font-weight:900;line-height:1;color:#eff4ff;letter-spacing:-.04em;flex:0 0 auto;}'
      + '.t8-cols{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;}'
      + '.t8-col{background:#f8fafc;border:1px solid #eef2f7;border-radius:18px;padding:16px 16px 18px;}'
      + '.t8-col-head{display:flex;align-items:center;gap:8px;margin-bottom:12px;flex-wrap:wrap;}'
      + '.t8-ic{width:26px;height:26px;border-radius:8px;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;}'
      + '.t8-ic svg{width:15px;height:15px;}'
      + '.t8-col-title{font-size:14px;font-weight:800;}'
      + '.t8-col-en{font-size:9px;font-weight:800;letter-spacing:.18em;color:#94a3b8;margin-left:auto;}'
      + '.t8-list{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:9px;font-size:13px;color:#334155;}'
      + '.t8-bar{margin-top:16px;display:flex;gap:10px;align-items:center;background:linear-gradient(90deg,#eff6ff,#f0f9ff);border:1px solid #dbeafe;border-radius:16px;padding:14px 18px;font-size:14px;font-weight:600;color:#1e3a8a;line-height:1.5;}'
      + '.t8-bar-ic{width:24px;height:24px;border-radius:8px;background:#2563eb;color:#fff;display:inline-flex;align-items:center;justify-content:center;flex:0 0 auto;}'
      + '.t8-bar-ic svg{width:14px;height:14px;}'
      + '.t8-fig{display:none;margin:0 0 18px;}'
      + '.t8-fig.on{display:block;}'
      + '.t8-figbox{position:relative;display:inline-block;width:100%;text-align:center;}'
      + '.t8-dimg{display:block;width:100%;max-width:360px;margin:0 auto;border:1px solid #eef2f7;border-radius:16px;background:#fff;cursor:zoom-in;transition:box-shadow .18s;}'
      + '.t8-dimg:hover{box-shadow:0 10px 26px -12px rgba(37,99,235,.45);}'
      + '.t8-figcap{margin:8px 0 0;font-size:11.5px;font-weight:700;letter-spacing:.02em;color:#94a3b8;}'
      + '.t8-lb{position:fixed;inset:0;background:rgba(15,23,42,.82);display:none;align-items:center;justify-content:center;z-index:99999;padding:24px;}'
      + '.t8-lb.on{display:flex;}'
      + '.t8-lb img{max-width:96vw;max-height:92vh;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.5);background:#fff;}'
      + '.t8-lb-x{position:absolute;top:18px;right:22px;width:42px;height:42px;border-radius:50%;background:rgba(255,255,255,.16);color:#fff;border:0;font-size:24px;line-height:1;cursor:pointer;display:flex;align-items:center;justify-content:center;}'
      + '@media(max-width:860px){.t8-cols{grid-template-columns:1fr;}.t8-title{font-size:22px;}.t8-num{font-size:48px;}}';
    var s = document.createElement('style');
    s.id = 't8-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  // ---- 핵심기술 다이어그램(코어 기술.jpg 보강) : 필요 시에만 지연 로드 ----
  var DIAG_V = '20260711';

  function loadDiagramScripts() {
    if (window.__t8diagLoad) return;
    window.__t8diagLoad = true;
    for (var i = 1; i <= 8; i++) {
      var sc = document.createElement('script');
      sc.src = '/techdiag/td' + i + '.js?v=' + DIAG_V;
      sc.defer = true;
      document.head.appendChild(sc);
    }
  }

  function fillDiagrams() {
    var GB = window.GB || {};
    var figs = document.querySelectorAll('#tech-grid .t8-fig');
    var done = figs.length > 0;
    for (var k = 0; k < figs.length; k++) {
      var f = figs[k];
      if (f.getAttribute('data-loaded') === '1') continue;
      var n = f.getAttribute('data-tech');
      var key = 'tech' + parseInt(n, 10);
      if (GB[key]) {
        f.innerHTML = '<div class="t8-figbox">'
          + '<img class="t8-dimg" alt="핵심기술 ' + n + ' 다이어그램" src="data:image/webp;base64,' + GB[key] + '">'
          + '<p class="t8-figcap">이미지를 누르면 크게 볼 수 있습니다</p>'
          + '</div>';
        f.className = 't8-fig on';
        f.setAttribute('data-loaded', '1');
      } else {
        done = false;
      }
    }
    return done;
  }

  function loadDiagrams() {
    ensureLightbox();
    loadDiagramScripts();
    var tries = 0;
    (function poll() {
      tries++;
      if (fillDiagrams()) return;
      if (tries < 50) setTimeout(poll, 150);
    })();
  }

  function ensureLightbox() {
    if (document.getElementById('t8-lb')) return;
    var lb = document.createElement('div');
    lb.id = 't8-lb';
    lb.className = 't8-lb';
    lb.innerHTML = '<button class="t8-lb-x" aria-label="닫기">×</button><img src="" alt="핵심기술 다이어그램 확대">';
    document.body.appendChild(lb);
    function close() { lb.className = 't8-lb'; }
    lb.addEventListener('click', function (e) {
      if (e.target === lb || (e.target.className && String(e.target.className).indexOf('t8-lb-x') > -1)) close();
    });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') close(); });
    if (!window.__t8lbClick) {
      window.__t8lbClick = true;
      document.addEventListener('click', function (e) {
        var t = e.target;
        if (t && t.classList && t.classList.contains('t8-dimg')) {
          var box = document.getElementById('t8-lb');
          if (!box) return;
          box.querySelector('img').src = t.src;
          box.className = 't8-lb on';
        }
      });
    }
  }

  function render() {
    var grid = document.getElementById('tech-grid');
    if (!grid) return;
    injectStyle();
    grid.className = 't8-wrap';
    grid.innerHTML = TECH8.map(panel).join('');
    loadDiagrams();
  }

  // 원래 렌더러가 다시 다크카드로 덮어쓰지 못하도록 오버라이드
  try { window.renderTechGrid = render; } catch (e) {}

  function boot() {
    render();
    // 초기 인라인 스크립트가 이후에 다시 그릴 수 있으므로 한 번 더 보정
    setTimeout(render, 300);
    setTimeout(render, 1200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  // 탭 전환(navigate)으로 tech 페이지에 진입할 때도 보장
  try {
    var _nav = window.navigate;
    if (typeof _nav === 'function' && !_nav.__t8) {
      window.navigate = function (id) {
        var r = _nav.apply(this, arguments);
        if (id === 'tech') setTimeout(render, 30);
        return r;
      };
      window.navigate.__t8 = true;
    }
  } catch (e) {}
})();
