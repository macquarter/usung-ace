// api/_seo.js — r39: 검색엔진 / 생성형엔진(GEO) 노출 기반
//
// ★ 파일명이 `_` 로 시작한다. Vercel 은 `api/` 안의 파일을 전부 서버리스 함수로
//   보지만 `_` 로 시작하는 것은 함수로 만들지 않는다. 이 파일은 라우트가 아니라
//   `api/inject.js` 가 import 해 쓰는 **모듈**이다. (`/api/_seo` 는 열리지 않는다)
//
// ★ 왜 별도 파일인가 — inject.js 의 cssLink/jsScript 는 물리적으로 한 줄이어야
//   한다는 제약이 있는데(개행 = SyntaxError = 사이트 전체 500), JSON-LD 를 그 옆에
//   한 줄로 우겨넣으면 사람이 못 읽고 다음 수정 때 반드시 사고가 난다.
//   모듈로 빼면 이 파일 안에서는 자유롭게 개행할 수 있다.
//
// ── 현재 사이트의 SEO 실측 (r39 착수 시점, 2026-08-17) ──────────────
//   robots.txt          404  (없음)
//   sitemap.xml         404  (없음)
//   meta description    없음
//   canonical           없음
//   Open Graph / Twitter 없음
//   JSON-LD             0건
//   → 즉 이 사이트는 지금까지 **검색엔진에 자기소개를 한 적이 없다.**
//
// ── ★ 구조적 한계 두 가지 (코드로 못 넘는다 — 승연 판단 필요) ────────
//   ① URL 이 하나뿐이다. navigate() 가 history 를 안 건드려서
//      회사소개·제품소개·기술력이 전부 `https://…/` 한 주소다.
//      → 검색결과에 뜰 수 있는 페이지가 1개뿐. 색인 면적이 11분의 1이다.
//   ② 본문이 JS 로 그려진다. 원본 HTML 의 페이지별 텍스트는
//      제품소개 362자 · 기술력 349자 · 시공갤러리 268자 · 부품 143자 뿐이고
//      실제 내용(부품 51종, 갤러리 50건, 기술 3챕터)은 오버레이가 그린다.
//      구글은 JS 를 실행하지만 **GPTBot·ClaudeBot·PerplexityBot 등 생성형
//      엔진 크롤러는 대부분 실행하지 않는다** → AI 검색에는 거의 안 보인다.
//   이 두 가지는 정적 사전렌더(별도 URL 생성)로만 풀린다. 별건이다.

// ★ 실도메인이 붙으면 이 상수 하나만 바꾸면 전부 따라간다.
//   지금은 usungace.com 이 이 배포를 가리키지 않아 vercel.app 이 정본이다.
//   (canonical 을 아직 없는 도메인으로 적으면 색인이 통째로 증발한다)
export const SITE = 'https://usung-ace.vercel.app';

// 회사 정보 출처 — index_v6.html ACE_DATA.company(2699행) + 회사소개 지도 카드(1880행)
// 대표이사 이름은 **일부러 넣지 않는다** — r5 에서 화면 전체에서 삭제한 항목이다.
const BIZ = {
  ko: '유성에이스 주식회사',
  en: 'YUSUNG ACE Co., Ltd.',
  alt: ['유성에이스', 'USUNG ACE', 'YUSUNG ACE'],
  tel: '+82-1588-9123',
  telDisplay: '1588-9123',
  fax: '+82-31-952-1706',
  street: '파주읍 센트럴산단1로 103',
  locality: '파주시',
  region: '경기도',
  bizNo: '166-86-01583',
  founded: '2007',
  blog: 'https://m.blog.naver.com/ysungace'
};

const DESC =
  '유성에이스는 2007년부터 직화구이·숯불구이 매장용 후드와 덕트를 직접 설계·제조하는 ' +
  '전문 제조사입니다. 360° 스윙 메커니즘, F.V.D 방화담파, 상하작동 텐션 시스템을 자체 ' +
  '기술로 적용하며 경기 파주 본사·공장에서 직접 생산합니다. 상담 1588-9123.';

const DESC_EN =
  'YUSUNG ACE has manufactured charcoal-grill kitchen hoods and duct systems in Korea ' +
  'since 2007. In-house 360° swing mechanism, F.V.D fire & volume damper, and vertical ' +
  'tension system. Factory-direct production in Paju, Gyeonggi-do.';

const KEYWORDS = [
  '후드', '덕트', '직화구이 후드', '숯불구이 후드', '고기집 후드', '주방 후드',
  '배기 덕트', '방화댐퍼', 'FVD', '풍량조절댐퍼', '후드 제작', '후드 시공',
  '파주 후드 제조', '경기도 덕트 업체', '유성에이스'
].join(', ');

// ── JSON-LD ────────────────────────────────────────────────────────
// ★ 없는 사실을 지어내지 않는다. 좌표(geo)·영업시간·리뷰·평점은 원본에 근거가
//   없어서 **뺐다**. 구조화 데이터에 허위가 들어가면 수동 조치를 받는다.
//   좌표는 승연이 확인해 주면 그때 넣는다(QUESTIONS 참조).
const ADDRESS = {
  '@type': 'PostalAddress',
  streetAddress: BIZ.street,
  addressLocality: BIZ.locality,
  addressRegion: BIZ.region,
  addressCountry: 'KR'
  // ★ postalCode 는 원본 어디에도 없다. 지어내면 구조화 데이터에 허위가 섞이므로 뺐다.
};

function graph() {
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': ['Organization', 'Manufacturer'],
        '@id': SITE + '/#organization',
        name: BIZ.ko,
        alternateName: BIZ.alt,
        legalName: BIZ.ko,
        url: SITE,
        logo: { '@type': 'ImageObject', url: SITE + '/logo-light.jpg' },
        image: SITE + '/hero-bg.jpg',
        description: DESC,
        foundingDate: BIZ.founded,
        telephone: BIZ.tel,
        faxNumber: BIZ.fax,
        address: ADDRESS,
        identifier: { '@type': 'PropertyValue', name: '사업자등록번호', value: BIZ.bizNo },
        sameAs: [BIZ.blog],
        contactPoint: [{
          '@type': 'ContactPoint',
          telephone: BIZ.tel,
          contactType: 'sales',
          areaServed: 'KR',
          availableLanguage: ['ko', 'en', 'ja', 'zh', 'vi']
        }],
        knowsAbout: [
          '직화구이 후드', '숯불구이 후드', '주방 배기 덕트', '방화댐퍼',
          '360° 스윙 메커니즘', 'F.V.D 방화담파', '상하작동 텐션 시스템'
        ]
      },
      {
        // 지역 검색(구글 비즈니스 프로필·네이버 플레이스)과 짝을 이루는 노드.
        // ★ 이것만으로 지도에 뜨지는 않는다 — 등록은 사람이 해야 한다.
        '@type': 'LocalBusiness',
        '@id': SITE + '/#localbusiness',
        name: BIZ.ko,
        parentOrganization: { '@id': SITE + '/#organization' },
        url: SITE,
        image: SITE + '/hero-bg.jpg',
        telephone: BIZ.tel,
        address: ADDRESS,
        areaServed: [
          { '@type': 'Country', name: '대한민국' },
          { '@type': 'AdministrativeArea', name: '경기도' },
          { '@type': 'AdministrativeArea', name: '서울특별시' }
        ]
        // ★ priceRange·openingHours·aggregateRating 은 근거가 없어 넣지 않았다.
      },
      {
        '@type': 'WebSite',
        '@id': SITE + '/#website',
        url: SITE,
        name: BIZ.ko,
        inLanguage: ['ko', 'en', 'ja', 'zh', 'vi'],
        description: DESC,
        publisher: { '@id': SITE + '/#organization' }
      },
      {
        '@type': 'WebPage',
        '@id': SITE + '/#webpage',
        url: SITE,
        name: '유성에이스 — 직화구이 후드·덕트 전문 제조',
        isPartOf: { '@id': SITE + '/#website' },
        about: { '@id': SITE + '/#organization' },
        inLanguage: 'ko',
        description: DESC
      }
    ]
  };
}

// ── head 에 넣을 블록 ───────────────────────────────────────────────
// ★ 반환값은 여러 줄이어도 된다(이 파일은 문자열 이어붙이기가 아니다).
// ★ id 마커 `usung-r39-seo` 로 중복 삽입을 막는다 — inject.js 쪽에서 확인.
export const SEO_MARK = 'usung-r39-seo';

export function seoHead() {
  const ld = JSON.stringify(graph()).replace(/</g, '\\u003c');
  return [
    '<!-- ' + SEO_MARK + ' -->',
    '<meta name="description" content="' + DESC + '">',
    '<meta name="keywords" content="' + KEYWORDS + '">',
    '<meta name="author" content="' + BIZ.ko + '">',
    '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">',
    '<link rel="canonical" href="' + SITE + '/">',
    // 지역(geo) 메타 — 좌표는 근거가 없어 넣지 않고 행정구역만 준다
    '<meta name="geo.region" content="KR-41">',
    '<meta name="geo.placename" content="경기도 파주시">',
    '<meta property="og:type" content="website">',
    '<meta property="og:site_name" content="' + BIZ.ko + '">',
    '<meta property="og:title" content="유성에이스 — 직화구이 후드·덕트 전문 제조">',
    '<meta property="og:description" content="' + DESC + '">',
    '<meta property="og:url" content="' + SITE + '/">',
    // hero-bg.jpg 실측 1600x900 — 값을 지어내면 카톡·페북 미리보기가 깨진다
    '<meta property="og:image" content="' + SITE + '/hero-bg.jpg">',
    '<meta property="og:image:width" content="1600">',
    '<meta property="og:image:height" content="900">',
    '<meta property="og:locale" content="ko_KR">',
    '<meta property="og:locale:alternate" content="en_US">',
    '<meta property="og:locale:alternate" content="ja_JP">',
    '<meta property="og:locale:alternate" content="zh_CN">',
    '<meta property="og:locale:alternate" content="vi_VN">',
    '<meta name="twitter:card" content="summary_large_image">',
    '<meta name="twitter:title" content="유성에이스 — 직화구이 후드·덕트 전문 제조">',
    '<meta name="twitter:description" content="' + DESC_EN + '">',
    '<meta name="twitter:image" content="' + SITE + '/hero-bg.jpg">',
    '<script type="application/ld+json">' + ld + '</script>'
  ].join('\n  ');
}
