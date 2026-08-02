/* api/board.js — 고객센터 게시판 서버 저장소 (PPT slide6·7)
 *
 * 왜 필요한가: admin.html 의 글쓰기는 localStorage['usung-cms-state-v2'] 에만 남는다.
 * 브라우저별 저장소라 관리자가 쓴 글이 방문자에게는 아예 보이지 않았다.
 *
 * 저장 위치: 이 리포의 data/board.json (GitHub Contents API).
 *   - 커밋 메시지에 [skip ci] 를 넣어 글 한 건마다 Vercel 이 재배포되지 않게 한다.
 *   - 그래서 배포본의 정적 data/board.json 은 낡는다 → 읽기는 반드시 API 로 한다.
 *
 * 환경변수 2개가 모두 있어야 동작한다. 하나라도 없으면 GET 이 configured:false 로
 * 응답하고 프론트는 기존 localStorage 동작 그대로 남는다 — 미설정 상태에서
 * 라이브 화면이 바뀌지 않는다는 뜻이다.
 *   BOARD_TOKEN     : GitHub PAT (이 리포 contents read/write 만)
 *   BOARD_ADMIN_KEY : 관리자 쓰기 키 (admin.html 의 admin/admin 과 무관한 별도 비밀)
 *   BOARD_REPO      : owner/repo (선택, 기본 macquarter/usung-ace)
 */
import { createHash, timingSafeEqual } from 'node:crypto';

// ★ 모듈 로드 시점에 읽지 말 것. 그러면 import 이후에 env 를 세팅하는 호출자(테스트 등)가
// 조용히 기본값 main 을 쓰게 된다 — 실제로 테스트가 main 에 글을 써버렸다(2026-08-02).
const repo = () => process.env.BOARD_REPO || 'macquarter/usung-ace';
const branch = () => process.env.BOARD_BRANCH || 'main';
const FILE = 'data/board.json';
const MAX_BYTES = 256 * 1024;
const MAX_POSTS = 300;

function gh(path, init) {
  return fetch(`https://api.github.com/repos/${repo()}/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.BOARD_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'usung-board',
      ...(init && init.headers)
    }
  });
}

async function readFile() {
  const r = await gh(`contents/${FILE}?ref=${branch()}`, { cache: 'no-store' });
  if (r.status === 404) return { posts: [], sha: null };
  if (!r.ok) throw new Error('GitHub read ' + r.status);
  const j = await r.json();
  let posts = [];
  try {
    posts = JSON.parse(Buffer.from(j.content || '', 'base64').toString('utf8')).posts || [];
  } catch (e) { posts = []; }
  return { posts, sha: j.sha };
}

function writeFile(posts, sha) {
  const body = {
    message: 'chore(board): 게시판 글 갱신 [skip ci]',
    content: Buffer.from(JSON.stringify({ posts, updatedAt: Date.now() }, null, 2)).toString('base64'),
    branch: branch()
  };
  if (sha) body.sha = sha;
  return gh(`contents/${FILE}`, { method: 'PUT', body: JSON.stringify(body) });
}

// renderBoard() 가 템플릿 리터럴로 innerHTML 을 만든다 → 꺾쇠는 서버에서 걷어낸다.
const clean = (v, n) => String(v == null ? '' : v).replace(/[<>]/g, '').trim().slice(0, n);

function normalize(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, MAX_POSTS).map((p, i) => ({
    id: clean(p.id, 40) || 'p' + Date.now().toString(36) + i,
    cat: clean(p.cat, 20) || '일반',
    title: clean(p.title, 120),
    author: clean(p.author, 30) || '유성에이스',
    body: clean(p.body, 4000),
    pin: !!p.pin,
    createdAt: Number(p.createdAt) || Date.now()
  })).filter(p => p.title);
}

// 길이까지 감추려고 양쪽을 해시한 뒤 비교한다.
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
    if (!configured) { res.status(200).json({ ok: true, configured: false, posts: [] }); return; }
    try {
      const { posts } = await readFile();
      res.status(200).json({ ok: true, configured: true, posts });
    } catch (e) {
      // 읽기 실패로 게시판 자체가 죽으면 안 된다 — 빈 목록으로 물러난다.
      res.status(200).json({ ok: false, configured: true, posts: [], error: e.message });
    }
    return;
  }

  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'method' }); return; }
  if (!configured) { res.status(503).json({ ok: false, configured: false, error: '서버 저장소가 아직 설정되지 않았습니다' }); return; }
  if (!authed(req)) { res.status(401).json({ ok: false, error: '관리자 키가 일치하지 않습니다' }); return; }

  let payload = req.body;
  if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch (e) { payload = null; } }
  if (!payload) { res.status(400).json({ ok: false, error: '본문을 읽지 못했습니다' }); return; }

  const posts = normalize(payload.posts);
  if (Buffer.byteLength(JSON.stringify(posts)) > MAX_BYTES) {
    res.status(413).json({ ok: false, error: '용량 초과' });
    return;
  }

  try {
    // sha 가 어긋나면 409. 동시 수정뿐 아니라 GitHub 이 최대 60초(max-age=60) 묵은 응답을
    // 주는 경우에도 난다 — 실측으로 확인했다. 그래서 재시도 전에 잠깐 기다린다.
    for (let i = 0; i < 3; i++) {
      if (i) await new Promise(r => setTimeout(r, 400 * i * i));
      const { sha } = await readFile();
      const w = await writeFile(posts, sha);
      if (w.ok) { res.status(200).json({ ok: true, count: posts.length }); return; }
      if (w.status !== 409) {
        const detail = await w.text().catch(() => '');
        res.status(502).json({ ok: false, error: 'GitHub write ' + w.status + ' ' + detail.slice(0, 200) });
        return;
      }
    }
    res.status(409).json({ ok: false, error: '동시 수정 충돌 — 다시 저장해 주세요' });
  } catch (e) {
    res.status(502).json({ ok: false, error: e.message });
  }
}
