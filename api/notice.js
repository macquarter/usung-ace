/* api/notice.js — 공지사항 서버 저장소 (r58)
 *
 * 왜 필요한가 (2026-08-24 납품 점검에서 나온 최대 리스크):
 *   admin.html 의 공지 글쓰기는 localStorage['usung-cms-state-v2'] 에만 남았다.
 *   그런데 index_v6.html:3635-3652(frozen)가 **그 localStorage 를 읽어 타임라인에 병합**한다.
 *   관리자와 사이트가 같은 오리진이라 **고객이 자기 브라우저에서 공지를 쓰면 자기 눈에는 보인다.
 *   남에게는 안 보인다.** → 시연은 성공처럼 보이고 실제로는 실패하는, 제일 나쁜 형태의 결함이었다.
 *   이 파일이 그 「남에게 보이는 경로」다.
 *
 * 구조는 api/board.js 와 **일부러 똑같이** 뒀다. 배관이 둘로 갈라지면 한쪽만 썩는다.
 *   - 저장: 이 리포의 data/notice.json (GitHub Contents API)
 *   - 커밋 메시지에 [skip ci] → 글 한 건마다 Vercel 재배포되지 않는다
 *   - 그래서 배포본의 정적 data/notice.json 은 낡는다 → **읽기는 반드시 이 API 로** 한다
 *
 * 환경변수 2개가 모두 있어야 동작한다. 하나라도 없으면 GET 이 configured:false 로 응답하고
 * usung-notice.js 는 기존 동작(프로즌 타임라인 읽기) 그대로 남는다 — 미설정 상태에서
 * 라이브 화면이 바뀌지 않는다는 뜻이다.
 *   BOARD_TOKEN     : GitHub PAT (이 리포 contents read/write 만)
 *   BOARD_ADMIN_KEY : 관리자 비밀번호 (api/login.js 가 검사 → 12시간 토큰 발급)
 *   BOARD_REPO      : owner/repo (선택, 기본 macquarter/usung-ace)
 *
 * ★ 게시판과 같은 비밀을 쓴다. 공지 전용 키를 새로 만들지 않았다 —
 *   비밀이 둘이 되면 「어느 쪽이 진짜냐」로 반드시 사고가 난다(admin.html:817 주석 참조).
 */
import { authed } from './_auth.js';

// ★ 모듈 로드 시점에 읽지 말 것 (api/board.js:19 와 같은 이유 — 서버리스 env 게터화).
const repo = () => process.env.BOARD_REPO || 'macquarter/usung-ace';
const branch = () => process.env.BOARD_BRANCH || 'main';
const FILE = 'data/notice.json';
const MAX_BYTES = 256 * 1024;
const MAX_POSTS = 200;

function gh(path, init) {
  return fetch(`https://api.github.com/repos/${repo()}/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.BOARD_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'usung-notice',
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
    message: 'chore(notice): 공지사항 갱신 [skip ci]',
    content: Buffer.from(JSON.stringify({ posts, updatedAt: Date.now() }, null, 2)).toString('base64'),
    branch: branch()
  };
  if (sha) body.sha = sha;
  return gh(`contents/${FILE}`, { method: 'PUT', body: JSON.stringify(body) });
}

// usung-notice.js 는 esc() 로 다시 한 번 막지만, 서버에서도 걷어낸다(이중 방어).
const clean = (v, n) => String(v == null ? '' : v).replace(/[<>]/g, '').trim().slice(0, n);

function normalize(list) {
  if (!Array.isArray(list)) return [];
  return list.slice(0, MAX_POSTS).map((p, i) => ({
    id: clean(p.id, 40) || 'n' + Date.now().toString(36) + i,
    cat: clean(p.cat, 20) || '공지',
    title: clean(p.title, 120),
    body: clean(p.body, 4000),
    pin: !!p.pin,
    createdAt: Number(p.createdAt) || Date.now()
  })).filter(p => p.title);
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key, x-admin-token');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const configured = !!(process.env.BOARD_TOKEN && process.env.BOARD_ADMIN_KEY);

  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
    if (!configured) { res.status(200).json({ ok: true, configured: false, posts: [] }); return; }
    try {
      const { posts } = await readFile();
      res.status(200).json({ ok: true, configured: true, posts });
    } catch (e) {
      // 읽기 실패로 공지 페이지가 죽으면 안 된다 — 빈 목록으로 물러난다.
      res.status(200).json({ ok: false, configured: true, posts: [], error: e.message });
    }
    return;
  }

  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'method' }); return; }
  if (!configured) { res.status(503).json({ ok: false, configured: false, error: '서버 저장소가 아직 설정되지 않았습니다' }); return; }
  if (!authed(req)) { res.status(401).json({ ok: false, error: '관리자 권한이 없습니다 — 다시 로그인해 주세요' }); return; }

  let payload = req.body;
  if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch (e) { payload = null; } }
  if (!payload) { res.status(400).json({ ok: false, error: '본문을 읽지 못했습니다' }); return; }

  const posts = normalize(payload.posts);
  if (Buffer.byteLength(JSON.stringify(posts)) > MAX_BYTES) {
    res.status(413).json({ ok: false, error: '용량 초과' });
    return;
  }

  try {
    // sha 가 어긋나면 409 (api/board.js:115 와 같은 사정 — GitHub 이 최대 60초 묵은 응답을 준다).
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
