/* api/product-image.js — 제품 사진 업로드 (r55) · 승연 지시의 「사진을 넣거나 추가하면」 부분
 *
 * ── r63 에서 바뀐 것: 공통부를 api/_img.js 로 옮겼다 ──────────────────
 *   매직넘버 판별·base64 해독·GitHub 쓰기(sha 재시도)는 로고 업로드(api/logo.js)와 **같다**.
 *   복사해 두면 반드시 한쪽만 썩는다. **동작은 그대로다** — 옮기기만 했다.
 *   ★ 상세한 배경(왜 [skip ci] 를 안 쓰나 · 왜 여기서는 base64 를 허용하나 · 3MB 근거)은
 *     전부 `api/_img.js` 헤더로 같이 옮겼다. 거기를 읽을 것.
 *
 * ── 이 파일에만 있는 것 ──────────────────────────────────────────────
 *   `stem` 검증. stem 이 곧 파일명이 되므로(usung-r8-data.js:7 이 R8_IMG + stem + '.png')
 *   경로 문자가 섞이면 리포 아무 데나 쓸 수 있다. 화이트리스트로만 통과시킨다.
 *
 * ── 되돌리기 ─────────────────────────────────────────────────────────
 *   이 파일을 지우면 사진 업로드 경로가 사라진다(관리자 업로드 버튼이 404).
 *   ★ 이미 올라간 사진은 리포에 실제 파일로 남는다 — 코드를 되돌려도 사진은 안 사라진다.
 *     지우려면 products/final/<stem>.png 를 직접 지운다.
 */
import { authed } from './_auth.js';
import { readPng, putImage } from './_img.js';

const DIR = 'products/final';
const STEM_OK = /^[A-Za-z0-9_-]{1,40}$/; // stem 이 곧 파일명이다. 경로 문자 절대 금지

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key, x-admin-token');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'method' }); return; }

  const configured = !!(process.env.BOARD_TOKEN && process.env.BOARD_ADMIN_KEY);
  if (!configured) { res.status(503).json({ ok: false, error: '서버 저장소가 아직 설정되지 않았습니다' }); return; }
  if (!authed(req)) { res.status(401).json({ ok: false, error: '관리자 키가 일치하지 않습니다' }); return; }

  let payload = req.body;
  if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch (e) { payload = null; } }
  if (!payload) { res.status(400).json({ ok: false, error: '본문을 읽지 못했습니다' }); return; }

  const stem = String(payload.stem || '').trim();
  if (!STEM_OK.test(stem)) {
    res.status(400).json({ ok: false, error: '제품 코드는 영문·숫자·-·_ 만 쓸 수 있습니다' });
    return;
  }

  const img = readPng(payload.data);
  if (img.error) { res.status(img.status).json({ ok: false, error: img.error }); return; }

  try {
    const w = await putImage({
      path: `${DIR}/${stem}.png`,
      buf: img.buf,
      message: replaced => `chore(products): 사진 ${replaced ? '교체' : '추가'} ${stem}.png`,
      agent: 'usung-product-image'
    });
    if (!w.ok) { res.status(w.status).json({ ok: false, error: w.error }); return; }

    res.status(200).json({
      ok: true,
      stem,
      replaced: w.replaced,
      bytes: img.buf.length,
      // ★ 관리자 화면은 이 값을 보고 「1~2분 뒤 반영」을 안내해야 한다.
      //   숨기면 올린 사람이 새로고침해 보고 「안 올라갔다」고 판단한다.
      pending: true,
      message: '사진을 저장했습니다. 사이트 반영까지 1~2분 걸립니다'
    });
  } catch (e) {
    res.status(502).json({ ok: false, error: e.message });
  }
}
