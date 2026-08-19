/* usung-notice.js — 유성에이스 소식(page-notice) 톤앤매너 리디자인 (슬라이드: 소식)
 * 요구: "유성에이스 소식 톤앤매너 맞게 리디자인 해줘."
 *   원본은 빨강/주황 그라디언트 고정카드 + 빨강 타임라인 점/라인 + 검정 CTA(빨강 라벨)로
 *   사이트의 화이트+네이비(#0c1e5a)/블루(#1e40af) 톤과 충돌.
 *   → 전체를 네이비/블루 + 화이트 톤으로 재구성. 콘텐츠(고정 2카드·타임라인·전화 CTA)는 모두 보존.
 * 방식: page-notice 내부(.max-w-5xl)를 통째로 인라인 스타일 마크업으로 교체(usung-manual.js와 동일 패턴,
 *   theme-white.css 특이도 싸움 원천 차단). 타임라인 항목은 원본 인라인 스크립트가 이미 렌더한
 *   #notice-timeline에서 그대로 추출(→ CMS로 추가된 공지도 보존). 원본 index_v6.html 불변.
 * 되돌리기: inject.js(api/inject.js)의 usung-notice.js 주입 1줄 제거.
 *
 * r52 — build-marker: r52-b1. 승연 「더미값이면 당연히 없는게 맞아」 →
 *   고정카드 2건 삭제 + 타임라인 더미 7건 날짜로 필터. 근거는 DUMMY_DATES 주석.
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

  /* ── r52: 더미 공지 퇴출 ──────────────────────────────────────────────
   * 승연 「사이트 공지 9건 … 더미값이면 당연히 없는게 맞아」.
   * 화면의 9건 = 고정카드 2 + 타임라인 7. 고정카드 2는 아래 buildHTML 에서 삭제했고,
   * 타임라인 7은 index_v6.html:3629 의 인라인 배열이 #notice-timeline 에 그린 것을
   * 여기서 되읽는 구조라 「지울 원본」이 이 파일에 없다 → 읽은 뒤 걸러낸다.
   *
   * ★ 제목이 아니라 **날짜**로 거른다. usung-r16-i18n-i.js:71-74 가 이 제목들을
   *   5개 국어로 번역하므로, 한국어 제목으로 건 필터는 외국어 화면에서 통째로 샌다.
   *   날짜 문자열(2026.04.05)은 사전에 없어 어느 언어에서도 그대로다.
   * ★ 하드코딩 목록은 원래 썩는다(KNOWLEDGE 41). 여기만 예외인 이유 —
   *   출처인 index_v6.html 이 frozen 이라 이 7건은 영원히 늘지도 줄지도 않는다.
   *   반대로 CMS·게시판으로 **새로 들어온 공지는 날짜가 달라 그대로 통과**한다.
   * ★ 결과가 0건인 게 정상이다. 공지는 서버 발행 경로가 없다(KNOWLEDGE 48-a). */
  var DUMMY_DATES = {
    '2026.04.05': 1,  // 2026 제품 카탈로그 v6 배포 안내
    '2026.03.28': 1,  // 태엽감속기 빠찌링 정품 교체 캠페인
    '2026.03.20': 1,  // 파주 본사 주차장 확장 공사 안내
    '2026.03.12': 1,  // 시공후기 리뷰 이벤트 — 스타벅스 기프티콘
    '2026.02.28': 1,  // F.V.D 방화담파 2세대 정식 출시
    '2026.02.15': 1,  // 설 연휴 기간 긴급 A/S 접수 안내
    '2026.01.20': 1   // 유성에이스 공식 블로그 리뉴얼 완료
  };

  // 이미 렌더된 #notice-timeline에서 항목 추출 → 더미 제외(없으면 빈 배열)
  function readTimeline() {
    var el = document.getElementById('notice-timeline');
    if (!el || !el.children || !el.children.length) return [];
    var out = [];
    var rows = el.children;
    for (var i = 0; i < rows.length; i++) {
      var r = rows[i];
      var spans = r.querySelectorAll('span');
      var h4 = r.querySelector('h4');
      var p = r.querySelector('p');
      var date = spans[0] ? spans[0].textContent.trim() : '';
      if (DUMMY_DATES[date]) continue;
      out.push({
        date: date,
        tag: spans[1] ? spans[1].textContent.trim() : '공지',
        title: h4 ? h4.textContent.trim() : '',
        excerpt: p ? p.textContent.trim() : ''
      });
    }
    return out;
  }

  /* 공지 0건일 때 — 타임라인 자리를 빈 채로 두지 않는다
   * ★ 여기 문구는 반드시 **한 요소에 텍스트 노드 하나**로 둔다. <br> 로 두 줄을 이으면
   *   usung-r16-i18n.js 의 applyHtml() 이 innerHTML 통째로 매칭하는 경로에 걸려
   *   `…표시됩니다.<br>급한…` 이라는 키를 찾게 되고, 텍스트 노드 경로에도 안 맞아
   *   **영문 화면에서 이 블록만 한국어로 남는다**(프리뷰 실측으로 잡았다).
   *   사전 3줄은 usung-r16-i18n-i.js 「r52」 주석 자리에 있다. */
  function emptyState() {
    return '<div style="border-radius:20px;border:1px dashed rgba(12,30,90,.18);background:rgba(12,30,90,.02);padding:44px 24px;text-align:center">' +
      '<div style="font-size:26px;line-height:1;margin-bottom:14px">📭</div>' +
      '<div style="font-size:15px;font-weight:800;color:' + INK + ';margin-bottom:8px">등록된 공지가 없습니다</div>' +
      '<p style="font-size:13.5px;color:' + SUB + ';line-height:1.7;margin:0">새로운 소식이 등록되면 이곳에 표시됩니다.</p>' +
      '<p style="font-size:13.5px;color:' + SUB + ';line-height:1.7;margin:2px 0 0">급한 문의는 아래 대표전화로 연락해 주세요.</p>' +
    '</div>';
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

      /* ★ r52 — 고정카드 2건(「2026 설 연휴 A/S 운영 안내」·「창립 기념 감사 프로모션」) 삭제.
       *   둘 다 이 파일에 하드코딩된 더미였다. 날짜(2026.02.10 / 05.31)가 이미 지난 데다
       *   실제 운영 정보가 아니라 고객이 그대로 믿으면 오히려 위험하다. */

      /* Timeline */
      '<div>' +
        '<div style="display:flex;align-items:center;gap:12px;margin-bottom:32px">' +
          '<div style="height:1px;flex:1;background:linear-gradient(90deg,transparent,rgba(12,30,90,.18),transparent)"></div>' +
          '<div style="font-size:10px;letter-spacing:.24em;font-weight:900;color:' + SUB + '">TIMELINE · 최근 공지</div>' +
          '<div style="height:1px;flex:1;background:linear-gradient(90deg,transparent,rgba(12,30,90,.18),transparent)"></div>' +
        '</div>' +
        (items.length
          /* 공지가 있을 때만 세로 레일(점·선)을 그린다. 0건이면 레일만 남아 흉하다. */
          ? '<div style="position:relative;padding-left:36px">' +
              '<div style="position:absolute;left:11px;top:8px;bottom:8px;width:2px;background:linear-gradient(180deg,' + BRAND + ',rgba(30,64,175,.25),transparent)"></div>' +
              '<div style="display:flex;flex-direction:column;gap:20px">' +
                items.map(timelineItem).join('') +
              '</div>' +
            '</div>'
          : emptyState()) +
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
