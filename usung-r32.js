/* usung-r32.js — 260812_홈페이지_수정_r3.pptx s2 · s6
 *
 * r3 덱은 r2 덱에 승연이 「반영안됨」 이라고 덧쓴 정정본이다. 여기서 처리하는 두 건은
 * 둘 다 **내가 r29/r30 에서 엉뚱한 표면을 고쳐서** 화면에 안 나타난 것들이다.
 *
 *   s2 「부품명이 '150Ø기름받이' 단일로 표기해주세요~」  (슬라이드 캡처: 부품소개 카드)
 *   s6 「'자세히 보기' 지워주고 모달도 삭제」            (기술력 국내최초 4카드)
 *
 * 되돌리기: 이 파일 삭제 + api/inject.js 의 링크 1줄 삭제.
 */
(function () {
  'use strict';

  /* ══════════════════════════════════════════════════════════════════════
   * s2 — 부품 「기름받이 / 150Ø」 두 줄 → 「150Ø기름받이」 한 줄
   * ══════════════════════════════════════════════════════════════════════
   * r29 에서 나는 이걸 usung-r29-parts.js:67 의 `p.over.p28` 로 처리했다.
   * 그런데 R19.plan 의 over 는 **제품 상세 모달의 부품 구성 타일**에만 닿는다.
   * 덱 s2 의 캡처는 파란 테두리 카드 + 이름 + 파란 규격 — **부품소개 갤러리 카드**다.
   * 그쪽은 usung-r8-prod-a.js:128 / -b.js:235 가 R8_PARTS 를 직접 읽어 그린다.
   * 그래서 화면이 안 바뀌었고 승연이 「반영안됨」 이라고 적은 것이다.
   *
   * ★ 고칠 곳은 R8_PARTS 하나다. 이 한 곳이 부품 표면 3곳을 동시에 덮는다 —
   *   (a) 부품소개 페이지 renderPartsPage() → PART_ORDER → partTileHTML()
   *   (b) 제품소개 하단 티저 partTileHTML()
   *   (c) 제품 상세 모달 r19 label() (over 가 없으면 R8_PARTS 를 기본값으로 읽는다)
   *   usung-r21.js:155 의 p29(기름받이속) 교정이 이미 같은 패턴이다 — 그대로 따른다.
   *
   * ★ usung-r8-data.js 는 build_graft.py 생성물이라 수기 수정 금지(§3) → 런타임 교정.
   *   const 는 재대입만 막고 속성 변형은 허용된다. 클래식 스크립트끼리는 전역 렉시컬
   *   이름으로 닿는다. 데이터 파일 미실행 시 typeof 조차 TDZ 로 던지므로 반드시 try.
   *
   * ★ sp 를 비워도 카드 높이는 안 무너진다 — 템플릿이 `${p.sp||'&nbsp;'}` 라
   *   빈 줄이 자리를 지킨다(p30 「기름받이망」 이 이미 같은 상태다).
   *
   * ★ usung-r29-parts.js 의 over 지정은 그대로 둔다. 같은 값을 쓰므로 충돌하지 않고,
   *   모달 쪽에서 over 가 우선이라 지우면 그쪽만 다시 두 줄이 될 위험이 있다.
   */
  function fixP28() {
    try {
      if (typeof R8_PARTS !== 'object' || !R8_PARTS.p28) return false;
      if (R8_PARTS.p28.nm === '150Ø기름받이') return true;   // 멱등
      R8_PARTS.p28.nm = '150Ø기름받이';
      R8_PARTS.p28.sp = '';
      return true;
    } catch (e) { return false; }
  }
  fixP28();

  /* ══════════════════════════════════════════════════════════════════════
   * s6 — 기술력 「국내 최초」 4카드: 모달 삭제
   * ══════════════════════════════════════════════════════════════════════
   * r30 에서 카드 앞면의 「자세히 보기 →」(.tf-more)만 지웠다. 그런데 카드 자체가
   * role="button" + onclick="openFirst(i)" 라 **아무 데나 눌러도 모달이 그대로 떴다.**
   * r3 s6 이 「모달도 삭제」 라고 못 박았다 → 카드에서 클릭 경로를 끊는다.
   *
   * ★ usung-r8-tech.js 의 템플릿에서 속성을 아예 빼는 방식으로 처리한다(아래 별도 커밋).
   *   여기서는 그 템플릿이 어떤 이유로 옛 버전으로 실행됐을 때를 대비한 **안전망**이다.
   *   renderTech() 는 techBuilt 플래그로 1회만 돌지만 goTech() 시점에 불리므로,
   *   문서 로드 시점에 #th-first 가 비어 있을 수 있다 → 관찰자로 붙는다.
   * ★ openFirst / #fmask 자체는 지우지 않는다. 다른 진입점이 남아 있을 수 있고,
   *   호출되지만 않으면 아무 일도 하지 않는다. 되살릴 때도 이쪽이 싸다.
   */
  function unlinkCards(root) {
    var cards = (root || document).querySelectorAll('#th-first .tf-card[onclick]');
    if (!cards.length) return false;
    for (var i = 0; i < cards.length; i++) {
      var c = cards[i];
      c.removeAttribute('onclick');
      c.removeAttribute('onkeydown');
      c.removeAttribute('role');
      c.removeAttribute('tabindex');
      c.onclick = null;
      c.classList.add('r32-nolink');
    }
    return true;
  }

  function boot() {
    unlinkCards(document);
    var host = document.getElementById('th-first');
    if (!host || !window.MutationObserver) return;
    // #th-first 는 renderTech() 가 innerHTML 로 한 번에 채운다 → 그 뒤 다시 벗긴다.
    new MutationObserver(function () { unlinkCards(host); })
      .observe(host, { childList: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot);
  } else {
    boot();
  }

  /* R8_PARTS 가 늦게 붙는 경우를 위한 짧은 재시도(usung-r29-parts.js 와 같은 형태).
   * 부품소개는 goParts() 에서 그려지므로 그 전에만 끝나면 된다. */
  if (!fixP28()) {
    var n = 0;
    var iv = setInterval(function () {
      if (fixP28() || ++n > 80) clearInterval(iv);
    }, 100);
  }
})();
