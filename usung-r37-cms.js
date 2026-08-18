/* usung-r37-cms.js — 관리자페이지에서 발행한 내용을 방문자 화면에 적용
 * 승연 지시「관리자페이지 배포해서 cms까지 걸어줘」
 *
 * ── 왜 오버레이로 하나 ────────────────────────────────────────────────
 *   index_v6.html:5608 의 loadCmsContent() 는 **localStorage 만** 읽는다.
 *   그래서 관리자가 고쳐도 방문자에게는 안 보였다. index_v6.html 은 frozen 이라
 *   그 함수를 못 고친다 → /api/cms 를 읽어 같은 일을 하는 오버레이를 덧댄다.
 *   이 파일은 defer 라 인라인 로더보다 **늦게** 돈다 = 서버 값이 로컬 값을 이긴다. 의도된 순서다.
 *
 * ── ★ 한국어일 때만 적용한다 ──────────────────────────────────────────
 *   CMS 로 새로 넣은 문구는 5개국어 사전(__R16D, 현재 627행)에 당연히 없다.
 *   언어 무관하게 적용하면 EN/JA/ZH/VI 화면에 한국어가 튀어나온다 —
 *   r34·r35·r36 으로 「EN 한글 잔존 0」 까지 만든 걸 관리자가 글 한 줄 고칠 때마다
 *   무너뜨리는 셈이다. 그래서 getLang()==='ko' 일 때만 적용하고,
 *   langchange 로 ko 에 돌아오면 다시 적용한다.
 *   (외국어 화면 문구 수정은 사전 등재가 필요한 별도 작업이다 — 승연에게 보고할 것)
 *
 * ── 실측으로 정한 SKIP ────────────────────────────────────────────────
 *   라이브에서 75개 [data-cms] 전부에 프로브 텍스트를 심고 3초 뒤 생존을 확인했다.
 *   되돌려진 건 **정확히 1개**: a_ceo_name.
 *   usung-r5-company.js:35 enforce() 가 100ms 인터벌로 회사명을 강제한다(법인명 정정 목적).
 *   여기서 CMS 가 맞서면 초당 10회 깜빡이는 싸움이 된다 → 건드리지 않는다.
 *
 *   ★★ r45(260818) g_title 추가 — 이유가 위와 다르다. **구조를 잃는다.**
 *   applyOne 은 아래처럼 textContent 로만 쓴다. 자식 요소가 있으면 통째로 사라진다.
 *   ★ 세는 기준은 index_v6.html 이 아니라 **브라우저에 그려진 DOM** 이다(오버레이가 다시 그린다).
 *     실측: 11개 페이지를 순회해 닿는 [data-cms] 는 75개, 그중 자식이 있는 건 **딱 1개**다.
 *     · g_title (kids=3) — <span>20년의 시공,</span><br/><span class="…bg-clip-text…">전국 곳곳에…</span>
 *       여긴 줄바꿈·들여쓰기가 섞인 여러 줄이라 실제 textContent 에 개행이 들어간다.
 *       기본값을 아무리 맞춰도 동등성 가드가 안 걸리고, 쓰는 순간 <br/> 와
 *       **그라데이션 span 이 사라지고 「전국 곳곳에 있습니다.」 가 통짜 글씨로 붙는다.**
 *       갤러리 히어로 제목이라 눈에 바로 띈다 → 아예 손대지 않는다.
 *     · a_ceo_p1 은 **DOM 에서 kids=0** 이다. 파일에는 <strong class="text-white">유성에이스</strong>
 *       가 있지만 오버레이가 그 문단을 통째로 다시 써서 평문이 된다. 즉 지킬 구조가 없다
 *       → SKIP 불필요. (예전 주석은 「<strong> 을 동등성 가드로 보존한다」고 적어놨는데
 *       그건 파일만 보고 쓴 것이라 틀렸다. 파일≠화면 — 이 프로젝트의 상시 함정이다.)
 *   ★ 관리자 화면에서 g_title 은 CMS_LIVE 밖이라 이미 「⚠ 미반영」로 뜬다 — 표시와 동작이 일치한다.
 *
 * ★ 되돌리기 = 이 파일 삭제 + api/inject.js 의 jsScript 링크 1줄 삭제.
 * ★ 미설정 상태(BOARD_TOKEN 등 없음)에서는 /api/cms 가 configured:false 를 주고
 *   이 파일은 아무것도 하지 않는다 — 라이브 화면이 오늘과 100% 동일하다.
 */
(function () {
  'use strict';

  var SKIP = { a_ceo_name: 1, g_title: 1 };   // 위 주석 참조 — 둘 다 실측 근거 있음
  var content = null;             // /api/cms 가 준 내용 (없으면 아무것도 안 한다)
  var timer = null;
  var applying = false;

  function lang() {
    try { return (typeof window.getLang === 'function') ? window.getLang() : 'ko'; }
    catch (e) { return 'ko'; }
  }

  function applyOne(el, val) {
    // index_v6.html:5621 과 같은 규약 — textContent 로만 넣는다(HTML 주입 없음).
    if (el.textContent === val) return false;   // ★ 같은 값이면 안 건드린다 = 옵저버 무한루프 차단
    el.textContent = val;
    return true;
  }

  function applyTel(val) {
    // index_v6.html 의 c_tel 처리와 같은 규칙: 1588 번호가 든 tel 링크만 바꾸고 📞 는 보존한다.
    var n = 0;
    var links = document.querySelectorAll('a[href^="tel:"]');
    for (var i = 0; i < links.length; i++) {
      var a = links[i];
      if ((a.getAttribute('href') || '').indexOf('1588') < 0) continue;
      var want = 'tel:' + String(val).replace(/[^0-9+]/g, '');
      if (a.getAttribute('href') !== want) { a.setAttribute('href', want); n++; }
      var txt = (a.textContent || '');
      var icon = txt.indexOf('📞') >= 0 ? '📞 ' : '';
      if (txt.replace(/📞/g, '').trim() !== String(val).trim()) { a.textContent = icon + val; n++; }
    }
    return n;
  }

  function apply() {
    if (!content || applying) return 0;
    if (lang() !== 'ko') return 0;           // ★ 외국어 화면은 건드리지 않는다
    applying = true;
    var changed = 0;
    try {
      var els = document.querySelectorAll('[data-cms]');
      for (var i = 0; i < els.length; i++) {
        var el = els[i];
        var k = el.getAttribute('data-cms');
        if (!k || SKIP[k]) continue;
        var v = content[k];
        if (v === undefined || v === null || v === '') continue;
        if (applyOne(el, v)) changed++;
      }
      if (content.c_tel) changed += applyTel(content.c_tel);
    } catch (e) { /* 화면을 죽이지 않는다 */ }
    applying = false;
    return changed;
  }

  function schedule() {
    if (timer) return;
    // i18n 엔진(160ms)과 같은 결의 디바운스. 값이 같으면 안 건드리므로 2회째엔 변경 0 으로 수렴한다.
    timer = setTimeout(function () { timer = null; apply(); }, 200);
  }

  function start() {
    apply();
    // SPA 라 navigate()·goCat() 이 섹션을 새로 그린다 → 그때마다 다시 적용해야 한다.
    try {
      var mo = new MutationObserver(schedule);
      mo.observe(document.body, { childList: true, subtree: true });
    } catch (e) { }
    // 옵저버가 못 잡는 초기 렌더 경합 보험 (usung-home.js 등 다른 오버레이가 늦게 도는 경우)
    [300, 900, 2000, 4000].forEach(function (ms) { setTimeout(apply, ms); });
    // 외국어로 갔다가 한국어로 돌아오면 i18n 이 원문을 복원한다 → 다시 덮어야 한다.
    document.addEventListener('langchange', function () { setTimeout(apply, 260); });
    window.__r37Cms = { apply: apply, content: function () { return content; } };
  }

  function boot() {
    fetch('/api/cms', { cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (j) {
        // 미설정이거나 내용이 비었으면 손대지 않는다 — 원문 그대로가 정답이다.
        if (!j || !j.configured || !j.content) return;
        var keys = Object.keys(j.content);
        if (!keys.length) return;
        content = j.content;
        start();
      })
      .catch(function () { /* API 실패로 홈페이지가 바뀌면 안 된다 */ });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }
})();
