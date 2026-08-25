/* api/products.js — 제품소개 발행(publish) 경로  · 승연 지시
 *   「제품소개의 관리자페이지는 유기적으로 움직이도록 부탁해. 하나더 추가하거나 빼거나
 *    사진을 넣거나 추가하면 알아서 기입이되고 레이아웃도 추가로 생성되도록 해야해.」
 *
 * ── 무엇이 고장나 있었나 ──────────────────────────────────────────────
 *   관리자 제품 탭은 admin.html 의 D2.products **하드코딩 15개**를 보여준다.
 *   그런데 실제 사이트 제품은 usung-catalog-data.js 의 window.UP_DATA **215종**이다.
 *   카테고리 이름조차 다르다(관리자: 등제품·스텐파이프·스파이얼 / 화면: LED조명·
 *   파이프·후레쉬볼·코브라후드). 즉 **관리자가 보여주는 제품 목록은 화면과 아무 관계가 없다.**
 *   게다가 admin 의 발행(publishCms)은 `{content}` 텍스트만 POST 한다 —
 *   S.arrays.products 는 localStorage 를 벗어난 적이 없다. 고쳐도 방문자에겐 안 간다.
 *   → r48(관리자 시드 퇴출)·r52(공지 더미 삭제)와 **같은 병**이 제품에 남아 있었다.
 *
 * ── 설계: 전체 교체가 아니라 **패치(patch)** 다 ───────────────────────
 *   215종을 통째로 서버에 올리지 않는다. 정적 카탈로그를 기준선으로 두고
 *   **차이분만** data/products.json 에 적는다.
 *     { add:[{stem,cat,mid,grp,name,finish,tags}], edit:{stem:{필드}}, del:[stem] }
 *   ★ 이유 셋:
 *     1) 용량 — 215종 전체는 JSON 으로 60KB+ 다. 패치는 보통 1KB 미만이라
 *        GitHub Contents API·서버리스 응답 한도에서 멀리 떨어져 있다.
 *     2) 롤백 — data/products.json 하나만 지우면 오늘의 215종으로 정확히 돌아간다.
 *     3) 사고 반경 — 관리자가 실수로 목록을 비워도 기준선은 리포에 그대로 있다.
 *        (r48-d 「배열 비우기 금지 — 진짜 글이 죽는다」와 같은 원칙)
 *
 * ── 저장 위치 ────────────────────────────────────────────────────────
 *   api/cms.js 를 그대로 복제한다. 같은 환경변수(BOARD_TOKEN·BOARD_ADMIN_KEY·
 *   BOARD_REPO·BOARD_BRANCH)를 재사용하므로 승연이 Vercel 에 등록할 것이 늘지 않는다.
 *   커밋 메시지 [skip ci] → 제품 한 번 고칠 때마다 Vercel 재배포가 돌지 않는다.
 *   ★ 그래서 배포본의 정적 data/products.json 은 낡는다. 읽기는 이 API 이거나
 *     raw.githubusercontent.com 이어야 한다(api/inject.js 가 후자를 쓴다).
 *
 * ── ★ 이미지는 여기서 다루지 않는다 ──────────────────────────────────
 *   base64 dataURL 을 이 JSON 에 담으면 사진 몇 장에 MB 단위가 된다(cms.js 와 같은 이유).
 *   사진 업로드는 **별도 경로에서 리포에 실제 파일로** 커밋한다.
 *   여기서는 stem(파일명)만 다루고, 이미지 URL 은 stem 으로부터 유도된다:
 *     R8_IMG + stem + '.png'  (usung-r8-data.js:7)
 */
import { authed } from './_auth.js';

// ★ 모듈 최상위에서 env 를 읽지 말 것 — import 호이스팅 때문에 값이 구워진다(cms.js 와 동일 함정).
const repo = () => process.env.BOARD_REPO || 'macquarter/usung-ace';
const branch = () => process.env.BOARD_BRANCH || 'main';
const FILE = 'data/products.json';

const MAX_BYTES = 256 * 1024;   // 패치는 보통 1KB 미만 — 사고 상한선이다
const MAX_ADD = 300;            // 신규 제품
const MAX_EDIT = 300;           // 수정 대상
const MAX_DEL = 300;            // 삭제 대상
const MAX_VAL = 200;            // 제품명·규격 한 칸

const EMPTY = { add: [], edit: {}, del: [] };

function gh(path, init) {
  return fetch(`https://api.github.com/repos/${repo()}/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.BOARD_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'usung-products',
      ...(init && init.headers)
    }
  });
}

async function readFile() {
  const r = await gh(`contents/${FILE}?ref=${branch()}`, { cache: 'no-store' });
  if (r.status === 404) return { patch: { ...EMPTY }, updatedAt: 0, sha: null };
  if (!r.ok) throw new Error('GitHub read ' + r.status);
  const j = await r.json();
  let patch = { ...EMPTY }, updatedAt = 0;
  try {
    const parsed = JSON.parse(Buffer.from(j.content || '', 'base64').toString('utf8'));
    patch = normalize(parsed);
    updatedAt = Number(parsed && parsed.updatedAt) || 0;
  } catch (e) { patch = { ...EMPTY }; }
  return { patch, updatedAt, sha: j.sha };
}

function writeFile(patch, sha) {
  const body = {
    message: 'chore(products): 제품소개 갱신 [skip ci]',
    content: Buffer.from(
      JSON.stringify({ ...patch, updatedAt: Date.now() }, null, 2)
    ).toString('base64'),
    branch: branch()
  };
  if (sha) body.sha = sha;
  return gh(`contents/${FILE}`, { method: 'PUT', body: JSON.stringify(body) });
}

/* ── 검증 ───────────────────────────────────────────────────────────
   방문자쪽은 이 값을 카드 텍스트로 넣는다. 꺾쇠는 서버에서 걷는다
   — 나중에 누가 innerHTML 로 바꿔도 사고가 안 나게(cms.js·board.js 와 같은 이유). */
const clean = (v) => String(v == null ? '' : v).replace(/[<>]/g, '').trim().slice(0, MAX_VAL);

// stem 은 곧 이미지 파일명이다(gal001·led006·cobra001 …). 경로 문자를 절대 허용하지 않는다
// — '../' 가 섞이면 R8_IMG 와 이어붙을 때 엉뚱한 URL 이 만들어진다.
const STEM_OK = /^[A-Za-z0-9_-]{1,40}$/;

/* 한 제품 레코드가 가질 수 있는 칸. 앞 6개는 usung-catalog-data.js 의 7열과 같은 이름이다
   (stem·cat·mid·grp·name·finish·tags). 여기 없는 키는 조용히 버린다.

   ★ r60 에서 feat(특징)·badge(NEW/BEST) 두 칸을 더했다. 이 둘은 카탈로그 원본에 **없는 열**이라
     215행 전부 undefined 로 시작한다 — 읽는 쪽은 항상 `|| ''` 로 받아야 한다.

   ★★ 태그(tags)에 얹지 않은 이유가 있다. tags 는 죽은 칸이 아니다 —
     usung-review.js:662 가 상세창에 **칩으로 그리고**, usung-r8-data.js:198 colorOf() 가
     **마지막 태그를 색상 이름으로** 쓴다. 여기에 '특징' 이나 'BEST' 를 밀어 넣으면
     제품 색상 이름표가 「BEST」로 바뀐다. 칸을 새로 파는 편이 싸다. */
const FIELDS = ['cat', 'mid', 'grp', 'name', 'finish', 'tags', 'feat', 'badge'];

function normRecord(o) {
  if (!o || typeof o !== 'object') return null;
  const stem = clean(o.stem);
  if (!STEM_OK.test(stem)) return null;
  const out = { stem };
  for (const f of FIELDS) {
    if (o[f] == null) continue;
    const s = clean(o[f]);
    if (s) out[f] = s;
  }
  // 이름 없는 제품은 카드에 빈칸으로 뜬다 — 저장하지 않는다(cms.js 의 빈 값 규칙과 같다).
  if (!out.name) return null;
  return out;
}

function normalize(obj) {
  const out = { add: [], edit: {}, del: [] };
  if (!obj || typeof obj !== 'object') return out;

  const seen = new Set();
  if (Array.isArray(obj.add)) {
    for (const raw of obj.add) {
      if (out.add.length >= MAX_ADD) break;
      const rec = normRecord(raw);
      if (!rec || seen.has(rec.stem)) continue;   // stem 중복은 뒤엣것을 버린다
      seen.add(rec.stem);
      out.add.push(rec);
    }
  }

  if (obj.edit && typeof obj.edit === 'object') {
    let n = 0;
    for (const stem of Object.keys(obj.edit)) {
      if (n >= MAX_EDIT) break;
      if (!STEM_OK.test(stem)) continue;
      const src = obj.edit[stem];
      if (!src || typeof src !== 'object') continue;
      const patch = {};
      for (const f of FIELDS) {
        if (src[f] == null) continue;
        const s = clean(src[f]);
        // 빈 문자열은 「지우기」가 아니라 「손대지 않음」이다.
        // 빈 값을 저장하면 방문자쪽에서 원문 제품명을 빈칸으로 덮어버린다.
        if (s) patch[f] = s;
      }
      if (!Object.keys(patch).length) continue;
      out.edit[stem] = patch;
      n++;
    }
  }

  if (Array.isArray(obj.del)) {
    const d = new Set();
    for (const raw of obj.del) {
      if (d.size >= MAX_DEL) break;
      const stem = clean(raw);
      if (STEM_OK.test(stem)) d.add(stem);
    }
    out.del = [...d];
  }

  return out;
}

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, x-admin-key, x-admin-token');
  if (req.method === 'OPTIONS') { res.status(200).end(); return; }

  const configured = !!(process.env.BOARD_TOKEN && process.env.BOARD_ADMIN_KEY);

  if (req.method === 'GET') {
    res.setHeader('Cache-Control', 's-maxage=30, stale-while-revalidate=120');
    if (!configured) { res.status(200).json({ ok: true, configured: false, ...EMPTY }); return; }
    try {
      const { patch, updatedAt } = await readFile();
      res.status(200).json({ ok: true, configured: true, ...patch, updatedAt });
    } catch (e) {
      // 읽기 실패로 제품소개가 비면 안 된다 — 빈 패치로 물러나면 정적 215종이 그대로 보인다.
      res.status(200).json({ ok: false, configured: true, ...EMPTY, error: e.message });
    }
    return;
  }

  if (req.method !== 'POST') { res.status(405).json({ ok: false, error: 'method' }); return; }
  if (!configured) { res.status(503).json({ ok: false, configured: false, error: '서버 저장소가 아직 설정되지 않았습니다' }); return; }
  if (!authed(req)) { res.status(401).json({ ok: false, error: '관리자 키가 일치하지 않습니다' }); return; }

  let payload = req.body;
  if (typeof payload === 'string') { try { payload = JSON.parse(payload); } catch (e) { payload = null; } }
  if (!payload) { res.status(400).json({ ok: false, error: '본문을 읽지 못했습니다' }); return; }

  const patch = normalize(payload);
  if (Buffer.byteLength(JSON.stringify(patch)) > MAX_BYTES) {
    res.status(413).json({ ok: false, error: '용량 초과' });
    return;
  }

  try {
    // sha 가 어긋나면 409. 동시 수정뿐 아니라 GitHub 이 최대 60초 묵은 응답을 주는 경우에도
    // 난다(board.js 에서 실측). 그래서 재시도 전에 잠깐 기다린다.
    for (let i = 0; i < 3; i++) {
      if (i) await new Promise(r => setTimeout(r, 400 * i * i));
      const { sha } = await readFile();
      const w = await writeFile(patch, sha);
      if (w.ok) {
        res.status(200).json({
          ok: true,
          added: patch.add.length,
          edited: Object.keys(patch.edit).length,
          deleted: patch.del.length
        });
        return;
      }
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
