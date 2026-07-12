/* =========================================================================
 * usung-tech8.js  —  기술 및 인증현황 > 8대 핵심기술 (텍스트 리디자인)
 * 2026-07-11 텍스트 리디자인:
 *   - 원본 인포그래픽 8장(이미지)을 전부 "선택 가능한 실제 텍스트 카드"로 전환.
 *   - 각 기술: 문제원인 / 해결방법 / 효과 3열 + 핵심요약 1줄.
 *   - 우측의 추상 다이어그램(헷갈리는 그림)은 제거.
 *   - 상단에 후드 해부도(11개 부품 구조 + 파이프 제품의 장점)를 텍스트로 유기적 배치.
 *   - 스크롤 진입 시 카드가 하나씩 페이드-업(IntersectionObserver) 애니메이션.
 *   - 상단 8대 기술 인덱스(클릭 시 부드럽게 스크롤).
 * 이전(이미지) 버전 백업: _backup_tech8/usung-tech8.pre-textredesign-20260711.js
 * 되돌리기: 백업본으로 이 파일을 교체하면 원복.
 * ========================================================================= */
(function () {
  'use strict';

  var VER = '20260711diagram1';

  // 후드 구조 11 포인트 (첨부 해부도 기반)
  var PARTS = [
    ['토출', '125Ø · 150Ø 토출'],
    ['분리청소', '분리청소 가능'],
    ['F.V.D', '풍속 조절 겸 방화댐퍼'],
    ['스윙', '360도 스윙'],
    ['방지망', '분리청소 가능(선택) · 이물질 방지망 추가 가능'],
    ['텐션', '상하작동 · 베어링 수량으로 강약 조절'],
    ['걸링', '스톱바 · 브레이크 · 분리청소 가능'],
    ['나팔캡', '분리청소 가능'],
    ['나팔', '하부 나팔'],
    ['기름받이속', '기름 낙하 방지'],
    ['기름받이', '210Ø']
  ];

  // 파이프 제품의 장점
  var ADV = [
    '파이프가 고정되지 않고 시계추 모양으로 360° 스윙되어, 부러지거나 휠 염려가 없어 편리합니다.',
    '상하부를 연결하는 파이프링이 간단히 분리되어 내부 청소가 가능합니다.',
    '화로와 80~150mm 정도 떨어뜨려 시공해야 화재로부터 안전합니다.'
  ];
  var CAUTION = [
    '텐션 탄성이 흘러내리거나 와이어가 끊어져 후드가 갑자기 내려와도, 파이프 타입은 스톱바(브레이크) 역할을 하므로 안전합니다.',
    '하부 나팔이 화로에 빠질 정도로는 시공하지 마세요.'
  ];

  // 8대 핵심기술 콘텐츠 (원본 인포그래픽 8장에서 텍스트 추출)
  var DATA = [
    { t: '맞춤형 제작',
      sub: '매장 환경과 천장 높이에 맞춰 후드 길이를 현장 조건에 맞게 제작합니다.',
      cause: ['매장별 천장 높이 차이', '정형화된 길이로는 설치 어려움', '현장 절단 시 마감 불량'],
      solve: ['기본 기장 L1800 기준 제작', '설치 전 기장 확인 후 제작', '현장 맞춤 절단·연장 제작'],
      effect: ['후드 시공 부담 감소', '설치 시간 단축', '추가 비용 절감'],
      point: '현장 조건에 맞춘 길이 조절 및 맞춤 제작 (최소 800mm ~ 기본 1800mm, 3000mm 이상 문의)' },
    { t: '360도 스윙',
      sub: '후드 각도를 자유롭게 조절하여 설치 정렬과 내부 관리를 더 편리하게 합니다.',
      cause: ['고정식 후드의 정렬 불규칙', '파이프 비틀림 손상 위험', '내부 관리 시 작업 불편'],
      solve: ['수직축 기준 자유 스윙 구조', '360° 회전으로 각도 조절', '설치 후 방향 보정 가능'],
      effect: ['수직 정렬이 쉽고 정확', '파이프 손상 위험 감소', '내부 관리 편의 향상'],
      point: '설치 환경에 맞춰 각도와 방향을 자유롭게 조절' },
    { t: 'FVD 방화댐퍼',
      sub: '고온 감지 시 자동 폐쇄되는 구조로 덕트 화재 확산 위험을 줄입니다.',
      cause: ['불꽃 상승 가능성', '덕트 화재 확산 위험', '배기 풍량 불규칙'],
      solve: ['FVD 풍량 조절 기능', '고온 감지 자동 폐쇄', '현장 관리 보조 구조'],
      effect: ['화재 확산 위험 완화', '배기·환기 밸런스 유지', '소방 안전 관리 보조'],
      point: '고온 감지 → 자동 폐쇄로 화재 확산 위험 완화와 배기 밸런스 관리' },
    { t: 'VD 풍량조절댐퍼',
      sub: '후드별 댐퍼 개방 각도를 조절해 매장 전체 배기 밸런스를 맞춥니다.',
      cause: ['메인관에 여러 대 후드 연결', '모터 거리별 풍량 편차', '특정 후드 과흡입·흡입 부족'],
      solve: ['후드별 개방 각도 직접 조절', '거리별 풍량 편차 보정', '시공 후 풍량 조절 가능'],
      effect: ['매장 전체 배기 밸런스 향상', '과흡입·흡입 부족 완화', '안정적인 환기 환경 조성'],
      point: '후드별 댐퍼 개방 각도 조절로 풍량 최적화' },
    { t: '양옆태엽 / 듀얼 다이캐스팅',
      sub: '외부 장착 구조와 양쪽 지지 방식으로 교체와 상하작동을 더 안정적으로 만듭니다.',
      cause: ['내부 태엽 교체 불편', '후드 태엽 청소 어려움', '상하작동 시 사용감 저하'],
      solve: ['양쪽 와이어 지지 방식', '교체가 쉬운 외부 장착 구조', '청소 접근성을 높인 구조'],
      effect: ['태엽 교체 편의 향상', '부드러운 상하작동', '안정적인 사용감 제공'],
      point: '외부 장착·양쪽 지지로 태엽 교체 편의와 안정적인 사용감 제공' },
    { t: '와이어 없는 텐션 구조',
      sub: '와이어 없는 특허 텐션 기술로 장력을 안정적으로 유지합니다.',
      cause: ['와이어 끊어짐 발생 가능', '유지관리 부담 증가', '상하작동 안정성 저하'],
      solve: ['볼베어링 기반 장력 조절', '와이어 없는 특허 텐션 구조', '상하작동 구조 안정화'],
      effect: ['안정적인 장력 유지', '유지관리 비용 절감', '작동 신뢰성 향상'],
      point: '와이어 없는 특허 텐션 기술로 유지관리 부담 감소' },
    { t: '분리 청소 가능 구조',
      sub: '공구 없이 주요 오염 부위를 분리해 청소와 위생관리를 간편하게 합니다.',
      cause: ['후드 내부 기름때 축적', '분리 작업 시 공구 필요', '청소·위생관리 부담'],
      solve: ['손으로 돌려 분리하는 구조', '상하부 파이프 분리 가능', '나팔캡·기름받이 간편 분리'],
      effect: ['주요 오염 부위 세척 용이', '공구 없이 관리 편리', '청소 시간·부담 감소'],
      point: '주요 오염 부위를 간편 분리해 위생관리 효율 향상' },
    { t: '기름낙하방지필터',
      sub: '기름받이망과 기름받이속 구조로 기름 낙하와 내부 오염 부담을 줄입니다.',
      cause: ['구조 사이 기름 낙하', '음식 오염 가능성', '파이프 내부 오염'],
      solve: ['기름받이망 기본 적용', '기름받이속 선택 적용', '1중망·2중망 변경 기능'],
      effect: ['음식 위 기름 낙하 감소', '후드 내부 청결 관리', '매장 위생관리 효율 향상'],
      point: '기름받이망·기름받이속 구조로 위생관리 효율 향상' }
  ];

  function pad(n) { return n < 10 ? '0' + n : '' + n; }
  function esc(s) {
    return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
  }

  function injectStyle() {
    var old = document.getElementById('t8-style');
    if (old) old.parentNode.removeChild(old);
    var css = ''
      + '#tech-grid.t8-wrap{display:block;max-width:920px;margin:0 auto;padding:2px 0 8px;}'
      // ── 스크롤 리빌 ──
      + '.t8-rv{opacity:0;transform:translateY(26px);transition:opacity .6s ease,transform .6s ease;}'
      + '.t8-rv.t8-in{opacity:1;transform:none;}'
      + '.t8-slide .t8-rvc{opacity:0;transform:translateY(16px);transition:opacity .55s ease,transform .55s ease;}'
      + '.t8-slide.t8-in .t8-rvc{opacity:1;transform:none;}'
      + '.t8-slide.t8-in .t8-rvc:nth-child(1){transition-delay:.05s;}'
      + '.t8-slide.t8-in .t8-rvc:nth-child(2){transition-delay:.13s;}'
      + '.t8-slide.t8-in .t8-rvc:nth-child(3){transition-delay:.21s;}'
      + '.t8-slide.t8-in .t8-rvc:nth-child(4){transition-delay:.29s;}'
      + '.t8-slide.t8-in .t8-rvc:nth-child(5){transition-delay:.37s;}'
      // ── 상단 후드 해부도 히어로 ──
      + '.t8-core{background:linear-gradient(165deg,#0a1c48 0%,#122a6e 52%,#1d4ed8 100%);border-radius:26px;overflow:hidden;'
      +   'margin:0 0 32px;box-shadow:0 26px 56px -30px rgba(11,30,77,.72);}.t8-hero{background:none;border-radius:0;box-shadow:none;margin:0;padding:30px 30px 22px;}'
      + '.t8-hero-eyebrow{color:#93c5fd;font-size:12px;font-weight:800;letter-spacing:.24em;'
      +   'text-transform:uppercase;margin:0 0 6px;}'
      + '.t8-hero-title{color:#fff;font-size:26px;font-weight:900;letter-spacing:-.02em;margin:0 0 6px;}'
      + '.t8-hero-sub{color:#cbd5e1;font-size:14px;line-height:1.6;margin:0 0 22px;max-width:640px;}'
      + '.t8-hero-diagram{background:#f7f9fc;border:1px solid #e2e8f0;border-radius:18px;padding:18px 18px 10px;margin:0 0 16px;}'
      + '.t8-dh{color:#0b1e4d;font-size:14px;font-weight:800;letter-spacing:-.01em;margin:0 0 6px;}'
      + '.t8-dh span{color:#64748b;font-weight:600;font-size:12px;margin-left:8px;}'
      + '.t8-hood{display:block;width:100%;max-width:760px;height:auto;margin:0 auto;}'
      + '.t8-panel{background:rgba(255,255,255,.06);border:1px solid rgba(255,255,255,.14);'
      +   'border-radius:18px;padding:18px 18px 16px;}'
      + '.t8-panel-h{color:#e0f2fe;font-size:14px;font-weight:800;letter-spacing:-.01em;margin:0 0 14px;'
      +   'padding-bottom:10px;border-bottom:1px solid rgba(255,255,255,.14);}'
      + '.t8-parts{list-style:none;margin:0;padding:0;}'
      + '.t8-parts li{display:flex;gap:11px;align-items:flex-start;padding:7px 0;'
      +   'border-bottom:1px dashed rgba(255,255,255,.10);}'
      + '.t8-parts li:last-child{border-bottom:0;}'
      + '.t8-pn{flex:0 0 auto;width:24px;height:24px;border-radius:7px;'
      +   'background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;font-size:12px;font-weight:900;'
      +   'display:flex;align-items:center;justify-content:center;margin-top:1px;}'
      + '.t8-pt{color:#f1f5f9;font-size:13.5px;line-height:1.5;}'
      + '.t8-pt b{display:block;color:#fff;font-weight:800;font-size:14px;margin-bottom:1px;}'
      + '.t8-advlist{list-style:none;counter-reset:adv;margin:0 0 14px;padding:0;}'
      + '.t8-advlist li{counter-increment:adv;position:relative;padding:8px 0 8px 30px;'
      +   'color:#e2e8f0;font-size:13.5px;line-height:1.6;border-bottom:1px dashed rgba(255,255,255,.10);}'
      + '.t8-advlist li:last-child{border-bottom:0;}'
      + '.t8-advlist li:before{content:counter(adv);position:absolute;left:0;top:8px;width:20px;height:20px;'
      +   'border-radius:50%;background:rgba(147,197,253,.22);color:#93c5fd;font-size:11px;font-weight:900;'
      +   'display:flex;align-items:center;justify-content:center;}'
      + '.t8-cautions{margin:0;padding:0;}'
      + '.t8-caution{color:#fca5a5;font-size:12.5px;line-height:1.55;margin:6px 0 0;'
      +   'padding-left:16px;text-indent:-16px;}'
      // ── 8대 기술 인덱스 ──
      + '.t8-index{position:relative;background:none;border-radius:0;box-shadow:none;'
      +   'padding:26px 30px 28px;margin:0;}.t8-index::before{content:"";position:absolute;left:30px;right:30px;top:0;height:1px;background:linear-gradient(90deg,rgba(147,197,253,0),rgba(147,197,253,.42),rgba(147,197,253,0));}'
      + '.t8-index-h{color:#93c5fd;font-size:12px;font-weight:800;letter-spacing:.24em;'
      +   'text-transform:uppercase;margin:0 0 4px;}'
      + '.t8-index-s{color:#fff;font-size:20px;font-weight:900;letter-spacing:-.02em;margin:0 0 16px;}'
      + '.t8-chips{display:grid;grid-template-columns:repeat(4,1fr);gap:11px;}'
      + '.t8-chip{display:flex;align-items:center;gap:10px;text-align:left;background:rgba(255,255,255,.06);'
      +   'border:1px solid rgba(255,255,255,.14);border-radius:13px;padding:10px 12px;cursor:pointer;'
      +   'color:#f1f5f9;font:inherit;transition:transform .15s,background .15s,border-color .15s;}'
      + '.t8-chip:hover{transform:translateY(-2px);background:rgba(255,255,255,.13);border-color:rgba(147,197,253,.6);}'
      + '.t8-chip-n{flex:0 0 auto;width:25px;height:25px;border-radius:8px;'
      +   'background:linear-gradient(135deg,#3b82f6,#1d4ed8);color:#fff;font-size:12px;font-weight:900;'
      +   'display:flex;align-items:center;justify-content:center;}'
      + '.t8-chip-t{font-size:12.5px;font-weight:700;line-height:1.25;letter-spacing:-.01em;}'
      // ── 기술 카드 ──
      + '.t8-slide{position:relative;background:#fff;border:1px solid #e5e9f0;border-radius:22px;'
      +   'padding:22px 24px;margin:0 0 20px;scroll-margin-top:96px;'
      +   'box-shadow:0 1px 2px rgba(15,23,42,.04),0 18px 40px -26px rgba(15,23,42,.22);}'
      + '.t8-head{display:flex;align-items:flex-start;gap:14px;margin:0 0 18px;}'
      + '.t8-badge{flex:0 0 auto;min-width:52px;height:52px;border-radius:14px;'
      +   'background:linear-gradient(135deg,#0b1e4d,#1d4ed8);color:#fff;'
      +   'display:flex;flex-direction:column;align-items:center;justify-content:center;line-height:1;'
      +   'box-shadow:0 8px 18px -8px rgba(29,78,216,.7);}'
      + '.t8-badge small{font-size:8px;font-weight:800;letter-spacing:.16em;opacity:.85;margin-bottom:2px;}'
      + '.t8-badge b{font-size:19px;font-weight:900;}'
      + '.t8-title{color:#0f172a;font-size:20px;font-weight:900;letter-spacing:-.02em;margin:2px 0 4px;}'
      + '.t8-sub{color:#475569;font-size:13.5px;line-height:1.6;margin:0;}'
      + '.t8-cols{display:grid;grid-template-columns:repeat(3,1fr);gap:14px;margin:0 0 16px;}'
      + '.t8-cell{background:#f8fafc;border:1px solid #eef2f7;border-radius:14px;padding:14px 15px;}'
      + '.t8-tag{display:inline-block;font-size:11.5px;font-weight:800;letter-spacing:.02em;'
      +   'padding:4px 10px;border-radius:999px;margin:0 0 10px;}'
      + '.t8-tag.cause{background:#eef1f6;color:#334155;}'
      + '.t8-tag.solve{background:#e6f0ff;color:#2563eb;}'
      + '.t8-tag.effect{background:#f6eddd;color:#c08a3e;}'
      + '.t8-ul{list-style:none;margin:0;padding:0;}'
      + '.t8-ul li{position:relative;padding:5px 0 5px 16px;color:#334155;font-size:13px;line-height:1.55;}'
      + '.t8-ul li:before{content:"";position:absolute;left:0;top:11px;width:6px;height:6px;border-radius:50%;'
      +   'background:#94a3b8;}'
      + '.t8-cell.solve .t8-ul li:before{background:#2563eb;}'
      + '.t8-cell.effect .t8-ul li:before{background:#c08a3e;}'
      + '.t8-point{display:flex;align-items:flex-start;gap:10px;background:#eef4ff;border:1px solid #dbe6ff;'
      +   'border-radius:14px;padding:13px 16px;color:#1e40af;font-size:13.5px;font-weight:700;line-height:1.55;}'
      + '.t8-point i{flex:0 0 auto;width:20px;height:20px;border-radius:50%;background:#2563eb;color:#fff;'
      +   'font-size:12px;font-weight:900;font-style:normal;display:flex;align-items:center;justify-content:center;margin-top:1px;}'
      // ── 반응형 ──
      + '@media(max-width:900px){'
      +   '#tech-grid.t8-wrap{padding:0;}'
      +   '.t8-core{border-radius:18px;}.t8-hero{padding:20px 16px 14px;}'
      +   '.t8-hero-title{font-size:21px;}'
      +   '.t8-hero-grid{grid-template-columns:1fr;gap:14px;}'
      +   '.t8-index{padding:18px 15px 18px;}.t8-index::before{left:15px;right:15px;}'
      +   '.t8-index-s{font-size:17px;}'
      +   '.t8-chips{grid-template-columns:repeat(2,1fr);gap:9px;}'
      +   '.t8-slide{border-radius:16px;padding:16px 15px;}'
      +   '.t8-title{font-size:18px;}'
      +   '.t8-cols{grid-template-columns:1fr;gap:10px;}'
      + '}';
    var s = document.createElement('style');
    s.id = 't8-style';
    s.textContent = css;
    document.head.appendChild(s);
  }

  // 후드 측면 단면 도면(SVG) + 11개 부품 콜아웃
  function hoodSVG() {
    var g = ''
      // 천장 + 해치
      + '<line x1="250" y1="44" x2="470" y2="44" stroke="#0b1e4d" stroke-width="3"/>'
      + '<path d="M262 44 L274 32 M292 44 L304 32 M322 44 L334 32 M352 44 L364 32 M382 44 L394 32 M412 44 L424 32 M442 44 L454 32" stroke="#94a3b8" stroke-width="1.5"/>'
      // 1 토출 덕트
      + '<ellipse cx="360" cy="44" rx="27" ry="6" fill="#dbe3ee" stroke="#0b1e4d" stroke-width="1.5"/>'
      + '<rect x="333" y="44" width="54" height="54" fill="url(#t8pipe)" stroke="#0b1e4d" stroke-width="2"/>'
      // 2 분리청소 플랜지
      + '<rect x="325" y="98" width="70" height="20" rx="4" fill="url(#t8pipe)" stroke="#0b1e4d" stroke-width="2"/>'
      + '<line x1="327" y1="108" x2="393" y2="108" stroke="#1d4ed8" stroke-width="1.5" stroke-dasharray="5 4"/>'
      // 3 F.V.D 댐퍼
      + '<rect x="322" y="120" width="76" height="34" rx="3" fill="#eef2f8" stroke="#0b1e4d" stroke-width="2"/>'
      + '<line x1="330" y1="150" x2="390" y2="124" stroke="#0b1e4d" stroke-width="2"/>'
      + '<circle cx="386" cy="126" r="3.4" fill="#dc2626"/>'
      // 4 스윙 볼조인트 + 360° 회전 표시
      + '<rect x="345" y="154" width="30" height="20" fill="url(#t8pipe)" stroke="#0b1e4d" stroke-width="2"/>'
      + '<ellipse cx="360" cy="192" rx="31" ry="12" fill="none" stroke="#1d4ed8" stroke-width="1.5" stroke-dasharray="5 4"/>'
      + '<path d="M330 189 l-6 -4 6 -3" fill="none" stroke="#1d4ed8" stroke-width="1.5"/>'
      + '<path d="M390 195 l6 4 -6 3" fill="none" stroke="#1d4ed8" stroke-width="1.5"/>'
      + '<circle cx="360" cy="192" r="19" fill="url(#t8pipe)" stroke="#0b1e4d" stroke-width="2"/>'
      + '<circle cx="360" cy="192" r="7" fill="#c9d4e3" stroke="#0b1e4d" stroke-width="1"/>'
      // 본체 파이프
      + '<rect x="337" y="210" width="46" height="150" fill="url(#t8pipe)" stroke="#0b1e4d" stroke-width="2"/>'
      // 5 방지망
      + '<rect x="337" y="224" width="46" height="22" fill="url(#t8mesh)" stroke="#0b1e4d" stroke-width="1.5"/>'
      // 6 텐션 스프링(코일)
      + (function () { var s = ''; for (var k = 0; k < 6; k++) { s += '<ellipse cx="360" cy="' + (260 + k * 11) + '" rx="18" ry="5" fill="none" stroke="#0b1e4d" stroke-width="1.6"/>'; } return s; })()
      // 7 걸링 스톱바
      + '<rect x="316" y="334" width="88" height="12" rx="3" fill="#0b1e4d"/>'
      // 8 나팔캡
      + '<ellipse cx="360" cy="366" rx="27" ry="6" fill="#dbe3ee" stroke="#0b1e4d" stroke-width="1.5"/>'
      // 9 나팔
      + '<path d="M337 372 L383 372 L423 448 L297 448 Z" fill="url(#t8pipe)" stroke="#0b1e4d" stroke-width="2"/>'
      // 10 기름받이속
      + '<path d="M312 440 Q360 462 408 440" fill="none" stroke="#1d4ed8" stroke-width="1.6" stroke-dasharray="5 4"/>'
      // 11 기름받이
      + '<path d="M292 456 L428 456 L410 496 Q360 514 310 496 Z" fill="#eef2f8" stroke="#0b1e4d" stroke-width="2"/>'
      + '<ellipse cx="360" cy="456" rx="68" ry="8" fill="#f7f9fc" stroke="#0b1e4d" stroke-width="1.5"/>'
      // 210Ø 치수선
      + '<line x1="292" y1="524" x2="428" y2="524" stroke="#1d4ed8" stroke-width="1.2"/>'
      + '<line x1="292" y1="519" x2="292" y2="529" stroke="#1d4ed8" stroke-width="1.2"/>'
      + '<line x1="428" y1="519" x2="428" y2="529" stroke="#1d4ed8" stroke-width="1.2"/>'
      + '<text x="360" y="521" text-anchor="middle" font-size="11" font-weight="700" fill="#1d4ed8">210Ø</text>';
    var CALL = [
      [1, 'L', 333, 70, '토출', '125Ø·150Ø'],
      [2, 'R', 395, 108, '분리청소', '파이프링 분리'],
      [3, 'L', 322, 137, 'F.V.D', '풍속조절·방화댐퍼'],
      [4, 'R', 379, 192, '스윙', '360° 스윙'],
      [5, 'L', 337, 235, '방지망', '이물질 방지망'],
      [6, 'R', 383, 290, '텐션', '상하작동·강약조절'],
      [7, 'L', 316, 340, '걸링', '스톱바·브레이크'],
      [8, 'R', 386, 366, '나팔캡', '분리청소 가능'],
      [9, 'L', 317, 410, '나팔', '하부 나팔'],
      [10, 'R', 408, 442, '기름받이속', '기름 낙하 방지'],
      [11, 'L', 292, 480, '기름받이', '210Ø']
    ];
    var co = '';
    for (var i = 0; i < CALL.length; i++) {
      var n = CALL[i][0], side = CALL[i][1], ax = CALL[i][2], ay = CALL[i][3];
      var title = esc(CALL[i][4]), detail = esc(CALL[i][5]);
      var bx = side === 'L' ? 118 : 602;
      var edge = side === 'L' ? bx + 13 : bx - 13;
      var tx = side === 'L' ? 98 : 622;
      var anc = side === 'L' ? 'end' : 'start';
      co += '<line x1="' + ax + '" y1="' + ay + '" x2="' + edge + '" y2="' + ay + '" stroke="#94a3b8" stroke-width="1.3"/>'
        + '<circle cx="' + ax + '" cy="' + ay + '" r="3.2" fill="#0b1e4d"/>'
        + '<circle cx="' + bx + '" cy="' + ay + '" r="13" fill="#0b1e4d"/>'
        + '<text x="' + bx + '" y="' + (ay + 4) + '" text-anchor="middle" font-size="12" font-weight="800" fill="#fff">' + n + '</text>'
        + '<text x="' + tx + '" y="' + (ay - 2) + '" text-anchor="' + anc + '" font-size="13.5" font-weight="800" fill="#0f172a">' + title + '</text>'
        + '<text x="' + tx + '" y="' + (ay + 14) + '" text-anchor="' + anc + '" font-size="11.5" fill="#5b6b82">' + detail + '</text>';
    }
    return '<svg class="t8-hood" viewBox="0 0 720 544" xmlns="http://www.w3.org/2000/svg" font-family="inherit" role="img" aria-label="유성에이스 파이프형 후드 구조 도면 — 11개 부품">'
      + '<defs>'
      +   '<linearGradient id="t8pipe" x1="0" y1="0" x2="1" y2="0">'
      +     '<stop offset="0" stop-color="#ffffff"/><stop offset="0.5" stop-color="#e7edf5"/><stop offset="1" stop-color="#c9d4e3"/>'
      +   '</linearGradient>'
      +   '<pattern id="t8mesh" width="7" height="7" patternUnits="userSpaceOnUse">'
      +     '<path d="M0 0 L7 0 M0 0 L0 7" stroke="#9fb0c6" stroke-width="1"/>'
      +   '</pattern>'
      + '</defs>'
      + g + co + '</svg>';
  }

  function heroHTML() {
    var adv = '';
    for (var a = 0; a < ADV.length; a++) adv += '<li>' + esc(ADV[a]) + '</li>';
    var caut = '';
    for (var c = 0; c < CAUTION.length; c++) caut += '<p class="t8-caution">※ ' + esc(CAUTION[c]) + '</p>';
    return '<section class="t8-hero">'
      + '<div class="t8-hero-eyebrow">PRODUCT STRUCTURE</div>'
      + '<h2 class="t8-hero-title">유성에이스 후드의 장점</h2>'
      + '<p class="t8-hero-sub">유성에이스 파이프형 후드는 토출부터 기름받이까지 11개 부품이 유기적으로 맞물린 구조입니다. '
      +   '각 부품이 분리청소·풍속조절·안전정지 기능을 담당해, 사용 편의와 위생·안전을 동시에 잡았습니다.</p>'
      + '<div class="t8-hero-diagram">'
      +   '<div class="t8-dh">후드 구조 한눈에 보기<span>측면 단면도 · 11개 부품</span></div>'
      +   hoodSVG()
      + '</div>'
      + '<div class="t8-panel"><div class="t8-panel-h">파이프 제품의 장점</div>'
      +   '<ul class="t8-advlist">' + adv + '</ul>'
      +   '<div class="t8-cautions">' + caut + '</div></div>'
      + '</section>';
  }

  function indexHTML() {
    var chips = '';
    for (var j = 0; j < DATA.length; j++) {
      chips += '<button type="button" class="t8-chip" data-go="' + (j + 1) + '">'
        + '<span class="t8-chip-n">' + pad(j + 1) + '</span>'
        + '<span class="t8-chip-t">' + esc(DATA[j].t) + '</span></button>';
    }
    return '<div class="t8-index">'
      + '<div class="t8-index-h">CORE TECHNOLOGY</div>'
      + '<div class="t8-index-s">유성에이스 8대 핵심 기술</div>'
      + '<div class="t8-chips">' + chips + '</div></div>';
  }

  function bullets(arr) {
    var li = '';
    for (var i = 0; i < arr.length; i++) li += '<li>' + esc(arr[i]) + '</li>';
    return '<ul class="t8-ul">' + li + '</ul>';
  }

  function cardHTML(d, i) {
    return '<section class="t8-slide t8-rv" id="t8-slide-' + (i + 1) + '">'
      + '<div class="t8-head t8-rvc">'
      +   '<div class="t8-badge"><small>TECH</small><b>' + pad(i + 1) + '</b></div>'
      +   '<div><h3 class="t8-title">' + esc(d.t) + '</h3>'
      +     '<p class="t8-sub">' + esc(d.sub) + '</p></div>'
      + '</div>'
      + '<div class="t8-cols">'
      +   '<div class="t8-cell cause t8-rvc"><span class="t8-tag cause">문제 원인</span>' + bullets(d.cause) + '</div>'
      +   '<div class="t8-cell solve t8-rvc"><span class="t8-tag solve">해결 방법</span>' + bullets(d.solve) + '</div>'
      +   '<div class="t8-cell effect t8-rvc"><span class="t8-tag effect">효과</span>' + bullets(d.effect) + '</div>'
      + '</div>'
      + '<div class="t8-point t8-rvc"><i>✓</i><span>' + esc(d.point) + '</span></div>'
      + '</section>';
  }

  // 상단 인덱스 칩 클릭 → 해당 카드로 부드럽게 스크롤
  function wireIndex() {
    if (window.__t8idx) return;
    window.__t8idx = true;
    document.addEventListener('click', function (e) {
      var t = e.target;
      var chip = t && t.closest ? t.closest('.t8-chip') : null;
      if (!chip) return;
      var n = chip.getAttribute('data-go');
      var target = document.getElementById('t8-slide-' + n);
      if (target) {
        try { target.scrollIntoView({ behavior: 'smooth', block: 'start' }); }
        catch (err) { target.scrollIntoView(); }
      }
    });
  }

  // 스크롤 진입 시 카드가 하나씩 나타나도록
  function setupReveal() {
    var els = document.querySelectorAll('#tech-grid .t8-rv');
    if (!els.length) return;
    // 병합된 상단 카드(후드의 장점 + 8대 핵심기술)는 한 몸이므로 항상 함께 노출
    var hero = document.querySelector('#tech-grid .t8-hero');
    var index = document.querySelector('#tech-grid .t8-index');
    function markIn(el) {
      if (!el || el.classList.contains('t8-in')) return;
      el.classList.add('t8-in');
      if (el === hero && index) index.classList.add('t8-in');
      else if (el === index && hero) hero.classList.add('t8-in');
    }
    if (!('IntersectionObserver' in window)) {
      for (var f = 0; f < els.length; f++) markIn(els[f]);
      return;
    }
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) {
        if (en.isIntersecting) { markIn(en.target); io.unobserve(en.target); }
      });
    }, { threshold: 0.12, rootMargin: '0px 0px -8% 0px' });
    for (var i = 0; i < els.length; i++) io.observe(els[i]);
    // 진입 시점에 이미 화면 안(92% 이내)에 들어와 있는 요소는 즉시 노출
    setTimeout(function () {
      var vh = window.innerHeight || document.documentElement.clientHeight;
      for (var k = 0; k < els.length; k++) {
        var r = els[k].getBoundingClientRect();
        if (r.top < vh * 0.92) markIn(els[k]);
      }
    }, 120);
  }

  // tech 페이지 진입 시, 하단 고정 스크롤 휠마크가 콘텐츠를 가리지 않도록 숨김
  function hideScrollMark() {
    var page = document.getElementById('page-tech');
    if (page && page.classList.contains('active')) {
      var mk = document.getElementById('usung-scrollmark');
      if (mk) { mk.style.opacity = '0'; mk.style.pointerEvents = 'none'; }
    }
  }

  function render() {
    var grid = document.getElementById('tech-grid');
    if (!grid) return;
    injectStyle();
    grid.className = 't8-wrap';
    grid.setAttribute('data-ver', VER);
    var html = '<div class="t8-core t8-rv">' + heroHTML() + indexHTML() + '</div>';
    for (var i = 0; i < DATA.length; i++) html += cardHTML(DATA[i], i);
    grid.innerHTML = html;
    hideScrollMark();
    wireIndex();
    setupReveal();
  }

  // 원래 렌더러가 다시 다크카드로 덮어쓰지 못하도록 오버라이드
  try { window.renderTechGrid = render; } catch (e) {}

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

  // 탭 전환(navigate)으로 tech 페이지에 진입할 때도 보장
  try {
    var _nav = window.navigate;
    if (typeof _nav === 'function' && !_nav.__t8) {
      window.navigate = function (id) {
        var r = _nav.apply(this, arguments);
        if (id === 'tech') { setTimeout(render, 30); setTimeout(hideScrollMark, 60); }
        return r;
      };
      window.navigate.__t8 = true;
    }
  } catch (e) {}
})();
