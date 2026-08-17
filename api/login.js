/* api/login.js — 관리자 로그인 (r44) · 승연 「2번으로 갑시다」
 *
 * 비밀번호를 **서버에서** 검사하고, 통과하면 12시간짜리 서명 토큰을 준다.
 * 그 토큰이 /api/cms · /api/board 의 발행 권한이 된다.
 *
 * ── 이 API 가 없앤 것 ────────────────────────────────────────────────
 *   · 로그인 화면의 「서버 키」 칸 (비밀 2개 → 1개)
 *   · admin/admin — 서버가 안 보던 가짜 자물쇠
 *
 * ── ★ 잠기지 않게 하는 설계 ──────────────────────────────────────────
 *   BOARD_ADMIN_KEY 를 아직 아무도 모르면 로그인은 전부 실패한다. 그렇다고 관리자
 *   화면 자체를 못 열게 하면, 승연이 Vercel 을 만지기 전까지 관리자가 죽는다.
 *   그래서 **진입과 발행을 분리**한다 — 화면 열기·임시저장(localStorage)은 로그인
 *   없이도 되고(예전과 동일), 라이브에 반영하는 발행만 이 토큰을 요구한다.
 *   admin.html 이 그 상태를 「임시저장 전용」 배너로 명시한다.
 *
 * ── 무차별 대입 ──────────────────────────────────────────────────────
 *   서버리스라 시도 횟수를 셀 저장소가 없다(카운터를 두려면 KV 가 필요하다).
 *   대신 실패 응답을 **1초 지연**시켜 자동 대입의 속도를 떨어뜨린다.
 *   비밀번호를 길게 잡는 것이 실질적인 방어다 — 로그인 화면에도 그렇게 안내한다.
 */
import { passwordOk, issueToken } from './_auth.js';

const sleep = (ms) => new Promise(r => setTimeout(r, ms));

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  res.setHeader('Cache-Control', 'no-store');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const configured = !!process.env.BOARD_ADMIN_KEY;

  // GET = 상태 조회. 관리자 화면이 「비밀번호가 아직 정해지지 않았습니다」를 띄우는 근거.
  // ★ 비밀번호 자체는 어떤 경우에도 응답에 넣지 않는다.
  if (req.method === 'GET') { res.status(200).json({ ok: true, configured }); return; }

  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'method' }); return; }

  if (!configured) {
    res.status(503).json({
      ok: false, configured: false,
      error: '관리자 비밀번호가 아직 정해지지 않았습니다 (Vercel 환경변수 BOARD_ADMIN_KEY)'
    });
    return;
  }

  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = null; } }
  const pw = body && typeof body.pw === 'string' ? body.pw : '';

  if (!passwordOk(pw)) {
    await sleep(1000);
    res.status(401).json({ ok: false, error: '비밀번호가 일치하지 않습니다' });
    return;
  }

  res.status(200).json({ ok: true, token: issueToken(), expiresIn: 12 * 60 * 60 * 1000 });
}
