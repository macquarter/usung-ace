/* api/tech-image.js — 기술력 페이지 「국내 최초」 4장 사진 교체 (r66)
 *   승연: 「관리자페이지에서 기술력 페이지의 국내최초 4가지 사진도 모두 바꿀 수 있도록 해줘.
 *          플레이스 홀더는 사이즈 동일하게 세팅해줘」
 *
 * ── ★ 「…도」 = 로고(r63) · 제품 사진(r55) 과 같은 배관을 쓰라는 뜻이다 ───────
 *   매직넘버 판별·base64 해독·GitHub 쓰기(sha 재시도)·삭제는 전부 `api/_img.js` 에 있고
 *   그건 **이미 경로를 인자로 받게 돼 있다**(r63). 그래서 이 파일은 얇다 —
 *   **`_img.js` 를 복제하지 않는다**(KNOWLEDGE 41·64. 복사해 두면 반드시 한쪽만 썩는다).
 *
 * ── 이 파일에만 있는 것 : slot 화이트리스트 ──────────────────────────────
 *   slot 이 곧 파일명이 된다(`tech/first<N>.png`). `product-image.js` 의 `stem` 과 같은 위험이다 —
 *   경로 문자가 섞이면 리포 아무 데나 쓸 수 있다. 그래서 **정수 1~4 만** 통과시킨다.
 *   화이트리스트가 정규식이 아니라 **개수(SLOTS)** 인 이유: 카드가 4장인 건 데이터가 아니라
 *   `usung-r8-tech.js` 의 `FIRSTS` 배열 길이다. 늘어나면 여기 숫자 하나만 고친다.
 *
 * ── ★ 왜 proto_assets/tf_*.png 를 덮어쓰지 않나 (r63 과 같은 이유) ────────
 *   덮어쓰면 **되돌아갈 원본이 리포에서 사라진다.** 새 경로에 쓰면
 *   **그 파일 하나 지우는 게 곧 원상복구**이고, 원본은 `onerror` 대체본으로 계속 산다.
 *   그래서 DELETE 를 같이 뒀다 — 잘못 올렸을 때 사람을 부르지 않아도 된다.
 *   ★ 착수 시점 실측 `GET /tech/first1.png` → **404**(대체본이 뜬다 = 안 올린 상태가 정상 동작).
 *
 * ── 캐시 ─────────────────────────────────────────────────────────────
 *   `?v=` 를 안 붙인다. 라이브 정적 png 실측 헤더가 `public, max-age=0, must-revalidate` 라
 *   브라우저가 매 요청 재검증한다. (KNOWLEDGE 37 은 `usung-*.js` 얘기다)
 *   ★ 커밋에 `[skip ci]` 도 안 넣는다 — 정적 파일이라 재배포가 안 돌면 **배포본에 영영 없다**(404).
 *     대가인 1~2분 지연은 `pending:true` 로 화면이 안내한다(감추면 「고장났다」고 판단한다).
 *
 * ── 되돌리기 ─────────────────────────────────────────────────────────
 *   이 파일을 지우면 사진 교체 경로가 사라진다(관리자 버튼이 404). **커밋 단위로만** 되돌린다.
 *   ★ 이미 올라간 사진은 리포에 실제 파일로 남는다 — 코드를 되돌려도 안 사라진다.
 *     지우려면 `tech/first<N>.png` 를 직접 지운다(r63 `brand/logo.png` 와 같은 형태).
 */
import { authed } from './_auth.js';
import { readPng, putImage, removeImage } from './_img.js';

const DIR = 'tech';
const SLOTS = 4;                 // usung-r8-tech.js 의 FIRSTS 길이
const AGENT = 'usung-tech-image';

// slot 이 곧 파일명이다. 정수 1~4 외에는 아무것도 통과시키지 않는다.
function slotOf(raw) {
  const n = Number(raw);
  if (!Number.isInteger(n) || n < 1 || n > SLOTS) return 0;
  return n;
}
const pathOf = n => `${DIR}/first${n}.png`;

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,DELETE,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key, x-admin-token');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }
  if (req.method !== 'POST' && req.method !== 'DELETE') {
    res.status(405).json({ ok: false, error: 'method' });
    return;
  }

  const configured = !!(process.env.BOARD_TOKEN && process.env.BOARD_ADMIN_KEY);
  if (!configured) { res.status(503).json({ ok: false, error: '서버 저장소가 아직 설정되지 않았습니다' }); return; }
  if (!authed(req)) { res.status(401).json({ ok: false, error: '관리자 키가 일치하지 않습니다' }); return; }

  try {
    if (req.method === 'DELETE') {
      // ★ DELETE 는 본문 대신 쿼리로 받는다 — 본문 있는 DELETE 는 게이트웨이마다 처리가 갈린다.
      const slot = slotOf((req.query && req.query.slot) || '');
      if (!slot) { res.status(400).json({ ok: false, error: `사진 번호는 1~${SLOTS} 만 쓸 수 있습니다` }); return; }

      const d = await removeImage({
        path: pathOf(slot),
        message: `chore(tech): 국내 최초 ${slot}번 사진을 기본으로 되돌림`,
        agent: AGENT
      });
      if (!d.ok) { res.status(d.status).json({ ok: false, error: d.error }); return; }
      res.status(200).json({
        ok: true,
        slot,
        removed: !d.absent,
        pending: !d.absent,
        message: d.absent
          ? '이미 기본 사진입니다'
          : '기본 사진으로 되돌렸습니다. 반영까지 1~2분 걸립니다'
      });
      return;
    }

    let payload = req.body;
    if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch (e) { payload = null; } }
    if (!payload) { res.status(400).json({ ok: false, error: '본문을 읽지 못했습니다' }); return; }

    const slot = slotOf(payload.slot);
    if (!slot) { res.status(400).json({ ok: false, error: `사진 번호는 1~${SLOTS} 만 쓸 수 있습니다` }); return; }

    const img = readPng(payload.data);
    if (img.error) { res.status(img.status).json({ ok: false, error: img.error }); return; }

    const w = await putImage({
      path: pathOf(slot),
      buf: img.buf,
      message: replaced => `chore(tech): 국내 최초 ${slot}번 사진 ${replaced ? '교체' : '등록'}`,
      agent: AGENT
    });
    if (!w.ok) { res.status(w.status).json({ ok: false, error: w.error }); return; }

    res.status(200).json({
      ok: true,
      slot,
      replaced: w.replaced,
      bytes: img.buf.length,
      // ★ 정적 파일이라 배포 빌드를 기다려야 한다. 숨기면 「안 바뀌었다」고 판단한다.
      pending: true,
      message: '사진을 저장했습니다. 사이트 반영까지 1~2분 걸립니다'
    });
  } catch (e) {
    res.status(502).json({ ok: false, error: e.message });
  }
}
