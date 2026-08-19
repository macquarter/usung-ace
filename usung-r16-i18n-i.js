/* usung-r16-i18n-i.js — **비이식 페이지** 잔여 사전 (ko/en/ja/zh/vi)
 * build-marker: r52-b2
 * ★ 한 줄 = 한 항목. [한국어, en, ja, zh, vi]
 * ★ 앞선 a~h 는 r8 이식 4개 뷰(제품·부품·기술력·갤러리)만 덮었다.
 *   전 페이지(.page 11개)로 범위를 넓혀 재계측하니 홈·회사소개·공지·게시판·푸터에
 *   105개가 더 남아 있었다. 이 파일이 그 구멍을 메운다.
 * ★ 푸터/내비/주소/게시판 헤더는 **i18n.js·usung-r6-nav.js 의 공식 번역문을 그대로 옮겼다**.
 *   새로 짓지 않았으므로 헤더와 푸터의 표기가 어긋날 수 없다.
 *   주의: i18n.js 의 언어 블록 순서는 ko - en - ja - vi - zh 로 __R16D 와 다르다(끝 둘을 바꿔 옮김).
 * ★ 공지 게시글 9건(제목+본문)은 usung-notice.js 에 **하드코딩된 정적 콘텐츠**라 번역 대상에 넣었다.
 *   유성에이스가 글을 고치면 그 문자열만 한국어로 남는다(= 오늘과 동일한 안전한 열화).
 * ★ 제외: 게시판 글 제목 10건(api/board.js 로 관리자가 수시 작성) · 제품 발주코드 24종(잔여업무 A-9
 *   대로 공장·대리점 공용 식별자라 의도적 유지) · 사용방법 페이지 42종(진입로가 전부 숨겨져 도달 불가).
 */
window.__R16D=(window.__R16D||[]).concat([
/* ── 홈 스테이트먼트 카운터 (r30/S01 이 'IN KOREA' 를 대체한 라벨) ─────────
   원래 영문이라 전 언어가 그대로 봤다. 한글로 바뀌었으니 사전이 없으면 en/ja/zh/vi 에
   한국어가 그대로 노출된다. data-i18n 이 없는 자리라 i18n.js 가 아니라 이 사전이 맡는다. */
["최초의 혁신적 후드","Korea's First Innovative Hood","初の革新的フード","首创革新油烟罩","Chụp hút đột phá đầu tiên"],
/* ── 푸터·상단 내비 (i18n.js / usung-r6-nav.js 원문) ───────────────────── */
["회사소개","About Us","会社紹介","公司介绍","Giới thiệu"],
["제품소개","Products","製品紹介","产品介绍","Sản phẩm"],
["시공갤러리","Gallery","施工ギャラリー","施工案例","Công trình"],
["기술력","Technology","技術","技术","Công nghệ"],
["공지게시판","Notice Board","お知らせ掲示板","公告栏","Bảng thông báo"],

/* ── 홈 히어로 3멘트 + CTA (usung-home.js) ─────────────────────────────── */
["프리미엄 직화기","Premium Charcoal Grill","プレミアム直火焼き","高级直火烤炉","Bếp nướng than cao cấp"],
["후드의 기준","The Standard in Hoods","フードの基準","油烟罩的标准","Tiêu chuẩn của chụp hút"],
["한 번 사용 해보면,","Once you have used it,","一度使えば、","用过一次，","Một lần sử dụng,"],
["다시 찾는 이유가 있습니다.","there is a reason customers come back.","また選ばれる理由があります。","就知道客户为何回头。","bạn sẽ hiểu vì sao khách quay lại."],
["유성에이스를 쓰면,","With YUSUNG ACE,","ユソンエースを使えば、","使用友盛ACE，","Với YUSUNG ACE,"],
["후드의 기준이 달라집니다.","the standard for hoods changes.","フードの基準が変わります。","油烟罩的标准就此改变。","tiêu chuẩn của chụp hút sẽ thay đổi."],
["제품 라인업 보기","View Product Lineup","製品ラインナップ","查看产品线","Xem sản phẩm"],
["견적 문의","Request Quote","見積依頼","报价咨询","Yêu cầu báo giá"],
["시공 현장 {n}","Site {n}","施工現場 {n}","施工现场 {n}","Công trình {n}"],

/* ── 회사소개 전화 카드 (usung-r9-excel.js · 잔여업무 A-13 해소) ───────── */
["유성에이스","YUSUNG ACE","ユソンエース","友盛ACE","YUSUNG ACE"],
["경기 파주시 파주읍 센트럴산단1로 103","103, Central Sandan 1-ro, Paju-eup, Paju-si, Gyeonggi-do","京畿道パジュ市パジュ邑セントラル産団1路103","京畿道坡州市坡州邑中央产业园区1路103号","103, Central Sandan 1-ro, Paju-eup, Paju-si, Gyeonggi-do"],
["경기 파주시 파주읍","Paju-eup, Paju-si, Gyeonggi-do","京畿道パジュ市パジュ邑","京畿道坡州市坡州邑","Paju-eup, Paju-si, Gyeonggi-do"],
["센트럴산단1로 103","103, Central Sandan 1-ro","セントラル産団1路103","中央产业园区1路103号","103, Central Sandan 1-ro"],
["(봉암리 1371-9)","(Bongam-ri 1371-9)","(ボンアムリ 1371-9)","(凤岩里 1371-9)","(Bongam-ri 1371-9)"],
["견적 · 설치 · A/S 무엇이든 아래 번호로 연락 주세요.","For quotes, installation or after-sales service, please call the number below.","見積・設置・A/S、何でも下記の番号までご連絡ください。","报价、安装、售后，任何需求请拨打下方号码。","Báo giá, lắp đặt hay bảo hành — xin gọi số bên dưới."],
["📞 대표전화 1588-9123","📞 Main Line 1588-9123","📞 代表電話 1588-9123","📞 客服热线 1588-9123","📞 Tổng đài 1588-9123"],
["평일 08:30 ~ 17:30","Weekdays 08:30 ~ 17:30","平日 08:30 ~ 17:30","工作日 08:30 ~ 17:30","Ngày thường 08:30 ~ 17:30"],

/* ── 공지 페이지 골격 (usung-notice.js · 문구는 i18n.js 원문) ──────────── */
["NOTICE · 공지사항","NOTICE","NOTICE · お知らせ","NOTICE · 公告","NOTICE · Thông báo"],
["유성에이스 소식","YUSUNG ACE News","ユソンエースニュース","友盛ACE动态","Tin YUSUNG ACE"],
["중요한 공지, A/S 일정, 이벤트 소식을 한곳에서 확인하세요.","Check important notices, A/S schedules, and event news in one place.","重要なお知らせ、A/Sスケジュール、イベント情報を一箇所で確認。","在此查看重要公告、售后日程和活动信息。","Xem thông báo quan trọng, lịch A/S và sự kiện tại đây."],
["TIMELINE · 최근 공지","TIMELINE · RECENT NOTICES","TIMELINE · 最近のお知らせ","TIMELINE · 最新公告","TIMELINE · THÔNG BÁO GẦN ĐÂY"],
["긴급","Urgent","緊急","紧急","Khẩn cấp"],
["진행중","Ongoing","進行中","进行中","Đang diễn ra"],
["업데이트","Update","アップデート","更新","Cập nhật"],
["공지","Notice","お知らせ","公告","Thông báo"],
["이벤트","Event","イベント","活动","Sự kiện"],
["궁금한 점은 언제든 전화주세요","Call us anytime with your questions","ご不明な点はいつでもお電話ください","有任何疑问请随时来电","Có thắc mắc, hãy gọi cho chúng tôi bất cứ lúc nào"],
["평일 08:30 ~ 17:30 / 토·일·공휴일 휴무","Weekdays 08:30 ~ 17:30 / Closed Sat, Sun and holidays","平日 08:30 ~ 17:30 / 土日祝休業","工作日 08:30 ~ 17:30 / 周六日及节假日休息","Ngày thường 08:30 ~ 17:30 / Nghỉ T7, CN và ngày lễ"],
/* r52 — 더미 공지 9건을 걷어내며 생긴 빈 상태 문구. 사전이 없으면 영문 화면에
   여기만 한국어로 남는다(실측으로 잡았다). */
["등록된 공지가 없습니다","No notices have been posted","登録されたお知らせはありません","暂无公告","Chưa có thông báo nào"],
["새로운 소식이 등록되면 이곳에 표시됩니다.","New announcements will appear here.","新しいお知らせが登録されるとここに表示されます。","有新公告时将显示在此处。","Thông báo mới sẽ hiển thị tại đây."],
["급한 문의는 아래 대표전화로 연락해 주세요.","For urgent enquiries, please call the main line below.","お急ぎの場合は下記の代表電話までご連絡ください。","紧急咨询请拨打下方客服热线。","Liên hệ gấp xin gọi tổng đài bên dưới."],

/* ── 게시판 표 머리글·분류 탭 (i18n.js board_col_* 원문) ──────────────── */
["분류","Category","分類","分类","Phân loại"],
["제목","Title","タイトル","标题","Tiêu đề"],
["등록일","Date","登録日","日期","Ngày"],
["블로그","Blog","ブログ","博客","Blog"],
["기술정보","Tech Info","技術情報","技术信息","Thông tin kỹ thuật"],
["제품소식","Product News","製品ニュース","产品资讯","Tin sản phẩm"]
]);
