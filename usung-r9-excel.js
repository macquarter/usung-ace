/* usung-r9-excel.js — 260729 회의록(엑셀) 미반영분 반영
 *   E2  회사소개 '문의하기' 폼 삭제 → 전화연결 안내로 대체
 *       (엑셀 2번: "회사소개 문의하기 기능 삭제 / 견적문의도 그냥 저희회사로 연락하라고
 *        떴으면 좋겠어요 / 무조건 전화연결로만 하기로함")
 *       진입로 7곳이 전부 navigate('about','inquiry-section') 이라, 앵커는 그대로 두고
 *       그 안의 내용물만 갈아끼운다 → 버튼 7개를 개별 배선할 필요가 없다.
 *   E4  시공갤러리 스타일 단위 '이 스타일로 견적문의하기' → 전화연결 CTA
 *       (엑셀 4번: "이스타일 제품보기 삭제 / 이스타일로 견적문의하기 → 전화연결")
 *       삭제만 되고 전화 CTA 로 대체되지 않은 상태였다.
 *
 * 원본 index_v6.html 불변. 런타임 오버레이만.
 * ★ data-i18n 이 붙은 문구는 언어 전환 때 원문으로 되돌아온다 → 원문은 CSS 로 숨기고
 *   대체 문구는 별도 노드로 심는다. 노드가 날아가면 MutationObserver 로 다시 붙인다.
 */
(function () {
  'use strict';
  if (window.__usungR9Excel) return;
  window.__usungR9Excel = true;

  var TEL = '1588-9123';
  var TEL_HREF = 'tel:1588-9123';
  var MOBILE = '010-8254-9229';
  var FAX = '(031) 952-1706';   // 푸터·챗봇 표기와 동일 형식
  // 260804 취합본 r2 S2 — 「평일 08:30 ~ 17:30 으로 변경」(빨간박스 x533-676 y359-398)
  // ★ r16 은 완전일치 조회라 usung-r16-i18n-i.js:41 의 ko 키도 같이 바꿔야 한다.
  //   안 바꾸면 en/ja/zh/vi 4개 언어에서 조용히 미번역으로 남는다(§3 r16 함정 3).
  var HOURS = '평일 08:30 ~ 17:30';

  /* ---------- CSS ---------- */
  function injectCss() {
    if (document.getElementById('usung-r9-excel-css')) return;
    var css = [
      /* E2 : 원본 폼·성공메시지·설명문 숨김 (노드는 남기고 화면에서만 제거) */
      '#inquiry-section > form#inquiry-form{display:none !important;}',
      '#inquiry-section > #inquiry-success{display:none !important;}',
      '#inquiry-section > p[data-i18n="about_contact_desc"]{display:none !important;}',
      /* E2 : 전화 안내 카드
         ★ theme-white.css 가 #page-about 배경을 흰색으로 바꿔놨다(실측 rgb(255,255,255)).
           원본 마크업의 text-white/50 만 보고 어두운 섹션이라 넘겨짚으면 흰 글씨가 된다. */
      '.r9tel{margin-top:8px;border-radius:20px;padding:32px 28px;' +
        'background:#f8fafc;border:1px solid #e2e8f0;}',
      '.r9tel-lead{font-size:17px;line-height:1.6;color:#475569;margin:0 0 22px;}',
      '.r9tel-main{display:inline-flex;align-items:center;gap:10px;text-decoration:none;' +
        'padding:18px 34px;border-radius:999px;font-weight:900;font-size:24px;letter-spacing:-.5px;' +
        'color:#fff;background:linear-gradient(135deg,#1e40af 0%,#2563eb 100%);' +
        'box-shadow:0 14px 34px rgba(37,99,235,.32);transition:transform .18s ease;}',
      '.r9tel-main:hover{transform:translateY(-2px);}',
      '.r9tel-rows{display:flex;flex-wrap:wrap;gap:10px 34px;margin:26px 0 0;}',
      '.r9tel-rows > div{display:flex;align-items:baseline;gap:10px;font-size:15px;}',
      '.r9tel-rows span{color:#94a3b8;font-size:13px;font-weight:700;letter-spacing:.04em;}',
      '.r9tel-rows b,.r9tel-rows a{color:#0f172a;font-weight:700;text-decoration:none;}',
      // S2 로 각주 줄을 지워 지금은 쓰이지 않는다. 「무료 실측 폐지인지 카드 정리인지」가
      // 미확정(잔여업무)이라 되살릴 때 한 줄만 되돌리면 되도록 규칙은 남겨 둔다.
      '.r9tel-note{margin:22px 0 0;font-size:14px;color:#64748b;}',
      '@media (max-width:600px){',
      '.r9tel{padding:26px 20px;}',
      '.r9tel-main{font-size:20px;padding:16px 26px;width:100%;justify-content:center;}',
      '.r9tel-rows{gap:10px 20px;}',
      '}',
      /* E4 : 갤러리 스타일 단위 전화 CTA — 260803) 카테고리 탭 행 안쪽 우측으로 이동.
         .gal-tabs 는 flex 라 마지막 자식으로 넣으면 마지막 탭 바로 오른쪽에 붙는다.
         탭 높이(padding 9/18 · 14.5px)에 맞춰 크기를 낮춘다. */
      '.r9gcta{display:inline-flex;margin:0;}',
      /* r47) 색은 usung-blue-standard 의 브랜드 블루(#2563EB→#3B82F6)를 그대로 쓴다.
         이전 시작색 #1e40af 는 네이비에 가까워 옆 탭(#1D4ED8)과 계열이 어긋났다. */
      '.r9gcta a{display:inline-flex;align-items:center;gap:9px;text-decoration:none;' +
        'padding:9px 18px;border-radius:999px;font-weight:800;font-size:14px;color:#fff;' +
        'line-height:1.25;' +
        'background:linear-gradient(135deg,#2563eb 0%,#3b82f6 100%);' +
        'box-shadow:0 6px 16px rgba(37,99,235,.28);transition:transform .18s ease;}',
      '.r9gcta a:hover{transform:translateY(-2px);}',
      /* 전화번호는 통째로 유지한다. 393px 에서 "1588-/9123" 처럼 낱글자가 끊기는 것을
         막는다(실측). */
      '.r9g-t{white-space:nowrap;}',
      /* r47) 라벨 줄이 사라져 남은 건 전화번호 한 줄뿐이다. 예전엔 좁은 화면에서 이걸
         감췄는데(라벨이 남아 있었으므로), 이제 감추면 빈 알약만 남는다. */
      '@media (max-width:600px){',
      '.r9gcta a{font-size:12.5px;padding:8px 13px;gap:0;}',
      '}'
    ].join('');
    var st = document.createElement('style');
    st.id = 'usung-r9-excel-css';
    st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  }

  /* ---------- E2 : 회사소개 문의 폼 → 전화연결 ---------- */
  function telCard() {
    var d = document.createElement('div');
    d.id = 'usung-r9-tel';
    d.className = 'r9tel';
    d.innerHTML =
      '<p class="r9tel-lead">별도의 문의 양식 없이 <b style="color:#0b1e4d">전화로 바로</b> 상담해 드립니다.<br>' +
      '견적 · 설치 · A/S 무엇이든 아래 번호로 연락 주세요.</p>' +
      '<a class="r9tel-main" href="' + TEL_HREF + '">📞 대표전화 ' + TEL + '</a>' +
      '<div class="r9tel-rows">' +
        '<div><span>휴대폰</span><a href="tel:' + MOBILE.replace(/-/g, '') + '">' + MOBILE + '</a></div>' +
        '<div><span>팩스</span><b>' + FAX + '</b></div>' +
        '<div><span>운영시간</span><b>' + HOURS + '</b></div>' +
      '</div>';
      /* 260804 취합본 r2 S2 — 「삭제」(빨간박스 x96-499 y398-437 = 이 각주 줄).
       * 지시 범위는 이 카드 한 곳이다 → chatbot.js 의 「현장 실측 무료」 문장 4곳은 손대지 않았다.
       * 「무료 실측을 그만둔다」는 사실 변경인지 카드 정리인지 PPT 만으로는 못 가른다 → 잔여업무로 올린다.
       * usung-r16-i18n-c.js:33 의 사전 행은 남겨 둔다(사문화된 키라 무해 · 되살릴 때 그대로 번역됨). */
    return d;
  }

  function applyAbout() {
    var sec = document.getElementById('inquiry-section');
    if (!sec) return false;
    if (!document.getElementById('usung-r9-tel')) {
      var form = document.getElementById('inquiry-form');
      // 폼 자리에 그대로 끼워 넣어야 제목 바로 아래에 온다.
      if (form && form.parentNode === sec) sec.insertBefore(telCard(), form);
      else sec.appendChild(telCard());
    }
    return true;
  }

  function observeAbout() {
    var sec = document.getElementById('inquiry-section');
    if (!sec || sec.__r9Observed) return;
    sec.__r9Observed = true;
    // 카드가 통째로 날아갔을 때만 되붙인다. 카드 내부는 건드리지 않으므로 되울리지 않는다.
    new MutationObserver(function () {
      if (!document.getElementById('usung-r9-tel')) applyAbout();
    }).observe(sec, { childList: true });
  }

  /* ---------- E4 : 갤러리 전화 CTA ----------
   * r47) 승연 지시로 앞줄 「원하는 스타일로 문의하기」를 뺐다. 남는 건 전화번호 한 줄뿐이라
   *   탭에 따라 문구가 바뀔 일이 없다 → 스타일명을 읽던 curStyle()/ctaLabel() 을 함께 지운다.
   *   같은 일을 하는 문구는 r42 전폭 카드(usung-r42.js galHead)에 그대로 살아 있다.
   * ★ CTA 가 #gal-tabs 안에 있어 관찰자(subtree:true)와 되울림이 생긴다. 내용이 고정이므로
   *   한 번 그린 앵커는 다시 건드리지 않는다. renderGalTabs() 가 탭을 통째로 갈아끼우면
   *   앵커도 함께 사라지고 applyGallery() 가 새 노드를 만들므로 플래그도 같이 초기화된다. */
  function paintCta() {
    var a = document.querySelector('#usung-r9-gal-cta a');
    if (!a || a.__r9Painted) return;
    a.__r9Painted = 1;
    a.innerHTML = '<span class="r9g-t">대표전화 ' + TEL + ' &rarr;</span>';
  }

  function applyGallery() {
    var tabs = document.getElementById('gal-tabs');
    if (!tabs || !tabs.parentNode) return false;
    // 260803) 탭 행 바깥의 가운데 블록 → 탭 행 안쪽 마지막 자식(= 마지막 탭 우측).
    //   renderGalTabs() 가 innerHTML 을 통째로 갈아끼우면 같이 지워지므로,
    //   관찰자가 매번 되붙인다(observeGallery).
    var w = document.getElementById('usung-r9-gal-cta');
    if (!w) {
      w = document.createElement('div');
      w.id = 'usung-r9-gal-cta';
      w.className = 'r9gcta';
      w.innerHTML = '<a href="' + TEL_HREF + '"></a>';
    }
    if (w.parentNode !== tabs) tabs.appendChild(w);
    paintCta();
    return true;
  }

  function observeGallery() {
    var tabs = document.getElementById('gal-tabs');
    if (!tabs || tabs.__r9Observed) return;
    tabs.__r9Observed = true;
    // ★ renderGalTabs() 는 #gal-tabs.innerHTML 을 통째로 갈아끼운다(usung-r8-gal.js).
    //   버튼이 새로 생기므로 class 속성 변경이 일어나지 않는다 → childList 도 함께 봐야 한다.
    //   CTA 도 함께 지워지므로 되붙인다. paintCta() 의 라벨 비교가 되울림을 끊는다.
    new MutationObserver(function () { applyGallery(); })
      .observe(tabs, { childList: true, attributes: true, attributeFilter: ['class'], subtree: true });
    var host = tabs.parentNode;
    if (host && !host.__r9Observed) {
      host.__r9Observed = true;
      new MutationObserver(function () {
        // 뷰가 통째로 다시 그려지면 #gal-tabs 노드 자체가 바뀌므로 관찰도 다시 건다.
        if (!document.getElementById('usung-r9-gal-cta')) applyGallery();
        observeGallery();
      }).observe(host, { childList: true });
    }
  }

  /* ---------- 마운트 ----------
   * 회사소개는 원본 HTML 이라 처음부터 있지만, 갤러리는 usung-r8-mount.js 가 늦게
   * 심는다(UP_DATA 대기로 최대 6초). 둘 다 붙을 때까지 짧게 재시도한다. */
  function run() {
    injectCss();
    var t = 0;
    (function tick() {
      t++;
      var a = applyAbout();
      var g = applyGallery();
      if (a) observeAbout();
      if (g) observeGallery();
      if ((!a || !g) && t < 120) setTimeout(tick, 100);
    })();
  }

  try { run(); } catch (e) {}
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', function () { try { run(); } catch (e) {} });
  }
})();
