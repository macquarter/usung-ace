/* api/gallery.js — 시공갤러리 항목 발행(publish) 경로 · r76
 *   승연 지시 「갤러리 추가와 수정기능 넣고 편집자가 이름과 내용 그리고 카테고리까지 넣을수 있게」
 *
 * ── 무엇이 고장나 있었나 ──────────────────────────────────────────────
 *   갤러리 글자를 고치는 길이 「화면에서 편집」(r41) 하나뿐이었다. 그건 **글자로** 찾는다.
 *   갤러리는 같은 문구가 여러 장에 걸쳐 있어서 한 장을 고치면 여러 장이 같이 바뀐다.
 *   r70 이 그걸 **경고**하게 만들었지만, 경고는 「못 고친다」를 정중하게 말한 것일 뿐이다.
 *   → 이 API 는 글자가 아니라 **항목(src)** 을 지목한다. 그래서 구조적으로 안 묶인다.
 *
 * ── 왜 src(파일명)가 주소인가 ────────────────────────────────────────
 *   usung-r8-gal.js 의 GALLERY 는 [src, spec, site, w, h] 5열이다.
 *   실측: 전체 69행 · **src 중복 0**. 즉 파일명 하나로 69행 중 딱 한 행이 지목된다.
 *   (분류+파일명이 아니라 파일명만으로 충분하다 — 분류는 화면에 보여줄 때만 쓴다.)
 *
 * ── 설계: 전체 교체가 아니라 패치(patch) ─────────────────────────────
 *   api/products.js 를 그대로 따른다. 69행을 통째로 올리지 않고 차이분만 적는다.
 *     { add:[{src,cat,spec,site,w,h}], edit:{src:{cat,spec,site}}, del:[src] }
 *   이유 셋(products.js §설계와 동일): 용량 · 롤백(파일 하나 지우면 원상복구) · 사고 반경.
 *
 * ── ★ 서버는 「쌍둥이」를 모른다 ──────────────────────────────────────
 *   실측: spec|site 가 똑같은 **중복쌍이 19개** 있다(69행 중 38행 · 27%).
 *   galItems('전체') 가 spec+'|'+site 를 키로 중복을 걷어내므로 69 → 50 이 된다.
 *   한쪽만 고치면 키가 갈라져 **숨어 있던 짝이 나타난다**(전체 50 → 51).
 *   → 그 판단은 **관리자 화면이** 한다. 「두 곳 다 바꾸기」를 고르면 관리자가
 *     edit 항목을 **두 개** 보낸다. 서버는 시키는 대로 저장할 뿐이다.
 *   ★ 서버에 정책을 넣지 않는 이유: 쌍둥이 목록은 데이터가 바뀌면 같이 바뀐다.
 *     서버에 굳혀 두면 반드시 썩는다(KNOWLEDGE 41).
 *
 * ── ★ 사진 파일은 여기서 다루지 않는다 ───────────────────────────────
 *   base64 를 이 JSON 에 담으면 몇 장에 MB 가 된다(products.js·cms.js 와 같은 이유).
 *   사진은 api/gallery-image.js 가 api/_img.js 를 통해 **리포에 실제 파일로** 커밋한다.
 *   여기서는 src(파일명)만 다룬다. 실제 주소는 GAL_DIR + src 로 유도된다.
 *   ★★ 그래서 수명이 둘이다 — 사진은 커밋 후 재배포 1~2분, 글자는 이 API 로 즉시.
 *      관리자 화면이 이 차이를 글로 안내해야 한다(CLAUDE.md §3-3).
 */
import { authed } from './_auth.js';

// ★ 모듈 최상위에서 env 를 읽지 말 것 — import 호이스팅 때문에 값이 구워진다(cms.js 와 동일 함정).
const repo = () => process.env.BOARD_REPO || 'macquarter/usung-ace';
const branch = () => process.env.BOARD_BRANCH || 'main';
const FILE = 'data/gallery.json';

const MAX_BYTES = 256 * 1024;   // 패치는 보통 1KB 미만 — 사고 상한선이다
const MAX_ADD = 200;
const MAX_EDIT = 200;
const MAX_DEL = 200;
const MAX_VAL = 200;            // 한 칸(이름·내용)

const EMPTY = { add: [], edit: {}, del: [] };

/* 분류 화이트리스트. usung-r8-gal.js 의 GAL_ORDER 와 같은 값이다.
   ★ 왜 자유 문자열이 아닌가 — cat 은 GALLERY[cat] 배열을 고르는 키다.
     없는 분류를 쓰면 그 항목은 어느 배열에도 안 들어가 **조용히 사라진다**.
     "저장했는데 없어졌다" 가 가장 나쁜 실패다. 여기서 막고 400 으로 알린다. */
const CATS = ['클래식', '모던', '프리미엄', '레트로'];

/* src 는 곧 이미지 파일명이다(gm01.jpg · gc14.jpg …). 경로 문자를 절대 허용하지 않는다
   — '../' 가 섞이면 GAL_DIR 과 이어붙일 때 엉뚱한 URL 이 만들어진다.
   ★ 확장자를 정규식에 포함한 이유: 기존 69행이 전부 '.jpg' 로 끝난다. 확장자를 떼면
     api/gallery-image.js 가 무엇을 쓸지 몰라 양쪽 규칙이 갈라진다(products.js 의 stem 과 다른 점). */
const SRC_OK = /^[A-Za-z0-9_-]{1,40}\.(?:jpg|jpeg|png|webp)$/i;

function gh(path, init) {
  return fetch(`https://api.github.com/repos/${repo()}/${path}`, {
    ...init,
    headers: {
      Authorization: `Bearer ${process.env.BOARD_TOKEN}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'usung-gallery',
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
    // ★ [skip ci] 를 붙인다 — 이건 **글자**다. api/inject.js 가 Contents API 로 직접 읽으므로
    //   재배포 없이 즉시 반영된다. 사진(api/gallery-image.js)은 정반대다(_img.js §[skip ci]).
    message: 'chore(gallery): 시공갤러리 갱신 [skip ci]',
    content: Buffer.from(
      JSON.stringify({ ...patch, updatedAt: Date.now() }, null, 2)
    ).toString('base64'),
    branch: branch()
  };
  if (sha) body.sha = sha;
  return gh(`contents/${FILE}`, { method: 'PUT', body: JSON.stringify(body) });
}

/* ── 검증 ───────────────────────────────────────────────────────────
   방문자쪽은 이 값을 타일 캡션·라이트박스 글로 넣는다. 꺾쇠는 서버에서 걷는다
   — 나중에 누가 innerHTML 로 바꿔도 사고가 안 나게(cms.js·products.js 와 같은 이유). */
const clean = (v) => String(v == null ? '' : v).replace(/[<>]/g, '').trim().slice(0, MAX_VAL);

/* 편집 가능한 칸은 셋뿐이다 — 승연이 지정한 「이름 · 내용 · 카테고리」.
   ★ src 는 여기 없다. src 는 **주소**라 바꿀 수 없다(바꾸려면 지우고 새로 넣는다).
   ★ w·h 도 여기 없다. 실측 결과 usung-r8-gal.js 는 두 칸을 **한 번도 읽지 않는다**
     (mk() 가 만들기만 하고 소비처가 없다). 사진을 따라가는 값이지 사람이 고칠 값이 아니다. */
const FIELDS = ['cat', 'spec', 'site'];

/* 새로 추가하는 한 행. add 는 edit 과 달리 **spec·cat 이 필수**다 —
   내용 없는 타일은 '유성에이스 후드' 로만 뜨고, 분류 없는 타일은 어느 탭에도 안 걸린다. */
function normAdd(o) {
  if (!o || typeof o !== 'object') return null;
  const src = clean(o.src);
  if (!SRC_OK.test(src)) return null;
  const cat = clean(o.cat);
  if (!CATS.includes(cat)) return null;
  const spec = clean(o.spec);
  if (!spec) return null;
  const rec = { src, cat, spec, site: clean(o.site) };
  // w·h 는 사진의 실제 크기다. 관리자가 업로드할 때 재서 보낸다. 못 재면 그냥 뺀다
  // — 지금 아무도 안 읽으므로 없어도 화면이 같다(억지로 0 을 넣으면 나중에 읽는 쪽이 생겼을 때 거짓말이 된다).
  const w = Math.trunc(Number(o.w)), h = Math.trunc(Number(o.h));
  if (Number.isFinite(w) && w > 0 && w < 20000) rec.w = w;
  if (Number.isFinite(h) && h > 0 && h < 20000) rec.h = h;
  return rec;
}

function normalize(obj) {
  const out = { add: [], edit: {}, del: [] };
  if (!obj || typeof obj !== 'object') return out;

  const seen = new Set();
  if (Array.isArray(obj.add)) {
    for (const raw of obj.add) {
      if (out.add.length >= MAX_ADD) break;
      const rec = normAdd(raw);
      if (!rec || seen.has(rec.src)) continue;   // src 중복은 뒤엣것을 버린다
      seen.add(rec.src);
      out.add.push(rec);
    }
  }

  if (obj.edit && typeof obj.edit === 'object' && !Array.isArray(obj.edit)) {
    let n = 0;
    for (const src of Object.keys(obj.edit)) {
      if (n >= MAX_EDIT) break;
      if (!SRC_OK.test(src)) continue;
      const s = obj.edit[src];
      if (!s || typeof s !== 'object') continue;
      const patch = {};
      for (const f of FIELDS) {
        if (s[f] == null) continue;
        const v = clean(s[f]);
        // ★ 빈 문자열은 「지우기」가 아니라 「손대지 않음」이다(products.js 와 같은 규칙).
        //   빈 값을 저장하면 방문자쪽에서 원문을 빈칸으로 덮어버린다.
        if (!v) continue;
        // 분류만은 화이트리스트를 통과해야 한다 — 위 CATS 주석 참조.
        if (f === 'cat' && !CATS.includes(v)) continue;
        patch[f] = v;
      }
      if (!Object.keys(patch).length) continue;
      out.edit[src] = patch;
      n++;
    }
  }

  if (Array.isArray(obj.del)) {
    const d = new Set();
    for (const raw of obj.del) {
      if (d.size >= MAX_DEL) break;
      const src = clean(raw);
      if (SRC_OK.test(src)) d.add(src);
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
      res.status(200).json({ ok: true, configured: true, ...patch, updatedAt, cats: CATS });
    } catch (e) {
      // 읽기 실패로 갤러리가 비면 안 된다 — 빈 패치로 물러나면 정적 69행이 그대로 보인다.
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
