/* api/cms.js — 관리자페이지 발행(publish) 경로  · 승연 지시「관리자페이지 배포해서 cms까지 걸어줘」
 *
 * ── 무엇이 고장나 있었나 ──────────────────────────────────────────────
 *   admin.html 의 저장은 saveAll() → saveLocal() → localStorage['usung-cms-state-v2']
 *   가 전부다. localStorage 는 **브라우저별** 저장소라 고친 사람 화면에서만 바뀌고
 *   방문자는 예전 내용을 본다. admin.html:762 주석이 게시판에 대해 같은 말을 한다.
 *   → 「관리자에서 고쳐도 반영이 안 되더라」의 정체다. 재제작이 아니라 발행 경로가 없는 것.
 *
 * ── 설계: api/board.js 를 그대로 복제한다 ────────────────────────────
 *   ★ 환경변수를 **재사용**한다(BOARD_TOKEN·BOARD_ADMIN_KEY·BOARD_REPO·BOARD_BRANCH).
 *     새 변수를 만들면 승연이 Vercel 에 등록할 게 늘어난다. 게시판(A-11)과 같은 리포에
 *     같은 권한으로 쓰므로 토큰을 나눌 이유가 없다.
 *   저장 위치: 이 리포의 data/cms.json (GitHub Contents API).
 *     커밋 메시지에 [skip ci] → 글 한 번 고칠 때마다 Vercel 재배포가 돌지 않는다.
 *     그래서 배포본의 정적 data/cms.json 은 낡는다 → 읽기는 반드시 이 API 로 한다.
 *
 * ── 미설정일 때 라이브가 바뀌지 않는다 ────────────────────────────────
 *   환경변수가 하나라도 없으면 GET 이 configured:false + content:{} 로 응답한다.
 *   방문자 오버레이(usung-r37-cms.js)는 그걸 보고 아무것도 하지 않는다.
 *   즉 A-11 등록 전에는 **화면이 오늘과 100% 동일**하다.
 *
 * ── ★ 이미지는 발행하지 않는다 ────────────────────────────────────────
 *   admin.html:1119 등이 FileReader.readAsDataURL 로 이미지를 **base64 dataURL** 로
 *   S.images 에 담는다. 그대로 올리면 사진 몇 장에 파일이 MB 단위로 커져
 *   GitHub Contents API 와 서버리스 응답 한도를 넘긴다. 텍스트(content)만 받는다.
 *   이미지 교체는 지금처럼 리포에 파일로 커밋하는 방식이 맞다.
 */
import { createHash, timingSafeEqual } from 'node:crypto';

// ★ 모듈 최상위에서 env 를 읽지 말 것 — import 호이스팅 때문에 값이 구워진다(board.js 와 동일 함정).
const repo = () => process.env.BOARD_REPO || 'macquarter/usung-ace';
const branch = () => process.env.BOARD_BRANCH || 'main';
const FILE = 'data/cms.json';
const MAX_BYTES = 128 * 1024;
const MAX_KEYS = 300;
const MAX_VAL = 2000;

function gh(path, init) {
  return fetch(`https://api.github.com/repos/${repo()}/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.BOARD_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'usung-cms',
      ...(init && init.headers)
    }
  });
}

async function readFile() {
  const r = await gh(`contents/${FILE}?ref=${branch()}`, { cache: 'no-store' });
  if (r.status === 404) return { content: {}, updatedAt: 0, sha: null };
  if (!r.ok) throw new Error('GitHub read ' + r.status);
  const j = await r.json();
  let content = {}, updatedAt = 0;
  try {
    const parsed = JSON.parse(Buffer.from(j.content || '', 'base64').toString('utf8'));
    content = (parsed && parsed.content) || {};
    updatedAt = Number(parsed && parsed.updatedAt) || 0;
  } catch (e) { content = {}; }
  return { content, updatedAt, sha: j.sha };
}

function writeFile(content, sha) {
  const body = {
    message: 'chore(cms): 홈페이지 내용 갱신 [skip ci]',
    content: Buffer.from(JSON.stringify({ content, updatedAt: Date.now() }, null, 2)).toString('base64'),
    branch: branch()
  };
  if (sha) body.sha = sha;
  return gh(`contents/${FILE}`, { method: 'PUT', body: JSON.stringify(body) });
}

// 방문자쪽은 textContent 로만 넣으므로 태그가 실행될 일은 없다. 그래도 꺾쇠는 서버에서 걷는다
// — 나중에 누가 innerHTML 로 바꿔도 사고가 안 나게(게시판 clean() 과 같은 이유).
const clean = (v) => String(v == null ? '' : v).replace(/[<>]/g, '').slice(0, MAX_VAL);

// data-cms 속성값의 실제 형태: h_title1 · c_tel · a_ceo_name … (영숫자+언더스코어)
const KEY_OK = /^[A-Za-z0-9_]{1,40}$/;

function normalize(obj) {
  const out = {};
  if (!obj || typeof obj !== 'object') return out;
  let n = 0;
  for (const k of Object.keys(obj)) {
    if (n >= MAX_KEYS) break;
    if (!KEY_OK.test(k)) continue;
    const v = obj[k];
    if (v == null) continue;
    if (typeof v !== 'string' && typeof v !== 'number') continue;
    const s = clean(v);
    // 빈 값은 저장하지 않는다. 저장하면 방문자쪽에서 원문을 빈칸으로 덮어버린다
    // (index_v6.html:5620 도 같은 이유로 '' 를 건너뛴다).
    if (!s.trim()) continue;
    out[k] = s;
    n++;
  }
  return out;
}

// 길이까지 감추려고 양쪽을 해시한 뒤 비교한다(board.js 와 동일).
const digest = (s) => createHash('sha256').update(String(s == null ? '' : s)).digest();
function authed(req) {
  const key = process.env.BOARD_ADMIN_KEY;
  if (!key) return false;
  return timingSafeEqual(digest(req.headers['x-admin-key']), digest(key));
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const configured = !!(process.env.BOARD_TOKEN && process.env.BOARD_ADMIN_KEY);

  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
    if (!configured) { res.status(200).json({ ok: true, configured: false, content: {} }); return; }
    try {
      const { content, updatedAt } = await readFile();
      res.status(200).json({ ok: true, configured: true, content, updatedAt });
    } catch (e) {
      // 읽기 실패로 홈페이지가 죽으면 안 된다 — 빈 내용으로 물러나면 원문이 그대로 보인다.
      res.status(200).json({ ok: false, configured: true, content: {}, error: e.message });
    }
    return;
  }

  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'method' }); return; }
  if (!configured) { res.status(503).json({ ok: false, configured: false, error: '서버 저장소가 아직 설정되지 않았습니다' }); return; }
  if (!authed(req)) { res.status(401).json({ ok: false, error: '관리자 키가 일치하지 않습니다' }); return; }

  let payload = req.body;
  if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch (e) { payload = null; } }
  if (!payload) { res.status(400).json({ ok: false, error: '본문을 읽지 못했습니다' }); return; }

  const content = normalize(payload.content);
  if (Buffer.byteLength(JSON.stringify(content)) > MAX_BYTES) {
    res.status(413).json({ ok: false, error: '용량 초과' });
    return;
  }

  try {
    // sha 가 어긋나면 409. 동시 수정뿐 아니라 GitHub 이 최대 60초 묵은 응답을 주는 경우에도
    // 난다(board.js 에서 실측). 그래서 재시도 전에 잠깐 기다린다.
    for (let i = 0; i < 3; i++) {
      if (i) await new Promise(r => setTimeout(r, 400 * i * i));
      const { sha } = await readFile();
      const w = await writeFile(content, sha);
      if (w.ok) { res.status(200).json({ ok: true, count: Object.keys(content).length }); return; }
      if (w.status !== 409) {
        const detail = await w.text().catch(() => '');
        res.status(502).json({ ok: false, error: 'GitHub write ' + w.status + ' ' + detail.slice(0, 200) });
        return;
      }
    }
    res.status(409).json({ ok: false, error: '동시 수정 충돌 — 다시 발행해 주세요' });
  } catch (e) {
    res.status(502).json({ ok: false, error: e.message });
  }
}
