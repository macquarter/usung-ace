// Vercel Serverless Function: HTML 인젝션 미들웨어
// - theme-white.css 와 usung-overlay.js 를 페이지 로드 시 자동 삽입
// - 원본 index_v6.html 은 raw GitHub URL 에서 fetch (번들링 안전)
export const config = { runtime: 'nodejs' };

const RAW_URL = 'https://raw.githubusercontent.com/macquarter/usung-ace/main/index_v6.html';

export default async function handler(req, res) {
  try {
    // 원본 HTML 가져오기 (Vercel Edge 캐시 활용)
    const r = await fetch(RAW_URL, { cache: 'no-store' });
    if (!r.ok) throw new Error('raw fetch ' + r.status);
    let html = await r.text();

    // <head> 닫힘 직전에 화이트 테마 CSS 링크 삽입
    if (!html.includes('theme-white.css')) {
      html = html.replace('</head>',
        '<link rel="stylesheet" href="/theme-white.css?v=3">\n  </head>');
    }
    // </body> 직전에 PPTX 오버레이 JS 삽입
    if (!html.includes('usung-overlay.js')) {
      html = html.replace('</body>',
        '<script src="/usung-overlay.js?v=3" defer></script>\n</body>');
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'public, max-age=0, s-maxage=60, stale-while-revalidate=300');
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
