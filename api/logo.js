/* api/logo.js — 관리자 로고 교체 (r63)
 *   승연: 「유성에이스 관리자 페이지에 활용된 로고도 변경가능하도록해줘. 내가 직접 변경할게」
 *
 * ── 무엇을 바꾸나 ────────────────────────────────────────────────────
 *   `admin.html` 의 로고 두 곳(로그인 화면 · 사이드바)이 보는 그림 하나.
 *   자리는 **`brand/logo.png`** 다.
 *
 * ── ★ 왜 기존 `유성 에이스 로고.png` 를 덮어쓰지 않나 ────────────────
 *   ① 그 파일명엔 **공백(%20) + 한글**이 둘 다 있다. 이 리포는 `parts/` 에서 **NFD/NFC 착시**로
 *      이미 한 번 데였다. GitHub Contents API 경로에 그대로 태우면 실패해도 원인이 안 보인다.
 *   ② 덮어쓰면 **되돌아갈 원본이 리포에서 사라진다.** 새 경로면 파일 하나 지우는 게 곧 원상복구다.
 *      그래서 DELETE 를 같이 뒀다 — 잘못 올렸을 때 사람을 부르지 않아도 된다.
 *   ③ `brand/` 는 착수 시점에 비어 있었다(실측 `GET /brand/logo.png` → **404**).
 *
 * ── ★★ 사이트 상단 로고는 여기서 안 바뀐다 ──────────────────────────
 *   그건 파일이 아니다. `usung-navfix.js` 안에 `data:image/png;base64` 로 **구워져** 있고
 *   `usung-logofix.js` 가 `content:url(...) !important` 로 `#nav-logo` 에 못박는다(#169).
 *   ★ 그리고 **그림 자체가 다르다** — 헤더는 `index_v6.html:534` 가 `bg-transparent` 라
 *     어두운 히어로 영상 위에 뜬다(= **흰색 판본**). 관리자 로고는 **남색 판본**이라 흰 판에 얹는다.
 *   **하나로 먹이면 한쪽이 반드시 안 보이게 된다.** 사이트까지 바꾸려면 흰색 판본을 따로 받아야 한다
 *   → `QUESTIONS.md` M1.
 *
 * ── 캐시 ─────────────────────────────────────────────────────────────
 *   `?v=` 를 안 붙인다. 라이브 정적 png 실측 헤더가 `public, max-age=0, must-revalidate` 라
 *   브라우저가 **매 요청 재검증**한다. (KNOWLEDGE 37 은 `usung-*.js` 얘기다)
 *
 * ── 되돌리기 ─────────────────────────────────────────────────────────
 *   이 파일을 지우면 로고 교체 경로가 사라진다(관리자 버튼이 404).
 *   ★ 이미 올라간 로고는 리포에 실제 파일로 남는다 — 코드를 되돌려도 안 사라진다.
 *     지우려면 `brand/logo.png` 를 직접 지운다.
 */
import { authed } from './_auth.js';
import { readPng, putImage, removeImage } from './_img.js';

const PATH = 'brand/logo.png';
const AGENT = 'usung-logo';

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
      const d = await removeImage({
        path: PATH,
        message: 'chore(brand): 관리자 로고를 기본으로 되돌림',
        agent: AGENT
      });
      if (!d.ok) { res.status(d.status).json({ ok: false, error: d.error }); return; }
      res.status(200).json({
        ok: true,
        removed: !d.absent,
        pending: !d.absent,
        message: d.absent
          ? '이미 기본 로고입니다'
          : '기본 로고로 되돌렸습니다. 반영까지 1~2분 걸립니다'
      });
      return;
    }

    let payload = req.body;
    if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch (e) { payload = null; } }
    if (!payload) { res.status(400).json({ ok: false, error: '본문을 읽지 못했습니다' }); return; }

    const img = readPng(payload.data);
    if (img.error) { res.status(img.status).json({ ok: false, error: img.error }); return; }

    const w = await putImage({
      path: PATH,
      buf: img.buf,
      message: replaced => `chore(brand): 관리자 로고 ${replaced ? '교체' : '등록'}`,
      agent: AGENT
    });
    if (!w.ok) { res.status(w.status).json({ ok: false, error: w.error }); return; }

    res.status(200).json({
      ok: true,
      replaced: w.replaced,
      bytes: img.buf.length,
      // ★ 정적 파일이라 배포 빌드를 기다려야 한다. 숨기면 「안 바뀌었다」고 판단한다.
      pending: true,
      message: '로고를 저장했습니다. 반영까지 1~2분 걸립니다'
    });
  } catch (e) {
    res.status(502).json({ ok: false, error: e.message });
  }
}
