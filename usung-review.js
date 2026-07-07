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
 *  [Task2]   부품 페이지 — 카드 크게(5→4열) + 박스 균일(정사각), 여백 축소
 *            (※ 실제 균일 누끼는 "부품 크롭본" 48종 이미지 교체 필요 — 업로드 방식 확정 후 진행)
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
      + '#parts-grid .aspect-square img{max-width:100% !important;max-height:100% !important;}';
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
