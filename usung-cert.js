/* usung-cert.js — 인증현황(Certifications) 재디자인 오버레이
 * 요구(슬라이드13): 특허/디자인/인증 개별 제목·내용은 노출하지 않고,
 * "여러 문서가 겹쳐진 폴더처럼" 대표 카드만 보여 보유량만 느껴지게. (경쟁사 카피 방지)
 * 원본 index_v6.html 은 건드리지 않고 런타임에서 #archive-grid 를 교체한다.
 * 되돌리기: api/inject.js 에서 이 스크립트 주입 1줄만 제거하면 원상복구.
 */
(function () {
  'use strict';

  var CATS = [
    {
      label: '특허', en: 'PATENTS', accent: '#2563eb', soft: '#eff6ff',
      desc: '핵심 기술을 특허로 보호하고 있습니다.'
    },
    {
      label: '디자인등록', en: 'DESIGN', accent: '#7c3aed', soft: '#f5f3ff',
      desc: '제품 디자인을 등록해 권리를 확보했습니다.'
    },
    {
      label: '인증서', en: 'CERTIFICATES', accent: '#059669', soft: '#ecfdf5',
      desc: '품질·안전 관련 인증을 보유하고 있습니다.'
    }
  ];

  var ICON = {
    doc: '<svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/></svg>',
    lock: '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
    shield: '<svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>'
  };

  function card(c) {
    return '' +
      '<div class="cert-cell">' +
        '<div class="cert-doc" style="--ac:' + c.accent + ';--sf:' + c.soft + '">' +
          '<div class="cert-doc-top">' +
            '<span class="cert-ico">' + ICON.doc + '</span>' +
            '<span class="cert-en">' + c.en + '</span>' +
          '</div>' +
          '<div class="cert-label">' + c.label + '</div>' +
          '<div class="cert-sub">' + c.desc + '</div>' +
          '<div class="cert-redact" aria-hidden="true"><span></span><span></span><span></span></div>' +
          '<div class="cert-foot">' +
            '<span class="cert-count">다수 보유</span>' +
            '<span class="cert-lock">' + ICON.lock + '세부 내용 비공개</span>' +
          '</div>' +
        '</div>' +
      '</div>';
  }

  function injectStyle() {
    if (document.getElementById('cert-style')) return;
    var s = document.createElement('style');
    s.id = 'cert-style';
    s.textContent = [
      '#archive-grid.cert-scope{display:block!important;}',
      '.cert-note{max-width:760px;margin:0 auto 44px;display:flex;align-items:center;gap:10px;justify-content:center;',
        'background:#f8fafc;border:1px solid #e6ebf2;border-radius:14px;padding:14px 20px;color:#475569;',
        'font-size:13.5px;font-weight:600;line-height:1.6;text-align:center;}',
      '.cert-note svg{color:#059669;flex:0 0 auto;}',
      '.cert-wrap{display:grid;grid-template-columns:repeat(3,1fr);gap:38px;max-width:1000px;margin:0 auto;}',
      '@media(max-width:820px){.cert-wrap{grid-template-columns:1fr;gap:52px;}}',
      /* stacked back sheets */
      '.cert-cell{position:relative;}',
      '.cert-cell::before,.cert-cell::after{content:"";position:absolute;inset:0;border-radius:20px;background:#fff;',
        'border:1px solid #e6ebf2;box-shadow:0 10px 22px rgba(15,23,42,.06);z-index:1;}',
      '.cert-cell::before{transform:rotate(-3.5deg) translateY(7px);}',
      '.cert-cell::after{transform:rotate(2.6deg) translateY(3px);}',
      /* front document */
      '.cert-doc{position:relative;z-index:2;background:#fff;border:1px solid #e2e8f0;border-radius:20px;',
        'box-shadow:0 18px 40px rgba(15,23,42,.12);padding:24px 22px 20px;overflow:hidden;}',
      '.cert-doc::before{content:"";position:absolute;top:0;left:0;right:0;height:5px;background:var(--ac);}',
      '.cert-doc-top{display:flex;align-items:center;justify-content:space-between;margin-top:4px;}',
      '.cert-ico{width:46px;height:46px;border-radius:12px;display:flex;align-items:center;justify-content:center;',
        'background:var(--sf);color:var(--ac);}',
      '.cert-en{font-size:10.5px;letter-spacing:.16em;font-weight:800;color:var(--ac);}',
      '.cert-label{font-size:21px;font-weight:900;color:#0f172a;margin-top:16px;letter-spacing:-.01em;}',
      '.cert-sub{font-size:13px;color:#64748b;line-height:1.6;margin-top:6px;}',
      '.cert-redact{margin:18px 0 6px;display:flex;flex-direction:column;gap:9px;filter:blur(3px);opacity:.5;',
        'user-select:none;pointer-events:none;}',
      '.cert-redact span{height:10px;border-radius:5px;background:#cbd5e1;}',
      '.cert-redact span:nth-child(1){width:80%;}',
      '.cert-redact span:nth-child(2){width:96%;}',
      '.cert-redact span:nth-child(3){width:64%;}',
      '.cert-foot{margin-top:14px;padding-top:14px;border-top:1px solid #eef2f7;display:flex;align-items:center;',
        'justify-content:space-between;gap:8px;}',
      '.cert-count{font-size:14px;font-weight:900;color:var(--ac);}',
      '.cert-lock{display:inline-flex;align-items:center;gap:5px;font-size:11px;font-weight:800;color:#64748b;',
        'background:#f1f5f9;border:1px solid #e2e8f0;padding:5px 10px;border-radius:999px;white-space:nowrap;}'
    ].join('');
    document.head.appendChild(s);
  }

  function render() {
    var grid = document.getElementById('archive-grid');
    if (!grid) return;
    injectStyle();

    // 1) 대표 3카드 + 안내문으로 교체
    grid.className = 'cert-scope';
    grid.innerHTML =
      '<div class="cert-note">' + ICON.shield +
        '보유 자료는 지식재산권 보호를 위해 세부 내용을 비공개합니다.</div>' +
      '<div class="cert-wrap">' + CATS.map(card).join('') + '</div>';

    // 2) 상단 필터 칩(전체 자료/특허/디자인등록/인증서) 숨김 — 개별 노출 불필요
    var chipRow = grid.previousElementSibling;
    if (chipRow && /전체 자료|특허/.test(chipRow.textContent || '')) {
      chipRow.style.display = 'none';
    }

    // 3) 하단 숫자 통계바 숨김 — 정확한 소량 카운트는 "다수 보유" 인상과 상충
    var statsBar = grid.nextElementSibling;
    if (statsBar && /특허 보유|기술 노하우|디자인등록/.test(statsBar.textContent || '')) {
      statsBar.style.display = 'none';
    }

    // 4) 히어로 설명문 톤 조정(세부 열람 유도 문구 제거)
    var desc = document.querySelector('#page-certification [data-i18n="archive_desc"]');
    if (desc) desc.textContent = '20여 년간 축적한 기술력을 특허 · 디자인등록 · 인증으로 보유하고 있습니다.';
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

  // 인증현황 페이지로 이동할 때마다 재적용(안전)
  if (typeof window.navigate === 'function' && !window.__certNavWrapped) {
    window.__certNavWrapped = true;
    var _nav = window.navigate;
    window.navigate = function (id) {
      var r = _nav.apply(this, arguments);
      if (id === 'certification') { setTimeout(render, 60); setTimeout(render, 400); }
      return r;
    };
  }
})();
