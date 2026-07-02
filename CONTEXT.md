# 유성에이스 웹사이트 프로젝트 — 컨텍스트 인계 문서

> **다음 대화 시작 시 이 문서를 첨부하거나 "GitHub의 macquarter/usung-ace 레포 CONTEXT.md 읽고 이어서 작업해줘"라고 지시하면 됩니다.**

---

## 1. 기업 정보

| 항목 | 값 |
|---|---|
| 회사명 | 유성에이스 (USUNG ACE) |
| 창업 | 2007년 |
| 업종 | 직화기 후드/덕트 전문 제조 |
| CEO | 박진선 |
| 주소 | 경기 파주시 파주읍 센트럴산단1로 103 (봉암리 1371-9) |
| 전화 | 1588-9123 |
| FAX | (031) 952-1706 |
| 사업자등록번호 | 166-86-01583 |
| 태그라인 | 대한민국 덕트 No.1 |
| 네이버 블로그 | https://m.blog.naver.com/ysungace |
| 차별화 전략 | 후발주자(검정 배경 경쟁사)와 격차 위해 **화이트 톤** 채택 |

---

## 2. 기술 스택 + 배포

| 항목 | 값 |
|---|---|
| GitHub 레포 | `macquarter/usung-ace` |
| 라이브 사이트 | https://usung-ace.vercel.app/ |
| 배포 | Vercel 자동 (main 브랜치 push 시) |
| 프론트엔드 | 바닐라 JS + Tailwind CSS (CDN) + Pretendard/Inter |
| 구조 | Single-file SPA (`index_v6.html` 5,681줄, 417KB) |
| 관리자 | `admin.html` (2,450줄, 148KB) |
| 다국어 | `i18n.js` (KO/EN/JA/VI/ZH) |
| CMS | data-cms 속성 + localStorage |
| 서버리스 | `api/` (Vercel Functions) |
| 블로그 연동 | 네이버 RSS → `api/blog.js` |

---

## 3. 파일 구조 (GitHub)

```
usung-ace/
├── index_v6.html          ← 메인 SPA (수정 금지! 5,681줄)
├── admin.html             ← CMS (별도)
├── theme-white.css        ← v6 — 우리가 관리하는 화이트 테마
├── usung-overlay.js       ← v10 — 우리가 관리하는 PPTX 오버레이
├── vercel.json            ← / → /api/inject 라우팅
├── hero-bg.mp4            ← 유성에이스 전경 (MD5: 6b36d39c...)
├── api/
│   ├── blog.js            ← 네이버 RSS
│   └── inject.js          ← HTML 인젝션 미들웨어 (우리가 관리)
├── i18n.js (86KB) / chatbot.js / data.json
├── products/p001~p148.jpg ← 기존 148장 (코브라 없음)
├── parts/p01~p50.png
└── gallery/g01~g50.jpg
```

---

## 4. 작업 방식 (절대 원칙)

- **`index_v6.html` 직접 수정 금지** — 5,681줄 통째로 커밋하기 비효율적
- 모든 변경은 **3개 파일만** 관리:
  1. `theme-white.css` (스타일)
  2. `usung-overlay.js` (DOM 패치 + 로직)
  3. `api/inject.js` (HTML 응답에 CSS/JS 자동 주입)
- 사용자 권한 있음 → Chrome MCP로 자동:
  - GitHub 텍스트 커밋
  - GitHub 웹에서 바이너리(mp4 등) 드래그-드롭 업로드
  - 구글 드라이브 확인
  - 라이브 사이트 검증

---

## 5. PPTX 디렉션 적용 현황 (홈페이지r6 마지막.pptx 10슬라이드)

| Slide | 내용 | 상태 |
|---|---|---|
| 1 | 기술-사용방법 | ✅ |
| 2 | "5가지 → 4가지 핵심특징", 무소음 카드 삭제, 5번 360° 스윙을 2번 위치로 | ✅ |
| 3 | 유지망필터 — 공기가 위로 올라가 기름 여과 (반전) | ✅ |
| 4 | 제품소개 페이지 | ✅ |
| 5 | **7개 대분류 트리 재정렬** | ✅ |
| 6 | **제품별 중분류 + 칼라별 소분류** (대표사진 + 색상 옵션 그리드) | ✅ |
| 7 | 사용방법 유튜브 링크 활성화/비활성화 | ✅ (현재 모두 "영상 준비 중") |
| 8 | 사용방법 가이드 이미지 | ✅ |
| 9 | 속봉·겉봉 360도 회전 이미지 | ✅ |
| 10 | 등제품 이미지 위치 유지 | ✅ |

---

## 6. 제품 카테고리 트리 (PPTX 슬라이드 5)

```
1. 갤럭시 (29) — A · B · C · D
2. LED 조명 (24) — LED 조명 · 우주선/갓등
3. 스텐파이프 (30)
   ├ 도금 → 스윙 양옆태엽 · 내부태엽 · 텐션
   └ 도장 → 스윙 양옆태엽 · 내부태엽 · 텐션
4. 스파이얼 도장 (13) — 양옆/내부/텐션
5. 파이프 기타옵션 — 고정텐션·사각측향·모터
6. 후레쉬볼 (52) — 자바라·신형·장축
7. 하향식 후드 (10) — 코브라·망대·주물·나팔 (overlay 주입)
```

**구글 드라이브 폴더** (사용자 제품 사진 원본):
https://drive.google.com/drive/folders/1-GfmC6aHvsFa4PyFL1GaXTwX3LX3P90b

폴더 트리 구조가 위 7개 대분류와 일치함 (도금/도장 서브폴더 포함).

---

## 7. 디자인 시스템 (theme-white v6)

```css
:root {
  --bg: #ffffff;
  --fg-deep: #020617;    /* 가장 진한 텍스트 */
  --fg: #0a0e27;
  --fg-soft: #1e293b;
  --brand: #1e40af;      /* 브랜드 블루 (CTA) */
  --brand-2: #0ea5e9;    /* 시안 액센트 */
  --brand-deep: #0c1e5a; /* 네이비 (No.1 단색) */
  --shadow-sm/md/lg/xl/brand
}
```

- **화이트 베이스** — 후발주자(검정) 차별화
- **진한 검정 텍스트** — 강한 대비
- **푸터만 다크 유지** — 브랜드 컨트라스트
- 홈 히어로 영상 위: 화이트 그라데이션 오버레이 + 다크 텍스트

---

## 8. 적용 완료 사항 (43 tasks)

1. ✅ 화이트 테마 전체 적용 (홈 영상 위 포함)
2. ✅ 7개 카테고리 메가메뉴 (좌측만, 우측 hide, 200ms 잠금 폴링)
3. ✅ 메가메뉴 hover 롤백 버그 해결 (`Object.defineProperty`로 megaHoverCat 무력화)
4. ✅ 네비게이션 바 항상 화이트 + 다크 텍스트 강제
5. ✅ 히어로 영상 교체 (사용자 mp4, MD5: 6b36d39c)
6. ✅ "No.1" 차분한 단색 네이비 (글로우 제거)
7. ✅ 제품 페이지 사이드바 트리 + 우측 그룹 그리드
8. ✅ 제품 상세 모달 (대표사진 + 색상별 썸네일)
9. ✅ 시공갤러리 사진 선명화 (필터 제거)
10. ✅ 사용방법 4가지 핵심특징 + 유튜브 슬롯
11. ✅ 통계 숫자 진한 블루 그라데이션
12. ✅ 푸터 다크 네이비 그라데이션

---

## 9. 알려진 미해결 이슈

- **사용방법 3D 시뮬레이션**: `manual-3d-*` Three.js 캔버스 일부가 아직 다크 톤 (Three.js가 인라인 배경 그림)
- **하향식 후드 사진**: 코브라 10종 placeholder 이미지 사용 중. 실제 사진은 구글 드라이브에 있으나 GitHub 미업로드
  - 사진 목록: 90Ø롱망코브라220, 75Ø망대코브라200, 사각코브라160, 75Ø주물코브라200Ø갓160, 75Ø주물나팔코브라100, 75Ø코브라170, 75Ø코브라270, 75Ø코브라170(2단캡), 코브라신형(각), 코브라사각파이프원형나팔

---

## 10. 자주 사용한 MCP 도구

| 도구 | 용도 |
|---|---|
| `mcp__github__github_create_or_update_file` | 텍스트 파일 커밋 (SHA 필요) |
| `mcp__github__github_get_file` | 파일/SHA 조회 |
| `mcp__Claude_in_Chrome__browser_batch` | 라이브 검증, GitHub 웹 업로드 |
| `mcp__Claude_in_Chrome__navigate` / `computer` / `find` | Chrome 자동화 |
| `mcp__workspace__bash` | curl, python, sed 파일 조작 |
| `mcp__workspace__web_fetch` | 라이브 HTML 가져오기 |

---

## 11. 작업 절차 (표준 반복)

1. 사용자 요구사항 받기 → `TaskCreate`
2. 현재 SHA 조회 (`github_get_file` 또는 GitHub API)
3. `theme-white.css` 또는 `usung-overlay.js` 또는 `api/inject.js` 수정
4. `github_create_or_update_file` 커밋 (SHA 포함)
5. 25초 대기 (Vercel 배포)
6. Chrome MCP로 `?v={n}` 캐시버스트하고 라이브 검증
7. 스크린샷 → 결과 보고

---

## 12. Chrome MCP 연결 정보 (다음 대화에서 재사용)

- **Browser 1**: `56fa9619-1d49-4306-a316-0b8dc4dfbe8b` (macOS, local)
- **활성 탭**: `2090121639`
- **GitHub 로그인**: 활성 상태 (drag-drop 업로드 가능)
- **드라이브 로그인**: 활성 상태

---

## 13. 사용자 대응 스타일

- 사용자는 **결과 지향** — 즉시 라이브에 반영되기를 원함
- 캐시 이슈로 못 볼 수 있으니 `?v={n}` 파라미터로 항상 캐시 버스트 유도
- 시각적 결과를 스크린샷으로 확인하고 보고
- 후발주자와의 격차를 매우 중요하게 생각함 (화이트 톤 유지가 브랜드 정체성)

---

## 14. 다음 대화 시작 프롬프트 예시

```
GitHub macquarter/usung-ace 레포의 CONTEXT.md 읽고 이어서 작업해줘.
이번엔 [요구사항] 해줘.
```

또는 이 파일을 첨부하고:
```
첨부한 CONTEXT.md 기반으로 계속 진행. 
이번엔 [요구사항] 처리해줘.
```

---

**작성일**: 2026-07-02
**현재 버전**: theme-white.css v6, usung-overlay.js v10, api/inject.js
