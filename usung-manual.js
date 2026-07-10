/* usung-manual.js v2 — 사용방법 페이지: 카탈로그 실사진(p34~36) 분해 배치
 * 요구(0710): "각 첨부파일을 하나씩 모두 뜯어서 각 페이지에 직관적으로 이해가도록 배치"
 *   → 카탈로그 사용방법/구조 원본 패널을 요소별로 크롭한 실사진(window.USUNG_GUIDE_IMG)을
 *      각 방법마다 제목과 함께 그대로 배치. 사진이 곧 설명. 클릭 시 확대(라이트박스).
 * 저작권: 전부 유성에이스 자산(고객 확인). 원본 index_v6.html 불변, 런타임 DOM 재구성.
 * 되돌리기: inject.js 주입 라인 제거. 이미지 데이터는 usung-guide-images.js.
 */
(function () {
  'use strict';

  var NAVY = '#0c1e5a', BRAND = '#1e40af', INK = '#1e293b', SUB = '#475569', LINE = 'rgba(12,30,90,.10)';
  var VIDEO = 'https://www.youtube.com/watch?v=VNgsryiCnQY';
  // 이미지 조립: guidep/p*_*.js 청크가 window.GB[key] 에 raw webp base64 를 누적한다.
  // (구버전 fallback: window.USUNG_GUIDE_IMG[key] = 완성된 data-URI)
  function IMG(k){
    if (window.GB && GB[k]) return 'data:image/webp;base64,' + GB[k];
    return (window.USUNG_GUIDE_IMG && window.USUNG_GUIDE_IMG[k]) || '';
  }
  function esc(s){ return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;'); }

  // 4가지 핵심 특징 (텍스트, 카탈로그 정합) — 아이콘/포인트 컬러 포함(리디자인 0711)
  var IC = {
    oil:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2.7l5.7 5.6a8 8 0 1 1-11.4 0z"/></svg>',
    swing:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>',
    tool:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z"/></svg>',
    shield:'<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/></svg>'
  };
  var FEATURES = [
    { n:'01', t:'기름유도장치 (기름받이속)', d:'사용 중 기름이 전혀 흐르지 않습니다. 일체형 성형 기름받이가 후드 내부의 기름을 안전하게 모아 위생적으로 관리합니다.', tag:'기름 흘림 ZERO', ac:'#d97706', bg:'rgba(217,119,6,.10)', ic:IC.oil },
    { n:'02', t:'360° 자유 스윙', d:'파이프가 고정되지 않고 시계추처럼 부드럽게 회전합니다. 테이블을 치우지 않고 후드만 옆으로 옮겨 청소할 수 있어 부러질 염려가 없습니다.', tag:'파이프 파손 ZERO', ac:'#2563eb', bg:'rgba(37,99,235,.10)', ic:IC.swing },
    { n:'03', t:'나사타입 간편 분리', d:'상·하부를 잇는 파이프링이 나사 방식이라 도구 없이 손으로 분리됩니다. 누구나 손쉽게 내부 청소를 할 수 있습니다.', tag:'도구 없이 분리', ac:'#7c3aed', bg:'rgba(124,58,237,.10)', ic:IC.tool },
    { n:'04', t:'유지망 필터', d:'기름을 여과해 모터와 덕트 내부를 청결하게 유지합니다. 모터 수명을 늘리고 화재를 예방하는 이중 효과가 있습니다.', tag:'모터수명 연장 + 화재예방', ac:'#059669', bg:'rgba(5,150,105,.10)', ic:IC.shield }
  ];

  // 양옆태엽 스윙 구조의 장점 (카탈로그 p36 스윙 다이어그램)
  var MERITS = [
    '파이프가 고정되어 있지 않고 시계추 모양으로 360° 스윙되어 부러지거나 휘어질 염려가 없습니다.',
    '상·하부를 연결하는 파이프가 간단히 분리되어 내부 청소가 가능합니다.',
    '화로와 80~150mm 정도 떨어뜨려 시공하면 화재로부터 안전합니다.',
    '태엽이 바깥·양옆에 있어 교체가 편리하고, 한쪽 와이어가 끊어져도 나머지 한쪽이 잡아줍니다.'
  ];

  // 8가지 사용·유지관리 방법 — 각 방법 = 제목 + 실사진(패널) + 한줄 설명
  var METHODS = [
    { k:'guide1_taeyeop', code:'METHOD 01', title:'태엽감속기 교체방법',
      cap:'사각 피스 4개만 풀면 현장에서 직접 교체할 수 있습니다. 가운데 고정 피스 2개는 절대 풀지 마세요.' },
    { k:'guide2_sokbong', code:'METHOD 02', title:'속봉 · 겉봉 분리방법',
      cap:'겉링 볼트를 풀고 겉링을 돌리면 속봉·겉봉이 분리되어 내부까지 세척할 수 있습니다.' },
    { k:'guide3_bbajing', code:'METHOD 03', title:'빠찌링(베어링) 교체방법',
      cap:'처음엔 6개로 시작하고 느슨해지면 1~2개를 추가합니다. 뺄 때는 반드시 펜치를 사용하세요.' },
    { k:'guide4_napal', code:'METHOD 04', title:'나팔 · 기름받이 분리방법',
      cap:'도구 없이 손으로 돌려 분리합니다. 기름받이속·기름받이망·일체형 모두 같은 방법입니다.' },
    { k:'guide5_fvd', code:'METHOD 05', title:'FVD 방화댐퍼 (화재 예방)',
      cap:'화재 시 72℃ 퓨즈가 녹으면 날개가 자동으로 닫혀 불길 확산을 차단합니다.' },
    { k:'guide6_sangbu', code:'METHOD 06', title:'상부 분리 (선택사항)',
      cap:'상부를 분리하면 덕트·모터 내부까지 점검하고 청소할 수 있습니다.' },
    { k:'guide7_assy', code:'METHOD 07', title:'등제품 조립순서', wide:true, maxw:600,
      cap:'등받침 → 등 하판 → 갓 순서로 끼우면 완성됩니다. 아크릴등·한지등·LED 모두 동일합니다.' },
    { k:'guide8_rail', code:'METHOD 08', title:'이동식 레일', wide:true, maxw:720,
      cap:'레일 방식으로 후드를 옆으로 밀어 이동시켜, 청소·점검 공간을 손쉽게 확보합니다.' }
  ];

  var CAUTIONS = [
    '텐션이 풀리거나 와이어줄이 끊어져 후드가 갑자기 내려와도, 파이프 타입은 스톱바(브레이크) 역할을 하므로 안전합니다.',
    '하부 나팔이 화로에 빠질 정도로 낮게 시공하지 마세요.'
  ];

  var CHECK = '<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.6" style="flex:none"><path d="M20 6 9 17l-5-5"/></svg>';

  function featureCard(f){
    return '<div style="position:relative;background:#fff;border:1px solid '+LINE+';border-radius:22px;padding:26px 24px;box-shadow:0 10px 30px rgba(10,20,60,.06);overflow:hidden">'+
      '<span style="position:absolute;top:4px;right:16px;font-size:78px;font-weight:900;line-height:1;color:'+f.ac+';opacity:.08;letter-spacing:-.04em;pointer-events:none">'+f.n+'</span>'+
      '<div style="position:relative;width:52px;height:52px;border-radius:15px;background:'+f.bg+';color:'+f.ac+';display:flex;align-items:center;justify-content:center;margin-bottom:16px">'+f.ic+'</div>'+
      '<h3 style="position:relative;margin:0 0 9px;font-size:18.5px;font-weight:800;color:'+NAVY+';letter-spacing:-.02em">'+esc(f.t)+'</h3>'+
      '<p style="position:relative;margin:0 0 16px;font-size:13.5px;line-height:1.72;color:'+SUB+'">'+esc(f.d)+'</p>'+
      '<div style="position:relative;display:inline-flex;align-items:center;gap:7px;padding:7px 13px;border-radius:999px;background:rgba(5,150,105,.09);color:#047857;font-size:12px;font-weight:800">'+CHECK+esc(f.tag)+'</div>'+
    '</div>';
  }

  // 카드 헤더(번호 뱃지 + 코드 + 제목) — 균일 높이 유지를 위해 공통 분리
  function methodHeader(m, i){
    return '<div style="display:flex;align-items:center;gap:12px;margin-bottom:14px">'+
        '<span style="flex:none;width:34px;height:34px;border-radius:10px;background:'+NAVY+';color:#fff;font-size:13px;font-weight:800;display:flex;align-items:center;justify-content:center">'+(i+1)+'</span>'+
        '<div>'+
          '<div style="font-size:10px;font-weight:800;letter-spacing:.2em;color:'+BRAND+'">'+esc(m.code)+'</div>'+
          '<h3 style="margin:2px 0 0;font-size:19px;font-weight:800;color:'+NAVY+';letter-spacing:-.02em">'+esc(m.title)+'</h3>'+
        '</div>'+
      '</div>';
  }

  // 균일 박스: 컨텐츠 양이 달라도 카드 높이/이미지틀 크기 동일.
  // - 카드: flex column + height:100% (그리드 align-items:stretch 로 같은 행 균등)
  // - 캡션: min-height 로 1~2줄 편차 흡수
  // - 이미지: 고정 높이 틀(#f8fafc) + object-fit:contain (margin-top:auto 로 하단 정렬)
  // 넓은 다이어그램(07/08)은 전체폭 카드로 별도 유지.
  function methodCard(m, i){
    var src = IMG(m.k);
    var wide = !!m.wide;
    if (wide) {
      var wimg = src
        ? '<img src="'+src+'" alt="'+esc(m.title)+'" loading="lazy" data-zoom="1" style="display:block;width:100%;height:auto;max-width:'+(m.maxw||720)+'px;margin:0 auto;border-radius:14px;border:1px solid '+LINE+';background:#fff;cursor:zoom-in">'
        : '<div style="padding:40px;text-align:center;color:#94a3b8;border:1px dashed '+LINE+';border-radius:14px">이미지 준비 중</div>';
      return '<div style="grid-column:1/-1;background:#fff;border:1px solid '+LINE+';border-radius:22px;padding:24px 22px 22px;box-shadow:0 10px 30px rgba(10,20,60,.06)">'+
        methodHeader(m,i)+
        '<p style="margin:0 0 16px;font-size:13.5px;line-height:1.7;color:'+SUB+'">'+esc(m.cap)+'</p>'+
        wimg+
      '</div>';
    }
    var imgFrame = src
      ? '<div style="margin-top:auto;height:200px;border-radius:14px;border:1px solid '+LINE+';background:#fff;display:flex;align-items:center;justify-content:center;overflow:hidden">'+
          '<img src="'+src+'" alt="'+esc(m.title)+'" loading="lazy" data-zoom="1" style="max-width:100%;max-height:100%;width:auto;height:auto;object-fit:contain;cursor:zoom-in">'+
        '</div>'
      : '<div style="margin-top:auto;height:200px;display:flex;align-items:center;justify-content:center;color:#94a3b8;border:1px dashed '+LINE+';border-radius:14px">이미지 준비 중</div>';
    return '<div style="display:flex;flex-direction:column;height:100%;background:#fff;border:1px solid '+LINE+';border-radius:22px;padding:24px 22px 22px;box-shadow:0 10px 30px rgba(10,20,60,.06)">'+
      methodHeader(m,i)+
      '<p style="margin:0 0 16px;min-height:46px;font-size:13.5px;line-height:1.7;color:'+SUB+'">'+esc(m.cap)+'</p>'+
      imgFrame+
    '</div>';
  }

  function buildHTML(){
    return '<div style="max-width:1000px;margin:0 auto;padding:0 20px">'+

      // 헤더
      '<div style="text-align:center;margin-bottom:52px">'+
        '<div style="font-size:11px;font-weight:800;letter-spacing:.32em;color:'+BRAND+';margin-bottom:14px">HOW TO USE · MAINTENANCE</div>'+
        '<h1 style="margin:0 0 14px;font-size:clamp(34px,5vw,54px);font-weight:800;color:'+NAVY+';letter-spacing:-.03em">사용방법</h1>'+
        '<p style="margin:0;font-size:17px;color:'+SUB+'">유성에이스 후드의 구조와 사용·유지관리 방법을 실제 카탈로그 그림으로 안내합니다.</p>'+
      '</div>'+

      // 스윙 구조 인트로 (guide9) + 장점
      '<div style="margin-bottom:60px;background:linear-gradient(135deg,'+NAVY+' 0%,#12307a 100%);border-radius:28px;padding:38px 34px;color:#fff">'+
        '<div style="display:grid;grid-template-columns:minmax(240px,340px) 1fr;gap:32px;align-items:center">'+
          '<div style="text-align:center">'+
            (IMG('guide9_swing')
              ? '<img src="'+IMG('guide9_swing')+'" alt="양옆태엽 스윙 구조" data-zoom="1" style="display:inline-block;width:100%;max-width:320px;height:auto;border-radius:16px;background:#fff;padding:10px;cursor:zoom-in">'
              : '')+
          '</div>'+
          '<div>'+
            '<div style="font-size:11px;font-weight:800;letter-spacing:.28em;color:#93c5fd;margin-bottom:8px">WHY DUAL-SPRING SWING</div>'+
            '<h2 style="margin:0 0 20px;font-size:clamp(22px,3.2vw,30px);font-weight:800;letter-spacing:-.02em">양옆태엽 스윙 구조의 장점</h2>'+
            '<div style="display:flex;flex-direction:column;gap:14px">'+
              MERITS.map(function(m,i){
                return '<div style="display:flex;gap:12px;align-items:flex-start">'+
                  '<span style="flex:none;width:26px;height:26px;border-radius:999px;background:rgba(147,197,253,.18);color:#bfdbfe;font-size:12.5px;font-weight:800;display:flex;align-items:center;justify-content:center;margin-top:1px">'+(i+1)+'</span>'+
                  '<span style="font-size:14px;line-height:1.65;color:#e8eeff">'+esc(m)+'</span>'+
                '</div>';
              }).join('')+
            '</div>'+
          '</div>'+
        '</div>'+
      '</div>'+

      // 4가지 핵심 특징
      '<div style="margin-bottom:60px">'+
        '<div style="font-size:11px;font-weight:800;letter-spacing:.28em;color:'+BRAND+';margin-bottom:8px">PRODUCT FEATURES</div>'+
        '<h2 style="margin:0 0 24px;font-size:clamp(24px,3.4vw,32px);font-weight:800;color:'+NAVY+';letter-spacing:-.02em">유성에이스 후드, 4가지 핵심 특징</h2>'+
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));gap:18px;max-width:760px;margin:0 auto">'+
          FEATURES.map(featureCard).join('')+
        '</div>'+
      '</div>'+

      // 8가지 사용·유지관리 방법 (실사진)
      '<div style="margin-bottom:56px">'+
        '<div style="font-size:11px;font-weight:800;letter-spacing:.28em;color:'+BRAND+';margin-bottom:8px">STEP-BY-STEP</div>'+
        '<h2 style="margin:0 0 10px;font-size:clamp(24px,3.4vw,32px);font-weight:800;color:'+NAVY+';letter-spacing:-.02em">사용 · 유지관리 방법</h2>'+
        '<p style="margin:0 0 26px;font-size:15px;color:'+SUB+'">카탈로그 실제 그림으로 정리했습니다. 그림을 누르면 크게 볼 수 있습니다.</p>'+
        '<div style="display:grid;grid-template-columns:repeat(auto-fit,minmax(300px,1fr));gap:20px;align-items:stretch">'+
          METHODS.map(methodCard).join('')+
        '</div>'+
      '</div>'+

      // 안전 주의사항
      '<div style="margin-bottom:52px;background:#fff7ed;border:1px solid #fed7aa;border-radius:22px;padding:26px 26px">'+
        '<div style="font-size:11px;font-weight:800;letter-spacing:.2em;color:#c2410c;margin-bottom:14px">SAFETY · 안전 주의사항</div>'+
        CAUTIONS.map(function(c){
          return '<div style="display:flex;gap:10px;align-items:flex-start;margin-bottom:10px">'+
            '<span style="color:#ea580c;font-weight:800;flex:none">※</span>'+
            '<span style="font-size:13.5px;line-height:1.65;color:#9a3412">'+esc(c)+'</span>'+
          '</div>';
        }).join('')+
      '</div>'+

      // 공식 영상
      '<div style="text-align:center;margin-bottom:16px">'+
        '<a href="'+VIDEO+'" target="_blank" rel="noopener" style="display:inline-flex;align-items:center;gap:9px;padding:13px 24px;border-radius:999px;background:#fef2f2;border:1px solid #fecaca;color:#dc2626;font-size:14.5px;font-weight:800;text-decoration:none">'+
          '<svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor"><path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814z"/><polygon fill="#fff" points="9.545,15.568 15.818,12 9.545,8.432"/></svg>'+
          '유성에이스 공식 영상 보기'+
        '</a>'+
      '</div>'+

    '</div>';
  }

  // 라이트박스 (확대)
  function ensureLightbox(){
    if (document.getElementById('usung-lb')) return;
    var lb = document.createElement('div');
    lb.id = 'usung-lb';
    lb.style.cssText = 'position:fixed;inset:0;z-index:99999;background:rgba(8,14,40,.88);display:none;align-items:center;justify-content:center;padding:24px;cursor:zoom-out;overflow:auto';
    lb.innerHTML = '<img id="usung-lb-img" style="max-width:96vw;max-height:92vh;width:auto;height:auto;border-radius:12px;box-shadow:0 20px 60px rgba(0,0,0,.5);background:#fff">';
    lb.addEventListener('click', function(){ lb.style.display='none'; });
    document.body.appendChild(lb);
    document.addEventListener('keydown', function(e){ if(e.key==='Escape') lb.style.display='none'; });
  }
  function openLightbox(src){
    ensureLightbox();
    var lb = document.getElementById('usung-lb');
    document.getElementById('usung-lb-img').src = src;
    lb.style.display = 'flex';
  }

  function render(){
    var page = document.getElementById('page-manual');
    if (!page) return;
    if (page.dataset.usungManual === 'v2') return;
    var wrap = page.querySelector('.max-w-5xl') || page.firstElementChild;
    if (!wrap) return;
    wrap.outerHTML = buildHTML();
    page.dataset.usungManual = 'v2';
    // 이미지 클릭 → 확대
    page.querySelectorAll('img[data-zoom="1"]').forEach(function(im){
      im.addEventListener('click', function(){ openLightbox(im.src); });
    });
  }

  function boot(){ render(); setTimeout(render,300); setTimeout(render,1200); }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();

  if (typeof window.navigate === 'function' && !window.__manualNavWrapped) {
    window.__manualNavWrapped = true;
    var _nav = window.navigate;
    window.navigate = function(id){
      var r = _nav.apply(this, arguments);
      if (id === 'manual') { render(); setTimeout(render,60); }
      return r;
    };
  }
})();
