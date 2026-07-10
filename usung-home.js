/* usung-home.js — 홈(대문) 재구성 오버레이 (슬라이드 2·3)
 * 슬라이드2: 히어로 스크롤 멘트를 3개로 축소 + 마지막 멘트3에 CTA 버튼(제품 라인업/견적).
 *   - 멘트1: 프리미엄 직화기 후드의 기준
 *   - 멘트2: 한 번 사용 해보면, 다시 찾는 이유가 있습니다.
 *   - 멘트3: 유성에이스를 쓰면, 후드의 기준이 달라집니다.  ← CTA 버튼 부착(usung-review.js homeHero)
 *   - 기존 4개 기술 모션 프레임(anim-feat1~4)은 숨김, 별도 CTA 프레임(anim-cta)도 숨김.
 * 슬라이드3: 홈 섹션 순서 재배치 + 2개 섹션 삭제.
 *   순서 = 1)신개념 유성에이스+통계 → 2)유성에이스 후드의 장점(3D) → 3)대한민국의 불 앞에서 → 4)시공 갤러리
 *   삭제 = FEATURES IN MOTION, VIDEO SHOWCASE
 * + 후드의 장점(CORE TECHNOLOGY) 3D 그래픽 배경을 다크→푸른색으로 변경(hood3d-canvas 배경 fill 가로채기).
 * 원본 index_v6.html 은 건드리지 않고 런타임 DOM 패치. 되돌리기: inject.js 주입 1줄 제거.
 */
(function () {
  'use strict';

  // 히어로 그라데이션 재작업(2026-07-11): 프리미엄 블루→시안→소프트화이트 + 은은한 시머 애니메이션.
  // 기존 Tailwind 그라디언트(from-blue-500 via-cyan-400 to-blue-600) 대신 커스텀 클래스 사용.
  var GRAD = 'usung-hgrad';

  // 히어로용 스타일(그라데이션 폰트 + 스크롤 휠마크) 1회 주입
  function injectHomeStyle() {
    if (document.getElementById('usung-home-style')) return;
    var css = ''
      // ── 그라데이션 폰트 ──
      + '.usung-hgrad{'
      +   'background:linear-gradient(96deg,#93c5fd 0%,#38bdf8 30%,#22d3ee 52%,#67e8f9 72%,#e0f2fe 100%);'
      +   'background-size:220% 100%;-webkit-background-clip:text;background-clip:text;'
      +   '-webkit-text-fill-color:transparent;color:transparent;'
      +   'text-shadow:0 2px 24px rgba(34,211,238,.18);'
      +   'animation:usungHShine 6.5s ease-in-out infinite;}'
      + '@keyframes usungHShine{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}'
      // ── 스크롤 휠마크(마우스 모양) ──
      + '#usung-scrollmark{position:fixed;left:50%;bottom:26px;transform:translateX(-50%);z-index:40;'
      +   'display:flex;flex-direction:column;align-items:center;gap:9px;pointer-events:none;opacity:0;transition:opacity .45s ease;}'
      + '#usung-scrollmark .um-mouse{width:27px;height:44px;border:2px solid rgba(255,255,255,.9);border-radius:15px;'
      +   'display:flex;justify-content:center;padding-top:7px;background:rgba(10,20,50,.14);'
      +   'box-shadow:0 3px 18px rgba(0,0,0,.28),inset 0 0 0 1px rgba(255,255,255,.06);}'
      + '#usung-scrollmark .um-wheel{width:4px;height:9px;border-radius:2px;'
      +   'background:linear-gradient(#fff,#a5f3fc);animation:usungWheel 1.7s cubic-bezier(.4,0,.2,1) infinite;}'
      + '#usung-scrollmark .um-label{font-size:10px;letter-spacing:.3em;font-weight:800;color:rgba(255,255,255,.82);'
      +   'text-shadow:0 1px 8px rgba(0,0,0,.35);}'
      + '@keyframes usungWheel{0%{opacity:0;transform:translateY(-5px)}25%{opacity:1}55%{opacity:1;transform:translateY(7px)}100%{opacity:0;transform:translateY(7px)}}'
      + '@media(max-width:640px){#usung-scrollmark{bottom:18px}#usung-scrollmark .um-label{display:none}}';
    var s = document.createElement('style');
    s.id = 'usung-home-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  // 스크롤 휠마크 요소 생성(1회)
  function ensureScrollMark() {
    if (document.getElementById('usung-scrollmark')) return;
    var m = document.createElement('div');
    m.id = 'usung-scrollmark';
    m.setAttribute('aria-hidden', 'true');
    m.innerHTML = '<span class="um-mouse"><span class="um-wheel"></span></span><span class="um-label">SCROLL</span>';
    document.body.appendChild(m);
  }

  function setHeroTexts() {
    // 멘트1 — anim-hero
    var hero = document.getElementById('anim-hero');
    if (hero) {
      var h1 = hero.querySelector('h1');
      if (h1 && !h1.getAttribute('data-usung-home')) {
        h1.setAttribute('data-usung-home', '1');
        h1.className = 'text-4xl md:text-6xl lg:text-[92px] font-black tracking-[-0.03em] mb-4 leading-[1.05] text-white break-keep';
        h1.innerHTML = '프리미엄 직화기<br/><span class="' + GRAD + '">후드의 기준</span>';
      }
      var sub = hero.querySelector('p[data-cms="h_sub"]');
      if (sub) sub.style.display = 'none';
    }
    // 멘트2 — anim-text1
    var t1 = document.getElementById('anim-text1');
    if (t1) {
      var h2a = t1.querySelector('h2');
      if (h2a) h2a.innerHTML = '<span class="text-white">한 번 사용 해보면,</span><br/><span class="' + GRAD + '">다시 찾는 이유가 있습니다.</span>';
    }
    // 멘트3 — anim-text2
    var t2 = document.getElementById('anim-text2');
    if (t2) {
      var h2b = t2.querySelector('h2');
      if (h2b) h2b.innerHTML = '<span class="text-white">유성에이스를 쓰면,</span><br/><span class="' + GRAD + '">후드의 기준이 달라집니다.</span>';
    }
    // 기술 모션 프레임 숨김
    ['anim-feat1', 'anim-feat2', 'anim-feat3', 'anim-feat4'].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.style.display = 'none';
    });
    // 별도 CTA 프레임(anim-cta)은 전체 숨김 — CTA는 멘트3(anim-text2)에 직접 부착됨
    var cta = document.getElementById('anim-cta');
    if (cta) cta.style.display = 'none';
  }

  // 히어로 스크롤값 절반 — 원본 h-[400vh](이동 300vh) → 250vh(이동 150vh)로 축소.
  // 스티키 핀 구간(부모높이-100vh)과 타임라인 완료 지점(divisor*vh)을 동일하게 맞춰야
  // 마지막 멘트 이후 빈 스크롤이 생기지 않는다: 250vh-100vh=150vh = 1.5*vh.
  function halveHeroHeight() {
    var wrap = document.querySelector('#page-home [class*="h-[400vh]"]');
    if (!wrap) {
      var sticky = document.querySelector('#page-home .sticky');
      if (sticky && sticky.parentElement) wrap = sticky.parentElement;
    }
    if (wrap && wrap.style.height !== '250vh') wrap.style.height = '250vh';
  }

  // 스크롤 타임라인 재조정 — 멘트1 → 멘트2 → 멘트3(+CTA, 최종 유지) (feat/별도CTA 구간 제거)
  function wireScroll() {
    halveHeroHeight();
    if (window.__usungHomeScroll) return;
    window.__usungHomeScroll = true;
    function mr(v, a, b, c, d) {
      if (v <= a) return c;
      if (v >= b) return d;
      return c + (d - c) * ((v - a) / (b - a));
    }
    function set(id, op, tr) {
      var el = document.getElementById(id);
      if (el) { el.style.opacity = op; el.style.transform = tr; }
    }
    function setMark(op) {
      var mk = document.getElementById('usung-scrollmark');
      if (mk) mk.style.opacity = op;
    }
    function tick() {
      var home = document.getElementById('page-home');
      if (!home || !home.classList.contains('active')) { setMark(0); return; }
      var vh = window.innerHeight;
      var p = Math.min(Math.max(window.scrollY / (vh * 1.5), 0), 1);
      // 스크롤 휠마크 — 최상단에서만 노출, 스크롤 시작하면 페이드아웃
      setMark(p < 0.05 ? 1 : 0);
      // 멘트1
      set('anim-hero', mr(p, 0.10, 0.18, 1, 0),
        'scale(' + mr(p, 0.10, 0.18, 1, 0.9) + ') translateY(' + mr(p, 0.10, 0.18, 0, -60) + 'px)');
      // 멘트2
      set('anim-text1', mr(p, 0.24, 0.32, 0, 1) * mr(p, 0.42, 0.50, 1, 0),
        'translateY(' + mr(p, 0.24, 0.32, 40, 0) + 'px)');
      // 멘트3 (+CTA 버튼 부착) — 마지막 상태로 유지(페이드아웃 없음), 버튼 클릭 가능
      var m3op = mr(p, 0.54, 0.62, 0, 1);
      set('anim-text2', m3op, 'translateY(' + mr(p, 0.54, 0.62, 40, 0) + 'px)');
      var m3el = document.getElementById('anim-text2');
      if (m3el) m3el.style.pointerEvents = m3op > 0.5 ? 'auto' : 'none';
    }
    window.addEventListener('scroll', tick, { passive: true });
    // 초기 1회 + 지연 재적용
    tick();
    setTimeout(tick, 200);
  }

  // 홈 섹션 재배치 + 2개 삭제
  function reorderSections() {
    var home = document.getElementById('page-home');
    if (!home) return;
    var secs = Array.prototype.slice.call(home.querySelectorAll(':scope > section'));
    if (!secs.length) return;
    function find(re) {
      for (var i = 0; i < secs.length; i++) {
        if (re.test((secs[i].textContent || ''))) return secs[i];
      }
      return null;
    }
    var statement = find(/신개념 유성에이스|A NEW STANDARD/);
    var coretech = find(/유성에이스 후드의 장점|CORE TECHNOLOGY/);
    var wherewe = find(/대한민국의 불 앞에서|WHERE WE WORK/);
    var gallery = find(/REAL CONSTRUCTION|진짜 현장 사진/);
    var motion = find(/FEATURES IN MOTION/);
    var video = find(/USUNG ACE IN ACTION/);

    // 삭제 섹션 숨김
    if (motion) motion.style.display = 'none';
    if (video) video.style.display = 'none';

    // 순서 재배치 — hero(첫 자식) 뒤로 원하는 순서대로 append
    [statement, coretech, wherewe, gallery].forEach(function (sec) {
      if (sec) home.appendChild(sec);
    });
  }

  // 후드의 장점(CORE TECHNOLOGY) 3D 그래픽 배경을 푸른색으로 —
  // 캔버스는 매 프레임 다크 그라디언트로 배경을 다시 칠하므로, 컨텍스트의
  // 배경 fill(프레임 첫 fillRect(0,0,W,H))을 가로채 푸른 그라디언트로 교체한다.
  var BG_TOP = '#1b3f86';   // 좌상단(밝은 블루)
  var BG_BOT = '#0a1c48';   // 우하단(딥 네이비블루)
  function tintHoodGraphic() {
    var canvas = document.getElementById('hood3d-canvas');
    if (!canvas) return;
    var ctx = canvas.getContext('2d');
    if (!ctx || ctx.__usungBlueBg) return;
    ctx.__usungBlueBg = true;
    var origClear = ctx.clearRect.bind(ctx);
    var origFill = ctx.fillRect.bind(ctx);
    ctx.clearRect = function (x, y, w, h) {
      ctx.__frameStart = true;              // 매 프레임 시작 표시
      return origClear(x, y, w, h);
    };
    ctx.fillRect = function (x, y, w, h) {
      // 프레임의 첫 전체배경 fill(좌상단 0,0에서 시작)만 푸른 그라디언트로 교체
      if (ctx.__frameStart && x === 0 && y === 0) {
        ctx.__frameStart = false;
        var g = ctx.createLinearGradient(0, 0, w, h);
        g.addColorStop(0, BG_TOP);
        g.addColorStop(1, BG_BOT);
        var saved = ctx.fillStyle;
        ctx.fillStyle = g;
        origFill(x, y, w, h);
        ctx.fillStyle = saved;
        return;
      }
      return origFill(x, y, w, h);
    };
    // 캔버스 로드 전/여백에 잠깐 보이는 래퍼 배경도 동일 톤으로
    var wrap = document.getElementById('hood-3d-wrap');
    if (wrap) {
      wrap.style.background = 'linear-gradient(135deg,' + BG_TOP + ',' + BG_BOT + ')';
      // 플로팅 라벨칩: 다크 배경일 때 쓰던 어두운 글씨가 푸른 배경에서 안 보이므로
      // 칩 배경을 딥블루 반투명으로 깔고 글씨를 밝게 (라벨 가독성 확보)
      var chips = wrap.querySelectorAll('div.absolute');
      Array.prototype.forEach.call(chips, function (c) {
        if (c.__usungChip) return;
        c.__usungChip = true;
        if (getComputedStyle(c).backgroundColor !== 'rgba(0, 0, 0, 0)') {
          c.style.setProperty('background', 'rgba(8,18,46,0.62)', 'important');
          c.style.setProperty('border', '1px solid rgba(150,180,255,0.30)', 'important');
        }
        c.style.setProperty('color', '#e8eeff', 'important');
        Array.prototype.forEach.call(c.querySelectorAll('*'), function (d) {
          d.style.setProperty('color', '#e8eeff', 'important');
        });
      });
    }
  }

  function render() {
    injectHomeStyle();
    ensureScrollMark();
    setHeroTexts();
    reorderSections();
    tintHoodGraphic();
    wireScroll();
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

  // 홈으로 이동할 때마다 재적용
  if (typeof window.navigate === 'function' && !window.__homeNavWrapped) {
    window.__homeNavWrapped = true;
    var _nav = window.navigate;
    window.navigate = function (id) {
      var r = _nav.apply(this, arguments);
      if (id === 'home' || id === '' || id == null) { setTimeout(render, 60); setTimeout(render, 400); }
      return r;
    };
  }
})();
