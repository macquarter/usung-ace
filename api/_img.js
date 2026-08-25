/* api/_img.js — 이미지 업로드의 공통 부분 (r63)
 *
 * ── 왜 파일을 나눴나 ─────────────────────────────────────────────────
 *   r55 의 `api/product-image.js` 와 r63 의 `api/logo.js` 는 **하는 일이 같다** —
 *   base64 를 받아 → 진짜 PNG 인지 바이트로 확인하고 → GitHub 에 파일 하나로 커밋한다.
 *   다른 건 **경로뿐**이다.
 *   여기서 복사해 두면 나중에 한쪽만 고쳐진다(WebP 를 받게 하거나 상한을 바꿀 때).
 *   「같은 것을 두 곳에서 묻지 마라」 — KNOWLEDGE 41·64 가 매번 같은 말을 하고 있다.
 *
 * ── `_` 로 시작하는 이유 ─────────────────────────────────────────────
 *   Vercel 은 `api/_*.js` 에 **라우트를 만들지 않는다.** 그런데 **번들에는 들어간다**
 *   (KNOWLEDGE 38). `api/_auth.js`·`api/_patch.js`·`api/_seo.js` 와 같은 자리다.
 *   ★ 그래서 이 파일만 손으로 지우면 `product-image.js`·`logo.js` 가 **import 에서 죽는다.**
 *     되돌릴 땐 커밋 단위로.
 *
 * ── env 를 모듈 최상위에서 읽지 않는다 ────────────────────────────────
 *   import 호이스팅에 값이 구워진다(cms.js·products.js·product-image.js 동일한 주의).
 */

const repo = () => process.env.BOARD_REPO || 'macquarter/usung-ace';
const branch = () => process.env.BOARD_BRANCH || 'main';

// 원본 기준 3MB. 실측 최대 자산이 1.24MB(cobra006.png) 라 두 배 이상 여유가 있고,
// base64 로 약 1.33배 부풀어도 Vercel 요청 본문 한도 4.5MB 안이다.
export const MAX_BYTES = 3 * 1024 * 1024;

function gh(path, init, agent) {
  return fetch(`https://api.github.com/repos/${repo()}/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.BOARD_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': agent || 'usung-img',
      ...(init && init.headers)
    }
  });
}

/* ── 확장자를 신뢰하지 않는다 ──
   파일명은 사용자가 바꿀 수 있다. 실제 바이트 앞머리(매직 넘버)로 판정한다.
   ★ 저장은 PNG 만 한다 — 화면이 만드는 URL 이 항상 '.png' 로 끝나기 때문이다.
     JPEG 를 .png 이름으로 커밋해도 브라우저는 대개 그려주지만 그건 우연히 되는 것이다.
     JPEG·WebP 는 관리자 화면이 캔버스로 PNG 변환해서 보낸다.
   그래도 png/jpeg/webp 를 **구분해서** 돌려준다 — 415 응답에 「받은 형식」을 적어야
   화면 쪽 버그인지 사용자 실수인지 구분이 된다. */
export function sniff(buf) {
  if (buf.length > 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a) return 'png';
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg';
  if (buf.length > 12 &&
    buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}

// dataURL 이든 순수 base64 든 받는다. 관리자 화면은 canvas.toDataURL() 을 그대로 보낸다.
export function decode(s) {
  if (typeof s !== 'string' || !s) return null;
  const i = s.indexOf('base64,');
  const b64 = i >= 0 ? s.slice(i + 7) : s;
  if (!/^[A-Za-z0-9+/=\s]+$/.test(b64)) return null;
  try {
    const buf = Buffer.from(b64.replace(/\s/g, ''), 'base64');
    return buf.length ? buf : null;
  } catch (e) { return null; }
}

/* 본문 → 검증된 PNG 버퍼. 실패하면 { status, error } 를 돌려준다(던지지 않는다).
   핸들러가 그대로 res.status(x).json(...) 하면 되도록 모양을 맞췄다. */
export function readPng(raw) {
  const buf = decode(raw);
  if (!buf) return { error: '이미지를 읽지 못했습니다', status: 400 };
  if (buf.length > MAX_BYTES) {
    return {
      status: 413,
      error: `이미지가 너무 큽니다 (${Math.round(buf.length / 1024)}KB · 최대 ${MAX_BYTES / 1024 / 1024}MB)`
    };
  }
  const kind = sniff(buf);
  if (kind !== 'png') {
    return {
      status: 415,
      error: kind ? `PNG 만 저장할 수 있습니다 (받은 형식: ${kind})` : '이미지 형식을 알 수 없습니다'
    };
  }
  return { buf };
}

// 덮어쓰기에는 기존 파일의 sha 가 필요하다. 없으면(=신규) null.
async function currentSha(path, agent) {
  const r = await gh(`contents/${path}?ref=${branch()}`, { cache: 'no-store' }, agent);
  if (r.status === 404) return null;
  if (!r.ok) throw new Error('GitHub read ' + r.status);
  const j = await r.json();
  return j.sha || null;
}

/* ── ★★ [skip ci] 를 쓰지 않는다 ──────────────────────────────────────
   `data/*.json` 은 api/inject.js 가 raw.githubusercontent.com 에서 읽으므로 재배포 없이
   즉시 반영된다 → 거기선 [skip ci] 가 맞다.
   그런데 **이미지는 리포의 정적 파일**이고 방문자에게는 Vercel 이 **빌드 산출물**로 준다.
   [skip ci] 로 커밋하면 파일은 리포에 들어가지만 **배포본에는 영영 없다** → 404 다.
   ★ 그래서 이미지 커밋은 **일부러 재배포를 돌린다.**
   ★ 대가로 1~2분이 걸린다. 이건 감추면 사고다 — 올린 사람이 새로고침했다가 안 보이면
     「고장났다」고 판단한다. 그래서 응답에 pending:true 를 실어 화면이 안내하게 한다. */
export async function putImage({ path, buf, message, agent }) {
  // sha 충돌은 동시 수정뿐 아니라 GitHub 이 묵은 응답을 줄 때도 난다(board.js 실측) → 재시도.
  for (let i = 0; i < 3; i++) {
    if (i) await new Promise(r => setTimeout(r, 400 * i * i));
    const sha = await currentSha(path, agent);
    const body = {
      message: typeof message === 'function' ? message(!!sha) : message,
      content: buf.toString('base64'),
      branch: branch()
    };
    if (sha) body.sha = sha;

    const w = await gh(`contents/${path}`, { method: 'PUT', body: JSON.stringify(body) }, agent);
    if (w.ok) return { ok: true, replaced: !!sha };
    if (w.status !== 409) {
      const detail = await w.text().catch(() => '');
      return { ok: false, status: 502, error: 'GitHub write ' + w.status + ' ' + detail.slice(0, 200) };
    }
  }
  return { ok: false, status: 409, error: '동시 수정 충돌 — 다시 올려 주세요' };
}

/* 파일 삭제 — 「기본으로 되돌리기」용.
   ★ 없는 파일을 지우라는 요청은 **성공으로 친다**(absent:true). 되돌리기 버튼을 두 번 눌렀다고
     빨간 에러를 띄우면, 이미 원하는 상태인데 고장난 줄 안다. */
export async function removeImage({ path, message, agent }) {
  const sha = await currentSha(path, agent);
  if (!sha) return { ok: true, absent: true };

  const r = await gh(`contents/${path}`, {
    method: 'DELETE',
    body: JSON.stringify({ message, sha, branch: branch() })
  }, agent);
  if (r.ok) return { ok: true, absent: false };

  const detail = await r.text().catch(() => '');
  return { ok: false, status: 502, error: 'GitHub delete ' + r.status + ' ' + detail.slice(0, 200) };
}
