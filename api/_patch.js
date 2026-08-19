/* api/_patch.js — r55. 관리자가 발행한 제품 차이분(add/edit/del)을 **신선하게** 읽는다.
 *
 * ★★ 왜 별도 모듈인가 — 두 가지 이유가 겹친다.
 *   ① api/inject.js 가 296줄이라 여기에 더 넣으면 300줄 한도를 넘는다.
 *   ② KNOWLEDGE 38: `api/_*.js` 는 라우트가 안 생기지만 번들에는 들어간다. _seo.js 와 같은 수법.
 *
 * ★★★ 이 파일이 존재하는 진짜 이유 — raw.githubusercontent 는 **최대 5분 늦다**.
 *   처음엔 raw 만 읽었다. api/products.js 가 `[skip ci]` 로 커밋하니 배포본의 정적
 *   data/products.json 은 낡고, raw 는 리포를 그대로 준다 — 거기까진 맞다.
 *   그런데 프리뷰 실측에서 발행분이 안 나타났다. 재 보니:
 *
 *     raw:  cache-control: max-age=300 · source-age: 246 · x-cache: HIT
 *     api:  같은 순간에 **새 값**
 *
 *   ★ 쿼리스트링으로 캐시를 못 깬다 — `?t=<난수>` 를 붙여도 `x-cache: HIT` 였다(실측).
 *     raw 의 Fastly 는 쿼리를 캐시 키에서 뺀다. `fetch(..., {cache:'no-store'})` 도 소용없다.
 *     그건 **이쪽 Node 의 캐시**를 끄는 것이지 상대 CDN 을 어쩌지 못한다.
 *
 *   승연이 관리자에서 발행하고 새로고침했는데 5분간 아무 일도 안 일어나면
 *   「안 되네」로 끝난다. 이 리비전의 요구 자체가 「유기적으로 움직이도록」이다.
 *   그래서 **Contents API 를 1차로, raw 를 폴백으로** 둔다.
 *
 * ★ 호출량 — 페이지 로드마다 GitHub API 를 때리면 안 된다. 인스턴스 메모리에 20초 캐시한다.
 *   인증 한도가 5,000/시간이니 웜 인스턴스가 10개여도 10 × 180 = 1,800/시간으로 안전하다.
 *   반영 지연은 최악 20초 — 사진(빌드 1~2분)보다 훨씬 빠르므로 체감상 「즉시」다.
 *
 * ★ process.env 는 **함수 안에서** 읽는다. 모듈 최상단에서 읽으면 ESM 호이스팅 때문에
 *   조용히 기본값이 박힌다(KNOWLEDGE 「서버리스 3대 함정」1). api/products.js 와 같은 게터 꼴.
 */

const EMPTY = { add: [], edit: {}, del: [] };

const repo = () => process.env.BOARD_REPO || 'macquarter/usung-ace';
const branch = () => process.env.BOARD_BRANCH || 'main';
const token = () => process.env.BOARD_TOKEN;

// 인스턴스 수명 동안만 사는 메모. 콜드 스타트마다 비니까 오래된 값이 굳을 일이 없다.
let memo = { at: 0, val: null };
const TTL = 20000;

/* 어떤 모양이 와도 add/edit/del 세 칸으로 정규화한다.
   ★ 관리자가 보낸 JSON 을 그대로 믿지 않는다 — add 가 객체로 오면 아래 map 이 터진다. */
function normalize(raw) {
  if (!raw || typeof raw !== 'object') return EMPTY;
  return {
    add: Array.isArray(raw.add) ? raw.add : [],
    edit: (raw.edit && typeof raw.edit === 'object' && !Array.isArray(raw.edit)) ? raw.edit : {},
    del: Array.isArray(raw.del) ? raw.del : []
  };
}

/* 1차 — Contents API. 발행 직후 값이 즉시 나온다(실측).
   Accept: vnd.github.raw 로 받으면 base64 껍데기 없이 파일 본문 그대로다. */
async function fromApi() {
  const tk = token();
  if (!tk) return null;                       // 토큰이 없으면 조용히 폴백으로 넘긴다
  const url = 'https://api.github.com/repos/' + repo() +
    '/contents/data/products.json?ref=' + encodeURIComponent(branch());
  const r = await fetch(url, {
    headers: {
      Authorization: 'Bearer ' + tk,
      Accept: 'application/vnd.github.raw',
      'User-Agent': 'usung-ace-inject'
    },
    cache: 'no-store'
  });
  if (r.status === 404) return EMPTY;         // 아직 아무것도 발행하지 않았다 — 오류가 아니다
  if (!r.ok) return null;                     // 401·403·5xx → 폴백에 맡긴다
  return normalize(JSON.parse(await r.text()));
}

/* 2차 — raw. 토큰이 없거나 API 가 죽어도 화면은 살아야 한다. 최대 5분 늦을 뿐 값은 맞다. */
async function fromRaw() {
  const url = 'https://raw.githubusercontent.com/' + repo() + '/' + branch() + '/data/products.json';
  const r = await fetch(url, { cache: 'no-store' });
  if (!r.ok) return EMPTY;                    // 404 = 발행 전
  return normalize(JSON.parse(await r.text()));
}

/* 최종 — 무슨 일이 있어도 **던지지 않는다**. 여기서 던지면 페이지가 통째로 죽는다.
   최악의 경우 빈 패치를 돌려주고, 방문자는 정적 215종을 그대로 본다(= 오늘과 같은 화면). */
export async function loadPatch() {
  const now = Date.now();
  if (memo.val && now - memo.at < TTL) return memo.val;

  let val = null;
  try { val = await fromApi(); } catch (e) { val = null; }
  if (!val) { try { val = await fromRaw(); } catch (e) { val = null; } }
  if (!val) val = EMPTY;

  memo = { at: now, val };
  return val;
}
