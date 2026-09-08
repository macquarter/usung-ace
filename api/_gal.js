/* api/_gal.js — r76. 갤러리 발행분을 서빙 HTML 에 심는 블록을 만든다.
 *
 * ★★ 왜 api/inject.js 안에 안 쓰나 — inject.js 가 이미 **328줄**이다(한도 300).
 *   _patch.js 가 갈라져 나온 이유와 **똑같다**(그 파일 머리말: 「inject.js 가 296줄이라
 *   여기에 더 넣으면 300줄 한도를 넘는다」). 그때 세운 관례를 그대로 따른다.
 *   KNOWLEDGE 38: `api/_*.js` 는 라우트가 안 생기지만 번들에는 들어간다.
 *
 * ★ 왜 서빙 시점에 심나 · 왜 배포본 파일을 안 읽나 · 왜 raw 가 아니라 Contents API 인가
 *   → **api/inject.js 의 r55 블록 주석에 이미 다 적혀 있다.** 여기 옮겨 적지 않는다
 *     (두 곳에 적으면 반드시 한쪽이 썩는다 — KNOWLEDGE 41).
 */
import { loadGalPatch } from './_patch.js';

/* 서빙 HTML 에 삽입할 문자열을 만든다. 실패하면 **빈 문자열**을 돌려준다 —
   던지면 페이지가 통째로 죽는다.

   ★★ 패치가 비어도 적용기는 **반드시** 넣는다. r55 가 프리뷰 실측에서 배운 것이다:
     아직 아무것도 발행하지 않으면 data/gallery.json 이 없다 → 적용기가 빠진다 →
     「제대로 배포됐는데 발행이 없다」와 「배포가 안 됐다」가 **똑같이 보인다**.
     서빙된 HTML 에 usung-r76-gal.js 가 있는지로 배포를 판정하므로, 빠지면 판정이 불가능해진다.
     빈 패치를 넣는 것과 안 넣는 것은 방문자 화면이 완전히 같다(정적 69행) — 넣는 쪽이 순수 이득이다.

   ★ `<` 이스케이프: 갤러리 이름에 우연히 '</script' 가 들어가면 인라인 블록이 거기서 끊긴다.
     JSON 안의 꺾쇠는 < 로 바꿔도 파싱 결과가 같다. */
export async function galBlock(V) {
  let patch;
  try { patch = await loadGalPatch(); } catch (e) { patch = { add: [], edit: {}, del: [] }; }
  const inline = '<script>window.GAL_PATCH='
    + JSON.stringify(patch).split('<').join('\\u003c')
    + ';</script>';
  // 인라인(즉시 실행 · 데이터만) → 적용기(defer · usung-r8-gal.js 바로 다음 차례)
  return inline + '<script src="/usung-r76-gal.js?v=' + V + '" defer></script>';
}

/* ★★★ 적용기는 반드시 usung-r8-gal.js **다음**에 와야 한다.
   GALLERY 는 최상위 const 라 window 프로퍼티가 아니고, **맨이름으로만** 닿는다.
   앞에 실리면 GALLERY 가 아직 없어 조용히 아무것도 안 한다(usung-r76-gal.js 머리말). */
export const GAL_ANCHOR = V => '<script src="/usung-r8-gal.js?v=' + V + '" defer></script>';

/* 서빙 HTML 에 실제로 끼워 넣는다. ★ 이 일을 api/inject.js 가 아니라 여기서 하는 이유 둘:
   ① inject.js 가 이미 300줄 한도를 넘었다 — 거기서 더 늘리지 않는다.
   ② 「앵커가 무엇이고 그 **다음**에 와야 한다」는 지식이 한 파일에 모인다.
      두 파일에 흩어 두면 순서 규칙을 고칠 때 한쪽만 고쳐 조용히 어긋난다(KNOWLEDGE 41).

   ★★ 무슨 일이 있어도 **던지지 않는다** — 실패하면 받은 html 을 그대로 돌려준다.
     그러면 방문자는 정적 69행을 본다(= 오늘과 같은 화면). 여기서 던지면 페이지가 통째로 죽는다. */
export async function injectGal(html, V) {
  try {
    const a = GAL_ANCHOR(V);
    if (!html.includes(a)) return html;      // 앵커가 없다 = 이 페이지엔 갤러리 스크립트가 없다
    return html.split(a).join(a + await galBlock(V));
  } catch (e) { return html; }
}
