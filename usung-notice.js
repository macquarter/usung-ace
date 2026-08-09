/* usung-notice.js — 유성에이스 소식(page-notice) 톤앤매너 리디자인 (슬라이드: 소식)
 * 요구: "유성에이스 소식 톤앤매너 맞게 리디자인 해줘."
 *   원본은 빨강/주황 그라디언트 고정카드 + 빨강 타임라인 점/라인 + 검정 CTA(빨강 라벨)로
 *   사이트의 화이트+네이비(#0c1e5a)/블루(#1e40af) 톤과 충돌.
 *   → 전체를 네이비/블루 + 화이트 톤으로 재구성. 콘텐츠(고정 2카드·타임라인·전화 CTA)는 모두 보존.
 * 방식: page-notice 내부(.max-w-5xl)를 통째로 인라인 스타일 마크업으로 교체(usung-manual.js와 동일 패턴,
 *   theme-white.css 특이도 싸움 원천 차단). 타임라인 항목은 원본 인라인 스크립트가 이미 렌더한
 *   #notice-timeline에서 그대로 추출(→ CMS로 추가된 공지도 보존). 원본 index_v6.html 불변.
 * 되돌리기: inject.js(api/inject.js)의 usung-notice.js 주입 1줄 제거.
 */
(function () {
  'use strict';

  var NAVY = '#0b1e4d', BRAND = '#1e40af', INK = '#0b1e4d',
      SUB = '#475569', MUT = '#94a3b8';

  function esc(s) {
    return String(s == null ? '' : s)
      .replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  // 타임라인 태그별 배지 스타일(빨강 계열 제거, 브랜드 톤으로 정돈)
  function tagStyle(tag) {
    var t = (tag || '').trim();
    if (t === '업데이트') return 'background:rgba(30,64,175,.10);color:#1e40af;border:1px solid rgba(30,64,175,.22)';
    if (t === 'A/S')     return 'background:rgba(11,30,77,.08);color:#0b1e4d;border:1px solid rgba(11,30,77,.20)';
    if (t === '이벤트')   return 'background:rgba(29,78,216,.09);color:#1d4ed8;border:1px solid rgba(29,78,216,.20)';
    return 'background:rgba(71,85,105,.10);color:#475569;border:1px solid rgba(71,85,105,.20)'; /* 공지/기본 */
  }

  // 이미 렌더된 #notice-timeline에서 항목 추출(없으면 기본값)
  var DEFAULTS = [
    { date: '2026.04.05', tag: '업데이트', title: '2026 제품 카탈로그 v6 배포 안내', excerpt: '갤럭시 A~D 타입 전면 개정된 최신 카탈로그가 자료실에 업로드되었습니다. 신규 F.V.D 방화담파 라인업 포함.' },
    { date: '2026.03.28', tag: 'A/S', title: '태엽감속기 빠찌링(베어링) 정품 교체 캠페인', excerpt: '5년 이상 사용 매장 대상으로 베어링 무상 점검 및 할인 교체를 진행합니다. 전화 접수만 받습니다.' },
    { date: '2026.03.20', tag: '공지', title: '파주 본사 주차장 확장 공사 안내', excerpt: '3월 25일 ~ 4월 10일까지 본사 주차장 확장 공사로 임시 주차 장소를 운영합니다.' },
    { date: '2026.03.12', tag: '이벤트', title: '시공후기 리뷰 이벤트 — 스타벅스 기프티콘', excerpt: '게시판에 실제 시공 사진과 후기를 남겨주시는 분들께 매주 5분 추첨하여 커피 기프티콘을 드립니다.' },
    { date: '2026.02.28', tag: '업데이트', title: 'F.V.D 방화담파 2세대 정식 출시', excerpt: '기존 대비 폐쇄 속도 40% 향상, 스프링 수명 2배 연장된 2세대 F.V.D가 전 제품군에 기본 탑재됩니다.' },
    { date: '2026.02.15', tag: 'A/S', title: '설 연휴 기간 긴급 A/S 접수 안내', excerpt: '설 연휴 기간 긴급 상황 발생 시 1588-9123으로 연락 주시면 순차 대응해드립니다.' },
    { date: '2026.01.20', tag: '공지', title: '유성에이스 공식 블로그 리뉴얼 완료', excerpt: '네이버 공식 블로그가 새롭게 리뉴얼되었습니다. 시공 사례와 기술 정보를 확인하세요.' }
  ];

  function readTimeline() {
    var el = document.getElementById('notice-timeline');
    if (!el || !el.children || !el.children.length) return DEFAULTS.slice();
    var out = [];
    var rows = el.children;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var spans = r.querySelectorAll('span');
      var h4 = r.querySelector('h4');
      var p = r.querySelector('p');
      out.push({
        date: spans[0] ? spans[0].textContent.trim() : '',
        tag: spans[1] ? spans[1].textContent.trim() : '공지',
        title: h4 ? h4.textContent.trim() : '',
        excerpt: p ? p.textContent.trim() : ''
      });
    }
    return out.length ? out : DEFAULTS.slice();
  }

  function timelineItem(n) {
    return '<div style="position:relative">' +
      '<div style="position:absolute;left:-30px;top:20px;width:14px;height:14px;border-radius:999px;background:' + NAVY + ';border:3px solid #fff;box-shadow:0 0 0 2px rgba(12,30,90,.22)"></div>' +
      '<div style="border-radius:18px;border:1px solid rgba(12,30,90,.12);background:#fff;padding:20px 22px;box-shadow:0 8px 22px rgba(12,30,90,.05)">' +
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:8px">' +
          '<span style="font-size:11px;font-weight:800;color:' + MUT + ';letter-spacing:.03em">' + esc(n.date) + '</span>' +
          '<span style="font-size:10px;padding:3px 10px;border-radius:999px;font-weight:800;' + tagStyle(n.tag) + '">' + esc(n.tag) + '</span>' +
        '</div>' +
        '<h4 style="font-size:17px;font-weight:900;color:' + INK + ';margin:0 0 6px;line-height:1.4">' + esc(n.title) + '</h4>' +
        '<p style="font-size:14px;color:' + SUB + ';line-height:1.65;margin:0">' + esc(n.excerpt) + '</p>' +
      '</div>' +
    '</div>';
  }

  function buildHTML(items) {
    return '<div class="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">' +

      /* Hero */
      '<div style="text-align:center;margin-bottom:48px">' +
        '<div style="display:inline-flex;align-items:center;gap:8px;padding:6px 16px;border-radius:999px;background:rgba(30,64,175,.08);border:1px solid rgba(30,64,175,.20);color:' + BRAND + ';font-size:11px;font-weight:800;letter-spacing:.18em;margin-bottom:20px">' +
          '<span style="width:6px;height:6px;border-radius:999px;background:' + BRAND + ';display:inline-block"></span>NOTICE · 공지사항' +
        '</div>' +
        '<h1 style="font-size:clamp(30px,5vw,46px);font-weight:900;letter-spacing:-.02em;color:' + NAVY + ';margin:0 0 14px">유성에이스 소식</h1>' +
        '<p style="color:' + SUB + ';font-size:16px;max-width:560px;margin:0 auto;line-height:1.6">중요한 공지, A/S 일정, 이벤트 소식을 한곳에서 확인하세요.</p>' +
      '</div>' +

      /* Pinned cards */
      '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:16px;margin-bottom:56px">' +
        /* 카드1 — 긴급 A/S (네이비) */
        '<div style="position:relative;border-radius:24px;background:linear-gradient(135deg,' + NAVY + ',#1e40af);padding:28px;color:#fff;box-shadow:0 24px 60px rgba(11,30,77,.22);overflow:hidden">' +
          '<div style="position:absolute;top:-40px;right:-40px;width:160px;height:160px;border-radius:999px;background:rgba(255,255,255,.08);filter:blur(30px)"></div>' +
          '<div style="position:relative">' +
            '<div style="font-size:10px;font-weight:900;letter-spacing:.2em;color:#bfd3ff;margin-bottom:14px">PINNED · 중요</div>' +
            '<h3 style="font-size:20px;font-weight:900;margin:0 0 8px;line-height:1.3">2026 설 연휴 A/S 운영 안내</h3>' +
            '<p style="color:rgba(255,255,255,.82);font-size:14px;line-height:1.65;margin:0">2026년 2월 16일(월) ~ 18일(수) 설 연휴 기간 중 긴급 A/S는 1588-9123으로 연락주시면 순차 대응합니다.</p>' +
            '<div style="margin-top:20px;display:flex;align-items:center;justify-content:space-between;font-size:11px;color:rgba(255,255,255,.72);font-weight:700">' +
              '<span>2026.02.10</span>' +
              '<span style="padding:4px 11px;border-radius:999px;background:rgba(248,113,113,.22);border:1px solid rgba(254,178,178,.45);color:#fee2e2">긴급</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
        /* 카드2 — 이벤트 (블루) */
        '<div style="position:relative;border-radius:24px;background:linear-gradient(135deg,#1d4ed8,#3b82f6);padding:28px;color:#fff;box-shadow:0 24px 60px rgba(29,78,216,.22);overflow:hidden">' +
          '<div style="position:absolute;bottom:-40px;left:-40px;width:160px;height:160px;border-radius:999px;background:rgba(255,255,255,.10);filter:blur(30px)"></div>' +
          '<div style="position:relative">' +
            '<div style="font-size:10px;font-weight:900;letter-spacing:.2em;color:#dbeafe;margin-bottom:14px">PINNED · 이벤트</div>' +
            '<h3 style="font-size:20px;font-weight:900;margin:0 0 8px;line-height:1.3">창립 기념 감사 프로모션</h3>' +
            '<p style="color:rgba(255,255,255,.88);font-size:14px;line-height:1.65;margin:0">갤럭시 A·B 타입 일괄 견적 시 최대 15% 할인 + F.V.D 방화담파 무상 업그레이드. 5월 31일까지!</p>' +
            '<div style="margin-top:20px;display:flex;align-items:center;justify-content:space-between;font-size:11px;color:rgba(255,255,255,.85);font-weight:700">' +
              '<span>2026.04.01 ~ 2026.05.31</span>' +
              '<span style="padding:4px 11px;border-radius:999px;background:rgba(255,255,255,.22);border:1px solid rgba(255,255,255,.35)">진행중</span>' +
            '</div>' +
          '</div>' +
        '</div>' +
      '</div>' +

      /* Timeline */
      '<div>' +
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:32px">' +
          '<div style="height:1px;flex:1;background:linear-gradient(90deg,transparent,rgba(12,30,90,.18),transparent)"></div>' +
          '<div style="font-size:10px;letter-spacing:.24em;font-weight:900;color:' + SUB + '">TIMELINE · 최근 공지</div>' +
          '<div style="height:1px;flex:1;background:linear-gradient(90deg,transparent,rgba(12,30,90,.18),transparent)"></div>' +
        '</div>' +
        '<div style="position:relative;padding-left:36px">' +
          '<div style="position:absolute;left:11px;top:8px;bottom:8px;width:2px;background:linear-gradient(180deg,' + BRAND + ',rgba(30,64,175,.25),transparent)"></div>' +
          '<div style="display:flex;flex-direction:column;gap:20px">' +
            items.map(timelineItem).join('') +
          '</div>' +
        '</div>' +
      '</div>' +

      /* Contact CTA */
      '<div style="margin-top:64px;border-radius:24px;background:linear-gradient(135deg,' + NAVY + ',' + BRAND + ');color:#fff;padding:36px 40px;display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:24px;box-shadow:0 24px 60px rgba(12,30,90,.22)">' +
        '<div>' +
          '<div style="font-size:10px;letter-spacing:.24em;font-weight:900;color:#93c5fd;margin-bottom:8px">CUSTOMER CENTER</div>' +
          '<h3 style="font-size:clamp(22px,3vw,30px);font-weight:900;letter-spacing:-.01em;margin:0">궁금한 점은 언제든 전화주세요</h3>' +
          /* 260804 취합본 r2 S2 — 운영시간 08:30~17:30.
             ★ 이 줄이 index_v6.html:2442 를 런타임에 덮는다(render() 가 .max-w-5xl 을 통째 교체)
               → 고정된 원본의 09:00 표기는 화면에 뜨지 않는다. 원본은 건드릴 필요가 없다. */
          '<p style="color:rgba(255,255,255,.65);font-size:14px;margin:8px 0 0">평일 08:30 ~ 17:30 / 토·일·공휴일 휴무</p>' +
        '</div>' +
        '<a href="tel:1588-9123" style="padding:16px 32px;border-radius:999px;background:#fff;color:' + NAVY + ';font-weight:900;font-size:18px;text-decoration:none;box-shadow:0 12px 30px rgba(0,0,0,.18);white-space:nowrap">📞 1588-9123</a>' +
      '</div>' +

    '</div>';
  }

  function render() {
    var page = document.getElementById('page-notice');
    if (!page) return;
    if (page.dataset.usungNotice === 'v1') return;
    var wrap = page.querySelector('.max-w-5xl') || page.firstElementChild;
    if (!wrap) return;
    var items = readTimeline();
    wrap.outerHTML = buildHTML(items);
    page.dataset.usungNotice = 'v1';
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

  // 소식으로 이동할 때마다 재적용(1회 렌더 후엔 dataset 가드로 no-op)
  if (typeof window.navigate === 'function' && !window.__noticeNavWrapped) {
    window.__noticeNavWrapped = true;
    var _nav = window.navigate;
    window.navigate = function (id) {
      var r = _nav.apply(this, arguments);
      if (id === 'notice') { setTimeout(render, 60); setTimeout(render, 400); }
      return r;
    };
  }
})();
