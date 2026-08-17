/* api/_auth.js — 관리자 세션 토큰 발급·검증 (r44)
 *
 * ── 왜 만들었나 ──────────────────────────────────────────────────────
 *   r43 까지 관리자 인증은 두 겹이었다.
 *     1) admin.html 의 admin/admin  → **서버가 검사하지 않는다.** 정적 파일 안에서
 *        문자열 비교만 한다(admin.html:736). 소스에 박혀 있고 로그인 화면에도 인쇄돼
 *        있었다. sessionStorage['cms-auth']='1' 한 줄이면 통과된다 = 자물쇠가 아니다.
 *     2) 「서버 키」(BOARD_ADMIN_KEY) → 이게 유일한 진짜 자물쇠였다.
 *   비밀이 둘인데 하나는 가짜였다. r44 는 **가짜를 없애고 진짜 하나만 남긴다.**
 *
 * ── 설계: 새 환경변수를 만들지 않는다 ────────────────────────────────
 *   BOARD_ADMIN_KEY 를 「서버 키」가 아니라 **「관리자 비밀번호」**로 재정의한다.
 *   승연이 Vercel 에 등록할 게 늘지 않는다(api/cms.js:10 과 같은 원칙).
 *
 * ── 토큰 ─────────────────────────────────────────────────────────────
 *   서버리스라 세션 저장소가 없다. 그래서 **상태 없는 서명 토큰**을 쓴다.
 *     payload = base64url(JSON{exp, v})
 *     token   = payload + '.' + base64url(HMAC-SHA256(payload, BOARD_ADMIN_KEY))
 *   서명 비밀이 곧 비밀번호다. 비밀번호가 바뀌면 기존 토큰이 전부 무효가 된다 —
 *   따로 폐기 목록을 둘 필요가 없다.
 *
 * ── ★ 브라우저에 원문 키를 남기지 않는 것이 이득이다 ─────────────────
 *   예전에는 sessionStorage 에 **원문 키**가 그대로 있었다. 유출되면 영구 권한이다.
 *   토큰은 12시간 뒤 스스로 죽는다.
 *
 * ★ 모듈 최상위에서 env 를 읽지 말 것 — import 호이스팅에 값이 구워진다
 *   (api/board.js·cms.js 와 동일 함정).
 */
import { createHmac, createHash, timingSafeEqual } from 'node:crypto';

const TTL_MS = 12 * 60 * 60 * 1000;   // 12시간
const secret = () => process.env.BOARD_ADMIN_KEY || '';

const b64u = (buf) => Buffer.from(buf).toString('base64')
  .replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

function sign(payloadB64) {
  return b64u(createHmac('sha256', secret()).update(payloadB64).digest());
}

// 길이까지 감추려고 양쪽을 해시한 뒤 비교한다(board.js 와 동일 이유).
const digest = (s) => createHash('sha256').update(String(s == null ? '' : s)).digest();
const eq = (a, b) => timingSafeEqual(digest(a), digest(b));

/** 비밀번호가 BOARD_ADMIN_KEY 와 같은가 */
export function passwordOk(pw) {
  const k = secret();
  if (!k) return false;              // 미설정이면 누구도 통과 못 한다
  return eq(pw, k);
}

/** 로그인 성공 시 발급 */
export function issueToken() {
  const payload = b64u(JSON.stringify({ exp: Date.now() + TTL_MS, v: 1 }));
  return payload + '.' + sign(payload);
}

/** 토큰이 우리가 서명한 것이고 아직 안 죽었는가 */
export function tokenOk(token) {
  if (!secret() || typeof token !== 'string') return false;
  const i = token.indexOf('.');
  if (i <= 0) return false;
  const payload = token.slice(0, i);
  if (!eq(token.slice(i + 1), sign(payload))) return false;
  try {
    const j = JSON.parse(Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString('utf8'));
    return Number(j && j.exp) > Date.now();
  } catch (e) { return false; }
}

/**
 * 요청이 발행 권한을 갖는가.
 *   x-admin-token : r44 로그인이 준 서명 토큰
 *   x-admin-key   : r37 방식 원문 키 — ★ 일부러 남긴다.
 *     새 로그인에 문제가 생겨도 발행 경로가 통째로 막히지 않게 하는 안전줄이다.
 */
export function authed(req) {
  const h = req.headers || {};
  if (tokenOk(h['x-admin-token'])) return true;
  const k = secret();
  return !!k && eq(h['x-admin-key'], k);
}
