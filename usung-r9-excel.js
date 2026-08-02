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
  var HOURS = '평일 09:00 ~ 18:00';

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
      '.r9tel-note{margin:22px 0 0;font-size:14px;color:#64748b;}',
      '@media (max-width:600px){',
      '.r9tel{padding:26px 20px;}',
      '.r9tel-main{font-size:20px;padding:16px 26px;width:100%;justify-content:center;}',
      '.r9tel-rows{gap:10px 20px;}',
      '}',
      /* E4 : 갤러리 스타일 단위 전화 CTA */
      '.r9gcta{display:flex;justify-content:center;margin:22px 0 4px;}',
      '.r9gcta a{display:inline-flex;align-items:center;gap:10px;text-decoration:none;' +
        'padding:14px 28px;border-radius:999px;font-weight:800;font-size:15px;color:#fff;' +
        'background:linear-gradient(135deg,#1e40af 0%,#2563eb 100%);' +
        'box-shadow:0 10px 26px rgba(37,99,235,.28);transition:transform .18s ease;}',
      '.r9gcta a:hover{transform:translateY(-2px);}',
      '@media (max-width:600px){.r9gcta a{font-size:14px;padding:13px 20px;}}'
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
      '</div>' +
      '<p class="r9tel-note">현장 실측은 전국 어디든 무료입니다. 매장 주소와 평수만 알려주세요.</p>';
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

  /* ---------- E4 : 갤러리 스타일 단위 전화 CTA ---------- */
  function curStyle() {
    var on = document.querySelector('#gal-tabs .gal-tab.on');
    if (!on) return '';
    // 버튼 라벨은 "클래식 26" 처럼 개수가 붙는다 → 숫자를 걷어낸다.
    return (on.textContent || '').replace(/[\d\s]+$/, '').trim();
  }

  function ctaLabel() {
    var s = curStyle();
    if (!s || s === '전체') return '원하는 스타일로 문의하기';
    return '‘' + s + '’ 스타일로 문의하기';
  }

  function paintCta() {
    var a = document.querySelector('#usung-r9-gal-cta a');
    if (a) a.innerHTML = '<span>' + ctaLabel() + '</span> · 대표전화 ' + TEL + ' <b>&rarr;</b>';
  }

  function applyGallery() {
    var tabs = document.getElementById('gal-tabs');
    if (!tabs || !tabs.parentNode) return false;
    if (!document.getElementById('usung-r9-gal-cta')) {
      var w = document.createElement('div');
      w.id = 'usung-r9-gal-cta';
      w.className = 'r9gcta';
      w.innerHTML = '<a href="' + TEL_HREF + '"></a>';
      tabs.parentNode.insertBefore(w, tabs.nextSibling);
    }
    paintCta();
    return true;
  }

  function observeGallery() {
    var tabs = document.getElementById('gal-tabs');
    if (!tabs || tabs.__r9Observed) return;
    tabs.__r9Observed = true;
    // 탭 활성 클래스가 바뀌면 라벨을 따라간다. CTA 는 형제라 되울림이 없다.
    new MutationObserver(function () { paintCta(); })
      .observe(tabs, { attributes: true, attributeFilter: ['class'], subtree: true });
    var host = tabs.parentNode;
    if (host && !host.__r9Observed) {
      host.__r9Observed = true;
      new MutationObserver(function () {
        if (!document.getElementById('usung-r9-gal-cta')) applyGallery();
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
