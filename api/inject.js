// Vercel Serverless Function: HTML 인젝션 미들웨어
// - theme-white.css 와 usung-overlay.js 를 모든 페이지 로드 시 자동 삽입
// - 원본 index_v6.html 은 그대로 유지 (PPTX 디렉션 + 화이트 테마 + 제품 재정렬)
import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  try {
    // 정적 파일 경로 — Vercel 빌드 시 함수 옆에 복사된 파일을 직접 읽음
    const htmlPath = path.join(process.cwd(), 'index_v6.html');
    let html = fs.readFileSync(htmlPath, 'utf-8');

    // 인젝션 마커 (한 번만 삽입되도록)
    const cssInjection = '<link rel="stylesheet" href="/theme-white.css?v=2">\n  </head>';
    const jsInjection = '<script src="/usung-overlay.js?v=2" defer></script>\n</body>';

    // <head> 닫힘 직전에 CSS 링크 삽입
    if (!html.includes('theme-white.css')) {
      html = html.replace('</head>', cssInjection);
    }
    // </body> 직전에 JS 스크립트 삽입
    if (!html.includes('usung-overlay.js')) {
      html = html.replace('</body>', jsInjection);
    }

    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');
    res.status(200).send(html);
  } catch (err) {
    console.error('[inject]', err);
    // 실패 시 원본으로 폴백 (보안 — 빈 응답보다 원본이 안전)
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    res.status(500).send('<!doctype html><meta http-equiv="refresh" content="0;url=/index_v6.html">');
  }
}
