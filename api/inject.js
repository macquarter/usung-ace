// Vercel Serverless Function: HTML 인젝션 미들웨어 v4
// - theme-white.css 와 usung-overlay.js 강제 삽입 (cache busting 포함)
// - 원본 index_v6.html 은 raw GitHub URL 에서 fetch
export const config = { runtime: 'nodejs' };

const RAW_URL = 'https://raw.githubusercontent.com/macquarter/usung-ace/main/index_v6.html';

// ★ 캐시버스팅 값(?v=)은 반드시 **배포**를 가리켜야 한다. 원래 `Date.now()` 였는데
//   그건 배포 시각이 아니라 **서버리스 인스턴스가 시작한 시각**이라 배포와 무관하다.
//   그래서 양쪽으로 다 틀렸다:
//   ① 웜 인스턴스가 살아 있으면 새 코드를 올려도 옛 ?v= 를 계속 뿌린다. HTML 은
//      no-cache 라 항상 최신인데 오버레이 JS 는 브라우저 디스크 캐시에서 옛 것이 나온다
//      → **새 HTML 위에 옛 오버레이가 겹쳐 그려진다.** 승연이 본 「이전 내용이 중복」이 이것.
//      (실측: age 2982s 동안 ?v=1786927919940 고정, x-vercel-cache: HIT)
//   ② 반대로 인스턴스가 재시작되면 내용이 하나도 안 바뀌었는데 58개 파일을 전부 다시 받는다.
//   커밋 SHA 는 배포마다 유일하고 같은 배포 안에서는 불변이라 ①②를 동시에 없앤다.
// ★ 상수가 아니라 게터인 이유: 모듈 최상위에서 `process.env` 를 읽으면 안 된다
//   (KNOWLEDGE.md 「서버리스 3대 함정」1 — ESM import 호이스팅으로 조용히 기본값이 박힌다).
// ★ 12자로 자르는 건 URL 길이 절약용. 커밋 SHA 12자는 이 리포 규모에서 충돌하지 않는다.
// 로컬(Vercel 밖)에서는 두 env 가 모두 없으므로 Date.now() 로 떨어진다 — 기존 동작 유지.
const deployId = () => (
  process.env.VERCEL_GIT_COMMIT_SHA
  || process.env.VERCEL_DEPLOYMENT_ID
  || String(Date.now())
).slice(0, 12);

export default async function handler(req, res) {
  // 요청 시점에 1회 평가해 지역 상수로 둔다. 아래 cssLink·jsScript 는 손대지 않는다
  // — 그 두 줄은 **물리적으로 한 줄**이어야 하고(개행 = SyntaxError = 사이트 전체 500),
  //   V 라는 이름 그대로 104곳에서 쓰인다.
  const V = deployId();
  try {
    const r = await fetch(RAW_URL, { cache: 'no-store' });
    if (!r.ok) throw new Error('raw fetch ' + r.status);
    let html = await r.text();

    // S7·S8 — 브랜드 표기 통일: USUNG ACE → YUSUNG ACE (260804 취합본 r2 슬라이드 7·8)
    // index_v6.html 은 고정(frozen)이라 원본을 고치지 않고 응답 시점에 치환한다.
    // 대상 9곳(타이틀·히어로 eyebrow·영상 태그·DUCT SYSTEM·회사소개 c_name_en·
    // 푸터 저작권·주석·JSON-LD name_en·span)이 전부 공백 1개짜리 정확 일치형이라
    // 단순 치환으로 안전하다. 도메인 usungace.com 과 제품 파일명 p138_..._yusungace_...
    // 는 형태가 달라 걸리지 않는다(실측 확인). 되돌리기: 이 1줄 삭제.
    html = html.split('USUNG ACE').join('YUSUNG ACE');

    // ── r27 — 새로고침 때마다 옛 내용이 번쩍이는 문제(FOUC) 제거 ──
    // 증상(2026-08-16 첨부영상, 새로고침 3회 중 3회 재현):
    //   새로고침 직후 0.1~0.4초 동안 옛 히어로 「대한민국 덕트 / No.1 / 오늘을 이끄는 원동력.」 이
    //   검은 화면으로 뜨고, 삭제 대상인 FEATURES IN MOTION 섹션(01/SWING …)도 잠깐 스쳐 지나간다.
    // 원인: 오버레이 usung-home.js 는 defer 라 DOMContentLoaded 에서야 돈다. 그 전에 브라우저가
    //   원본 index_v6.html 을 이미 한 번 그린다. 스크롤 복원까지 겹치면 아래쪽 삭제 섹션도 보인다.
    // 대응: usung-home.js 가 만들어내는 것과 **똑같은 결과**를 응답 시점에 미리 박아 넣는다.
    //   → 첫 페인트부터 최종 화면. index_v6.html 원본은 그대로다(§2 고정 유지).
    // ★ usung-home.js 는 손대지 않는다. 아래 치환이 하나라도 빗나가면 예전처럼 JS 가 고쳐준다
    //   (같은 값을 다시 쓰는 것이라 멱등). 즉 실패해도 지금보다 나빠지지 않는다.
    // ★ 앵커 6종은 전부 index_v6.html 안에서 유일함을 실측 확인했다(grep -c → 1).
    // 되돌리기: 이 블록 전체 삭제.
    const FOUC = [
      // 1) 히어로 h1 — usung-home.js setHeroTexts() 79~80줄과 동일한 마크업
      ['<h1 class="text-5xl md:text-7xl lg:text-[110px] font-black tracking-[-0.04em] mb-7 leading-[0.95] text-white"><span data-cms="h_title1" data-i18n="hero_title1">대한민국 덕트</span><br/><span data-cms="h_title2" class="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500">No.1</span></h1>',
       '<h1 class="text-4xl md:text-6xl lg:text-[92px] font-black tracking-[-0.03em] mb-4 leading-[1.05] text-white break-keep">프리미엄 직화기<br/><span class="usung-hgrad">후드의 기준</span></h1>'],
      // 2) 히어로 보조문구 — usung-home.js 가 숨기는 것과 동일
      ['<p data-cms="h_sub" class="text-xl md:text-3xl',
       '<p data-cms="h_sub" style="display:none" class="text-xl md:text-3xl'],
      // 3) 히어로 스크롤 길이 400vh → 250vh (halveHeroHeight() 와 동일 값. 클래스는 남겨야 셀렉터가 계속 맞는다)
      ['<div class="relative h-[400vh]">',
       '<div class="relative h-[400vh]" style="height:250vh">'],
      // 4) 삭제 섹션 FEATURES IN MOTION — 영상에서 「01 / SWING」 으로 스쳐 보이던 그 섹션
      ['<section class="relative gradient-shift text-white py-16 md:py-24 overflow-hidden">',
       '<section style="display:none" class="relative gradient-shift text-white py-16 md:py-24 overflow-hidden">'],
      // 5) 삭제 섹션 VIDEO SHOWCASE
      ['<section class="py-16 bg-gradient-to-b from-black via-[#050a14] to-black border-t border-white/5">',
       '<section style="display:none" class="py-16 bg-gradient-to-b from-black via-[#050a14] to-black border-t border-white/5">']
    ];
    for (const [from, to] of FOUC) html = html.split(from).join(to);
    // 6) 기술 모션 프레임 4개 + 별도 CTA — 원본은 opacity-0 이지만 스크롤 복원 시 옛 타임라인이 켠다
    html = html.replace(/<div id="anim-(feat[1-4]|cta)" /g, '<div style="display:none" id="anim-$1" ');

    // ── r30 / S20 — 챗봇(에이스봇) 삭제 ──
    // 덱 260812_홈페이지_수정_r2 S20: 「그래서 그냥 챗봇기능도 삭제해주세요..ㅠㅠ」
    // 봇의 실체는 index_v6.html:5650 의 이 한 줄이다. #usungBot·#usungBotFab 마크업은
    // HTML 에 없고 chatbot.js 가 런타임에 만든다 → 이 줄만 빼면 봇이 통째로 사라진다.
    // ★ index_v6.html 은 고정(frozen)이지만 여기서 하는 건 응답 시점 문자열 치환이라 원본은 그대로다.
    // ★ chatbot.js·chatbot-articles.js·api/chat.js 파일 자체는 지우지 않는다 — 되살릴 때를 위해 남긴다.
    // 함께 뺀 링크: CSS 3(usung-docent·r17-bot·r18-bot) + JS 6(docent-core/ask/wz/wzui/bot·r20-bot).
    //   전부 #usungBot 스코프 전용임을 실측 확인했다(다른 영역으로 새지 않는다).
    // ★ usung-r13-curation* 는 남겨 둔다. 봇 안에서만 도는 기능인데 window.UsungBot 과
    //   #usungBotQk 존재를 먼저 확인하므로, 봇이 없으면 조용히 아무 일도 하지 않는다.
    // 되돌리기: 이 1줄 + 위 링크 9개 복원(_backup_20260816_pre-r30/api/inject.js).
    html = html.split('<script src="chatbot.js"></script>').join('');

    // ── r30 / S01 — 홈 스테이트먼트 키워드칩 1개 삭제 + 카운터 3번 명칭 변경 ──
    // 덱 S01 빨간박스 2개를 도형 좌표로 확인했다.
    //   ① 칩 줄 마지막 「친환경 설계」  → 삭제 (「우리회사는 설계하는 영역이 없어서요!」)
    //   ② 카운터 3번 「No.1 / IN KOREA」 → 「최초의 혁신적 후드 로 명칭 변경」
    // ★ JS 오버레이가 아니라 여기서 치환하는 이유: 오버레이는 DOMContentLoaded 뒤에 돌아
    //   옛 문구가 한 번 번쩍인다. 항목4(FOUC) 로 이미 지적받은 그 증상이다.
    // 앵커 3개 모두 index_v6.html 안에서 유일함을 실측했다(grep -c → 각 1).
    //
    // ── r32 / r3 덱 s1 — ② 를 다시 고친다 ──
    // r30 에서 나는 **라벨(IN KOREA)만** 바꾸고 큰 글자 「No.1」 은 남겼다. 옆 두 칸이
    // 14+ · 28 인 숫자 열이라 3열 리듬을 지키려던 것이었는데, r3 덱 s1 이 같은 지시를
    // 다시 보내왔다 — 「No.1 -> 최초의 혁신적 후드 로 명칭 변경」. 즉 **「No.1」 그 자체**를
    // 없애라는 뜻이다. 라벨 칸은 지우고 큰 칸 하나가 문구 전체를 진다.
    // ★ 문구는 반드시 **텍스트 노드 1개**로 둔다. <br> 이나 <span> 으로 쪼개면
    //   usung-r16-i18n-i.js:18 의 사전 한 행(["최초의 혁신적 후드", …])과 더는 일치하지
    //   않아 en/ja/zh/vi 가 통째로 죽는다(r20 교훈 · KNOWLEDGE 함정 30). 줄바꿈이
    //   필요하면 마크업이 아니라 `word-break:keep-all` 로 공백에서 접히게 둔다.
    // ★ 글자 크기는 clamp 로 준다. 25px 고정이면 393px 폭에서 열 하나가 ~104px 라
    //   3줄로 무너진다. clamp(16px,2.4vw,25px) → 데스크톱 1줄 / 모바일 2줄(≈42px)로
    //   옆 칸 숫자(48px)와 높이가 얼추 맞는다.
    const S01 = [
      ['<div class="px-5 py-2.5 rounded-full bg-white/5 border border-white/10 text-[12px] font-bold tracking-wider text-white/70 hover:bg-white/10 hover:border-blue-400/40 transition" data-i18n="stmt_chip5">친환경 설계</div>',
       ''],
      ['<div class="text-5xl md:text-6xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40">No.<span class="text-blue-400">1</span></div>',
       '<div class="font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-white/40" style="font-size:clamp(16px,2.4vw,25px);line-height:1.3;letter-spacing:-.02em;word-break:keep-all;padding:6px 0">최초의 혁신적 후드</div>'],
      ['<div class="text-[10px] font-bold tracking-[0.22em] text-white/40 mt-2">IN KOREA</div>',
       '']
    ];
    for (const [from, to] of S01) html = html.split(from).join(to);

    // 7) 위 h1 이 쓰는 그라데이션 클래스. usung-home.js 도 나중에 같은 규칙을 넣지만(중복 무해)
    //    첫 페인트에 없으면 「후드의 기준」 이 흰색으로 떴다가 그라데이션으로 바뀌어 또 번쩍인다.
    const preStyle = '<style id="usung-r27-prepaint">.usung-hgrad{background:linear-gradient(96deg,#bfdbfe 0%,#60a5fa 30%,#3b82f6 52%,#60a5fa 72%,#dbeafe 100%);background-size:220% 100%;-webkit-background-clip:text;background-clip:text;-webkit-text-fill-color:transparent;color:transparent;text-shadow:0 2px 24px rgba(37,99,235,.18);animation:usungHShine 6.5s ease-in-out infinite}@keyframes usungHShine{0%,100%{background-position:0% 50%}50%{background-position:100% 50%}}</style>';

    // 화이트 테마 CSS + 오버레이 JS 삽입
    const cssLink = '<link rel="stylesheet" href="/theme-white.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-tonefix.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-blue-standard.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-r10-fix.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-r10-tone.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-r10-redesign.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-r11.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-r12.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-r13-tech.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-r13-tech-b.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-r13-curation.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-r14-tech.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-r14-hero.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-r15-tech.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-r15-type.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-r16-tech.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-r17.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-r18.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-r19.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-r20.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-r21.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-r31.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-r32.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-r33.css?v=' + V + '">\n  </head>';
    const jsScript = '<script src="/usung-overlay.js?v=' + V + '" defer></script>\n<script src="/usung-test-products.js?v=' + V + '" defer></script>\n<script src="/usung-review.js?v=' + V + '" defer></script>\n<script src="/usung-tech8.js?v=' + V + '" defer></script>\n<script src="/usung-cert.js?v=' + V + '" defer></script>\n<script src="/usung-home.js?v=' + V + '" defer></script>\n<script src="/usung-products-order.js?v=' + V + '" defer></script>\n<script src="/usung-gallery.js?v=' + V + '" defer></script>\n<script src="/guidep/p1_0.js?v=' + V + '" defer></script>\n<script src="/guidep/p1_1.js?v=' + V + '" defer></script>\n<script src="/guidep/p2_0.js?v=' + V + '" defer></script>\n<script src="/guidep/p2_1.js?v=' + V + '" defer></script>\n<script src="/guidep/p2_2.js?v=' + V + '" defer></script>\n<script src="/guidep/p3_0.js?v=' + V + '" defer></script>\n<script src="/guidep/p3_1.js?v=' + V + '" defer></script>\n<script src="/guidep/p3_2.js?v=' + V + '" defer></script>\n<script src="/guidep/p3_3.js?v=' + V + '" defer></script>\n<script src="/guidep/p4_0.js?v=' + V + '" defer></script>\n<script src="/guidep/p4_1.js?v=' + V + '" defer></script>\n<script src="/guidep/p5_0.js?v=' + V + '" defer></script>\n<script src="/guidep/p5_1.js?v=' + V + '" defer></script>\n<script src="/guidep/p5_2.js?v=' + V + '" defer></script>\n<script src="/guidep/p6_0.js?v=' + V + '" defer></script>\n<script src="/guidep/p6_1.js?v=' + V + '" defer></script>\n<script src="/guidep/p6_2.js?v=' + V + '" defer></script>\n<script src="/guidep/p7_0.js?v=' + V + '" defer></script>\n<script src="/guidep/p7_1.js?v=' + V + '" defer></script>\n<script src="/guidep/p8_0.js?v=' + V + '" defer></script>\n<script src="/guidep/p8_1.js?v=' + V + '" defer></script>\n<script src="/guidep/p9_0.js?v=' + V + '" defer></script>\n<script src="/guidep/p9_1.js?v=' + V + '" defer></script>\n<script src="/guidep/p9_2.js?v=' + V + '" defer></script>\n<script src="/usung-manual.js?v=' + V + '" defer></script>\n<script src="/usung-notice.js?v=' + V + '" defer></script>\n<script src="/usung-board.js?v=' + V + '" defer></script><script src="/usung-board-sync.js?v=' + V + '" defer></script>\n<script src="/usung-detail-fix.js?v=' + V + '" defer></script>\n<script src="/usung-navfix.js?v=' + V + '" defer></script>\n<script src="/usung-damperfix.js?v=' + V + '" defer></script>\n<script src="/usung-logofix.js?v=' + V + '" defer></script>\n<script src="/usung-r5-company.js?v=' + V + '" defer></script>\n<script src="/usung-r5-nav.js?v=' + V + '" defer></script>\n<script src="/usung-r5-fixes.js?v=' + V + '" defer></script>\n<script src="/usung-r6-nav.js?v=' + V + '" defer></script>\n<script src="/usung-r6-core-img.js?v=' + V + '" defer></script>\n<script src="/usung-r6-main.js?v=' + V + '" defer></script>\n<script src="/usung-catalog-data.js?v=' + V + '" defer></script>\n<script src="/usung-r8-view.js?v=' + V + '" defer></script>\n<script src="/usung-r8-mount.js?v=' + V + '" defer></script>\n<script src="/usung-r8-data.js?v=' + V + '" defer></script>\n<script src="/usung-r8-prod-a.js?v=' + V + '" defer></script>\n<script src="/usung-r8-prod-b.js?v=' + V + '" defer></script>\n<script src="/usung-r8-tech.js?v=' + V + '" defer></script>\n<script src="/usung-r8-gal.js?v=' + V + '" defer></script><script src="/usung-r9-excel.js?v=' + V + '" defer></script><script src="/usung-r10.js?v=' + V + '" defer></script><script src="/usung-r12.js?v=' + V + '" defer></script><script src="/usung-r13-curation-data.js?v=' + V + '" defer></script><script src="/usung-r13-curation-score.js?v=' + V + '" defer></script><script src="/usung-r13-curation.js?v=' + V + '" defer></script><script src="/usung-r14.js?v=' + V + '" defer></script><script src="/usung-r16-i18n-a.js?v=' + V + '" defer></script><script src="/usung-r16-i18n-b.js?v=' + V + '" defer></script><script src="/usung-r16-i18n-c.js?v=' + V + '" defer></script><script src="/usung-r16-i18n-d.js?v=' + V + '" defer></script><script src="/usung-r16-i18n-e.js?v=' + V + '" defer></script><script src="/usung-r16-i18n-f.js?v=' + V + '" defer></script><script src="/usung-r16-i18n-g.js?v=' + V + '" defer></script><script src="/usung-r16-i18n-h.js?v=' + V + '" defer></script><script src="/usung-r16-i18n-i.js?v=' + V + '" defer></script><script src="/usung-r34-i18n.js?v=' + V + '" defer></script><script src="/usung-r35-i18n.js?v=' + V + '" defer></script><script src="/usung-r36-i18n.js?v=' + V + '" defer></script><script src="/usung-r37-cms.js?v=' + V + '" defer></script><script src="/usung-r16-i18n.js?v=' + V + '" defer></script><script src="/usung-r17.js?v=' + V + '" defer></script><script src="/usung-r19-parts-data.js?v=' + V + '" defer></script><script src="/usung-r19-parts.js?v=' + V + '" defer></script><script src="/usung-r20.js?v=' + V + '" defer></script><script src="/usung-r21.js?v=' + V + '" defer></script><script src="/usung-r23.js?v=' + V + '" defer></script><script src="/usung-r24.js?v=' + V + '" defer></script><script src="/usung-r25.js?v=' + V + '" defer></script><script src="/usung-r26.js?v=' + V + '" defer></script><script src="/usung-r29-color.js?v=' + V + '" defer></script><script src="/usung-r29-parts.js?v=' + V + '" defer></script><script src="/usung-r32.js?v=' + V + '" defer></script>\n</body>';

    if (!html.includes('theme-white.css')) {
      html = html.replace('</head>', cssLink);
    }
    if (!html.includes('usung-overlay.js')) {
      html = html.replace('</body>', jsScript);
    }
    if (!html.includes('usung-r27-prepaint')) {
      html = html.replace('</head>', preStyle + '</head>');
    }

    // 응답 헤더 — 항상 최신
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.setHeader('Pragma', 'no-cache');
    res.setHeader('Expires', '0');
    res.status(200).send(html);
  } catch (err) {
    console.error('[inject]', err);
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(500).send(
      '<!doctype html><html><head><meta charset="utf-8"><title>유성에이스</title></head>' +
      '<body><p>잠시만 기다려주세요... 페이지 로딩 중입니다.</p>' +
      '<script>setTimeout(()=>location.reload(),1500);</script></body></html>'
    );
  }
}
