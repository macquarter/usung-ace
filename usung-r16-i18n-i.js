/* usung-r16-i18n-i.js — **비이식 페이지** 잔여 사전 (ko/en/ja/zh/vi)
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
["PINNED · 중요","PINNED · IMPORTANT","PINNED · 重要","PINNED · 重要","PINNED · QUAN TRỌNG"],
["PINNED · 이벤트","PINNED · EVENT","PINNED · イベント","PINNED · 活动","PINNED · SỰ KIỆN"],
["TIMELINE · 최근 공지","TIMELINE · RECENT NOTICES","TIMELINE · 最近のお知らせ","TIMELINE · 最新公告","TIMELINE · THÔNG BÁO GẦN ĐÂY"],
["긴급","Urgent","緊急","紧急","Khẩn cấp"],
["진행중","Ongoing","進行中","进行中","Đang diễn ra"],
["업데이트","Update","アップデート","更新","Cập nhật"],
["공지","Notice","お知らせ","公告","Thông báo"],
["이벤트","Event","イベント","活动","Sự kiện"],
["궁금한 점은 언제든 전화주세요","Call us anytime with your questions","ご不明な点はいつでもお電話ください","有任何疑问请随时来电","Có thắc mắc, hãy gọi cho chúng tôi bất cứ lúc nào"],
["평일 08:30 ~ 17:30 / 토·일·공휴일 휴무","Weekdays 08:30 ~ 17:30 / Closed Sat, Sun and holidays","平日 08:30 ~ 17:30 / 土日祝休業","工作日 08:30 ~ 17:30 / 周六日及节假日休息","Ngày thường 08:30 ~ 17:30 / Nghỉ T7, CN và ngày lễ"],

/* ── 공지 게시글 9건 (제목 + 본문) ────────────────────────────────────── */
["2026 설 연휴 A/S 운영 안내","2026 Lunar New Year A/S Service Notice","2026年 旧正月連休 A/S 対応のご案内","2026年春节假期售后服务安排","Thông báo dịch vụ A/S dịp Tết Nguyên đán 2026"],
["2026년 2월 16일(월) ~ 18일(수) 설 연휴 기간 중 긴급 A/S는 1588-9123으로 연락주시면 순차 대응합니다.","During the Lunar New Year holiday, Feb 16 (Mon) to 18 (Wed) 2026, urgent A/S requests will be handled in order of receipt — please call 1588-9123.","2026年2月16日(月)～18日(水)の旧正月連休期間中、緊急のA/Sは1588-9123までご連絡いただければ順次対応いたします。","2026年2月16日(周一)至18日(周三)春节假期期间，紧急售后请拨打1588-9123，我们将依次处理。","Trong kỳ nghỉ Tết từ 16/2 (T2) đến 18/2 (T4) năm 2026, các yêu cầu A/S khẩn cấp xin gọi 1588-9123, chúng tôi sẽ xử lý lần lượt."],
["창립 기념 감사 프로모션","Anniversary Thank-You Promotion","創立記念 感謝プロモーション","创立纪念感恩促销","Chương trình tri ân kỷ niệm thành lập"],
["갤럭시 A·B 타입 일괄 견적 시 최대 15% 할인 + F.V.D 방화댐퍼 무상 업그레이드. 5월 31일까지!","Up to 15% off on bulk quotes for Galaxy Type A·B, plus a free F.V.D fire damper upgrade. Through May 31!","ギャラクシーA・Bタイプの一括見積で最大15%割引＋F.V.D防火ダンパー無償アップグレード。5月31日まで！","银河A·B型批量报价最高享15%折扣，另赠F.V.D防火阀免费升级。截至5月31日！","Giảm tới 15% khi báo giá trọn gói Galaxy loại A·B, kèm nâng cấp van chặn lửa F.V.D miễn phí. Đến hết 31/5!"],
["2026 제품 카탈로그 v6 배포 안내","2026 Product Catalog v6 Now Available","2026 製品カタログ v6 配布のご案内","2026产品目录v6发布通知","Thông báo phát hành Catalog sản phẩm 2026 v6"],
["갤럭시 A~D 타입 전면 개정된 최신 카탈로그가 자료실에 업로드되었습니다. 신규 F.V.D 방화댐퍼 라인업 포함.","The fully revised catalog covering Galaxy Types A to D has been uploaded to the resource library, including the new F.V.D fire damper lineup.","ギャラクシーA～Dタイプを全面改訂した最新カタログを資料室にアップロードしました。新型F.V.D防火ダンパーのラインナップも収録。","全面修订的银河A~D型最新目录已上传至资料室，包含全新F.V.D防火阀产品线。","Catalog mới nhất, sửa đổi toàn diện cho Galaxy loại A~D, đã được tải lên thư viện tài liệu, bao gồm dòng van chặn lửa F.V.D mới."],
["태엽감속기 빠찌링(베어링) 정품 교체 캠페인","Genuine Bearing Replacement Campaign for Spring Reducers","ゼンマイ減速機ベアリング純正交換キャンペーン","发条减速机轴承原厂更换活动","Chương trình thay vòng bi chính hãng cho bộ giảm tốc dây cót"],
["5년 이상 사용 매장 대상으로 베어링 무상 점검 및 할인 교체를 진행합니다. 전화 접수만 받습니다.","Stores in operation for 5+ years can get a free bearing inspection and a discounted replacement. Phone applications only.","5年以上ご使用の店舗を対象に、ベアリングの無償点検と割引交換を実施します。お申し込みはお電話のみとなります。","面向使用满5年以上的门店，提供轴承免费检测及折扣更换。仅接受电话申请。","Áp dụng cho các cửa hàng đã sử dụng trên 5 năm: kiểm tra vòng bi miễn phí và thay thế có chiết khấu. Chỉ nhận đăng ký qua điện thoại."],
["파주 본사 주차장 확장 공사 안내","Paju Headquarters Parking Lot Expansion Notice","パジュ本社 駐車場拡張工事のご案内","坡州总部停车场扩建施工通知","Thông báo thi công mở rộng bãi đỗ xe trụ sở Paju"],
["3월 25일 ~ 4월 10일까지 본사 주차장 확장 공사로 임시 주차 장소를 운영합니다.","From March 25 to April 10, a temporary parking area will be in use while the headquarters lot is expanded.","3月25日～4月10日まで本社駐車場の拡張工事のため、臨時駐車場を運営いたします。","3月25日至4月10日期间，因总部停车场扩建施工，将启用临时停车场。","Từ 25/3 đến 10/4, do thi công mở rộng bãi đỗ xe trụ sở, chúng tôi sẽ vận hành bãi đỗ tạm thời."],
["시공후기 리뷰 이벤트 — 스타벅스 기프티콘","Installation Review Event — Starbucks Gift Card","施工レビューイベント — スターバックス ギフトカード","施工评价活动 — 星巴克礼品卡","Sự kiện đánh giá công trình — Thẻ quà tặng Starbucks"],
["게시판에 실제 시공 사진과 후기를 남겨주시는 분들께 매주 5분 추첨하여 커피 기프티콘을 드립니다.","Post real installation photos and a review on the board, and five people will be drawn each week to receive a coffee gift card.","掲示板に実際の施工写真とレビューを投稿してくださった方の中から、毎週5名様を抽選でコーヒーギフトカードをプレゼントします。","在留言板发布真实施工照片与评价的用户，每周抽取5位赠送咖啡礼品卡。","Đăng ảnh công trình thực tế và đánh giá lên bảng tin, mỗi tuần 5 người sẽ được rút thăm nhận thẻ quà cà phê."],
["F.V.D 방화댐퍼 2세대 정식 출시","F.V.D Fire Damper 2nd Generation Officially Launched","F.V.D防火ダンパー 第2世代 正式発売","F.V.D防火阀第二代正式上市","Chính thức ra mắt van chặn lửa F.V.D thế hệ 2"],
["기존 대비 폐쇄 속도 40% 향상, 스프링 수명 2배 연장된 2세대 F.V.D가 전 제품군에 기본 탑재됩니다.","The 2nd-generation F.V.D — 40% faster closing and twice the spring life — now comes standard across the entire product range.","従来比で閉鎖速度40%向上、スプリング寿命2倍となった第2世代F.V.Dが全製品に標準搭載されます。","关闭速度较原有产品提升40%、弹簧寿命延长2倍的第二代F.V.D，将标配于全系列产品。","F.V.D thế hệ 2 — tốc độ đóng nhanh hơn 40%, tuổi thọ lò xo gấp đôi — nay được trang bị tiêu chuẩn trên toàn bộ dòng sản phẩm."],
["설 연휴 기간 긴급 A/S 접수 안내","Urgent A/S Requests During the Lunar New Year Holiday","旧正月連休期間中の緊急A/S受付のご案内","春节假期紧急售后受理通知","Hướng dẫn tiếp nhận A/S khẩn cấp trong kỳ nghỉ Tết"],
["설 연휴 기간 긴급 상황 발생 시 1588-9123으로 연락 주시면 순차 대응해드립니다.","If an emergency arises during the Lunar New Year holiday, call 1588-9123 and we will respond in order of receipt.","旧正月連休期間中に緊急事態が発生した場合は、1588-9123までご連絡いただければ順次対応いたします。","春节假期期间如遇紧急情况，请拨打1588-9123，我们将依次处理。","Nếu có tình huống khẩn cấp trong kỳ nghỉ Tết, xin gọi 1588-9123, chúng tôi sẽ xử lý lần lượt."],
["유성에이스 공식 블로그 리뉴얼 완료","YUSUNG ACE Official Blog Renewal Complete","ユソンエース公式ブログ リニューアル完了","友盛ACE官方博客改版完成","Hoàn tất đổi mới blog chính thức YUSUNG ACE"],
["네이버 공식 블로그가 새롭게 리뉴얼되었습니다. 시공 사례와 기술 정보를 확인하세요.","Our official Naver blog has been redesigned. Browse installation cases and technical information.","NAVER公式ブログを新しくリニューアルしました。施工事例と技術情報をご確認ください。","NAVER官方博客已全新改版，欢迎查看施工案例与技术信息。","Blog chính thức trên Naver đã được đổi mới. Mời xem các công trình và thông tin kỹ thuật."],

/* ── 게시판 표 머리글·분류 탭 (i18n.js board_col_* 원문) ──────────────── */
["분류","Category","分類","分类","Phân loại"],
["제목","Title","タイトル","标题","Tiêu đề"],
["등록일","Date","登録日","日期","Ngày"],
["블로그","Blog","ブログ","博客","Blog"],
["기술정보","Tech Info","技術情報","技术信息","Thông tin kỹ thuật"],
["제품소식","Product News","製品ニュース","产品资讯","Tin sản phẩm"]
]);
