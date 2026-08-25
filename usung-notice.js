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
 * r52 — build-marker: r52-b2. 승연 「더미값이면 당연히 없는게 맞아」 →
 *   고정카드 2건 삭제 + 타임라인 더미 7건 날짜로 필터. 근거는 DUMMY_DATES 주석.
 *
 * r58 — build-marker: r58-b1. 승연 「A로 가자」(공지 발행 경로를 오늘 만든다) →
 *   /api/notice 를 단일 진실로 삼는다. 세 가지가 한꺼번에 풀린다:
 *     R1  관리자 공지가 **자기 브라우저에서만** 사이트에 보이던 환상 제거
 *     D3  비동기 fetch 뒤 재렌더 불가(1회 가드) → 내용 지문 가드로 교체
 *     D4  프로즌 병합분과 서버분이 겹쳐 두 번 뜨는 문제 → 서버가 있으면 프로즌 잔여분 폐기
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
   * ★ 제목이 아니라 **날짜**로 거른다.
   *   ★★ 8/24 정정 — 예전에 여기 「usung-r16-i18n-i.js:71-74 가 이 제목들을 5개 국어로
   *   번역하므로 한국어 필터는 외국어 화면에서 샌다」고 적어 놨는데 **그건 내 오기다**.
   *   실측: 이 7개 제목은 i18n.js 에 0건, 전체 .js 에서 이 파일 외 0건이고,
   *   근거로 댄 usung-r16-i18n-i.js:71-74 는 **게시판 표 머리글**(분류/제목/등록일)이었다.
   *   날짜로 거른다는 **선택은 여전히 옳다** — 날짜는 어느 언어에서도 안 변하고,
   *   새 공지는 날짜가 달라 그대로 통과한다. 하지만 **이유가 틀렸으니 이 메모를
   *   근거로 다음 설계를 세우지 말 것.**
   * ★ 하드코딩 목록은 원래 썩는다(KNOWLEDGE 41). 여기만 예외인 이유 —
   *   출처인 index_v6.html 이 frozen 이라 이 7건은 영원히 늘지도 줄지도 않는다.
   * ★ r58 이전엔 「결과 0건이 정상」이었다. 공지에 서버 발행 경로가 없었기 때문이다.
   *   r58 이 /api/notice 를 열면서 그 전제가 끝났다 — 아래 pullServer() 참조. */
  var DUMMY_DATES = {
    '2026.04.05': 1,  // 2026 제품 카탈로그 v6 배포 안내
    '2026.03.28': 1,  // 태엽감속기 빠찌링 정품 교체 캠페인
    '2026.03.20': 1,  // 파주 본사 주차장 확장 공사 안내
    '2026.03.12': 1,  // 시공후기 리뷰 이벤트 — 스타벅스 기프티콘
    '2026.02.28': 1,  // F.V.D 방화담파 2세대 정식 출시
    '2026.02.15': 1,  // 설 연휴 기간 긴급 A/S 접수 안내
    '2026.01.20': 1   // 유성에이스 공식 블로그 리뉴얼 완료
  };

  /* ── 프로즌 타임라인 읽기 ────────────────────────────────────────────
   * ★★ r58 — 이 함수는 **한 번만** 유효하다. render() 가 .max-w-5xl 을 통째로 갈아치우면
   *   #notice-timeline 자체가 사라지기 때문이다. 그런데 서버 fetch 는 비동기라 그 뒤에 온다.
   *   → 읽은 결과를 캐시해 둬야 재렌더가 가능하다(캐시 없이는 두 번째 렌더가 항상 0건).
   *   이게 납품 점검 때 「D3 재렌더 불가」로 잡아 둔 그 문제다. */
  var frozenCache = null;
  function readTimeline() {
    if (frozenCache) return frozenCache;
    var el = document.getElementById('notice-timeline');
    if (!el || !el.children || !el.children.length) return [];   // 아직 안 그려졌다 → 캐시하지 않는다
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
    frozenCache = out;
    return out;
  }

  /* ── 서버 공지 (r58) ─────────────────────────────────────────────────
   * ★★★ 왜 서버가 「단일 진실」이어야 하는가 — 납품 점검에서 나온 최대 리스크(R1).
   *   index_v6.html:3635-3652(frozen)은 localStorage['usung-cms-state-v2'].boards.notice 를
   *   읽어 #notice-timeline 에 병합한다. 관리자와 사이트가 **같은 오리진**이라,
   *   고객이 관리자에서 공지를 쓰면 그 글이 **자기 브라우저에서만** 사이트에 보인다.
   *   남에게는 안 보인다 → 시연은 성공처럼 보이고 실제로는 실패한다.
   *
   *   그래서 /api/notice 가 configured 면 **프로즌 타임라인 잔여분을 통째로 버린다**.
   *   ★ 버려도 되는 근거: index_v6 의 defaultNoticeItems 7건은 DUMMY_DATES 로 이미
   *     걸러진다. 즉 **필터 후 남은 행은 전부 localStorage 출신**이다 — 그게 바로 저 환상이다.
   *   이 한 줄이 R1(환상)과 D4(중복 노출)를 동시에 없앤다.
   *
   * ★ 서버가 미설정(configured:false)이거나 fetch 가 실패하면 예전 동작 그대로 남는다.
   *   납품 전 환경변수가 빠져도 공지 페이지가 깨지지 않는다는 뜻이다. */
  var server = null;          // null = 아직 모름 / {configured, posts}
  var pad2 = function (n) { return n < 10 ? '0' + n : '' + n; };

  function toItem(p) {
    var d = new Date(Number(p.createdAt) || Date.now());
    var body = String(p.body == null ? '' : p.body);
    return {
      date: d.getFullYear() + '.' + pad2(d.getMonth() + 1) + '.' + pad2(d.getDate()),
      tag: p.cat || '공지',
      title: p.title || '',
      excerpt: body.length > 100 ? body.slice(0, 100) + '…' : body,
      pin: !!p.pin,
      ts: Number(p.createdAt) || 0
    };
  }

  function serverItems() {
    var posts = (server && server.posts) || [];
    return posts.map(toItem).sort(function (a, b) {
      if (a.pin !== b.pin) return a.pin ? -1 : 1;   // 상단고정 먼저
      return b.ts - a.ts;                            // 그다음 최신순
    });
  }

  function pullServer() {
    if (!window.fetch) return;
    fetch('/api/notice', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        if (!j || !j.configured || !Array.isArray(j.posts)) return;
        server = { configured: true, posts: j.posts };
        render(true);   // ★ fetch 는 첫 렌더 뒤에 온다 → 강제 재렌더가 반드시 필요하다
      })
      .catch(function () {});
  }

  // 화면에 그릴 최종 목록
  function resolveItems() {
    var frozen = readTimeline();
    return (server && server.configured) ? serverItems() : frozen;
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

  /* ★ r58 — 가드를 「1회만」에서 「같은 내용이면 건너뛴다」로 바꿨다.
   *   예전 가드(dataset==='v1' 이면 return)는 서버 fetch 가 도착해도 재렌더를 막았다.
   *   그렇다고 가드를 없애면 setTimeout 3연발 + navigate 훅이 매번 DOM 을 갈아엎는다.
   *   → 그릴 내용의 지문(stamp)을 비교한다. 같으면 no-op, 달라졌을 때만 다시 그린다. */
  function stamp(items) {
    return items.length + '|' + items.map(function (n) { return n.date + n.title; }).join('|');
  }

  function render(force) {
    var page = document.getElementById('page-notice');
    if (!page) return;
    var items = resolveItems();
    var sig = stamp(items);
    if (!force && page.dataset.usungNotice === sig) return;
    var wrap = page.querySelector('.max-w-5xl') || page.firstElementChild;
    if (!wrap) return;
    wrap.outerHTML = buildHTML(items);
    page.dataset.usungNotice = sig;
  }

  function boot() {
    pullServer();          // 비동기 — 도착하면 스스로 render(true) 한다
    render();
    // ★ setTimeout(render, …) 로 넘기지 않는다 — render 가 이제 인자(force)를 받는다.
    //   타이머가 인자를 넘기는 구현이면 조용히 force 로 돌아간다. 감싸서 인자를 끊는다.
    setTimeout(function () { render(); }, 300);
    setTimeout(function () { render(); }, 1200);
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
      if (id === 'notice') {
        setTimeout(function () { render(); }, 60);
        setTimeout(function () { render(); }, 400);
      }
      return r;
    };
  }
})();
