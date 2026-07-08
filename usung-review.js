/* =====================================================================
 * usung-review.js  —  "홈페이지내용정리_과장님과검토" 반영 오버레이
 * ---------------------------------------------------------------------
 * 원본(index_v6.html)·theme-white.css·usung-overlay.js 를 건드리지 않고
 * DOM 패치만으로 과장님 검토 요청사항을 적용한다.
 * 이 파일을 inject 목록에서 빼면 즉시 원복(되돌리기 안전).
 *
 * [적용 현황]
 *  slide 3   홈 히어로 — "대한민국 덕트 No.1"만, 하단에 제품라인업/견적문의 버튼
 *  slide 4   FIM 헤딩 "움직임으로"(shimmer) 너무 연함 → 주변과 동일 진한 네이비
 *  slide 5   스탯 스트립 + FIM 카드 그리드(빨간 네모칸) 삭제
 *  slide 9   시공갤러리 모달 — 사진 영역 확대(정보 패널보다 사진 크게)
 *  slide 10  시공갤러리 모달 — 무의미한 "제품 사양"(시공/품질) 삭제 (제품명 매핑은 이후)
 *  slide 12  코어기술 — 일체형 기름받이+나팔캡→기름낙하방지필터(기름받이속), 통합 LED 라이팅→VD
 *  slide 18  기술 탭 "기술" → "기술 및 인증현황" 명칭 변경
 *  slide 20  사용방법 — "유성에이스 후드, 4가지 핵심 특징" 섹션 전체 삭제
 *  slide 21  사용방법 — 가이드 상단에 영상 링크 자리(네모박스) 삽입, 나중에 href만 연결
 *  slide 28  인증현황(고객센터) 내용을 코어기술 페이지 하단으로 이동해 한 탭으로 통합,
 *            고객센터의 인증현황·프로세스 탭(및 프로세스 페이지) 제거
 *  slide 26  게시판 필터 — 전체/제품소식/블로그만, 기술정보·시공사례·업계동향 삭제
 *  slide 27  게시판 — 작성자 열 삭제, 댓글 [0] 숨김, NEW 배지는 최근 3개월(90일) 이내만
 *  slide 29  고객센터 — "시공 사례 / 견적 상담" → "견적 상담", "매장 규모별 맞춤 설계" 삭제
 *  [Task2]   부품 페이지 — 48종 정규화 누끼(1000x1000)로 전면 재구성:
 *            카드 크게(4열)+박스 균일(정사각), 필터 카테고리 재생성, 모달 NP 기준 교체
 *            (이미지: parts/01_..~48_..png, macOS NFD 파일명 → 런타임 normalize('NFD'))
 *  [Task3]   제품 페이지 — 215종 카탈로그 재구성(UP 배열): 갤럭시/LED조명/파이프/후레쉬볼/코브라후드
 *            카테고리 필터+카드 그리드+상세 모달, filterProducts 재정의, 히어로 라벨 215로 정정
 *            (이미지: products/final/gal·led·pipe·ball·cobra·cobrat###.png, ASCII 파일명)
 * ===================================================================== */
(function () {
  'use strict';

  var NAVY  = '#0c1e5a';
  var BRAND = '#1e40af';
  var NEW_DAYS = 90;

  function setImp(el, prop, val) { try { el.style.setProperty(prop, val, 'important'); } catch (e) {} }

  /* ---- 리뷰 전용 CSS 1회 주입 --------------------------------------- */
  function injectReviewCss() {
    if (document.getElementById('usung-review-css')) return;
    var css = ''
      // slide 27 : 게시판 데스크톱 그리드에서 '작성자' 열(4번째 셀) 제거 (6열 → 5열)
      // 헤더행 클래스: grid-cols-[...] / 데이터행 클래스: md:grid-cols-[...] (반응형)
      + '#page-board .grid-cols-\\[60px_90px_1fr_120px_110px_80px\\]{grid-template-columns:60px 90px 1fr 110px 80px !important;}'
      + '@media(min-width:768px){#page-board .md\\:grid-cols-\\[60px_90px_1fr_120px_110px_80px\\]{grid-template-columns:60px 90px 1fr 110px 80px !important;}}'
      + '#page-board .grid-cols-\\[60px_90px_1fr_120px_110px_80px\\] > :nth-child(4),'
      + '#page-board .md\\:grid-cols-\\[60px_90px_1fr_120px_110px_80px\\] > :nth-child(4){display:none !important;}'
      // slide 28 : 코어기술로 이동한 인증현황 블록 — 구분선 + reveal 강제 표시(스크롤 애니 미발동 대비)
      + '#ace-cert-merged{margin-top:2.5rem !important;padding-top:2.5rem !important;border-top:1px solid rgba(12,30,90,.10) !important;}'
      + '#ace-cert-merged .reveal{opacity:1 !important;transform:none !important;}'
      // slide 9 : 시공갤러리 모달 — 사진 영역을 더 크게(정보 패널 축소), 사진이 잘 보이도록
      + '#gallery-modal .gm-card{grid-template-columns:minmax(0,1.7fr) minmax(0,1fr) !important;}'
      + '@media(max-width:768px){#gallery-modal .gm-card{grid-template-columns:1fr !important;}}'
      + '#gallery-modal .gm-image{min-height:520px !important;}'
      + '#gallery-modal .gm-image img{width:100% !important;height:100% !important;object-fit:cover !important;}'
      // Task2 : 부품 카드 크게 + 박스 균일 — 데스크톱 5→4열, md 4→3열 (셀이 커져 부품이 크게 보임)
      + '#parts-grid{grid-template-columns:repeat(2,minmax(0,1fr)) !important;gap:1.5rem !important;}'
      + '@media(min-width:768px){#parts-grid{grid-template-columns:repeat(3,minmax(0,1fr)) !important;}}'
      + '@media(min-width:1024px){#parts-grid{grid-template-columns:repeat(4,minmax(0,1fr)) !important;}}'
      // 이미지 박스 여백 축소 → 부품이 프레임을 더 채워 크게 보이고, 박스 비율(정사각)은 유지되어 균일
      + '#parts-grid .aspect-square{padding:.5rem !important;}'
      + '#parts-grid .aspect-square img{max-width:100% !important;max-height:100% !important;}'
      // Task3 : 제품 상세 모달
      + '#up-modal{display:none;}'
      + '#up-modal.flex{display:flex !important;}'
      + '#up-modal img{image-rendering:auto;}';
    var st = document.createElement('style');
    st.id = 'usung-review-css';
    st.textContent = css;
    document.head.appendChild(st);
  }

  /* ---- slide 3 : 홈 히어로 ------------------------------------------ */
  function homeHero() {
    var hero = document.getElementById('anim-hero');
    if (!hero) return;
    hero.querySelectorAll('[data-cms="h_sub"], [data-i18n="hero_sub"]').forEach(function (el) {
      el.style.display = 'none';
    });
    if (!hero.querySelector('#ace-hero-cta')) {
      var wrap = document.createElement('div');
      wrap.id = 'ace-hero-cta';
      wrap.style.cssText = 'display:flex;flex-wrap:wrap;gap:14px;justify-content:center;margin-top:32px;';
      wrap.innerHTML =
        '<button type="button" onclick="navigate(\'products\')" ' +
          'style="padding:15px 34px;border-radius:9999px;font-weight:800;font-size:16px;border:none;' +
          'cursor:pointer;background:' + BRAND + ';color:#fff;letter-spacing:-.01em;' +
          'box-shadow:0 12px 32px -8px rgba(30,64,175,.6);transition:transform .15s;" ' +
          'onmouseover="this.style.transform=\'scale(1.05)\'" onmouseout="this.style.transform=\'scale(1)\'">제품 라인업 보기</button>' +
        '<button type="button" onclick="navigate(\'about\',\'inquiry-section\')" ' +
          'style="padding:15px 34px;border-radius:9999px;font-weight:800;font-size:16px;' +
          'cursor:pointer;background:rgba(255,255,255,.9);color:' + NAVY + ';' +
          'border:1.5px solid ' + NAVY + ';letter-spacing:-.01em;transition:transform .15s;" ' +
          'onmouseover="this.style.transform=\'scale(1.05)\'" onmouseout="this.style.transform=\'scale(1)\'">견적 문의</button>';
      hero.appendChild(wrap);
    }
  }

  /* ---- slide 4 : FIM 헤딩 "움직임으로" 진하게 ------------------------ */
  function fimHeading() {
    document.querySelectorAll('#page-home .shimmer-text, #page-home [data-cms="fim_title_b"]').forEach(function (el) {
      setImp(el, 'background', 'none');
      setImp(el, 'background-image', 'none');
      setImp(el, '-webkit-background-clip', 'initial');
      setImp(el, 'background-clip', 'initial');
      setImp(el, 'color', NAVY);
      setImp(el, '-webkit-text-fill-color', NAVY);
      setImp(el, 'animation', 'none');
      setImp(el, 'font-weight', '900');
    });
    var a = document.querySelector('#page-home [data-cms="fim_title_a"]');
    if (a) {
      var head = a.closest('h2');
      if (head) {
        setImp(head, 'color', NAVY);
        setImp(head, '-webkit-text-fill-color', NAVY);
        setImp(head, 'background', 'none');
        setImp(head, 'background-image', 'none');
        setImp(head, 'text-shadow', '0 1px 0 rgba(12,30,90,.30)');
      }
    }
  }

  /* ---- slide 5 : 빨간 네모칸 삭제 (스탯 스트립 + FIM 카드) ----------- */
  function homeRemoveBoxed() {
    var impact = document.querySelector('#page-home [data-i18n="impact_copy"]');
    if (impact) { var box = impact.closest('div'); if (box) box.style.display = 'none'; }
    document.querySelectorAll('#page-home .count').forEach(function (c) {
      var g = c.closest('.grid'); if (g) g.style.display = 'none';
    });
    document.querySelectorAll('#page-home .fcard').forEach(function (card) {
      var g = card.closest('.grid'); if (g) g.style.display = 'none';
    });
  }

  /* ---- slide 26 : 게시판 필터 탭 정리 ------------------------------- */
  function boardFilters() {
    var b = document.getElementById('page-board');
    if (!b) return;
    b.querySelectorAll('button').forEach(function (btn) {
      var oc = btn.getAttribute('onclick') || '';
      if (/setBoardFilter\('(기술정보|시공사례|업계동향)'\)/.test(oc)) {
        btn.style.display = 'none';
      }
    });
  }

  /* ---- slide 27 : 게시판 댓글[0] 숨김 + NEW 배지 90일 제한 ---------- */
  function boardMeta() {
    var b = document.getElementById('page-board');
    if (!b) return;
    // 댓글 카운트 "[n]" 숨김 (댓글 미연동)
    b.querySelectorAll('span, div').forEach(function (el) {
      if (el.children.length === 0 && /^\[\d+\]$/.test((el.textContent || '').trim())) {
        el.style.display = 'none';
      }
    });
    // NEW 배지: 등록일이 90일 이내인 글만 유지
    var now = Date.now();
    b.querySelectorAll('span').forEach(function (badge) {
      if (!/^new$/i.test((badge.textContent || '').trim())) return;
      var row = badge.closest('a') || badge.closest('div[class*="grid-cols"]') ||
                badge.closest('li') || badge.parentElement;
      var txt = row ? row.textContent : '';
      var m = txt.match(/(20\d\d)\.(\d\d)\.(\d\d)/);
      if (m) {
        var d = new Date(+m[1], +m[2] - 1, +m[3]).getTime();
        if (now - d > NEW_DAYS * 86400000) badge.style.display = 'none';
      }
    });
  }

  /* ---- slide 29 : 고객센터 "견적 상담"으로 정리 --------------------- */
  function customerMenu() {
    // 내비게이션/메가메뉴 영역으로 스캔 범위 제한 (전체 DOM 스캔 방지)
    var scopes = document.querySelectorAll(
      'nav, header, [class*="mega"], [class*="menu"], [class*="dropdown"], [id*="menu"]');
    scopes.forEach(function (scope) {
      scope.querySelectorAll('*').forEach(function (el) {
        if (el.children.length !== 0) return;
        var t = (el.textContent || '').trim();
        if (/^매장\s*규모별\s*맞춤\s*설계$/.test(t)) {
          el.style.display = 'none';
        } else if (/^시공\s*사례\s*\/\s*견적\s*상담$/.test(t)) {
          // data-i18n="nav_inquiry" 가 재렌더 시 원문을 되돌리므로 가드 없이 매 패스 재적용
          el.textContent = '견적 상담';
        }
      });
    });
  }

  /* ---- slide 28 : 인증현황 내용을 코어기술 페이지 하단으로 이동 -------- */
  function techCertMerge() {
    if (document.getElementById('ace-cert-merged')) return;   // 이미 통합됨
    var tech = document.getElementById('page-tech');
    var cert = document.getElementById('page-certification');
    if (!tech || !cert) return;
    var block = cert.children[0];                             // .max-w-7xl 래퍼(제목+필터+카드+통계)
    if (!block) return;
    block.id = 'ace-cert-merged';
    var kids = tech.children;
    var lastCta = kids.length ? kids[kids.length - 1] : null; // 마지막 "설치문의" CTA 섹션 앞에 삽입
    if (lastCta) { tech.insertBefore(block, lastCta); } else { tech.appendChild(block); }
  }

  /* ---- slide 28 : 고객센터의 인증현황·프로세스 탭 제거 ---------------- */
  function hideNavRows() {
    ['nav_process', 'nav_archive'].forEach(function (key) {
      document.querySelectorAll('[data-i18n="' + key + '"]').forEach(function (sp) {
        var row = sp.closest('button') || sp.closest('a') || sp.parentElement;
        if (row) row.style.display = 'none';
      });
    });
  }

  /* ---- slide 18 : "기술" → "기술 및 인증현황" 명칭 변경 --------------- */
  function relabelTechNav() {
    // data-i18n="nav_tech" 가 재렌더 시 원문을 되돌리므로 가드 없이 매 패스 재적용
    document.querySelectorAll('[data-i18n="nav_tech"]').forEach(function (sp) {
      if ((sp.textContent || '').trim() !== '기술 및 인증현황') sp.textContent = '기술 및 인증현황';
    });
  }

  /* ---- slide 12 : 코어기술 카드 명칭 변경 --------------------------- */
  //  일체형 기름받이 + 나팔캡 → 기름낙하방지필터(기름받이속)
  //  통합 LED 라이팅        → VD
  //  (data-cms 재렌더 대비: 원문이 되돌아오면 자동 재적용, 이미 바뀐 경우 skip → 무한루프 없음)
  function techLabels() {
    document.querySelectorAll('#page-tech h3').forEach(function (h) {
      var t = (h.textContent || '').trim();
      if (t === '일체형 기름받이 + 나팔캡') h.textContent = '기름낙하방지필터(기름받이속)';
      else if (t === '통합 LED 라이팅')     h.textContent = 'VD';
    });
  }

  /* ---- slide 20 : 사용방법 "유성에이스 후드, 4가지 핵심 특징" 섹션 삭제 - */
  function manualDeleteFeatures() {
    var m = document.getElementById('page-manual');
    if (!m) return;
    m.querySelectorAll('.mb-20').forEach(function (d) {
      if (/4\s*가지\s*핵심\s*특징/.test(d.textContent || '') && d.style.display !== 'none') {
        d.style.display = 'none';
      }
    });
  }

  /* ---- slide 21 : 사용방법 가이드 상단에 영상 링크 자리(네모박스) --- */
  //  나중에 href 만 넣으면 되는 자리 표시자. #ace-video-slot 로 1회만 삽입.
  function manualVideoSlot() {
    if (document.getElementById('ace-video-slot')) return;
    var m = document.getElementById('page-manual');
    if (!m) return;
    var hdr = null;
    m.querySelectorAll('div.mb-16').forEach(function (d) {
      if (!hdr && /MAINTENANCE\s*GUIDE/.test(d.textContent || '')) hdr = d;
    });
    if (!hdr) return;
    var box = document.createElement('a');
    box.id = 'ace-video-slot';
    box.href = '#';
    box.style.cssText =
      'display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;' +
      'max-width:900px;margin:0 auto 40px;padding:38px 20px;border-radius:16px;' +
      'border:2px dashed rgba(30,64,175,.45);background:rgba(30,64,175,.04);' +
      'color:' + BRAND + ';text-decoration:none;text-align:center;cursor:pointer;';
    box.innerHTML =
      '<span style="font-size:34px;line-height:1;">&#9654;</span>' +
      '<span style="font-weight:800;font-size:16px;letter-spacing:-.01em;">시공 · 사용 영상 자리</span>' +
      '<span style="font-size:13px;color:#64748b;">이미지 / 유튜브 링크를 이곳에 연결하세요 (추후 연결)</span>';
    hdr.insertAdjacentElement('afterend', box);
  }

  /* ---- slide 10 : 시공갤러리 모달 — 무의미한 "제품 사양"(시공/품질) 삭제 - */
  //  사진 확대는 CSS(injectReviewCss)에서 처리. 제품명 매핑은 이후 라운드.
  function galleryModalTweak() {
    document.querySelectorAll('#gallery-modal .gm-specs').forEach(function (dl) {
      var sec = dl.parentElement;
      if (sec && sec.style.display !== 'none') sec.style.display = 'none';
    });
  }

  /* ---- [Task2] 부품 페이지 — 48종 재구성 (정규화 누끼 + 균일 카드) --------- */
  var NP = [
    { img:'parts/01_반후지_150-125파이.png', name:'반후지 (150·125Ø)', cat:'상부', desc:'후드와 덕트 연결부를 마감하는 크롬 커버. 원형 입구부를 깔끔하게 마감합니다.', specs:'크롬 도금 / 150·125Ø' },
    { img:'parts/02_측향캡_125-100파이.png', name:'측향캡 (125·100Ø)', cat:'상부', desc:'측면 배기 방향의 덕트 마감 캡.', specs:'125·100Ø' },
    { img:'parts/03_VD풍량조절댐퍼.png', name:'VD 풍량조절댐퍼', cat:'상부', desc:'덕트 내 공기 흐름량을 수동으로 조절하는 볼륨댐퍼.', specs:'VD = Volume Damper / 레버 수동' },
    { img:'parts/04_FVD방화댐퍼.png', name:'FVD 방화댐퍼', cat:'상부', desc:'방화·풍량 통합 댐퍼. 화재 시 퓨즈가 용단되면 날개가 자동으로 닫혀 확산을 차단합니다.', specs:'FVD = Fire Volume Damper / 72°C 용단' },
    { img:'parts/05_FVD휴즈.png', name:'FVD 휴즈', cat:'상부', desc:'FVD에 장착되는 온도 감응 퓨즈. 화재 시 용단되어 댐퍼를 자동 차단합니다.', specs:'72°C 용단 / 교체형' },
    { img:'parts/06_휴즈핀.png', name:'휴즈핀', cat:'상부', desc:'FVD 휴즈를 댐퍼 본체에 고정하는 핀.', specs:'휴즈 고정용' },
    { img:'parts/07_천정형캡.png', name:'천정형 캡 (150·125·100Ø)', cat:'상부', desc:'덕트가 천장을 관통하는 부위를 마감하는 캡.', specs:'150·125·100Ø' },
    { img:'parts/08_티구찌.png', name:'티구찌', cat:'상부', desc:'T자형 연결 부속. 덕트 분기·교차부에서 방향을 전환합니다.', specs:'T형 연결 / 분기점용' },
    { img:'parts/09_원형상향모터.png', name:'원형 상향모터', cat:'모터', desc:'원형 덕트에 탑재되는 상향 배기 팬 모터.', specs:'원형 덕트 / 상향 배기' },
    { img:'parts/10_원형측향모터.png', name:'원형 측향모터', cat:'모터', desc:'원형 덕트에 탑재되는 측면 배기 팬 모터.', specs:'원형 덕트 / 측면 배기' },
    { img:'parts/11_사각측향모터.png', name:'사각 측향모터', cat:'모터', desc:'사각 덕트에 탑재되는 측면 배기 팬 모터.', specs:'사각 덕트 / 측면 배기' },
    { img:'parts/12_속레일.png', name:'속레일', cat:'부품', desc:'후드 승강 구조의 내부 슬라이드 레일.', specs:'슬라이드 레일 / 승강 구조' },
    { img:'parts/13_사각태엽감속기_흰색.png', name:'사각 태엽감속기 (흰색)', cat:'부품', desc:'태엽 방식으로 후드 승강을 제어하는 사각형 감속기.', specs:'사각형 / 태엽 감속' },
    { img:'parts/14_사각태엽감속기_검정.png', name:'사각 태엽감속기 (검정)', cat:'부품', desc:'사각 태엽감속기(검정 마감).', specs:'사각형 / 태엽 감속' },
    { img:'parts/15_철제태엽감속기.png', name:'철제 태엽감속기', cat:'부품', desc:'철제 소재 태엽 감속기. 고하중 환경에 적합합니다.', specs:'철제 / 고하중 대응' },
    { img:'parts/16_원형태엽감속기.png', name:'원형 태엽감속기', cat:'부품', desc:'원형 태엽 감속기.', specs:'원형 / 태엽 감속' },
    { img:'parts/17_속링_텐션용.png', name:'속링 (텐션용)', cat:'부품', desc:'파이프 내부 연결부를 보강하는 링(텐션용).', specs:'내부 보강 / 텐션용' },
    { img:'parts/18_빠찌링.png', name:'빠찌링', cat:'부품', desc:'텐션 장력을 미세 조절하는 링 부품.', specs:'텐션 조절용' },
    { img:'parts/19_LED안정기.png', name:'LED 안정기', cat:'부품', desc:'LED 조명 구동용 안정기.', specs:'LED 전원부' },
    { img:'parts/20_등받침.png', name:'등받침', cat:'부품', desc:'조명등을 후드 본체에 고정하는 받침 부속.', specs:'조명 고정용' },
    { img:'parts/21_자바라하부봉대.png', name:'자바라 하부봉대', cat:'부품', desc:'하부 자바라(주름관)를 지지하는 봉대.', specs:'하부 봉대' },
    { img:'parts/22_신형자바라하부봉대.png', name:'신형 자바라 하부봉대', cat:'부품', desc:'개선형 자바라 하부봉대.', specs:'신형 / 하부 봉대' },
    { img:'parts/23_8단유지망.png', name:'8단 유지망', cat:'필터', desc:'8단 구조 그리스 필터. 유증기를 걸러 덕트 기름 축적을 줄입니다.', specs:'스테인리스 / 세척 재사용' },
    { img:'parts/24_5단유지망.png', name:'5단 유지망', cat:'필터', desc:'5단 구조 그리스 필터.', specs:'스테인리스 / 세척 재사용' },
    { img:'parts/25_롱망_127-100파이.png', name:'롱망 (127·100Ø)', cat:'필터', desc:'긴 형태의 유지망.', specs:'127·100Ø' },
    { img:'parts/26_유지망_114-100파이.png', name:'유지망 (114·100Ø)', cat:'필터', desc:'원형 유지망.', specs:'114·100Ø' },
    { img:'parts/27_기름받이_127-114-100파이.png', name:'기름받이 (127·114·100Ø)', cat:'하부', desc:'덕트에서 떨어지는 기름을 받는 기름받이.', specs:'127·114·100Ø' },
    { img:'parts/28_기름받이_150파이.png', name:'150Ø 기름받이', cat:'하부', desc:'150Ø 규격 기름받이.', specs:'150Ø' },
    { img:'parts/29_기름받이속.png', name:'기름받이 (속)', cat:'하부', desc:'기름받이 내부 삽입형.', specs:'속 삽입형' },
    { img:'parts/30_기름받이망.png', name:'기름받이망', cat:'하부', desc:'기름받이에 결합되는 망.', specs:'기름받이 부속' },
    { img:'parts/31_일체형기름받이.png', name:'일체형 기름받이', cat:'하부', desc:'이음새 없는 일체형 기름받이로 누유를 원천 차단합니다.', specs:'단일 성형 / 누유 방지' },
    { img:'parts/32_갓기름받이.png', name:'갓 기름받이', cat:'하부', desc:'갓과 결합되는 기름받이.', specs:'갓 결합형' },
    { img:'parts/33_나팔_150파이.png', name:'150Ø 나팔', cat:'나팔·갓', desc:'기름받이 하단 나팔캡. 받은 기름을 한 곳으로 모읍니다.', specs:'150Ø' },
    { img:'parts/34_갓_200파이.png', name:'200Ø 갓', cat:'나팔·갓', desc:'배기 갓(후드 상부 커버).', specs:'200Ø' },
    { img:'parts/35_갓_210파이.png', name:'210Ø 갓', cat:'나팔·갓', desc:'배기 갓(후드 상부 커버).', specs:'210Ø' },
    { img:'parts/36_갓_250파이.png', name:'250Ø 갓', cat:'나팔·갓', desc:'배기 갓(후드 상부 커버).', specs:'250Ø' },
    { img:'parts/37_갓_320파이.png', name:'320Ø 갓', cat:'나팔·갓', desc:'배기 갓(후드 상부 커버).', specs:'320Ø' },
    { img:'parts/38_갓_350파이_반달.png', name:'350Ø 갓 (반달)', cat:'나팔·갓', desc:'반달형 배기 갓.', specs:'350Ø / 반달형' },
    { img:'parts/39_갓_350파이_슬림.png', name:'350Ø 갓 (슬림)', cat:'나팔·갓', desc:'슬림형 배기 갓.', specs:'350Ø / 슬림형' },
    { img:'parts/40_갓_450파이.png', name:'450Ø 갓', cat:'나팔·갓', desc:'대형 배기 갓.', specs:'450Ø' },
    { img:'parts/41_갓_520파이.png', name:'520Ø 갓', cat:'나팔·갓', desc:'대형 배기 갓.', specs:'520Ø' },
    { img:'parts/42_교체용후레쉬볼세트.png', name:'교체용 후레쉬볼 세트', cat:'후레쉬볼', desc:'커버(상)+후레쉬볼+커버(하)로 구성된 교체 세트.', specs:'교체 세트' },
    { img:'parts/43_후레쉬볼커버_상.png', name:'후레쉬볼 커버 (상)', cat:'후레쉬볼', desc:'후레쉬볼 상부 커버.', specs:'커버 / 상부' },
    { img:'parts/44_후레쉬볼커버_하.png', name:'후레쉬볼 커버 (하)', cat:'후레쉬볼', desc:'후레쉬볼 하부 커버.', specs:'커버 / 하부' },
    { img:'parts/45_후레쉬볼_크롬.png', name:'후레쉬볼 (크롬)', cat:'후레쉬볼', desc:'크롬 마감 장식 후레쉬볼.', specs:'크롬 마감' },
    { img:'parts/46_후레쉬볼_동.png', name:'후레쉬볼 (동)', cat:'후레쉬볼', desc:'동(구리) 마감 장식 후레쉬볼.', specs:'동 마감' },
    { img:'parts/47_후레쉬볼_신주.png', name:'후레쉬볼 (신주)', cat:'후레쉬볼', desc:'신주(황동) 마감 장식 후레쉬볼.', specs:'신주 마감' },
    { img:'parts/48_후레쉬볼_검정.png', name:'후레쉬볼 (검정)', cat:'후레쉬볼', desc:'검정 마감 장식 후레쉬볼.', specs:'검정 마감' }
  ];
  function partsRebuild() {
    var grid = document.getElementById('parts-grid');
    if (!grid) return;
    // 저장소 파일명이 macOS NFD(자소분리)로 커밋됨 → URL도 NFD로 맞춰야 404 안 남
    var partImg = function (p) { try { return p.img.normalize('NFD'); } catch (e) { return p.img; } };
    // 헤더 카운트 라벨을 실제 개수(48)로 정정 ("· 50 ITEMS" → "· 48 ITEMS")
    var pp = document.getElementById('page-parts');
    if (pp) {
      [].forEach.call(pp.querySelectorAll('div'), function (el) {
        if (el.children.length === 0 && /PARTS CATALOG/i.test(el.textContent)) {
          el.textContent = 'PARTS CATALOG · ' + NP.length + ' ITEMS';
        }
      });
    }
    // 모달 오프너를 NP 기준으로 교체
    window.openPartModal = function (idx) {
      var p = NP[idx]; if (!p) return;
      var g = function (id) { return document.getElementById(id); };
      var m = g('part-modal');
      if (g('pm-img'))    { g('pm-img').src = partImg(p); g('pm-img').alt = p.name; }
      if (g('pm-cat'))     g('pm-cat').textContent = p.cat;
      if (g('pm-name'))    g('pm-name').textContent = p.name;
      if (g('pm-desc'))    g('pm-desc').textContent = p.desc;
      if (g('pm-specs'))   g('pm-specs').textContent = p.specs;
      if (g('pm-prev'))    g('pm-prev').onclick = function () { window.openPartModal((idx - 1 + NP.length) % NP.length); };
      if (g('pm-next'))    g('pm-next').onclick = function () { window.openPartModal((idx + 1) % NP.length); };
      if (g('pm-counter')) g('pm-counter').textContent = (idx + 1) + ' / ' + NP.length;
      if (m) { m.classList.remove('hidden'); m.classList.add('flex'); document.body.style.overflow = 'hidden'; }
    };
    if (grid.querySelector('[data-np="1"]')) return; // 이미 재구성됨
    grid.innerHTML = NP.map(function (p) {
      return '<div class="part-card bg-[#111] border border-white/5 rounded-2xl p-4 flex flex-col items-center text-center hover:bg-[#1a1a1c] hover:border-blue-500/30 transition-all cursor-pointer group" data-np="1" data-cat="' + p.cat + '">'
        + '<div class="w-full aspect-square bg-white/[0.03] rounded-xl mb-3 flex items-center justify-center overflow-hidden p-3">'
        + '<img src="' + partImg(p) + '" alt="' + p.name + '" loading="lazy" class="max-w-full max-h-full object-contain group-hover:scale-110 transition-transform duration-500" />'
        + '</div>'
        + '<div class="text-[10px] font-bold tracking-widest text-blue-400/70 mb-1">' + p.cat + '</div>'
        + '<span class="text-sm text-gray-200 font-bold">' + p.name + '</span>'
        + '</div>';
    }).join('');
    [].forEach.call(grid.children, function (card, i) { card.onclick = function () { window.openPartModal(i); }; });
    // 필터 버튼 재구성 (전체 버튼 유지)
    var fe = document.getElementById('parts-filter');
    if (fe) {
      [].slice.call(fe.querySelectorAll('.parts-filter-btn')).forEach(function (b) {
        if (!b.hasAttribute('data-i18n')) b.remove();
      });
      var cats = []; NP.forEach(function (p) { if (cats.indexOf(p.cat) < 0) cats.push(p.cat); });
      cats.forEach(function (cat) {
        var btn = document.createElement('button');
        btn.className = 'parts-filter-btn px-4 py-2 rounded-full text-xs font-bold tracking-wider border border-white/10 bg-transparent text-white/50 hover:bg-white/5 transition-all';
        btn.textContent = cat;
        btn.onclick = function () { if (typeof window.filterParts === 'function') window.filterParts(cat); };
        fe.appendChild(btn);
      });
    }
  }

  /* ---- [Task3] 제품 페이지 — 215종 카탈로그 재구성 --------------------- */
  var UP = UP_DATA_PLACEHOLDER;
  var UP_CATS = ['갤럭시', 'LED조명', '파이프', '후레쉬볼', '코브라후드'];
  var UP_COL = {
    '갤럭시':    { text:'text-blue-300',    bg:'bg-blue-500/10',    border:'border-blue-400/25' },
    'LED조명':   { text:'text-yellow-200',  bg:'bg-yellow-500/10',  border:'border-yellow-400/25' },
    '파이프':    { text:'text-cyan-200',    bg:'bg-cyan-500/10',    border:'border-cyan-400/25' },
    '후레쉬볼':  { text:'text-rose-200',    bg:'bg-rose-500/10',    border:'border-rose-400/25' },
    '코브라후드':{ text:'text-emerald-200', bg:'bg-emerald-500/10', border:'border-emerald-400/25' }
  };
  var upActiveCat = '전체';
  var upFiltered = [];
  function upMapCat(cat) {
    if (!cat || cat === '전체') return '전체';
    if (UP_CATS.indexOf(cat) >= 0) return cat;
    if (/갤럭시|양옆태엽/.test(cat)) return '갤럭시';
    if (/LED/.test(cat)) return 'LED조명';
    if (/파이프|스파이얼/.test(cat)) return '파이프';
    if (/후레쉬볼|주름관/.test(cat)) return '후레쉬볼';
    if (/코브라|하향식|후드/.test(cat)) return '코브라후드';
    return '전체';
  }
  function upBuildModal() {
    if (document.getElementById('up-modal')) return;
    var m = document.createElement('div');
    m.id = 'up-modal';
    m.className = 'fixed inset-0 z-[9999] items-center justify-center p-4';
    m.innerHTML =
      '<div class="up-modal-bg absolute inset-0 bg-black/80 backdrop-blur-sm"></div>'
      + '<div class="relative bg-[#0d0d0f] border border-white/10 rounded-3xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col md:flex-row shadow-2xl">'
        + '<button id="up-close" type="button" class="absolute top-4 right-4 z-10 w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-lg leading-none">✕</button>'
        + '<div class="md:w-3/5 bg-white/[0.03] flex items-center justify-center p-6 min-h-[300px]"><img id="up-img" alt="" class="max-w-full max-h-[70vh] object-contain" /></div>'
        + '<div class="md:w-2/5 p-7 flex flex-col">'
          + '<div id="up-cat" class="text-[11px] font-bold tracking-[0.2em] text-blue-400 mb-2"></div>'
          + '<h3 id="up-name" class="text-xl md:text-2xl font-black text-white leading-snug mb-4"></h3>'
          + '<div id="up-tags" class="flex flex-wrap gap-1.5 mb-5"></div>'
          + '<div class="mt-auto pt-5 border-t border-white/10 flex items-center justify-between">'
            + '<div class="flex items-center gap-2">'
              + '<button id="up-prev" type="button" class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl leading-none">‹</button>'
              + '<button id="up-next" type="button" class="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center text-xl leading-none">›</button>'
            + '</div>'
            + '<span id="up-counter" class="text-[12px] text-white/40"></span>'
          + '</div>'
          + '<a href="tel:1588-9123" class="mt-4 text-center bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-xl transition">상담 문의</a>'
        + '</div>'
      + '</div>';
    document.body.appendChild(m);
    m.querySelector('.up-modal-bg').onclick = upCloseModal;
    document.getElementById('up-close').onclick = upCloseModal;
  }
  function upCloseModal() {
    var m = document.getElementById('up-modal');
    if (m) { m.classList.add('hidden'); m.classList.remove('flex'); }
    document.body.style.overflow = '';
  }
  function upOpenModal(i) {
    upBuildModal();
    var arr = upFiltered.length ? upFiltered : UP;
    var p = arr[i]; if (!p) return;
    var g = function (id) { return document.getElementById(id); };
    if (g('up-img'))  { g('up-img').src = p.img; g('up-img').alt = p.name; }
    if (g('up-cat'))    g('up-cat').textContent = p.cat + (p.type ? '  ·  ' + p.type : '');
    if (g('up-name'))   g('up-name').textContent = p.name;
    if (g('up-tags'))   g('up-tags').innerHTML = (p.tags || []).map(function (t) {
      return '<span class="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-white/60">' + t + '</span>';
    }).join('');
    if (g('up-prev'))   g('up-prev').onclick = function () { upOpenModal((i - 1 + arr.length) % arr.length); };
    if (g('up-next'))   g('up-next').onclick = function () { upOpenModal((i + 1) % arr.length); };
    if (g('up-counter')) g('up-counter').textContent = (i + 1) + ' / ' + arr.length;
    var m = g('up-modal'); if (m) { m.classList.remove('hidden'); m.classList.add('flex'); document.body.style.overflow = 'hidden'; }
  }
  window.openProductModal = upOpenModal;
  function upRenderFilter() {
    var filt = document.getElementById('product-filter'); if (!filt) return;
    var cats = ['전체'].concat(UP_CATS);
    filt.innerHTML = cats.map(function (c) {
      var count = c === '전체' ? UP.length : UP.filter(function (p) { return p.cat === c; }).length;
      var active = c === upActiveCat;
      var col = UP_COL[c] || { text:'text-white/70', bg:'bg-white/5', border:'border-white/15' };
      var cls = active ? 'bg-white text-black border-white' : (col.text + ' ' + col.bg + ' ' + col.border + ' hover:bg-white/10');
      return '<button onclick="filterProducts(this.dataset.cat)" data-cat="' + c + '" class="px-4 py-2 rounded-full text-[12px] font-bold tracking-wide transition border ' + cls + '">' + c + ' <span class="opacity-60 ml-1">' + count + '</span></button>';
    }).join('');
  }
  function upRenderGrid() {
    var grid = document.getElementById('products-grid'); if (!grid) return;
    upFiltered = upActiveCat === '전체' ? UP.slice() : UP.filter(function (p) { return p.cat === upActiveCat; });
    var empty = document.getElementById('products-empty'); if (empty) empty.classList.toggle('hidden', upFiltered.length > 0);
    grid.innerHTML = upFiltered.map(function (p, idx) {
      var col = UP_COL[p.cat] || { text:'text-white/70', bg:'bg-white/5', border:'border-white/15' };
      var tags = (p.tags || []).slice(0, 3);
      return '<article data-up="1" data-idx="' + idx + '" class="group relative rounded-3xl border border-white/10 bg-gradient-to-b from-white/[0.04] to-transparent overflow-hidden hover:border-blue-400/40 transition-all hover:-translate-y-1 duration-500 cursor-pointer">'
        + '<div class="relative aspect-[4/3] overflow-hidden bg-[#0a0e18]">'
          + '<img src="' + p.img + '" alt="' + p.name + '" loading="lazy" class="absolute inset-0 w-full h-full object-contain p-3 transition-transform duration-700 group-hover:scale-110" />'
          + '<div class="absolute top-4 right-4"><span class="text-[9px] font-bold px-2.5 py-1 rounded-full border backdrop-blur-sm ' + col.text + ' ' + col.bg + ' ' + col.border + '">' + p.cat + '</span></div>'
          + '<div class="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/70 to-transparent"></div>'
        + '</div>'
        + '<div class="p-5">'
          + '<h3 class="text-[15px] font-black tracking-tight text-white leading-snug mb-2 line-clamp-2">' + p.name + '</h3>'
          + '<div class="flex flex-wrap gap-1.5">' + tags.map(function (t) { return '<span class="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-white/[0.04] border border-white/10 text-white/55">' + t + '</span>'; }).join('') + '</div>'
          + '<div class="mt-4 pt-4 border-t border-white/5 flex items-center justify-between text-[11px]"><span class="text-white/35">USUNG ACE</span><span class="font-bold text-blue-400 flex items-center gap-1">자세히 보기 ›</span></div>'
        + '</div>'
      + '</article>';
    }).join('');
    [].forEach.call(grid.children, function (card) {
      card.onclick = function () { upOpenModal(parseInt(card.getAttribute('data-idx'), 10)); };
    });
    grid.classList.remove('in'); void grid.offsetWidth; grid.classList.add('in');
  }
  function productsRebuild() {
    var grid = document.getElementById('products-grid');
    var filt = document.getElementById('product-filter');
    if (!grid || !filt) return;
    // 히어로 라벨을 215/5개로 정정 (매 패스, 변경 있을 때만)
    var setTxt = function (sel, txt) { var el = document.querySelector(sel); if (el && el.textContent !== txt) el.textContent = txt; };
    setTxt('[data-i18n="prod_hero_tag"]', 'PRODUCT LINEUP · 215 MODELS');
    setTxt('[data-i18n="prod_hero_t1"]', '215가지 제품,');
    setTxt('[data-i18n="prod_stat1"]', '5개 카테고리');
    setTxt('[data-i18n="prod_stat2"]', '215종 실제 사진');
    // 내장 렌더러의 filterProducts 를 UP 기준으로 덮어씀
    window.filterProducts = function (cat) { upActiveCat = upMapCat(cat); upRenderFilter(); upRenderGrid(); };
    window.openProductModal = upOpenModal;
    if (grid.querySelector('[data-up="1"]')) return; // 이미 재구성됨
    upActiveCat = '전체';
    upRenderFilter(); upRenderGrid(); upBuildModal();
  }

  /* ---- 실행 하네스 -------------------------------------------------- */
  function applyAll() {
    injectReviewCss();
    try { homeHero(); }            catch (e) {}
    try { fimHeading(); }          catch (e) {}
    try { homeRemoveBoxed(); }     catch (e) {}
    try { boardFilters(); }        catch (e) {}
    try { boardMeta(); }           catch (e) {}
    try { customerMenu(); }        catch (e) {}
    try { techCertMerge(); }       catch (e) {}
    try { hideNavRows(); }         catch (e) {}
    try { relabelTechNav(); }      catch (e) {}
    try { techLabels(); }          catch (e) {}
    try { manualDeleteFeatures(); }catch (e) {}
    try { manualVideoSlot(); }     catch (e) {}
    try { galleryModalTweak(); }   catch (e) {}
    try { partsRebuild(); }       catch (e) {}
    try { productsRebuild(); }    catch (e) {}
  }

  function init() {
    applyAll();
    var n = 0;
    var iv = setInterval(function () { applyAll(); if (++n > 80) clearInterval(iv); }, 200);
    try {
      new MutationObserver(applyAll).observe(document.body, { childList: true, subtree: true });
    } catch (e) {}
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
