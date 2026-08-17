/* usung-r42.js — 260817 모바일 최적화 (승연 요청 4번 + F1 상시 전화 진입점)
 *
 * 마크업이 필요한 두 가지만 여기서 심는다. 나머지(①②③)는 usung-r42.css 가 전부 처리한다.
 *   ④ 시공갤러리 그리드 끝의 전폭 문의 카드  .r42-gcta
 *   ⑤ 모바일 하단 고정 전화 바              #r42-telbar
 *
 * 실측 근거 (라이브 393x852, 2026-08-17):
 *   · 갤러리 문의 진입점이 sticky 탭바 안 150x32 칩(#usung-r9-gal-cta) 하나뿐
 *   · 전역에서 보이는 tel: 링크가 회사소개 y=3532 아래 3개뿐 — 전화로만 받는 회사인데
 *     상시 진입점이 없다
 *
 * ★ F1 은 「새로 만드는 일」이 아니다. usung-r9-excel.js 가 r9 에서 이미 폼을 지우고
 *   전화 안내로 바꿔놨다(260729 미팅 「무조건 전화연결로만」). 라이브 393/1440 둘 다에서
 *   #inquiry-form 은 display:none · 0x0 이고 #usung-r9-tel 이 대신 그려진다.
 *   여기서 하는 건 (a) 상시 진입점 추가 (b) r9 가 못 떴을 때의 안전망뿐이다.
 */
(function () {
  'use strict';

  var TEL = '1588-9123';
  var TEL_HREF = 'tel:1588-9123';

  /* 모달이 열려 있으면 하단 바를 접는다 — 모달 안에 이미 「대표전화 문의하기」가 있고,
     56px 바가 모달 하단 버튼을 가린다. 네 종류가 전부 .on 으로 열린다(실측). */
  var MODAL_SEL = '#mask.on,#pmask.on,#fmask.on,#lbox.on';

  /* ════════════════════════════════════════════════════
   * ④ 시공갤러리 — 그리드 끝 전폭 문의 카드
   * ════════════════════════════════════════════════════ */

  /* 현재 선택된 스타일. usung-r9-excel.js 의 curStyle() 과 같은 방식으로 읽는다 —
     탭 라벨은 i18n 이 번역해버리므로 onclick 인자(원본 한국어)를 봐야 한다. */
  function curStyle() {
    var on = document.querySelector('#gal-tabs .gal-tab.on');
    if (!on) return '';
    var m = (on.getAttribute('onclick') || '').match(/filterGallery\("([^"]+)"\)/);
    if (m) return m[1];
    return (on.textContent || '').replace(/[\d\s]+$/, '').trim();
  }

  function galHead() {
    var s = curStyle();
    if (!s || s === '전체') return '이런 시공, 우리 매장에도 가능할까요?';
    return '‘' + s + '’ 스타일, 우리 매장에도 가능할까요?';
  }

  function applyGcta() {
    var grid = document.getElementById('gal-grid');
    if (!grid || !grid.parentNode) return false;

    var card = document.getElementById('r42-gcta');
    if (!card) {
      card = document.createElement('div');
      card.id = 'r42-gcta';
      card.className = 'r42-gcta';
      card.innerHTML =
        '<h3></h3>' +
        '<p>현장 사진을 보시고 궁금한 점이 있으면 바로 전화 주세요.<br>' +
        '주방 크기와 후드 위치만 알려주시면 가능한 사양을 안내해 드립니다.</p>' +
        '<a class="r42-gbtn" href="' + TEL_HREF + '">📞 대표전화 ' + TEL + '</a>';
    }
    /* 그리드 「뒤」 형제로 넣는다. 안에 넣으면 renderGallery() 의 innerHTML='' 에
       지워지고, .gal-grid 는 grid-auto-rows 가 걸려 있어 카드가 사진 칸으로 취급된다. */
    if (card.previousElementSibling !== grid) {
      grid.parentNode.insertBefore(card, grid.nextSibling);
    }

    /* 제목은 탭을 바꿀 때마다 갱신. 값이 실제로 변할 때만 써서 되울림을 끊는다. */
    var h = card.querySelector('h3');
    var k = galHead();
    if (h && h.__r42Label !== k) { h.__r42Label = k; h.textContent = k; }

    /* ★ 카드가 실제로 붙은 뒤에만 sticky 탭 안의 작은 칩을 감춘다(CSS가 이 클래스를 본다).
       무조건 감추면 카드 주입이 실패했을 때 갤러리 문의 진입점이 0개가 된다. */
    document.body.classList.add('r42-gcta-on');
    return true;
  }

  /* renderGalTabs() 는 #gal-tabs.innerHTML 을 통째로 갈아끼운다. 내 카드는 #gal-tabs
     바깥(그리드 뒤)이라 r9 가 겪은 되울림은 없지만, 탭 교체는 감지해야 제목이 따라간다. */
  function observeGallery() {
    var grid = document.getElementById('gal-grid');
    if (!grid) return;
    var host = grid.parentNode;
    if (host && !host.__r42Observed) {
      host.__r42Observed = true;
      new MutationObserver(function () {
        if (!document.getElementById('r42-gcta')) applyGcta();
      }).observe(host, { childList: true });
    }
    var tabs = document.getElementById('gal-tabs');
    if (tabs && !tabs.__r42Observed) {
      tabs.__r42Observed = true;
      new MutationObserver(function () { applyGcta(); })
        .observe(tabs, { childList: true, attributes: true, attributeFilter: ['class'], subtree: true });
    }
  }

  /* ════════════════════════════════════════════════════
   * ⑤ 모바일 하단 고정 전화 바
   *
   * ★ r31fix 교훈 — 고정 요소는 화면을 영구히 먹는다. 56px 로 묶고, 이미 전화 진입점이
   *   화면에 보이는 상황(회사소개 전화 패널·갤러리 카드·모달)에서는 스스로 접는다.
   * ════════════════════════════════════════════════════ */

  var bar = null;
  var visibleCta = 0;   // 화면에 보이는 「전화 진입점」 개수
  var io = null;

  function buildTelbar() {
    if (document.getElementById('r42-telbar')) return;
    bar = document.createElement('a');
    bar.id = 'r42-telbar';
    bar.href = TEL_HREF;
    bar.setAttribute('aria-label', '대표전화 ' + TEL + ' 으로 전화하기');
    bar.innerHTML = '<span class="r42-tb-k">대표전화</span>📞 ' + TEL;
    document.body.appendChild(bar);
    document.body.classList.add('r42-telbar-on');
  }

  function syncTelbar() {
    if (!bar) return;
    var hide = visibleCta > 0 || !!document.querySelector(MODAL_SEL);
    bar.classList.toggle('r42-off', hide);
  }

  /* 이미 화면에 있는 전화 CTA 를 추적한다. 스크롤 이벤트로 매번 재는 것보다 싸고,
     레이아웃 강제 계산(getBoundingClientRect)이 없어 스크롤이 끊기지 않는다. */
  function watchCta() {
    if (!io) {
      io = new IntersectionObserver(function (entries) {
        for (var i = 0; i < entries.length; i++) {
          var e = entries[i];
          if (e.isIntersecting && !e.target.__r42Vis) { e.target.__r42Vis = 1; visibleCta++; }
          else if (!e.isIntersecting && e.target.__r42Vis) { e.target.__r42Vis = 0; visibleCta--; }
        }
        if (visibleCta < 0) visibleCta = 0;
        syncTelbar();
      }, { threshold: 0.01 });
    }
    var t = document.querySelectorAll('#usung-r9-tel, #r42-gcta, #usung-r9-gal-cta');
    for (var i = 0; i < t.length; i++) {
      if (!t[i].__r42Watched) { t[i].__r42Watched = 1; io.observe(t[i]); }
    }
  }

  /* 모달 열림/닫힘은 class 변경이라 IntersectionObserver 로 안 잡힌다 — 따로 본다.
     네 모달은 mount 시점에 이미 body 직속 .r8x 안에 있다(usung-r8-view.js v-overlay). */
  function watchModals() {
    var ids = ['mask', 'pmask', 'fmask', 'lbox'];
    for (var i = 0; i < ids.length; i++) {
      var m = document.getElementById(ids[i]);
      if (!m || m.__r42Observed) continue;
      m.__r42Observed = 1;
      new MutationObserver(syncTelbar)
        .observe(m, { attributes: true, attributeFilter: ['class'] });
    }
  }

  /* ════════════════════════════════════════════════════
   * F1 안전망 — r9 가 못 떴을 때 문의가 조용히 사라지지 않게
   *
   * index_v6.html:5348 submitInquiry() 는 localStorage 에만 쌓고 성공 메시지를 띄운다.
   * 지금은 r9 가 폼을 display:none 처리해 도달 불가지만, r9 로드가 실패하면 폼이 보이고
   * 방문자는 「접수됐다」고 믿은 채 회사에는 아무것도 안 간다.
   * 회사 방침이 「무조건 전화」이므로 저장 대신 전화로 보낸다.
   * ════════════════════════════════════════════════════ */
  function guardInquiry() {
    if (typeof window.submitInquiry !== 'function' || window.submitInquiry.__r42) return;
    var guarded = function (e) {
      if (e && e.preventDefault) e.preventDefault();
      alert('죄송합니다. 온라인 문의 접수는 운영하지 않습니다.\n' +
            '대표전화 ' + TEL + ' 로 연락 주시면 바로 상담해 드립니다.');
      window.location.href = TEL_HREF;
      return false;
    };
    guarded.__r42 = 1;
    window.submitInquiry = guarded;
  }

  /* ════════════════════════════════════════════════════
   * 마운트
   *
   * ★ r8 오버레이가 뷰를 그린 「뒤」라야 #gal-grid 가 존재한다. r8 부트와의 경쟁을 피하려고
   *   즉시 1회 + body 감시로 늦게 생긴 노드까지 잡는다(r9 와 같은 방식).
   * ════════════════════════════════════════════════════ */
  function boot() {
    buildTelbar();
    applyGcta();
    observeGallery();
    watchCta();
    watchModals();
    guardInquiry();
    syncTelbar();
  }

  /* ★ body 전역 감시는 갤러리 100여 장이 그려질 때 초당 수백 번 불린다. 매번 재등록을
     시도하면 스크롤이 끊긴다 → rAF 로 한 프레임에 1회로 접는다. */
  var queued = 0;
  function rescan() {
    if (queued) return;
    queued = 1;
    requestAnimationFrame(function () {
      queued = 0;
      applyGcta();
      observeGallery();
      watchCta();
      watchModals();
      guardInquiry();
    });
  }

  function start() {
    boot();
    /* 뷰 전환(showView)으로 갤러리·모달이 나중에 생길 수 있다. 새 노드가 생길 때만
       다시 건다 — 각 함수가 __r42* 플래그로 중복 등록을 막는다. */
    new MutationObserver(rescan).observe(document.body, { childList: true, subtree: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start);
  } else {
    start();
  }
})();
