/* usung-home.js — 홈(대문) 재구성 오버레이 (슬라이드 2·3)
 * 슬라이드2: 히어로 스크롤 멘트를 3개로 축소 + 마지막에 CTA 버튼(제품 라인업/견적).
 *   - 멘트1: 프리미엄 직화기 후드의 기준
 *   - 멘트2: 한 번 사용 해보면, 다시 찾는 이유가 있습니다.
 *   - 멘트3: 유성에이스를 쓰면, 후드의 기준이 달라집니다.
 *   - 기존 4개 기술 모션 프레임(anim-feat1~4)은 숨김, CTA 큰 타이틀도 숨김.
 * 슬라이드3: 홈 섹션 순서 재배치 + 2개 섹션 삭제.
 *   순서 = 1)신개념 유성에이스+통계 → 2)유성에이스 후드의 장점(3D) → 3)대한민국의 불 앞에서 → 4)시공 갤러리
 *   삭제 = FEATURES IN MOTION, VIDEO SHOWCASE
 * 원본 index_v6.html 은 건드리지 않고 런타임 DOM 패치. 되돌리기: inject.js 주입 1줄 제거.
 */
(function () {
  'use strict';

  var GRAD = 'text-transparent bg-clip-text bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-600';

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
    // CTA — 큰 타이틀/설명 숨기고 버튼만 남김
    var cta = document.getElementById('anim-cta');
    if (cta) {
      var title = cta.querySelector('h2');
      if (title) title.style.display = 'none';
      var desc = cta.querySelector('p[data-cms="h_cta_desc"]');
      if (desc) desc.style.display = 'none';
      var tag = cta.querySelector('[data-cms="h_cta_tag"]');
      if (tag) { tag.textContent = 'SINCE 2007 · USUNG ACE'; tag.style.marginBottom = '28px'; }
      cta.style.background = 'transparent';
      cta.style.backdropFilter = 'none';
    }
  }

  // 스크롤 타임라인 재조정 — 멘트1 → 멘트2 → 멘트3 → CTA (feat 구간 제거)
  function wireScroll() {
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
    function tick() {
      var home = document.getElementById('page-home');
      if (!home || !home.classList.contains('active')) return;
      var vh = window.innerHeight;
      var p = Math.min(Math.max(window.scrollY / (vh * 3.0), 0), 1);
      // 멘트1
      set('anim-hero', mr(p, 0.10, 0.18, 1, 0),
        'scale(' + mr(p, 0.10, 0.18, 1, 0.9) + ') translateY(' + mr(p, 0.10, 0.18, 0, -60) + 'px)');
      // 멘트2
      set('anim-text1', mr(p, 0.24, 0.32, 0, 1) * mr(p, 0.42, 0.50, 1, 0),
        'translateY(' + mr(p, 0.24, 0.32, 40, 0) + 'px)');
      // 멘트3
      set('anim-text2', mr(p, 0.54, 0.62, 0, 1) * mr(p, 0.72, 0.80, 1, 0),
        'translateY(' + mr(p, 0.54, 0.62, 40, 0) + 'px)');
      // CTA
      var ctaOp = mr(p, 0.86, 0.94, 0, 1);
      set('anim-cta', ctaOp, 'scale(' + mr(p, 0.86, 0.94, 0.92, 1) + ')');
      var ctaEl = document.getElementById('anim-cta');
      if (ctaEl) ctaEl.style.pointerEvents = ctaOp > 0.5 ? 'auto' : 'none';
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

  function render() {
    setHeroTexts();
    reorderSections();
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
