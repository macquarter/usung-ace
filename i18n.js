(function(){
"use strict";
var T={
ko:{
nav_home:"홈",nav_about:"회사소개",nav_products:"제품소개",nav_parts:"부품소개",nav_gallery:"시공갤러리",nav_tech:"기술",nav_manual:"사용방법",nav_customer:"고객센터",nav_notice:"공지사항",nav_board:"게시판",nav_archive:"자료실",nav_inquiry:"시공 사례 / 견적 상담",nav_contact:"Contact Us",nav_core_tech:"코어 기술",nav_process:"프로세스",nav_core_desc:"360° 스윙, 간편청소, FVD 방화댐퍼, 맞춤제작",nav_process_desc:"현장실측부터 시공·사후관리까지 4단계",nav_manual_desc:"제품 설치·유지보수 비주얼 가이드",nav_notice_desc:"중요공지, 이벤트 확인하세요.",nav_board_desc:"기술정보, 시공사례, 제품소식",nav_archive_desc:"특허, 인증서 등",nav_inquiry_desc:"매장 규모별 맞춤 설계",
hero_tag:"SINCE 2007 · USUNG ACE",hero_title1:"대한민국 덕트",hero_title2:"No.1",hero_sub:"오늘을 이끄는 원동력.",hero_scroll1a:"새로운 환경, 새로운 기술로",hero_scroll1b:"한걸음 앞서갑니다.",hero_scroll2a:"신뢰와 나눔 속에",hero_scroll2b:"사랑받는 기업으로.",
feat1_title:"360° 스윙",feat1_desc:"시계추 모양으로 360° 자유 회전. 파이프가 고정되어 있지 않아 부러질 염려 없이 편리합니다.",feat2_title:"F.V.D 방화담파",feat2_desc:"풍속조절 겸용 방화담파로 화재 시 자동 차단. 200~220도에서 닫혀 화재 확산을 방지합니다.",feat3_title:"분리청소 가능",feat3_desc:"도구 없이 손으로 분리. 매일 세척 가능한 위생 구조입니다. 터치분리로 상부 파이프도 청소 가능.",feat4_title:"상하작동 텐션",feat4_desc:"필요한 기장으로 맞춤 제작. 기본기장 L1800 기준으로 절단·연장 가능합니다.",
fim_tag:"FEATURES IN MOTION",fim_title_a:"디테일을 ",fim_title_b:"움직임으로",fim_title_c:" 확인하세요.",fim_desc:"4가지 핵심 기술이 실제로 어떻게 작동하는지, 가만히 보고만 있어도 느껴집니다.",fim_card1_tag:"01 / SWING",fim_card1_title:"360° 자유 스윙",fim_card1_desc:"텐션 나사 방식으로 상·하·좌·우 360° 완전 자유 회전. 접시는 움직여도 파이프는 제자리를 유지합니다.",fim_card2_tag:"02 / CLEAN",fim_card2_title:"원터치 분리청소",fim_card2_desc:"나사 한 바퀴면 상부 파이프까지 통째 분리. 내부 기름때를 직접 확인하며 매일 세척 가능합니다.",fim_card3_tag:"03 / SAFETY",fim_card3_title:"안전·유지관리 옵션",fim_card3_desc:"FVD방화댐퍼: 200~220도에서 댐퍼가 닫혀 화재 예방. 터치분리로 상부 파이프도 청소 가능.",fim_card4_tag:"04 / CUSTOM",fim_card4_title:"맞춤형 제작",fim_card4_desc:"필요하신 기장으로 맞춤 제작이 가능합니다. 기본기장 L1800 기준으로 절단·연장 가능.",
www_tag:"WHERE WE WORK",www_title_a:"대한민국의 ",www_title_b:"불 앞에서",www_title_c:".",www_desc:"프랜차이즈 주방부터 거친 공정의 제조 현장, 정밀한 연구소까지. 유성에이스는 매일 수많은 전문가들의 작업 환경을 쾌적하게 지켜내고 있습니다.",www_case1_tag:"USE CASE 01",www_case1_title:"직화 고깃집",www_case2_tag:"USE CASE 02",www_case2_title:"장어·해물 구이",www_case3_tag:"USE CASE 03",www_case3_title:"공장 / 연구실",
cta_tag:"READY TO START?",cta_title_a:"지금 바로",cta_title_b:"시작하세요",cta_desc:"현장 실측부터 맞춤 설계·제작·시공까지, 원스톱으로 진행합니다.",cta_btn_call:"전화 상담",cta_btn_inquiry:"견적 문의",
tech_tag:"CORE TECHNOLOGY",tech_title:"유성에이스만의 핵심 기술",tech_impact:"자체공장에서 직접 설계하고 생산합니다.",tech_3d_title:"3D 후드 시스템",tech_stat1_label:"특허 기술",tech_stat1_val:"5건+",tech_stat2_label:"모델 라인업",tech_stat2_val:"148종",tech_stat3_label:"시공 실적",tech_stat3_val:"전국",tech_stat4_label:"업력",tech_stat4_val:"20년",
about_tag:"ABOUT US",about_title:"유성에이스",about_ceo_name:"대표이사 인사말",about_promise:"약속",about_history:"연혁",about_location:"오시는 길",about_contact_title:"문의하기",
prod_tag:"PRODUCT LINE-UP",prod_title:"제품 소개",prod_desc:"148종 이상의 다양한 후드·덕트·직화기 라인업",prod_all:"전체보기",prod_detail:"자세히 보기",prod_cta_title:"견적 상담 신청",prod_cta_desc:"매장 규모·업종에 맞는 최적의 제품을 추천받으세요.",prod_cta_btn:"상담 신청하기",
parts_title:"부품 소개",parts_all:"전체",
manual_tag:"VISUAL GUIDE",manual_title:"사용방법",manual_maintenance:"MAINTENANCE GUIDE",manual_maint_title:"유지보수 가이드",
gallery_tag:"GALLERY",gallery_title:"시공 갤러리",gallery_desc:"전국 각지의 유성에이스 시공 현장을 만나보세요.",
process_tag:"OUR PROCESS",process_title:"프로세스",process_desc:"현장실측부터 시공·사후관리까지 4단계 원스톱 서비스",process_step1_title:"현장 실측 / 상담",process_step1_desc:"20년 노하우의 전문가가 직접 방문해 매장 규모·화로 종류·천정고를 측정합니다. 현장 환경에 맞는 최적의 후드 시스템을 제안합니다.",process_step2_title:"맞춤 설계·견적",process_step2_desc:"갤럭시 A~D 중 매장에 최적인 모델을 추천하고 도면·견적서를 제공합니다. 천정고, 화로 배치, 동선을 모두 고려한 맞춤 설계입니다.",process_step3_title:"자체 공장 제작",process_step3_desc:"유성에이스 자체 공장에서 정밀 제작 후 현장으로 직배송합니다. 나사 하나까지 100% 국내 자체 생산, 품질에 대한 자부심입니다.",process_step4_title:"시공 및 사후관리",process_step4_desc:"전문 기사 시공 + F.V.D 방화담퍼 점검 + 부분 특허 부품 A/S 지원. 시공 후에도 유지보수까지 책임지는 원스톱 서비스입니다.",process_cta:"무료 현장 실측 신청하기",
footer_company:"(주) 유성에이스",footer_addr:"경기도 파주시 파주읍 센트럴산단1로 103",footer_tel:"대표전화",footer_fax:"FAX",footer_ceo:"대표",footer_ceo_name:"이재운",footer_biz:"사업자등록번호",footer_rights:"All rights reserved.",
lang_ko:"한국어",lang_en:"English",lang_ja:"日本語",lang_vi:"Tiếng Việt",lang_zh:"中文"
},

en:{
nav_home:"Home",nav_about:"About Us",nav_products:"Products",nav_parts:"Parts",nav_gallery:"Gallery",nav_tech:"Technology",nav_manual:"Manual",nav_customer:"Support",nav_notice:"Notice",nav_board:"Board",nav_archive:"Archive",nav_inquiry:"Projects / Quote",nav_contact:"Contact Us",nav_core_tech:"Core Technology",nav_process:"Process",nav_core_desc:"360° Swing, Easy Clean, FVD Fire Damper, Custom Built",nav_process_desc:"4 Steps from Site Survey to After-Service",nav_manual_desc:"Visual Guide for Installation & Maintenance",nav_notice_desc:"Important notices and event updates",nav_board_desc:"Tech info, project cases, product news",nav_archive_desc:"Patents, certifications, and more",nav_inquiry_desc:"Custom design by store size",
hero_tag:"SINCE 2007 · USUNG ACE",hero_title1:"Korea's Duct",hero_title2:"No.1",hero_sub:"The driving force behind today.",hero_scroll1a:"With new environments and new technology,",hero_scroll1b:"we stay one step ahead.",hero_scroll2a:"Built on trust and sharing,",hero_scroll2b:"a company people love.",
feat1_title:"360° Swing",feat1_desc:"Free 360° pendulum rotation. The unfixed pipe design eliminates breakage and ensures easy handling.",feat2_title:"F.V.D Fire Damper",feat2_desc:"Dual-purpose fire damper with airflow control. Automatically shuts at 200–220°C to prevent fire spread.",feat3_title:"Easy Disassembly & Clean",feat3_desc:"Hand-detachable without tools. Hygienic design allows daily cleaning. Touch-release for upper pipes too.",feat4_title:"Adjustable Tension",feat4_desc:"Custom-built to the length you need. Standard L1800 can be cut or extended.",
fim_tag:"FEATURES IN MOTION",fim_title_a:"See the ",fim_title_b:"details",fim_title_c:" in action.",fim_desc:"Watch how our four core technologies actually work — you can feel the difference just by looking.",fim_card1_tag:"01 / SWING",fim_card1_title:"360° Free Swing",fim_card1_desc:"Tension-screw mechanism enables full 360° rotation in all directions. The disc moves, but the pipe stays perfectly in place.",fim_card2_tag:"02 / CLEAN",fim_card2_title:"One-Touch Disassembly",fim_card2_desc:"A single screw turn detaches the entire upper pipe assembly. Inspect and wash away grease buildup daily.",fim_card3_tag:"03 / SAFETY",fim_card3_title:"Safety & Maintenance Options",fim_card3_desc:"FVD Fire Damper: closes at 200–220°C to prevent fire. Touch-release enables upper pipe cleaning.",fim_card4_tag:"04 / CUSTOM",fim_card4_title:"Custom Manufacturing",fim_card4_desc:"Built to the exact length you need. Standard L1800 base — can be cut or extended.",
www_tag:"WHERE WE WORK",www_title_a:"At the ",www_title_b:"heart of the flame",www_title_c:".",www_desc:"From franchise kitchens to heavy-duty manufacturing floors and precision laboratories — USUNG ACE keeps the work environments of countless professionals clean and comfortable every day.",www_case1_tag:"USE CASE 01",www_case1_title:"Charcoal BBQ",www_case2_tag:"USE CASE 02",www_case2_title:"Eel & Seafood Grill",www_case3_tag:"USE CASE 03",www_case3_title:"Factory / Lab",
cta_tag:"READY TO START?",cta_title_a:"Get started",cta_title_b:"right now",cta_desc:"From site survey to custom design, manufacturing, and installation — all in one stop.",cta_btn_call:"Call Us",cta_btn_inquiry:"Request Quote",
tech_tag:"CORE TECHNOLOGY",tech_title:"USUNG ACE's Core Technology",tech_impact:"Designed and manufactured in our own factory.",tech_3d_title:"3D Hood System",tech_stat1_label:"Patented Tech",tech_stat1_val:"5+",tech_stat2_label:"Model Lineup",tech_stat2_val:"148",tech_stat3_label:"Coverage",tech_stat3_val:"Nationwide",tech_stat4_label:"Experience",tech_stat4_val:"20 yrs",
about_tag:"ABOUT US",about_title:"USUNG ACE",about_ceo_name:"CEO Message",about_promise:"Our Promise",about_history:"History",about_location:"Directions",about_contact_title:"Contact Us",
prod_tag:"PRODUCT LINE-UP",prod_title:"Products",prod_desc:"Over 148 models of hoods, ducts, and charcoal grills",prod_all:"View All",prod_detail:"Learn More",prod_cta_title:"Request a Quote",prod_cta_desc:"Get the best product recommendation for your store size and type.",prod_cta_btn:"Request Consultation",
parts_title:"Parts",parts_all:"All",
manual_tag:"VISUAL GUIDE",manual_title:"User Manual",manual_maintenance:"MAINTENANCE GUIDE",manual_maint_title:"Maintenance Guide",
gallery_tag:"GALLERY",gallery_title:"Installation Gallery",gallery_desc:"Explore USUNG ACE installations across the country.",
process_tag:"OUR PROCESS",process_title:"Process",process_desc:"4-step one-stop service from site survey to after-service",process_step1_title:"Site Survey / Consultation",process_step1_desc:"A specialist with 20 years of experience visits your store to measure dimensions, burner type, and ceiling height, then recommends the optimal hood system.",process_step2_title:"Custom Design & Quote",process_step2_desc:"We recommend the best Galaxy A–D model for your store and provide drawings and a transparent quote, considering ceiling height, burner layout, and foot traffic.",process_step3_title:"In-House Manufacturing",process_step3_desc:"Precision-built at our own USUNG ACE factory and shipped directly to your site. Every screw is 100% domestically produced — quality we stand behind.",process_step4_title:"Installation & After-Service",process_step4_desc:"Professional technician installation + F.V.D fire damper inspection + patented parts A/S support. A one-stop service that takes responsibility even after installation.",process_cta:"Request Free Site Survey",
footer_company:"USUNG ACE Co., Ltd.",footer_addr:"103, Central Sandan 1-ro, Paju-eup, Paju-si, Gyeonggi-do",footer_tel:"Tel",footer_fax:"FAX",footer_ceo:"CEO",footer_ceo_name:"Jaeun Lee",footer_biz:"Business Reg. No.",footer_rights:"All rights reserved.",
lang_ko:"한국어",lang_en:"English",lang_ja:"日本語",lang_vi:"Tiếng Việt",lang_zh:"中文"
},

ja:{
nav_home:"ホーム",nav_about:"会社紹介",nav_products:"製品紹介",nav_parts:"部品紹介",nav_gallery:"施工ギャラリー",nav_tech:"技術",nav_manual:"使い方",nav_customer:"お客様センター",nav_notice:"お知らせ",nav_board:"掲示板",nav_archive:"資料室",nav_inquiry:"施工事例 / 見積相談",nav_contact:"Contact Us",nav_core_tech:"コア技術",nav_process:"プロセス",nav_core_desc:"360°スイング、簡単清掃、FVD防火ダンパー、オーダーメイド",nav_process_desc:"現場実測から施工・アフターサービスまで4段階",nav_manual_desc:"製品の設置・メンテナンス ビジュアルガイド",nav_notice_desc:"重要なお知らせ・イベント情報",nav_board_desc:"技術情報、施工事例、製品ニュース",nav_archive_desc:"特許、認証書など",nav_inquiry_desc:"店舗規模別オーダーメイド設計",
hero_tag:"SINCE 2007 · USUNG ACE",hero_title1:"韓国のダクト",hero_title2:"No.1",hero_sub:"今日を動かす原動力。",hero_scroll1a:"新しい環境、新しい技術で",hero_scroll1b:"一歩先を行きます。",hero_scroll2a:"信頼と分かち合いの中で",hero_scroll2b:"愛される企業へ。",
feat1_title:"360°スイング",feat1_desc:"振り子のように360°自由回転。パイプが固定されていないため、折れる心配なく便利です。",feat2_title:"F.V.D 防火ダンパー",feat2_desc:"風速調節兼用の防火ダンパーで火災時に自動遮断。200〜220℃で閉じて火災の拡大を防ぎます。",feat3_title:"分離清掃可能",feat3_desc:"工具不要で手で分離。毎日洗浄可能な衛生構造。ワンタッチで上部パイプも清掃可能。",feat4_title:"上下作動テンション",feat4_desc:"必要な長さでオーダーメイド。基本仕様L1800基準で切断・延長可能です。",
fim_tag:"FEATURES IN MOTION",fim_title_a:"ディテールを",fim_title_b:"動きで",fim_title_c:"ご確認ください。",fim_desc:"4つのコア技術が実際にどう動くのか、見ているだけで実感できます。",fim_card1_tag:"01 / SWING",fim_card1_title:"360°フリースイング",fim_card1_desc:"テンションネジ方式で上下左右360°完全自由回転。プレートが動いてもパイプは定位置を保ちます。",fim_card2_tag:"02 / CLEAN",fim_card2_title:"ワンタッチ分離清掃",fim_card2_desc:"ネジ一回転で上部パイプまで丸ごと分離。内部の油汚れを直接確認しながら毎日洗浄可能です。",fim_card3_tag:"03 / SAFETY",fim_card3_title:"安全・メンテナンスオプション",fim_card3_desc:"FVD防火ダンパー: 200〜220℃でダンパーが閉じて火災を予防。ワンタッチで上部パイプも清掃可能。",fim_card4_tag:"04 / CUSTOM",fim_card4_title:"オーダーメイド製作",fim_card4_desc:"ご希望の長さでオーダーメイド可能。基本仕様L1800基準で切断・延長できます。",
www_tag:"WHERE WE WORK",www_title_a:"韓国の",www_title_b:"炎の現場で",www_title_c:"。",www_desc:"フランチャイズの厨房から過酷な製造現場、精密な研究所まで。ユソンエースは毎日、数多くの専門家の作業環境を快適に守っています。",www_case1_tag:"USE CASE 01",www_case1_title:"直火焼肉店",www_case2_tag:"USE CASE 02",www_case2_title:"うなぎ・海鮮焼き",www_case3_tag:"USE CASE 03",www_case3_title:"工場 / 研究室",
cta_tag:"READY TO START?",cta_title_a:"今すぐ",cta_title_b:"始めましょう",cta_desc:"現場実測からオーダーメイド設計・製作・施工まで、ワンストップで対応します。",cta_btn_call:"電話相談",cta_btn_inquiry:"見積依頼",
tech_tag:"CORE TECHNOLOGY",tech_title:"ユソンエース独自のコア技術",tech_impact:"自社工場で直接設計・生産しています。",tech_3d_title:"3Dフードシステム",tech_stat1_label:"特許技術",tech_stat1_val:"5件+",tech_stat2_label:"モデルラインナップ",tech_stat2_val:"148種",tech_stat3_label:"施工実績",tech_stat3_val:"全国",tech_stat4_label:"業歴",tech_stat4_val:"20年",
about_tag:"ABOUT US",about_title:"ユソンエース",about_ceo_name:"代表挨拶",about_promise:"お約束",about_history:"沿革",about_location:"アクセス",about_contact_title:"お問い合わせ",
prod_tag:"PRODUCT LINE-UP",prod_title:"製品紹介",prod_desc:"148種以上の多彩なフード・ダクト・直火器ラインナップ",prod_all:"全て見る",prod_detail:"詳しく見る",prod_cta_title:"見積相談申請",prod_cta_desc:"店舗の規模・業種に合った最適な製品をご提案します。",prod_cta_btn:"相談を申し込む",
parts_title:"部品紹介",parts_all:"全て",
manual_tag:"VISUAL GUIDE",manual_title:"使い方",manual_maintenance:"MAINTENANCE GUIDE",manual_maint_title:"メンテナンスガイド",
gallery_tag:"GALLERY",gallery_title:"施工ギャラリー",gallery_desc:"全国各地のユソンエース施工現場をご覧ください。",
process_tag:"OUR PROCESS",process_title:"プロセス",process_desc:"現場実測から施工・アフターサービスまで4段階ワンストップ",process_step1_title:"現場実測 / 相談",process_step1_desc:"20年のノウハウを持つ専門家が直接訪問し、店舗規模・火炉の種類・天井高を測定。現場環境に最適なフードシステムをご提案します。",process_step2_title:"オーダーメイド設計・見積",process_step2_desc:"ギャラクシーA〜Dの中から最適モデルを推薦し、図面・見積書をご提供。天井高、火炉配置、動線すべてを考慮したオーダーメイド設計です。",process_step3_title:"自社工場製作",process_step3_desc:"ユソンエース自社工場で精密製作後、現場へ直接配送。ネジ一本まで100%国内自社生産、品質への誇りです。",process_step4_title:"施工・アフターサービス",process_step4_desc:"専門技術者による施工 + F.V.D防火ダンパー点検 + 特許部品A/Sサポート。施工後もメンテナンスまで責任を持つワンストップサービスです。",process_cta:"無料現場実測を申し込む",
footer_company:"株式会社 ユソンエース",footer_addr:"京畿道パジュ市パジュ邑セントラル産団1路103",footer_tel:"代表電話",footer_fax:"FAX",footer_ceo:"代表",footer_ceo_name:"イ・ジェウン",footer_biz:"事業者登録番号",footer_rights:"All rights reserved.",
lang_ko:"한국어",lang_en:"English",lang_ja:"日本語",lang_vi:"Tiếng Việt",lang_zh:"中文"
},

vi:{
nav_home:"Trang chủ",nav_about:"Giới thiệu",nav_products:"Sản phẩm",nav_parts:"Linh kiện",nav_gallery:"Công trình",nav_tech:"Công nghệ",nav_manual:"Hướng dẫn",nav_customer:"Hỗ trợ",nav_notice:"Thông báo",nav_board:"Diễn đàn",nav_archive:"Tài liệu",nav_inquiry:"Công trình / Báo giá",nav_contact:"Liên hệ",nav_core_tech:"Công nghệ lõi",nav_process:"Quy trình",nav_core_desc:"Xoay 360°, Vệ sinh dễ dàng, Van chống cháy FVD, Sản xuất theo yêu cầu",nav_process_desc:"4 bước từ khảo sát đến bảo trì sau lắp đặt",nav_manual_desc:"Hướng dẫn trực quan lắp đặt & bảo trì",nav_notice_desc:"Thông báo quan trọng và sự kiện",nav_board_desc:"Thông tin kỹ thuật, công trình, tin sản phẩm",nav_archive_desc:"Bằng sáng chế, chứng nhận, v.v.",nav_inquiry_desc:"Thiết kế tùy chỉnh theo quy mô cửa hàng",
hero_tag:"SINCE 2007 · USUNG ACE",hero_title1:"Ống gió Hàn Quốc",hero_title2:"No.1",hero_sub:"Động lực dẫn đầu hôm nay.",hero_scroll1a:"Với môi trường mới, công nghệ mới,",hero_scroll1b:"chúng tôi luôn đi trước một bước.",hero_scroll2a:"Trong niềm tin và sẻ chia,",hero_scroll2b:"trở thành doanh nghiệp được yêu mến.",
feat1_title:"Xoay 360°",feat1_desc:"Xoay tự do 360° như con lắc. Ống không cố định nên không lo gãy, sử dụng tiện lợi.",feat2_title:"Van chống cháy F.V.D",feat2_desc:"Van chống cháy kiêm điều chỉnh tốc độ gió, tự động đóng khi có hỏa hoạn. Đóng ở 200–220°C ngăn lửa lan.",feat3_title:"Tháo rời vệ sinh",feat3_desc:"Tháo bằng tay không cần dụng cụ. Kết cấu vệ sinh cho phép rửa hàng ngày. Tháo nhanh cả ống phía trên.",feat4_title:"Điều chỉnh lực căng",feat4_desc:"Sản xuất theo chiều dài yêu cầu. Tiêu chuẩn L1800, có thể cắt ngắn hoặc nối dài.",
fim_tag:"FEATURES IN MOTION",fim_title_a:"Xem ",fim_title_b:"chi tiết",fim_title_c:" qua chuyển động.",fim_desc:"Hãy quan sát 4 công nghệ cốt lõi vận hành thực tế — chỉ cần nhìn cũng cảm nhận được.",fim_card1_tag:"01 / SWING",fim_card1_title:"Xoay tự do 360°",fim_card1_desc:"Cơ chế vít lực căng cho phép xoay tự do 360° mọi hướng. Đĩa di chuyển nhưng ống luôn giữ nguyên vị trí.",fim_card2_tag:"02 / CLEAN",fim_card2_title:"Tháo rời một chạm",fim_card2_desc:"Chỉ một vòng vít là tháo toàn bộ ống phía trên. Kiểm tra và rửa dầu mỡ bên trong mỗi ngày.",fim_card3_tag:"03 / SAFETY",fim_card3_title:"An toàn & Bảo trì",fim_card3_desc:"Van chống cháy FVD: đóng ở 200–220°C ngăn cháy lan. Tháo nhanh để vệ sinh ống phía trên.",fim_card4_tag:"04 / CUSTOM",fim_card4_title:"Sản xuất theo yêu cầu",fim_card4_desc:"Sản xuất theo đúng chiều dài bạn cần. Tiêu chuẩn L1800, có thể cắt hoặc nối dài.",
www_tag:"WHERE WE WORK",www_title_a:"Trước ",www_title_b:"ngọn lửa",www_title_c:" Hàn Quốc.",www_desc:"Từ bếp nhượng quyền đến nhà máy sản xuất khắc nghiệt và phòng thí nghiệm chính xác — USUNG ACE giữ cho môi trường làm việc của vô số chuyên gia luôn trong lành mỗi ngày.",www_case1_tag:"USE CASE 01",www_case1_title:"Quán thịt nướng",www_case2_tag:"USE CASE 02",www_case2_title:"Lươn & Hải sản nướng",www_case3_tag:"USE CASE 03",www_case3_title:"Nhà máy / Phòng thí nghiệm",
cta_tag:"READY TO START?",cta_title_a:"Bắt đầu",cta_title_b:"ngay bây giờ",cta_desc:"Từ khảo sát hiện trường đến thiết kế, sản xuất và lắp đặt — tất cả trong một.",cta_btn_call:"Gọi tư vấn",cta_btn_inquiry:"Yêu cầu báo giá",
tech_tag:"CORE TECHNOLOGY",tech_title:"Công nghệ cốt lõi của USUNG ACE",tech_impact:"Tự thiết kế và sản xuất tại nhà máy riêng.",tech_3d_title:"Hệ thống hút 3D",tech_stat1_label:"Công nghệ sáng chế",tech_stat1_val:"5+",tech_stat2_label:"Dòng sản phẩm",tech_stat2_val:"148",tech_stat3_label:"Phạm vi thi công",tech_stat3_val:"Toàn quốc",tech_stat4_label:"Kinh nghiệm",tech_stat4_val:"20 năm",
about_tag:"ABOUT US",about_title:"USUNG ACE",about_ceo_name:"Lời chào từ Giám đốc",about_promise:"Cam kết",about_history:"Lịch sử",about_location:"Đường đi",about_contact_title:"Liên hệ",
prod_tag:"PRODUCT LINE-UP",prod_title:"Sản phẩm",prod_desc:"Hơn 148 mẫu chụp hút, ống gió và bếp nướng trực tiếp",prod_all:"Xem tất cả",prod_detail:"Xem chi tiết",prod_cta_title:"Yêu cầu tư vấn báo giá",prod_cta_desc:"Nhận đề xuất sản phẩm tối ưu cho quy mô và ngành nghề cửa hàng.",prod_cta_btn:"Đăng ký tư vấn",
parts_title:"Linh kiện",parts_all:"Tất cả",
manual_tag:"VISUAL GUIDE",manual_title:"Hướng dẫn sử dụng",manual_maintenance:"MAINTENANCE GUIDE",manual_maint_title:"Hướng dẫn bảo trì",
gallery_tag:"GALLERY",gallery_title:"Công trình thi công",gallery_desc:"Khám phá các công trình USUNG ACE trên toàn quốc.",
process_tag:"OUR PROCESS",process_title:"Quy trình",process_desc:"Dịch vụ trọn gói 4 bước từ khảo sát đến bảo trì",process_step1_title:"Khảo sát / Tư vấn",process_step1_desc:"Chuyên gia 20 năm kinh nghiệm trực tiếp khảo sát quy mô cửa hàng, loại bếp, chiều cao trần. Đề xuất hệ thống hút tối ưu cho môi trường thực tế.",process_step2_title:"Thiết kế & Báo giá",process_step2_desc:"Đề xuất mẫu Galaxy A–D phù hợp nhất, cung cấp bản vẽ và báo giá minh bạch. Thiết kế tùy chỉnh xét đến chiều cao trần, bố trí bếp và lối đi.",process_step3_title:"Sản xuất tại nhà máy",process_step3_desc:"Sản xuất chính xác tại nhà máy USUNG ACE và giao trực tiếp. Từng con ốc đều sản xuất 100% trong nước — niềm tự hào về chất lượng.",process_step4_title:"Lắp đặt & Bảo trì",process_step4_desc:"Kỹ thuật viên chuyên nghiệp lắp đặt + Kiểm tra van chống cháy F.V.D + Hỗ trợ A/S linh kiện sáng chế. Dịch vụ trọn gói chịu trách nhiệm cả sau lắp đặt.",process_cta:"Đăng ký khảo sát miễn phí",
footer_company:"Công ty USUNG ACE",footer_addr:"103, Central Sandan 1-ro, Paju-eup, Paju-si, Gyeonggi-do",footer_tel:"Điện thoại",footer_fax:"FAX",footer_ceo:"Giám đốc",footer_ceo_name:"Lee Jaeun",footer_biz:"Mã số doanh nghiệp",footer_rights:"All rights reserved.",
lang_ko:"한국어",lang_en:"English",lang_ja:"日本語",lang_vi:"Tiếng Việt",lang_zh:"中文"
},

zh:{
nav_home:"首页",nav_about:"公司介绍",nav_products:"产品介绍",nav_parts:"零部件",nav_gallery:"施工案例",nav_tech:"技术",nav_manual:"使用方法",nav_customer:"客户中心",nav_notice:"公告",nav_board:"论坛",nav_archive:"资料室",nav_inquiry:"施工案例 / 报价咨询",nav_contact:"联系我们",nav_core_tech:"核心技术",nav_process:"流程",nav_core_desc:"360°旋转、便捷清洁、FVD防火阀、定制生产",nav_process_desc:"从现场测量到施工及售后，4个步骤",nav_manual_desc:"产品安装与维护可视化指南",nav_notice_desc:"重要公告与活动信息",nav_board_desc:"技术资料、施工案例、产品动态",nav_archive_desc:"专利、认证证书等",nav_inquiry_desc:"按店铺规模定制设计",
hero_tag:"SINCE 2007 · USUNG ACE",hero_title1:"韩国排烟管道",hero_title2:"No.1",hero_sub:"引领今天的驱动力。",hero_scroll1a:"以全新的环境、全新的技术，",hero_scroll1b:"始终领先一步。",hero_scroll2a:"在信任与分享中，",hero_scroll2b:"成为备受喜爱的企业。",
feat1_title:"360°旋转",feat1_desc:"如钟摆般360°自由旋转。管道不固定，无断裂之忧，使用便捷。",feat2_title:"F.V.D 防火阀",feat2_desc:"风速调节兼防火阀，火灾时自动关闭。在200~220℃时闭合，防止火势蔓延。",feat3_title:"可拆卸清洗",feat3_desc:"无需工具，手动拆卸。卫生结构支持每日清洗。一键拆卸上部管道亦可清洁。",feat4_title:"上下伸缩调节",feat4_desc:"按所需长度定制生产。标准L1800规格，可截短或加长。",
fim_tag:"FEATURES IN MOTION",fim_title_a:"通过",fim_title_b:"动态",fim_title_c:"感受细节。",fim_desc:"四大核心技术如何实际运作，静静观看就能感受到。",fim_card1_tag:"01 / SWING",fim_card1_title:"360°自由旋转",fim_card1_desc:"张力螺丝机构实现上下左右360°完全自由旋转。托盘移动，管道始终保持原位。",fim_card2_tag:"02 / CLEAN",fim_card2_title:"一键拆卸清洗",fim_card2_desc:"拧一圈螺丝即可整体拆下上部管道。直接检查并清洗内部油污，支持每日清洁。",fim_card3_tag:"03 / SAFETY",fim_card3_title:"安全与维护选项",fim_card3_desc:"FVD防火阀：200~220℃时阀门关闭防止火灾。一键拆卸便于上部管道清洁。",fim_card4_tag:"04 / CUSTOM",fim_card4_title:"定制化生产",fim_card4_desc:"按您所需的长度定制生产。标准L1800规格，可截短或加长。",
www_tag:"WHERE WE WORK",www_title_a:"在韩国的",www_title_b:"烈焰前方",www_title_c:"。",www_desc:"从连锁餐厅厨房到重工业制造现场、精密实验室——友盛ACE每天守护着无数专业人士的洁净工作环境。",www_case1_tag:"USE CASE 01",www_case1_title:"炭火烤肉店",www_case2_tag:"USE CASE 02",www_case2_title:"鳗鱼·海鲜烧烤",www_case3_tag:"USE CASE 03",www_case3_title:"工厂 / 实验室",
cta_tag:"READY TO START?",cta_title_a:"立即",cta_title_b:"开始",cta_desc:"从现场测量到定制设计、生产、施工，一站式服务。",cta_btn_call:"电话咨询",cta_btn_inquiry:"询价",
tech_tag:"CORE TECHNOLOGY",tech_title:"友盛ACE独有的核心技术",tech_impact:"在自有工厂自主设计与生产。",tech_3d_title:"3D油烟罩系统",tech_stat1_label:"专利技术",tech_stat1_val:"5项+",tech_stat2_label:"产品型号",tech_stat2_val:"148种",tech_stat3_label:"施工范围",tech_stat3_val:"全国",tech_stat4_label:"行业经验",tech_stat4_val:"20年",
about_tag:"ABOUT US",about_title:"友盛ACE",about_ceo_name:"总经理致辞",about_promise:"承诺",about_history:"发展历程",about_location:"交通指南",about_contact_title:"联系我们",
prod_tag:"PRODUCT LINE-UP",prod_title:"产品介绍",prod_desc:"148种以上油烟罩、排烟管道及炭火炉产品线",prod_all:"查看全部",prod_detail:"查看详情",prod_cta_title:"申请报价咨询",prod_cta_desc:"根据您的店铺规模和行业，获取最优产品推荐。",prod_cta_btn:"申请咨询",
parts_title:"零部件介绍",parts_all:"全部",
manual_tag:"VISUAL GUIDE",manual_title:"使用方法",manual_maintenance:"MAINTENANCE GUIDE",manual_maint_title:"维护保养指南",
gallery_tag:"GALLERY",gallery_title:"施工案例",gallery_desc:"浏览全国各地友盛ACE施工现场。",
process_tag:"OUR PROCESS",process_title:"服务流程",process_desc:"从现场测量到施工及售后，4步一站式服务",process_step1_title:"现场测量 / 咨询",process_step1_desc:"拥有20年经验的专家亲临现场，测量店铺规模、灶具类型、天花板高度，为现场环境推荐最优油烟罩系统。",process_step2_title:"定制设计与报价",process_step2_desc:"从Galaxy A~D中推荐最适合的型号，提供图纸和透明报价。综合考虑天花板高度、灶具布局和动线的定制设计。",process_step3_title:"自有工厂制造",process_step3_desc:"在友盛ACE自有工厂精密制造后直发现场。每一颗螺丝都100%国内自主生产，这是对品质的自信。",process_step4_title:"施工与售后",process_step4_desc:"专业技师施工 + F.V.D防火阀检测 + 专利零部件售后支持。施工后仍负责维护保养的一站式服务。",process_cta:"申请免费现场测量",
footer_company:"友盛ACE有限公司",footer_addr:"京畿道坡州市坡州邑中央产业园区1路103号",footer_tel:"电话",footer_fax:"传真",footer_ceo:"总经理",footer_ceo_name:"李在云",footer_biz:"营业执照号",footer_rights:"All rights reserved.",
lang_ko:"한국어",lang_en:"English",lang_ja:"日本語",lang_vi:"Tiếng Việt",lang_zh:"中文"
}
};

var STORAGE_KEY="usung-lang";
var DEFAULT_LANG="ko";

function getLang(){
try{return localStorage.getItem(STORAGE_KEY)||DEFAULT_LANG}catch(e){return DEFAULT_LANG}
}

function setLang(code){
if(!T[code])return;
try{localStorage.setItem(STORAGE_KEY,code)}catch(e){}
var dict=T[code];
var els=document.querySelectorAll("[data-i18n]");
for(var i=0;i<els.length;i++){
var key=els[i].getAttribute("data-i18n");
if(dict[key]!=null)els[i].textContent=dict[key];
}
var phs=document.querySelectorAll("[data-i18n-placeholder]");
for(var j=0;j<phs.length;j++){
var pk=phs[j].getAttribute("data-i18n-placeholder");
if(dict[pk]!=null)phs[j].setAttribute("placeholder",dict[pk]);
}
document.documentElement.setAttribute("lang",code);
var evt;
try{evt=new CustomEvent("langchange",{detail:{lang:code}})}catch(e){evt=document.createEvent("CustomEvent");evt.initCustomEvent("langchange",true,true,{lang:code})}
document.dispatchEvent(evt);
}

window.I18N=T;
window.setLang=setLang;
window.getLang=getLang;

function init(){setLang(getLang())}
if(document.readyState==="loading"){document.addEventListener("DOMContentLoaded",init)}else{init()}
})();
