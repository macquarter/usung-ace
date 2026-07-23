// Vercel Serverless Function: HTML 인젝션 미들웨어 v4
// - theme-white.css 와 usung-overlay.js 강제 삽입 (cache busting 포함)
// - 원본 index_v6.html 은 raw GitHub URL 에서 fetch
export const config = { runtime: 'nodejs' };

const RAW_URL = 'https://raw.githubusercontent.com/macquarter/usung-ace/main/index_v6.html';
const V = Date.now();

export default async function handler(req, res) {
  try {
    const r = await fetch(RAW_URL, { cache: 'no-store' });
    if (!r.ok) throw new Error('raw fetch ' + r.status);
    let html = await r.text();

    // 화이트 테마 CSS + 오버레이 JS 삽입
    const cssLink = '<link rel="stylesheet" href="/theme-white.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-tonefix.css?v=' + V + '">\n  <link rel="stylesheet" href="/usung-blue-standard.css?v=' + V + '">\n  </head>';
    const jsScript = '<script src="/usung-overlay.js?v=' + V + '" defer></script>\n<script src="/usung-test-products.js?v=' + V + '" defer></script>\n<script src="/usung-review.js?v=' + V + '" defer></script>\n<script src="/usung-tech8.js?v=' + V + '" defer></script>\n<script src="/usung-cert.js?v=' + V + '" defer></script>\n<script src="/usung-home.js?v=' + V + '" defer></script>\n<script src="/usung-products-order.js?v=' + V + '" defer></script>\n<script src="/usung-gallery.js?v=' + V + '" defer></script>\n<script src="/guidep/p1_0.js?v=' + V + '" defer></script>\n<script src="/guidep/p1_1.js?v=' + V + '" defer></script>\n<script src="/guidep/p2_0.js?v=' + V + '" defer></script>\n<script src="/guidep/p2_1.js?v=' + V + '" defer></script>\n<script src="/guidep/p2_2.js?v=' + V + '" defer></script>\n<script src="/guidep/p3_0.js?v=' + V + '" defer></script>\n<script src="/guidep/p3_1.js?v=' + V + '" defer></script>\n<script src="/guidep/p3_2.js?v=' + V + '" defer></script>\n<script src="/guidep/p3_3.js?v=' + V + '" defer></script>\n<script src="/guidep/p4_0.js?v=' + V + '" defer></script>\n<script src="/guidep/p4_1.js?v=' + V + '" defer></script>\n<script src="/guidep/p5_0.js?v=' + V + '" defer></script>\n<script src="/guidep/p5_1.js?v=' + V + '" defer></script>\n<script src="/guidep/p5_2.js?v=' + V + '" defer></script>\n<script src="/guidep/p6_0.js?v=' + V + '" defer></script>\n<script src="/guidep/p6_1.js?v=' + V + '" defer></script>\n<script src="/guidep/p6_2.js?v=' + V + '" defer></script>\n<script src="/guidep/p7_0.js?v=' + V + '" defer></script>\n<script src="/guidep/p7_1.js?v=' + V + '" defer></script>\n<script src="/guidep/p8_0.js?v=' + V + '" defer></script>\n<script src="/guidep/p8_1.js?v=' + V + '" defer></script>\n<script src="/guidep/p9_0.js?v=' + V + '" defer></script>\n<script src="/guidep/p9_1.js?v=' + V + '" defer></script>\n<script src="/guidep/p9_2.js?v=' + V + '" defer></script>\n<script src="/usung-manual.js?v=' + V + '" defer></script>\n<script src="/usung-notice.js?v=' + V + '" defer></script>\n<script src="/usung-board.js?v=' + V + '" defer></script>\n<script src="/usung-detail-fix.js?v=' + V + '" defer></script>\n<script src="/usung-navfix.js?v=' + V + '" defer></script>\n<script src="/usung-damperfix.js?v=' + V + '" defer></script>\n<script src="/usung-logofix.js?v=' + V + '" defer></script>\n<script src="/usung-r5-company.js?v=' + V + '" defer></script>\n<script src="/usung-r5-nav.js?v=' + V + '" defer></script>\n</body>';

    if (!html.includes('theme-white.css')) {
      html = html.replace('</head>', cssLink);
    }
    if (!html.includes('usung-overlay.js')) {
      html = html.replace('</body>', jsScript);
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
