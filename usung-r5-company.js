/* usung-r5-company.js — r5 반영 (S7·S8·S9·S11): 회사소개 대표이사 이름 전면 삭제
   - CEO MESSAGE 헤딩: "대표이사 / 박진선" → "유성에이스 주식회사"(볼드), 대표이사 라벨/줄바꿈 숨김
   - COMPANY INFO: CEO 카드 삭제, COMPANY 카드 md:2칸으로 균형
   - 푸터 CONTACT: "대표 박진선" 항목(li) 숨김
   - ACE_DATA.company.ceo 런타임 치환
   원본 index_v6.html 불변. i18n 사전 보정 + DOM 강제 + 관찰자. 전부 try/catch.
   되돌리기: inject.js 주입 1줄 제거 + 파일 삭제. */
(function () {
  if (window.__usungR5Company) return;
  window.__usungR5Company = true;

  var ENTITY = {
    ko: '유성에이스 주식회사',
    en: 'USUNG ACE Co., Ltd.',
    ja: '株式会社 ユソンエース',
    vi: 'Công ty USUNG ACE',
    zh: '友盛ACE有限公司'
  };
  function curLang() {
    try { return (typeof window.getLang === 'function' && window.getLang()) || 'ko'; } catch (e) { return 'ko'; }
  }
  function entity() { return ENTITY[curLang()] || ENTITY.ko; }

  function patchDict() {
    try {
      var I = window.I18N; if (!I) return false;
      for (var L in ENTITY) { if (I[L]) I[L].about_ceo_name = ENTITY[L]; }
      if (typeof window.setLang === 'function' && typeof window.getLang === 'function') {
        try { window.setLang(window.getLang()); } catch (e) {}
      }
      return true;
    } catch (e) { return false; }
  }

  function enforce() {
    try {
      var ent = entity();
      // 1) CEO MESSAGE 이름 (data-cms 로더가 덮을 수 있어 강제)
      var names = document.querySelectorAll('[data-i18n="about_ceo_name"],[data-cms="a_ceo_name"]');
      for (var i = 0; i < names.length; i++) { if (names[i].textContent !== ent) names[i].textContent = ent; }
      // 2) "대표이사" 라벨 + 뒤 <br/> 숨김
      var labels = document.querySelectorAll('[data-i18n="about_ceo_label"]');
      for (var j = 0; j < labels.length; j++) {
        labels[j].style.display = 'none';
        var br = labels[j].nextElementSibling;
        if (br && br.tagName === 'BR') br.style.display = 'none';
      }
      // 3) COMPANY INFO: CEO 카드 삭제 + COMPANY 카드 2칸
      var ceoCell = document.querySelector('[data-cms="c_ceo"]');
      if (ceoCell) {
        var card = ceoCell.closest('.bg-black');
        if (card) card.style.display = 'none';
        var comp = document.querySelector('[data-cms="c_name"]');
        var compCard = comp && comp.closest('.bg-black');
        if (compCard && !compCard.__r5span) { compCard.__r5span = 1; compCard.classList.add('md:col-span-2'); }
      }
      // 4) 푸터 "대표 박진선" 항목 숨김
      var fceo = document.querySelector('[data-i18n="footer_ceo_name"]');
      if (fceo) { var li = fceo.closest('li'); if (li) li.style.display = 'none'; }
      // 5) ACE_DATA 치환
      try { if (window.ACE_DATA && window.ACE_DATA.company) window.ACE_DATA.company.ceo = ent; } catch (e) {}
    } catch (e) {}
  }

  function run() { patchDict(); enforce(); }
  run();
  var n = 0, iv = setInterval(function () { run(); if (++n > 40) clearInterval(iv); }, 100);
  try { window.addEventListener('langchange', enforce); } catch (e) {}
  try {
    var pend = false;
    var mo = new MutationObserver(function () { if (pend) return; pend = true; setTimeout(function () { pend = false; enforce(); }, 120); });
    mo.observe(document.body, { childList: true, subtree: true });
  } catch (e) {}
  try {
    var orig = window.navigate;
    if (typeof orig === 'function' && !orig.__r5company) {
      var w = function () { var r = orig.apply(this, arguments); setTimeout(run, 60); setTimeout(enforce, 300); return r; };
      w.__r5company = true;
      try { w.__usungNav = orig.__usungNav; w.__t8 = orig.__t8; w.__r5nav = orig.__r5nav; w.__boardNavWrapped = orig.__boardNavWrapped; } catch (e) {}
      window.navigate = w;
    }
  } catch (e) {}
})();
