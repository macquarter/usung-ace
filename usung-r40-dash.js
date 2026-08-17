// usung-r40-dash.js — r40: 관리자 대시보드를 「실제 데이터」로 교체
//
// ★ 왜 필요한가 (2026-08-17 실측)
//   기존 rDashboard() (admin.html:970) 는 숫자가 전부 지어낸 값이었다.
//     - 방문자 「1,284」          → 애널리틱스가 하나도 설치돼 있지 않다. 근거 0
//     - 「▲ 전월 대비 +8.4%」     → 비교할 전월 데이터가 존재하지 않는다
//     - 월별 추이 [12,18,24,...]  → 하드코딩. 라벨도 10월~4월로 지금(8월)과 안 맞는다
//     - 신규 문의 / 게시물        → 데모 시드(김철수·이영희·박민수)를 센 값
//   관리자 화면의 숫자가 거짓이면 그걸 보고 내리는 판단이 전부 틀어진다.
//   그래서 **실제로 확인할 수 있는 것만** 보여주고, 없는 것은 없다고 쓴다.
//
// ★ 데이터 출처 (전부 런타임 실측 — 하드코딩 숫자 0개)
//   /api/board  GET → 게시판 글 수, 서버 저장소 연결 여부
//   /api/cms    GET → 발행된 CMS 항목 수, 마지막 발행 시각
//   /           GET → 배포 커밋(오버레이 ?v= 값), SEO 태그 실재 여부
//   /robots.txt · /sitemap.xml → HTTP 상태
//   productCatalog (admin.html 이 이미 로드) → 제품 수
//   localStorage['usung-cms-state-v2'] → 이 브라우저에 쌓인 문의
//
// ★ 붙이는 방식: admin.html 의 rDashboard 를 **교체**한다. 원본은 지우지 않는다
//   (rView 가 ct.innerHTML = rDashboard() 를 호출하므로 반환값은 동기 문자열이어야 한다.
//    실측은 비동기라 먼저 「측정 중」으로 그리고, 끝나면 #ct 를 다시 그린다.)
//
// ★ 캐시: admin.html 은 정적 파일이라 ?v= 자동 주입이 없다. 이 파일을 고치면
//   admin.html 의 <script src="/usung-r40-dash.js?v=r40"> 버전 문자열을 반드시 올릴 것.

(function () {
  'use strict';

  var D = { done: false, busy: false };

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"]/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c];
    });
  }
  function num(n) { return Number(n || 0).toLocaleString('ko-KR'); }
  function ago(ts) {
    if (!ts) return '기록 없음';
    var s = Math.floor((Date.now() - ts) / 1000);
    if (s < 60) return '방금';
    if (s < 3600) return Math.floor(s / 60) + '분 전';
    if (s < 86400) return Math.floor(s / 3600) + '시간 전';
    return Math.floor(s / 86400) + '일 전';
  }

  // ── 실측 수집 ──────────────────────────────────────────────────────
  // 개별 실패가 대시보드 전체를 죽이지 않도록 항목마다 따로 잡는다.
  function getJSON(u) {
    return fetch(u, { cache: 'no-store' }).then(function (r) { return r.json(); })
      .catch(function (e) { return { __err: e.message }; });
  }
  function head(u) {
    return fetch(u, { method: 'HEAD', cache: 'no-store' })
      .then(function (r) { return r.status; }).catch(function () { return 0; });
  }

  function collect() {
    if (D.busy) return;
    D.busy = true;
    Promise.all([
      getJSON('/api/board'),
      getJSON('/api/cms'),
      fetch('/', { cache: 'no-store' }).then(function (r) { return r.text(); }).catch(function () { return ''; }),
      head('/robots.txt'),
      head('/sitemap.xml')
    ]).then(function (a) {
      D.board = a[0]; D.cms = a[1];
      var html = a[2] || '';
      var m = html.match(/\?v=([0-9a-f]{7,40})/);
      D.deploy = m ? m[1] : null;
      D.seo = {
        robots: a[3], sitemap: a[4],
        jsonld: (html.match(/application\/ld\+json/g) || []).length,
        desc: /<meta name="description"/.test(html),
        canon: /<link rel="canonical"/.test(html),
        og: (html.match(/<meta property="og:/g) || []).length
      };
      D.done = true; D.busy = false;
      if (typeof S !== 'undefined' && S.view === 'dashboard') {
        var ct = document.getElementById('ct');
        if (ct) ct.innerHTML = window.rDashboard();
      }
    });
  }

  // ── 조각 ──────────────────────────────────────────────────────────
  function card(lb, vl, sub, tone) {
    var col = tone === 'bad' ? 'var(--rd)' : tone === 'warn' ? 'var(--am)'
      : tone === 'mute' ? 'var(--tx4)' : 'var(--gn)';
    return '<div class="st-cd"><div class="lb">' + esc(lb) + '</div>'
      + '<div class="vl">' + vl + '</div>'
      + '<div class="dl" style="color:' + col + '">' + sub + '</div></div>';
  }
  function panel(title, body) {
    return '<div class="cd"><div class="cd-ti">' + esc(title) + '<div class="ln"></div></div>' + body + '</div>';
  }
  function row(k, v, tone) {
    var col = tone === 'bad' ? 'var(--rd)' : tone === 'warn' ? 'var(--am)'
      : tone === 'ok' ? 'var(--gn)' : 'var(--tx2)';
    return '<div style="display:flex;justify-content:space-between;gap:12px;padding:7px 0;'
      + 'border-bottom:1px solid var(--bd);font-size:12px">'
      + '<span style="color:var(--tx3)">' + esc(k) + '</span>'
      + '<span style="color:' + col + ';font-weight:600;text-align:right">' + v + '</span></div>';
  }
  function note(text) {
    return '<div style="margin-top:10px;padding:10px 12px;border-radius:10px;font-size:11px;'
      + 'line-height:1.7;background:rgba(245,158,11,.10);border:1px solid rgba(245,158,11,.30);'
      + 'color:var(--am)">' + text + '</div>';
  }

  // ── 이 브라우저에 쌓인 문의 ─────────────────────────────────────────
  // ★ 웹 문의 폼(index_v6.html:5348 submitInquiry)은 서버로 보내지 않는다.
  //   방문자 브라우저의 localStorage 에만 남는다 → 유성에이스는 볼 수 없다.
  //   숫자를 그냥 띄우면 「문의가 0건이구나」로 오해한다. 그래서 경고를 붙인다.
  function localInq() {
    try {
      var raw = JSON.parse(localStorage.getItem('usung-cms-state-v2') || 'null');
      var arr = (raw && raw.inquiries) || [];
      return arr.filter(function (q) { return q && q.source === 'webform'; });
    } catch (e) { return []; }
  }

  function inqTrend(list) {
    if (!list.length) return '<div class="sg" style="padding:34px 12px">이 브라우저에 접수된 문의가 없습니다</div>';
    var now = new Date(), buckets = [], labels = [];
    for (var i = 5; i >= 0; i--) {
      var d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      buckets.push(0); labels.push((d.getMonth() + 1) + '월');
    }
    list.forEach(function (q) {
      var d = new Date(q.createdAt || 0);
      var gap = (now.getFullYear() - d.getFullYear()) * 12 + (now.getMonth() - d.getMonth());
      if (gap >= 0 && gap <= 5) buckets[5 - gap]++;
    });
    var max = Math.max.apply(null, buckets) || 1;
    return '<div class="bar-wrap">' + buckets.map(function (v, i) {
      return '<div style="flex:1;display:flex;flex-direction:column;align-items:center">'
        + '<div class="bar" style="width:100%;height:' + (v / max * 150) + 'px">'
        + '<div class="bar-vl">' + v + '</div></div>'
        + '<div class="bar-lb">' + labels[i] + '</div></div>';
    }).join('') + '</div>';
  }

  // ── 렌더 ──────────────────────────────────────────────────────────
  function render() {
    if (!D.done) {
      return '<div class="sg">서버·사이트 상태를 실제로 확인하는 중…</div>';
    }
    var b = D.board || {}, c = D.cms || {}, seo = D.seo || {};
    var posts = (b.posts || []).length;
    var cmsN = c.content ? Object.keys(c.content).length : 0;
    var inq = localInq();
    // ★ productCatalog 는 분류 배열이 아니라 **제품 낱개의 평평한 배열**이다.
    //   분류는 각 항목의 cat 필드에 들어 있어서 중복을 걷어내야 나온다.
    var prods = 0, cats = 0;
    try {
      prods = productCatalog.length;
      var seen = {};
      productCatalog.forEach(function (p) { if (p && p.cat) seen[p.cat] = 1; });
      cats = Object.keys(seen).length;
    } catch (e) { prods = 0; cats = 0; }

    var srvOk = b.configured && c.configured;

    // ★ /api/board 가 담는 건 「고객게시판」 하나뿐이다(admin.html:773 이 S.boards.board 에만 넣는다).
    //   공지사항·인증현황은 서버로 올라가는 경로 자체가 없어 이 브라우저에만 있다.
    //   서버 수와 로컬 수가 다르면 「썼지만 아직 방문자에게 안 보이는 글」이 있다는 뜻이므로
    //   합계를 뭉뚱그리지 않고 둘을 나란히 보여준다.
    var lb = {};
    try { lb = (typeof S !== 'undefined' && S.boards) || {}; } catch (e) { lb = {}; }
    var locBoard = (lb.board || []).length;
    var sync = posts === locBoard;

    var stats =
      card('서버 저장소', srvOk ? '연결됨' : '미설정',
        srvOk ? 'CMS · 게시판 둘 다 정상' : 'Vercel 환경변수 확인 필요', srvOk ? 'ok' : 'bad')
      + card('고객게시판 글', num(posts) + '<span style="font-size:15px;color:var(--tx4)"> / ' + num(locBoard) + '</span>',
        sync ? '서버 · 이 브라우저 일치'
             : '서버 ' + num(posts) + '건 · 이 브라우저 ' + num(locBoard) + '건 — 아직 발행 안 됨',
        sync ? 'ok' : 'warn')
      + card('발행된 CMS 항목', num(cmsN),
        cmsN ? '마지막 발행 ' + ago(c.updatedAt) : '아직 발행한 적 없음', cmsN ? 'ok' : 'mute')
      + card('방문자', '측정 안 함', '애널리틱스 미설치 — 아래 참조', 'warn');

    var seoOk = seo.robots === 200 && seo.sitemap === 200 && seo.jsonld > 0;
    var siteBody =
      row('배포 커밋', D.deploy ? '<code>' + esc(D.deploy) + '</code>' : '확인 실패', D.deploy ? 'ok' : 'bad')
      + row('제품 카탈로그', prods ? num(prods) + '종 · ' + num(cats) + '개 분류' : '읽지 못함', prods ? 'ok' : 'bad')
      + row('공지사항 · 인증현황',
        num((lb.notice || []).length) + '건 · ' + num((lb.certification || []).length) + '건'
        + ' <span style="color:var(--tx4);font-weight:400">(이 브라우저에만)</span>', 'warn')
      + row('robots.txt', seo.robots === 200 ? '정상 (200)' : '없음 (' + seo.robots + ')', seo.robots === 200 ? 'ok' : 'bad')
      + row('sitemap.xml', seo.sitemap === 200 ? '정상 (200)' : '없음 (' + seo.sitemap + ')', seo.sitemap === 200 ? 'ok' : 'bad')
      + row('구조화 데이터 (JSON-LD)', seo.jsonld ? seo.jsonld + '건' : '없음', seo.jsonld ? 'ok' : 'bad')
      + row('meta description · canonical',
        (seo.desc ? '설명 ✓' : '설명 ✗') + ' / ' + (seo.canon ? 'canonical ✓' : 'canonical ✗'),
        seo.desc && seo.canon ? 'ok' : 'bad')
      + row('Open Graph (카톡·페북 미리보기)', seo.og ? seo.og + '개 태그' : '없음', seo.og ? 'ok' : 'bad');

    if (!seoOk) siteBody += note('검색엔진 노출 설정에 빠진 항목이 있습니다.');
    if (!sync || (lb.notice || []).length || (lb.certification || []).length) {
      siteBody += note(
        '<b>공지사항과 인증현황은 서버로 올라가는 경로가 없습니다.</b> '
        + '지금 이 컴퓨터에서만 보이고, 홈페이지 방문자에게는 보이지 않습니다. '
        + '서버와 연결된 것은 고객게시판 하나뿐입니다.');
    }
    siteBody += note(
      '<b>방문자 수는 지금 셀 수 없습니다.</b> 이 사이트에는 방문자 분석 도구가 '
      + '하나도 설치돼 있지 않습니다(구글 애널리틱스·네이버 애널리틱스·Vercel Analytics 모두 없음). '
      + '이전 화면의 「1,284명 · 전월 대비 +8.4%」는 <b>실제 수치가 아니라 예시로 박아둔 값</b>이었습니다. '
      + '측정을 원하시면 어떤 도구를 쓸지 정해 주시면 연결하겠습니다.');

    var inqBody = inqTrend(inq)
      + note(
        '<b>웹사이트 문의 폼은 유성에이스로 전달되지 않습니다.</b> '
        + '홈페이지에서 「문의 접수하기」를 누르면 그 내용은 서버가 아니라 '
        + '<b>방문한 사람 본인의 브라우저에만</b> 저장됩니다. '
        + '지금 이 화면에 보이는 ' + inq.length + '건도 이 컴퓨터에 남은 것뿐입니다. '
        + '고객 문의를 실제로 받으려면 접수 서버(또는 이메일 전송)를 따로 연결해야 합니다.');

    var recent = inq.slice(0, 5).map(function (q) {
      return '<div class="rc-it"><div class="av">' + esc((q.nm || '?')[0]) + '</div>'
        + '<div class="info"><div class="nm">' + esc(q.nm || '') + (q.co ? ' · ' + esc(q.co) : '') + '</div>'
        + '<div class="ms">' + esc(q.msg || '') + '</div></div>'
        + '<div class="tg tg-new">' + ago(q.createdAt) + '</div></div>';
    }).join('');

    return '<div class="st-grid">' + stats + '</div>'
      + '<div class="db-grid">'
      + panel('사이트 · 검색엔진 상태 (실시간 확인)', siteBody)
      + panel('문의 접수 현황', inqBody + (recent ? '<div class="rc-lst" style="margin-top:12px">' + recent + '</div>' : ''))
      + '</div>';
  }

  // ── 교체 ──────────────────────────────────────────────────────────
  function boot() {
    if (typeof window.rDashboard !== 'function') return;
    window.rDashboard = function () { if (!D.done) collect(); return render(); };
    if (typeof S !== 'undefined' && S.view === 'dashboard' && typeof R === 'function') R();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
