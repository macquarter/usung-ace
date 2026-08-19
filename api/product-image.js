/* api/product-image.js — 제품 사진 업로드 (r55) · 승연 지시의 「사진을 넣거나 추가하면」 부분
 *
 * ── ★★ 이 파일이 products.js 와 결정적으로 다른 점: [skip ci] 를 쓰면 안 된다 ──────
 *   data/products.json 은 api/inject.js 가 **raw.githubusercontent.com 에서** 읽는다.
 *   그래서 재배포 없이도 즉시 반영된다 → [skip ci] 가 맞다.
 *
 *   그런데 사진은 다르다. products/final/*.png 는 **리포의 정적 파일**이고,
 *   방문자에게는 Vercel 이 **빌드 산출물**로 준다(vercel.json 에 별도 규칙이 없다 = 그대로 서빙).
 *   [skip ci] 로 커밋하면 파일은 리포에 들어가지만 **배포본에는 영영 없다** → 404 다.
 *   ★ 그러므로 사진 커밋은 **일부러 재배포를 돌린다.** 커밋 메시지에 [skip ci] 를 넣지 않는다.
 *
 *   ★ 대가: 사진이 화면에 뜨기까지 Vercel 빌드 시간(1~2분)이 걸린다. 이건 감추면 사고다 —
 *     관리자가 올리고 새로고침했다가 안 보이면 「고장났다」고 판단한다.
 *     그래서 ① 응답에 pending:true 를 실어 관리자 화면이 안내하게 하고
 *          ② 그 사이 방문자 화면은 usung-r55-products.js 의 「사진 준비 중」 자리표시가 받는다.
 *     둘 다 있어야 한다. 하나만으로는 둘 중 한쪽이 깨진 화면을 본다.
 *
 * ── 왜 base64 를 여기서는 허용하나 ───────────────────────────────────
 *   api/cms.js 는 「이미지를 발행하지 않는다」고 못박았다. 그건 **JSON 데이터 파일 안에**
 *   dataURL 을 담지 말라는 뜻이다(글 한 줄 고칠 때마다 MB 를 읽고 쓰게 된다).
 *   여기서는 base64 가 **실제 파일 하나로 커밋되고 그 자리에서 사라진다** — GitHub
 *   Contents API 가 원래 base64 로만 바이너리를 받는다. 데이터 파일은 오염되지 않는다.
 *
 * ── 실측 근거 ────────────────────────────────────────────────────────
 *   현재 products/final 215장 = 47MB, 평균 224KB, 최대 1.24MB(cobra006.png).
 *   base64 는 약 1.33배로 부푼다 → 최대 ~1.65MB. Vercel 요청 본문 한도 4.5MB 안이다.
 *   상한을 3MB 로 두면 지금 자산 전부가 여유 있게 들어간다. 그보다 큰 건 관리자 화면이
 *   캔버스로 줄여서 보낸다.
 *
 * ── 되돌리기 ─────────────────────────────────────────────────────────
 *   이 파일을 지우면 사진 업로드 경로가 사라진다(관리자 업로드 버튼이 404).
 *   ★ 이미 올라간 사진은 리포에 실제 파일로 남는다 — 코드를 되돌려도 사진은 안 사라진다.
 *     지우려면 products/final/<stem>.png 를 직접 지운다.
 */
import { authed } from './_auth.js';

// ★ 모듈 최상위에서 env 를 읽지 말 것 — import 호이스팅에 값이 구워진다(cms.js·products.js 동일).
const repo = () => process.env.BOARD_REPO || 'macquarter/usung-ace';
const branch = () => process.env.BOARD_BRANCH || 'main';

const DIR = 'products/final';
const MAX_BYTES = 3 * 1024 * 1024;      // 원본 기준 3MB (실측 최대 1.24MB — 두 배 이상 여유)
const STEM_OK = /^[A-Za-z0-9_-]{1,40}$/; // stem 이 곧 파일명이다. 경로 문자 절대 금지

function gh(path, init) {
  return fetch(`https://api.github.com/repos/${repo()}/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.BOARD_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'usung-product-image',
      ...(init && init.headers)
    }
  });
}

/* ── 확장자를 신뢰하지 않는다 ──
   파일명은 사용자가 바꿀 수 있다. 실제 바이트 앞머리(매직 넘버)로 판정한다.
   ★ PNG 만 받는다 — R8_IMG + stem + '.png' 로 URL 이 만들어지기 때문이다(usung-r8-data.js:7).
     JPEG 를 .png 이름으로 커밋해도 브라우저는 대개 그려주지만, 그건 우연히 되는 것이라
     기대면 안 된다. JPEG 는 관리자 화면이 캔버스로 PNG 변환해서 보낸다. */
function sniff(buf) {
  if (buf.length > 8 &&
    buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47 &&
    buf[4] === 0x0d && buf[5] === 0x0a && buf[6] === 0x1a && buf[7] === 0x0a) return 'png';
  if (buf.length > 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg';
  if (buf.length > 12 &&
    buf.toString('ascii', 0, 4) === 'RIFF' && buf.toString('ascii', 8, 12) === 'WEBP') return 'webp';
  return null;
}

// dataURL 이든 순수 base64 든 받는다. 관리자 화면은 canvas.toDataURL() 을 그대로 보낸다.
function decode(s) {
  if (typeof s !== 'string' || !s) return null;
  const i = s.indexOf('base64,');
  const b64 = i >= 0 ? s.slice(i + 7) : s;
  if (!/^[A-Za-z0-9+/=\s]+$/.test(b64)) return null;
  try {
    const buf = Buffer.from(b64.replace(/\s/g, ''), 'base64');
    return buf.length ? buf : null;
  } catch (e) { return null; }
}

// 덮어쓰기에는 기존 파일의 sha 가 필요하다. 없으면(=신규) null.
async function currentSha(path) {
  const r = await gh(`contents/${path}?ref=${branch()}`, { cache: 'no-store' });
  if (r.status === 404) return null;
  if (!r.ok) throw new Error('GitHub read ' + r.status);
  const j = await r.json();
  return j.sha || null;
}

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

  const buf = decode(payload.data);
  if (!buf) { res.status(400).json({ ok: false, error: '이미지를 읽지 못했습니다' }); return; }
  if (buf.length > MAX_BYTES) {
    res.status(413).json({ ok: false, error: `사진이 너무 큽니다 (${Math.round(buf.length / 1024)}KB · 최대 ${MAX_BYTES / 1024 / 1024}MB)` });
    return;
  }

  const kind = sniff(buf);
  if (kind !== 'png') {
    // 관리자 화면이 캔버스로 PNG 로 바꿔 보내므로 여기 걸리면 화면 쪽 버그다. 원인을 말해준다.
    res.status(415).json({
      ok: false,
      error: kind ? `PNG 만 저장할 수 있습니다 (받은 형식: ${kind})` : '이미지 형식을 알 수 없습니다'
    });
    return;
  }

  const path = `${DIR}/${stem}.png`;

  try {
    // sha 충돌은 동시 수정뿐 아니라 GitHub 이 묵은 응답을 줄 때도 난다(board.js 실측) → 재시도.
    for (let i = 0; i < 3; i++) {
      if (i) await new Promise(r => setTimeout(r, 400 * i * i));
      const sha = await currentSha(path);
      const body = {
        // ★★ [skip ci] 를 넣지 않는다 — 넣으면 재배포가 안 돌아 사진이 배포본에 영영 없다.
        message: `chore(products): 사진 ${sha ? '교체' : '추가'} ${stem}.png`,
        content: buf.toString('base64'),
        branch: branch()
      };
      if (sha) body.sha = sha;

      const w = await gh(`contents/${path}`, { method: 'PUT', body: JSON.stringify(body) });
      if (w.ok) {
        res.status(200).json({
          ok: true,
          stem,
          replaced: !!sha,
          bytes: buf.length,
          // ★ 관리자 화면은 이 값을 보고 「1~2분 뒤 반영」을 안내해야 한다.
          //   숨기면 올린 사람이 새로고침해 보고 「안 올라갔다」고 판단한다.
          pending: true,
          message: '사진을 저장했습니다. 사이트 반영까지 1~2분 걸립니다'
        });
        return;
      }
      if (w.status !== 409) {
        const detail = await w.text().catch(() => '');
        res.status(502).json({ ok: false, error: 'GitHub write ' + w.status + ' ' + detail.slice(0, 200) });
        return;
      }
    }
    res.status(409).json({ ok: false, error: '동시 수정 충돌 — 다시 올려 주세요' });
  } catch (e) {
    res.status(502).json({ ok: false, error: e.message });
  }
}
