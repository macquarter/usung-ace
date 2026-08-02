/* usung-r5-fixes.js — r5 반영 (S2·S10·S16·S27)
 *  S2  홈 WHERE WE WORK "USE CASE" 3카드 링크 변경
 *        01 → 제품소개 · 파이프(스텐도금)
 *        02 → 제품소개 · LED조명
 *        03 → 제품소개 · 후레쉬볼(갓 자바라)
 *      (r5 슬라이드2: "연결되는 링크 변경 / 3.파이프스텐도금 / 2.LED조명 / 4.후레쉬볼 갓 자바라")
 *  S10 문의 페이지 '문의유형' <select> 옵션이 어두워 글씨가 안 보임 → 밝게(흰 배경·검정 글씨)
 *  S16 제품 상세 '색상·마감' 스와치가 너무 작음 → 약 2.5배 확대(64→160px) + 라벨 가독
 *  S27 이미지 복사/다른이름 저장/드래그 방지(불펌 방지 — 캐주얼 차단 수준)
 * 원본 index_v6.html 불변. 런타임 오버레이만. 되돌리기: inject.js 1줄 제거 + 파일 삭제.
 */
(function () {
  'use strict';
  if (window.__usungR5Fixes) return;
  window.__usungR5Fixes = true;

  /* ---------- S10 + S16 + S27(드래그) CSS ---------- */
  function injectCss() {
    if (document.getElementById('usung-r5-fixes-css')) return;
    var css = [
      /* S10 : 문의유형 select 옵션 밝게 (인라인 background:#1a1a2e 를 !important 로 덮어씀) */
      '#inq-type option{background:#ffffff !important;color:#111827 !important;}',
      /* S16 : 색상·마감 스와치 ~2.5배 확대 (기본 w-[64px] → 160px) + 라벨 전체 노출 */
      '#up-main .upd-sw{width:160px !important;padding:10px !important;}',
      '#up-main .upd-sw > span:last-child{font-size:14px !important;line-height:1.3 !important;' +
        'white-space:normal !important;overflow:visible !important;text-overflow:clip !important;margin-top:8px !important;}',
      /* S27 : 이미지 드래그 방지 */
      'img{-webkit-user-drag:none !important;-khtml-user-drag:none !important;-moz-user-drag:none !important;user-drag:none !important;}'
    ].join('');
    var st = document.createElement('style');
    st.id = 'usung-r5-fixes-css';
    st.textContent = css;
    (document.head || document.documentElement).appendChild(st);
  }

  /* ---------- S27 : 우클릭 복사·저장 / 드래그 방지 (이미지 한정) ---------- */
  function guardImages() {
    if (window.__usungImgGuard) return;
    window.__usungImgGuard = true;
    try {
      document.addEventListener('contextmenu', function (e) {
        if (e.target && e.target.tagName === 'IMG') e.preventDefault();
      }, true);
      document.addEventListener('dragstart', function (e) {
        if (e.target && e.target.tagName === 'IMG') e.preventDefault();
      }, true);
    } catch (e) {}
  }

  /* ---------- S2 : USE CASE 카드 라우팅 ---------- */
  // 대분류 필터 후 특정 중분류(section) 헤더로 즉시 스크롤.
  // 성공 시 해당 섹션 엘리먼트를 반환(호출측이 착지 위치를 검증하도록), 실패 시 false.
  function scrollToSec(label) {
    var pg = document.getElementById('page-products');
    if (!pg) return false;
    var secs = pg.querySelectorAll('[id^="up-sec-"]');
    for (var i = 0; i < secs.length; i++) {
      var sp = secs[i].querySelector('span');
      if (sp && (sp.textContent || '').trim() === label) {
        var y = secs[i].getBoundingClientRect().top + window.scrollY - 100;
        // behavior:'auto'(즉시) — smooth 는 직후 재렌더/upScrollTop 에 의해 중단됨
        window.scrollTo({ top: Math.max(0, y), behavior: 'auto' });
        return secs[i];
      }
    }
    return false;
  }

  /* ★ r8 이식 후 경로 변경 (2026-08-02)
   * 원래는 filterProducts()+up-sec-* 로 갔으나, r8 이식 이후 그 마크업은 통째로
   * .r8-original(display:none) 안으로 들어갔다. 필터도 스크롤도 숨은 DOM 에서만 일어나
   * 클릭해도 겉보기엔 아무 일도 안 하는 상태였다(라이브 실측: page-products/v-main/scrollY=0).
   * → r8 의 goCat(대분류) + scrollMid(중분류) 로 재배선한다.
   * 타이밍: usung-r8-mount.js 의 navigate 래퍼가 +60ms 뒤 syncFromPage(true)→goMain() 으로
   * v-main 을 강제하므로, 그보다 늦게 goCat 을 걸고 짧게 재확인해야 한다. */
  function r8Ready() {
    return typeof window.goCat === 'function' && !!document.getElementById('cv-tree');
  }
  // usung-r8-mount.js 의 gate() 와 같은 판정. 이식이 켜져 있다면 goCat 은 '늦게 뜰 뿐 반드시 뜬다'
  // → 준비를 기다리다 시간이 다 됐다고 legacy 로 빠지면 안 된다(legacy 마크업은 숨어 있어 무반응).
  function r8Off() {
    try {
      if (/[?&]r8=0\b/.test(location.search)) return true;
      if (/[?&]r8=1\b/.test(location.search)) return false;
      return localStorage.getItem('usungR8') === '0';
    } catch (e) { return /[?&]r8=0\b/.test(location.search); }
  }
  // 중분류 착지 — smooth 는 goCat 의 scrollTo(0,0)·재렌더에 끊기므로 즉시 스크롤 후
  // 실제로 상단 ~90px 에 놓일 때까지 재시도한다(최대 ~2.6s).
  var landSeq = 0;
  function landMid(md) {
    var my = ++landSeq, m = 0;
    (function tryMid() {
      if (my !== landSeq) return;     // 뷰가 다시 그려져 새 요청이 왔으면 이 루프는 폐기
      m++;
      var el = document.getElementById('mid-' + md);
      var ok = false;
      if (el) {
        var y = el.getBoundingClientRect().top + window.scrollY - 90;
        window.scrollTo({ top: Math.max(0, y), behavior: 'auto' });
        var t = el.getBoundingClientRect().top;
        ok = (t >= 55 && t <= 135);
      }
      if (!ok && m < 22) setTimeout(tryMid, 120);
    })();
  }

  /* ★ 감시는 길게 가져가야 한다(2026-08-02 실측).
   * usung-r8-mount.js 는 UP_DATA 가 늦게 오면 최대 6초까지 100ms 간격으로 boot 를
   * 재시도하고, boot 성공 시 syncFromPage() → goMain() 으로 v-main 을 켠다.
   * 짧게 감시하면 그 늦은 goMain 에 v-cat 이 덮여 클릭이 무위로 끝난다.
   * v-cat 이 꺼질 때마다 goCat 을 다시 걸고, 다시 켜지면 스크롤도 다시 잡는다. */
  function r8Route(cat, mid) {
    var t = 0, placed = false, stable = 0;
    (function settle() {
      t++;
      var v = document.getElementById('v-cat');
      var pg = document.getElementById('page-products');
      if (pg && pg.classList.contains('active') && r8Ready()) {
        if (!v || !v.classList.contains('on')) {
          try { window.goCat(cat); } catch (e) {}
          placed = false; stable = 0;
        } else if (!placed) {
          placed = true; stable = 0;
          if (mid) setTimeout(function () { landMid(mid); }, 120);
        } else {
          stable++;
        }
      }
      // 자리를 잡고 1.5초간 흔들리지 않으면 손을 뗀다. 계속 붙잡고 있으면 사용자가
      // 직접 '목록으로' 를 눌러 빠져나가려는 것까지 되돌려 버린다.
      if (stable < 14 && t < 60) setTimeout(settle, 110);
    })();
  }

  function routeUseCase(cat, sec) {
    try { if (typeof window.navigate === 'function') window.navigate('products'); } catch (e) {}
    // ★ legacy 로 빠질지는 '시간'이 아니라 '비상구가 켜졌는지'로 갈라야 한다(2026-08-02 실측).
    // 393px iframe 에서 r8 준비까지 7.3초가 걸렸는데 대기 상한이 2.5초라, 이식이 멀쩡히
    // 켜져 있는데도 legacy 로 새어 무반응으로 끝났다(legacy 마크업은 .r8-original 안에 숨어 있다).
    if (r8Off()) { legacyRoute(cat, sec); return; }
    var w = 0;
    (function waitR8() {
      w++;
      if (r8Ready()) { r8Route(cat, sec); return; }
      if (w < 150) setTimeout(waitR8, 100);
    })();
  }

  function legacyRoute(cat, sec) {
    var tries = 0;
    (function attempt() {
      tries++;
      if (typeof window.filterProducts !== 'function' || !document.getElementById('page-products')) {
        if (tries < 25) setTimeout(attempt, 100);
        return;
      }
      try { window.filterProducts(cat); } catch (e) {}   // 대분류 필터(1회)
      if (sec) {
        // 렌더 완료·늦은 upScrollTop/재렌더에도 흔들리지 않도록,
        // 섹션이 실제로 상단 ~100px 에 착지할 때까지 매번 재스크롤(최대 ~2.6s).
        var m = 0;
        (function trySec() {
          m++;
          var el = scrollToSec(sec);
          var landed = false;
          if (el) {
            var t = el.getBoundingClientRect().top;   // 착지 후 뷰포트 기준 위치
            landed = (t >= 55 && t <= 145);
          }
          if (!landed && m < 22) setTimeout(trySec, 120);
        })();
      }
    })();
  }

  // PPT「메인페이지,고객센터」slide2 의 번호는 제품소개 사이드바 순번이다.
  // 1.갤럭시 2.LED조명 3.파이프 4.후레쉬볼 5.하향식후드 (라이브 실측과 일치)
  // case1 의 '스텐도금' 은 260729 회의록 3-4 로 파이프 중분류가 구동(양옆태엽/텐션/
  // 내부태엽/기타옵션) 기준으로 바뀌면서 마감(grp)으로 내려가 스크롤 대상이 없다 → 대분류까지만.
  var CASES = {
    www_case1_btn: ['파이프', null],
    www_case2_btn: ['LED조명', null],
    www_case3_btn: ['후레쉬볼', '후레쉬볼 갓 자바라']
  };

  /* ★ 버튼마다 리스너를 붙이면 안 된다(2026-08-02 실측).
   * 홈 섹션이 재렌더되면 인라인 onclick 을 그대로 단 새 버튼으로 갈리는데, 재바인딩까지
   * 빈틈이 생긴다. 그 틈에 눌리면 원본 onclick 의 filterProducts 로 가고, 그 마크업은
   * .r8-original(display:none) 안이라 아무 일도 안 일어난다.
   * 게다가 원본 인자는 구 매핑(case2='파이프')이라 살려 쓸 수도 없다.
   * document 캡처 단계에서 가로채면 새로 그려진 버튼도 그대로 잡히고,
   * stopPropagation 이 타깃 단계의 인라인 onclick 자체를 막는다. */
  function bindDelegate() {
    if (window.__r5ucDelegated) return;
    window.__r5ucDelegated = true;
    document.addEventListener('click', function (e) {
      var btn = e.target && e.target.closest ? e.target.closest('button') : null;
      if (!btn) return;
      var sp = btn.querySelector('[data-i18n^="www_case"]');
      var c = sp && CASES[sp.getAttribute('data-i18n')];
      if (!c) return;
      e.preventDefault();
      e.stopPropagation();
      routeUseCase(c[0], c[1]);
    }, true);
  }

  function run() { try { injectCss(); guardImages(); bindDelegate(); } catch (e) {} }

  run();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
})();
