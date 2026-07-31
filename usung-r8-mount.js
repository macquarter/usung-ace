/* usung-r8-mount.js — r8 카탈로그 이식 부트스트랩
 *
 * 개념: r8 은 사이트 교체가 아니라 "이식"이다. 기존 라이브 사이트(5개 언어 · 챗봇 ·
 * 게시판 · 45종 오버레이)는 그대로 두고, 아래 4개 페이지의 내용물만 r8 버전으로 갈아끼운다.
 *
 *   #page-products ← v-main (히어로 · 대분류 내비 · BEST/NEW 밴드 · 부품 티저) + v-cat
 *   #page-parts    ← v-parts (부품 48종)
 *   #page-tech     ← v-tech  (브랜드 히스토리 · 국내최초 · 인증 · 시공현장)
 *   #page-gallery  ← v-gallery (시공갤러리 + 라이트박스)
 *
 * r8 CSS 는 전량 `.r8x` 스코프로 재작성되어 있으므로(scope_css.py) 나머지 페이지에
 * 스타일이 새지 않는다. 뷰 마크업은 usung-r8-view.js 가 문자열로 싣고 온다.
 *
 * 원본 index_v6.html 불변. 되돌리기: api/inject.js 에서 r8 스크립트 줄만 제거.
 *
 * 비상구: `?r8=0` 으로 그 브라우저에서 이식본을 끌 수 있다(아래 gate()).
 */
(function () {
  'use strict';
  if (window.__usungR8Mount) return;

  /* ---- 활성 게이트 (기본 ON) ----
     재배포 없이 끌 수 있는 비상구. 이식본에 문제가 생기면 URL 로 바로 원래 화면을 볼 수 있다.
       https://usung-ace.vercel.app/?r8=0   ← 그 브라우저에서 이식본 끄기(localStorage 고정)
       https://usung-ace.vercel.app/?r8=1   ← 다시 켜기
     한 세션만 되돌리려면 콘솔에서 __usungR8Unmount(). */
  function gate() {
    try {
      if (/[?&]r8=0\b/.test(location.search)) { localStorage.setItem('usungR8', '0'); return false; }
      if (/[?&]r8=1\b/.test(location.search)) { localStorage.removeItem('usungR8'); return true; }
      return localStorage.getItem('usungR8') !== '0';
    } catch (e) { return !/[?&]r8=0\b/.test(location.search); }
  }
  if (!gate()) return;

  window.__usungR8Mount = true;

  var V = (document.currentScript && document.currentScript.src.split('v=')[1]) || '';

  /* 라이브 페이지 → 이 페이지에 들어갈 r8 뷰들 */
  var MAP = {
    'page-products': ['v-main', 'v-cat'],
    'page-parts': ['v-parts'],
    'page-tech': ['v-tech'],
    'page-gallery': ['v-gallery']
  };
  /* 역방향: r8 뷰 → 라이브 페이지 id (navigate 인자) */
  var PAGE_OF = {
    'v-main': 'products', 'v-cat': 'products',
    'v-parts': 'parts', 'v-tech': 'tech', 'v-gallery': 'gallery'
  };

  function css() {
    if (document.getElementById('usung-r8-css')) return;
    var l = document.createElement('link');
    l.id = 'usung-r8-css';
    l.rel = 'stylesheet';
    l.href = '/usung-r8.css' + (V ? '?v=' + V : '');
    (document.head || document.documentElement).appendChild(l);
  }

  /* 라이브 페이지 컨테이너를 비우고 .r8x 스코프 안에 r8 뷰를 심는다.
     원본 마크업은 지우지 않고 감춰만 둔다 → 문제 시 __usungR8Unmount() 로 복구. */
  function mount() {
    if (!window.R8_VIEW) return false;
    var done = 0;
    for (var pid in MAP) {
      var page = document.getElementById(pid);
      if (!page || page.querySelector(':scope > .r8x')) { done++; continue; }

      var keep = document.createElement('div');
      keep.className = 'r8-original';
      keep.style.display = 'none';
      while (page.firstChild) keep.appendChild(page.firstChild);

      var host = document.createElement('div');
      host.className = 'r8x';
      host.innerHTML = MAP[pid].map(function (v) { return window.R8_VIEW[v] || ''; }).join('');

      page.appendChild(keep);
      page.appendChild(host);
      watch(host);
      done++;
    }
    overlay();
    return done === Object.keys(MAP).length;
  }

  /* 오버레이(제품 모달 · 부품 모달 · 국내최초 모달 · 갤러리 라이트박스)는 body 직속에 심는다.
     ★ 260731 사고: 원본 HTML 에서 이 4개가 갤러리 섹션 뒤에 있어 v-gallery 문자열에 딸려
     들어갔고, 그대로 #page-gallery 안에 마운트됐다. 비갤러리 페이지에서는 #page-gallery 가
     display:none 이라 .mask.on 이 붙어도 조상이 죽어 있어 크기가 0 → 제품 상세 모달이
     아예 안 열렸다(position:fixed 는 조상 display:none 을 이기지 못한다). 실측: 제품소개에서
     카드 클릭 시 mask.className='mask on' / display='flex' 인데 getBoundingClientRect 0x0.
     CSS 가 .r8x 스코프이므로 body 직속에도 .r8x 래퍼가 필요하다. 자식이 전부 fixed 라
     래퍼 자체 높이는 0 → 레이아웃에 영향 없음. */
  function overlay() {
    if (!window.R8_VIEW || !window.R8_VIEW['v-overlay']) return;
    if (document.getElementById('r8-overlay-host')) return;
    var ov = document.createElement('div');
    ov.id = 'r8-overlay-host';
    ov.className = 'r8x';
    ov.innerHTML = window.R8_VIEW['v-overlay'];
    /* ★ body 의 '맨 앞'이어야 한다 — append 가 아니다.
       라이브 index_v6.html 은 body 직속에 #part-modal 을 갖고 있고 그 안의
       pm-img / pm-cat / pm-name / pm-desc 4개 id 가 r8 부품모달과 겹친다.
       getElementById 는 문서 순서상 앞선 것을 돌려주므로, 뒤에 붙이면 openPart() 가
       라이브 쪽 빈 모달에 글을 써서 r8 모달이 텍스트 없이 열린다(실측).
       #page-gallery 안에 있던 기존 배포본도 #main-content(body 1번째) 안이라 r8 이
       이겼다 — 맨 앞에 넣으면 그 순서를 그대로 유지한다. 자식이 전부 fixed 라
       first-child 여도 레이아웃에는 영향이 없다. */
    document.body.insertBefore(ov, document.body.firstChild);
    watch(ov);
  }

  window.__usungR8Unmount = function () {
    for (var pid in MAP) {
      var page = document.getElementById(pid);
      if (!page) continue;
      var host = page.querySelector(':scope > .r8x');
      var keep = page.querySelector(':scope > .r8-original');
      if (host) host.remove();
      if (keep) { while (keep.firstChild) page.appendChild(keep.firstChild); keep.remove(); }
    }
    var ov = document.getElementById('r8-overlay-host');
    if (ov) ov.remove();
    window.__usungR8Mount = false;
  };

  /* ---- 지연 이미지 되살리기 ----
     프로토타입에서는 뷰가 처음부터 보이는 상태라 loading="lazy" 가 정상 동작했다.
     이식본은 뷰를 숨긴 채(.view 는 display:none) innerHTML 로 심기 때문에 그 안의
     lazy 이미지는 레이아웃이 없어 관찰 대상에서 빠지고, 뷰를 켜도 크롬이 다시
     평가하지 않는다. 실측: 부품 48장 중 30장만 로드, p31~p48 은 영구 미로드.
     → 뷰가 켜질 때 직접 IntersectionObserver 로 감시해 근처에 오면 eager 로 승격한다.
     (전량 eager 로 바꾸면 갤러리 69장을 한 번에 받게 되므로 지연 특성은 유지) */
  var unlazyIO = null;
  function unlazy(root) {
    if (!root) return;
    var imgs = root.querySelectorAll('img[loading="lazy"]');
    if (!imgs.length) return;
    if (!('IntersectionObserver' in window)) {
      for (var j = 0; j < imgs.length; j++) imgs[j].loading = 'eager';
      return;
    }
    if (!unlazyIO) {
      unlazyIO = new IntersectionObserver(function (es, ob) {
        for (var k = 0; k < es.length; k++) {
          if (!es[k].isIntersecting) continue;
          var im = es[k].target;
          ob.unobserve(im);
          im.loading = 'eager';
          if (!im.complete || !im.naturalWidth) { var s = im.src; im.src = ''; im.src = s; }
        }
      }, { rootMargin: '600px 0px' });
    }
    for (var i = 0; i < imgs.length; i++) unlazyIO.observe(imgs[i]);
  }

  /* r8 은 뷰 진입·탭 전환·카테고리 이동마다 innerHTML 을 다시 그린다.
     showView 한 곳에 거는 대신 호스트 전체를 감시해 새로 들어온 이미지를 모두 잡는다.
     childList 만 관찰하므로 unlazy 가 바꾸는 속성(loading/src)으로 되돌아오지 않는다. */
  function watch(host) {
    if (!window.MutationObserver) return;
    var t = 0;
    new MutationObserver(function () {
      clearTimeout(t);
      t = setTimeout(function () { unlazy(host); }, 50);
    }).observe(host, { childList: true, subtree: true });
  }

  /* ---- 라우팅 ----
     r8 프로토타입의 showView() 는 자체 SPA 라우터였다. 이식본에서는 라이브 navigate()
     가 페이지를 고르고, showView 는 .view.on 토글 + 페이지 전환만 담당한다.
     build_graft.py 가 원본 showView/setNav 를 슬라이스에서 제거하므로 여기 정의가 유일하다. */
  var routing = false;

  window.showView = function (id) {
    var vs = document.querySelectorAll('.r8x .view');
    for (var i = 0; i < vs.length; i++) vs[i].classList.remove('on');
    var el = document.getElementById(id);
    if (el) el.classList.add('on');

    var page = PAGE_OF[id];
    if (!page || routing) return;
    var active = document.querySelector('.page.active');
    if (active && active.id === 'page-' + page) return;
    routing = true;
    try { if (typeof window.navigate === 'function') window.navigate(page); }
    finally { routing = false; }
  };

  /* 라이브 사이트에는 r8 의 .nav-menu 가 없다 — 존재할 때만 반영 */
  window.setNav = function (id) {
    var as = document.querySelectorAll('.r8x .nav-menu a');
    for (var i = 0; i < as.length; i++) as[i].classList.remove('on');
    var el = document.getElementById(id);
    if (el) el.classList.add('on');
  };

  /* 페이지별 진입 함수 — r8 은 뷰를 열 때 비로소 렌더한다(지연 렌더).
     showView 만 호출하면 빈 컨테이너가 보이므로 반드시 go* 를 태워야 한다. */
  var ENTER = {
    'page-products': 'goMain',
    'page-parts': 'goParts',
    'page-tech': 'goTech',
    'page-gallery': 'goGallery'
  };

  /* 라이브 navigate() 로 페이지가 바뀌면 그 페이지의 r8 뷰를 켜고 렌더한다.
     force=true 면 상단 내비로 들어온 것이므로 그 페이지의 기본 뷰로 되돌린다
     (예: 카테고리 상세 v-cat 을 보다가 '제품소개'를 다시 누르면 v-main 으로). */
  var entered = {};
  function syncFromPage(force) {
    var active = document.querySelector('.page.active');
    if (!active) return;
    var views = MAP[active.id];
    if (!views) return;
    var host = active.querySelector(':scope > .r8x');
    if (!host) return;
    if (!force && entered[active.id] && host.querySelector('.view.on')) return;

    var fn = window[ENTER[active.id]];
    routing = true;
    try {
      if (typeof fn === 'function') { fn(); entered[active.id] = 1; }
      else window.showView(views[0]);
    } catch (e) {
      console.error('[r8] enter ' + active.id, e);
    } finally { routing = false; unlazy(host); }
  }

  /* ---- 부트 ----
     r8Build() 는 usung-catalog-data.js 가 실어 오는 window.UP_DATA(제품 215종)를 읽는다.
     주의: 그 파일은 리포에 있지만 api/inject.js 가 주입하지 않아 라이브에는 로드되지 않는다
     (2026-07-31 라이브 스크립트 목록으로 확인). r8 스크립트 줄을 추가할 때 이 파일을
     맨 앞에 함께 넣어야 한다. 빠지면 아래 UP_DATA 가드에서 조용히 멈춘다. */
  var booted = false;
  function boot() {
    if (booted) return;
    if (typeof window.r8Build !== 'function') return;   // 슬라이스 아직 미로드
    if (!window.UP_DATA) return;                        // 카탈로그 데이터 대기
    if (!mount()) return;
    booted = true;
    try { window.r8Build(); } catch (e) { console.error('[r8] build', e); }
    syncFromPage();
  }

  function run() {
    try { css(); boot(); } catch (e) { console.error('[r8] run', e); }
  }

  run();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run);
  window.addEventListener('load', run);

  /* 다른 오버레이의 늦은 렌더 흡수 (약 6초) */
  var n = 0, iv = setInterval(function () { run(); if (booted || ++n > 60) clearInterval(iv); }, 100);

  /* 페이지 이동 후 뷰 동기화 (기존 래퍼 플래그 보존 — r5/r6 모듈과 같은 규약) */
  try {
    var orig = window.navigate;
    if (typeof orig === 'function' && !orig.__r8mount) {
      var w = function () {
        var external = !routing;          // showView 경유가 아니면 상단 내비 클릭
        var r = orig.apply(this, arguments);
        setTimeout(function () { run(); syncFromPage(external); }, 60);
        return r;
      };
      w.__r8mount = true;
      try {
        w.__usungNav = orig.__usungNav; w.__t8 = orig.__t8;
        w.__r5company = orig.__r5company; w.__r5nav = orig.__r5nav;
        w.__r6nav = orig.__r6nav; w.__r6main = orig.__r6main;
        w.__boardNavWrapped = orig.__boardNavWrapped;
      } catch (e) {}
      window.navigate = w;
    }
  } catch (e) {}
})();
