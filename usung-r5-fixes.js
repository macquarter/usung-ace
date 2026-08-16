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

  /* ── ★ 세대 토큰 · 강제 goMain 삼키기 (2026-08-10 신고 2건) ────────────────
   * 신고 — (b1) 대분류를 누르면 대문이 번쩍인다. (b2) 그 직후 '제품 전체 보기' 를
   * 눌러도 대문으로 안 간다. **둘 다 기존 동작이 원인인데 그 동작 자체는 옳다.**
   *
   *  (b1) usung-r8-mount.js:275 의 navigate 래퍼는 외부 호출이면 +60ms 뒤
   *       syncFromPage(true) 를 부르고, force 라 멱등가드를 건너뛰고 goMain() 을
   *       **강제**한다(늦은 부트 구제용). 실측 — [1ms navigate / 22ms goCat /
   *       **132ms goMain** / 160ms goCat] → 그 사이 약 23ms 동안 v-main 이 보인다.
   *  (b2) 아래 settle() 이 110ms 마다 goCat 을 다시 쏜다(§3 「조용히 안 먹는 4대 원인」의
   *       처방). 최대 60틱 ≈ 6.6초 산다. 실측 — [1522ms 캡션클릭 / 1626ms goMain /
   *       **1683ms goCat** / 1750ms goMain / **1807ms goCat**] → 최종 v-cat = 실패.
   *       ★ 5초쯤 뒤에 누르면 루프가 이미 죽어 **성공한다.** 한 번 눌러 보고
   *         「고쳐졌다」고 판정하면 안 되는 종류의 버그다.
   *
   * ★ 조치는 **라우터 안에서만** 한다. 전역 goCat 을 가로채는 안은 폐기했다 —
   *   usung-r12.js:64 의 popstate 복원이 window.goCat(t.c) 를 부르므로
   *   **브라우저 뒤로가기가 통째로 깨진다**(r12 가 r21 보다 먼저 로드돼 선점도 불가).
   *   대신 (a) 세대 토큰으로 지난 라우팅 루프를 스스로 멈추고,
   *        (b) 라우팅이 켜 둔 1회용 표를 mount 의 강제 goMain 이 소모하게 한다.
   *   페이지 안의 카드·'← 전체 제품'·popstate 는 손대지 않는다. */
  var routeGen = 0;          // 세대 — 새 요청이 오면 지난 루프는 즉시 자결한다
  var swallow = 0;           // 남은 1회용 표(강제 goMain 삼키기)
  var swallowT = 0;          // 표의 만료 시각

  function wrapMain() {
    var gm = window.goMain;
    if (typeof gm !== 'function' || gm.__r22) return;
    var w = function () {
      /* 표가 살아 있을 때 **딱 한 번만** 삼킨다.
         - 시한(≈0.9초) : mount 는 +60~130ms 에 쏜다. 그 뒤 사용자의 대문 이동은 살린다.
         - view.on 검사 : 켜진 뷰가 하나도 없으면 **절대 막지 않는다**(빈 화면 방지). */
      if (swallow > 0 && Date.now() < swallowT &&
          document.querySelector('.r8x .view.on')) { swallow--; return; }
      return gm.apply(this, arguments);
    };
    w.__r22 = 1;
    window.goMain = w;
  }

  /* 진행 중인 대분류 라우팅을 포기한다 — usung-r21.js 의 '제품 전체 보기' 가 부른다.
     정착 루프·중분류 착지 루프를 함께 무효화하고 남은 표도 버린다. */
  function cancelRoute() { routeGen++; landSeq++; swallow = 0; swallowT = 0; }
  window.__usungRouteCancel = cancelRoute;

  /* ★ 감시는 길게 가져가야 한다(2026-08-02 실측).
   * usung-r8-mount.js 는 UP_DATA 가 늦게 오면 최대 6초까지 100ms 간격으로 boot 를
   * 재시도하고, boot 성공 시 syncFromPage() → goMain() 으로 v-main 을 켠다.
   * 짧게 감시하면 그 늦은 goMain 에 v-cat 이 덮여 클릭이 무위로 끝난다.
   * v-cat 이 꺼질 때마다 goCat 을 다시 걸고, 다시 켜지면 스크롤도 다시 잡는다. */
  function r8Route(cat, mid, gen) {
    var my = gen || ++routeGen;
    var t = 0, placed = false, stable = 0;
    (function settle() {
      if (my !== routeGen) return;   // 새 요청(또는 취소)이 왔다 — 이 루프는 폐기
      t++;
      var v = document.getElementById('v-cat');
      var pg = document.getElementById('page-products');
      if (pg && pg.classList.contains('active') && r8Ready()) {
        /* ★ 첫 안착은 v-cat 상태와 무관하게 무조건 goCat 을 부른다.
           예전엔 'v-cat 이 꺼져 있을 때만' 불렀다. 그러면 이미 분류 화면이 열려 있는
           상태(=두 번째 이후 클릭)에서는 goCat 이 한 번도 안 불려 분류가 안 바뀐다.
           덱 S03「최초 분류탭 클릭에만 반응」· S02「모두 파이프로 연결」이 같은 원인이다. */
        if (!placed) {
          try { window.goCat(cat); } catch (e) {}
          placed = true; stable = 0;
          if (mid) setTimeout(function () { landMid(mid); }, 120);
        } else if (!v || !v.classList.contains('on')) {
          placed = false; stable = 0;   // 늦은 goMain 에 덮였다 — 다음 틱에 다시 안착
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
    /* ★ 표를 켜는 곳은 여기 하나뿐이다 — 대분류 라우팅이 시작될 때만.
       r20 메가메뉴 · r5 USE CASE · r13 큐레이션이 전부 이 함수로 모이므로
       의도 출처를 빠짐없이 잡으면서도 다른 경로의 goMain 은 건드리지 않는다. */
    var my = ++routeGen;
    wrapMain();
    swallow = 1; swallowT = Date.now() + 900;
    try { if (typeof window.navigate === 'function') window.navigate('products'); } catch (e) {}
    // ★ legacy 로 빠질지는 '시간'이 아니라 '비상구가 켜졌는지'로 갈라야 한다(2026-08-02 실측).
    // 393px iframe 에서 r8 준비까지 7.3초가 걸렸는데 대기 상한이 2.5초라, 이식이 멀쩡히
    // 켜져 있는데도 legacy 로 새어 무반응으로 끝났다(legacy 마크업은 .r8-original 안에 숨어 있다).
    if (r8Off()) { legacyRoute(cat, sec); return; }
    var w = 0;
    (function waitR8() {
      if (my !== routeGen) return;   // 기다리는 동안 취소·재요청이 왔다
      w++;
      if (r8Ready()) { r8Route(cat, sec, my); return; }
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

  /* 사용자가 대문으로 나가려 하면 진행 중인 정착 루프를 스스로 접는다.
     `← 전체 제품`(usung-r8-view.js:67·76) 을 대분류 클릭 직후 6.6초 안에 누르면
     settle() 이 v-cat 을 다시 켜 되끌어간다 — 신고 ② 와 같은 결함이 다른 입구로 난 것.
     ★ preventDefault·stopPropagation 을 하지 않는다. 인라인 onclick 의 goMain() 은
       그대로 돌아야 하고, 여기서는 **우리 루프만** 포기한다(다른 코드에 영향 0). */
  function bindAbandon() {
    if (window.__r5aban) return;
    window.__r5aban = true;
    document.addEventListener('click', function (e) {
      var t = e.target && e.target.closest ? e.target.closest('[onclick*="goMain("]') : null;
      if (t) cancelRoute();
    }, true);
  }

  // 챗봇 큐레이션(usung-r13-curation.js)이 추천 결과에서 같은 경로로 착지해야 한다.
  // 이 라우터에는 r8Off 판정 · 최대 15초 준비 대기 · 중분류 착지 재시도가 들어 있어
  // 복제하면 그 실측 지식이 갈라진다. 함수 하나만 밖으로 낸다.
  window.__usungRoute = routeUseCase;

  function run() { try { injectCss(); guardImages(); bindDelegate(); bindAbandon(); } catch (e) {} }

  run();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
})();
