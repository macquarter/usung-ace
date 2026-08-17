/* usung-r34-i18n.js — 승연 요청 ⑤「외국어 다시 전체적용」 잔여 구멍 사전 (ko/en/ja/zh/vi)
 *
 * ★ 한 줄 = 한 항목. [한국어, en, ja, zh, vi] — a~i 와 같은 형식이다.
 * ★ 이 파일은 a~i 뒤, 엔진(usung-r16-i18n.js) 앞에 실린다. concat 이라 순서는
 *   사실 무관하지만(엔진이 d.length 변화를 보고 맵을 다시 만든다) 읽는 사람이
 *   「사전 → 엔진」 순서를 기대하므로 그 자리에 넣었다.
 * ★ 되돌리기 = 이 파일 삭제 + inject.js cssLink 아닌 **jsScript** 링크 1줄 삭제.
 *
 * ── 왜 이 항목들이 남아 있었나 ────────────────────────────────────────
 * a~i(538행)는 r8 이식 4개 뷰와 비이식 페이지를 덮었다. 그 뒤 r19~r33 에서
 * **새로 그린 표면**(제품 상세 모달의 색상표·부품 구성·규격표, BEST4 밴드,
 * 기술력 인증 배지)은 사전 갱신 없이 한국어로만 들어갔다. 영어로 바꿔도 그
 * 부분만 한국어로 남는다 — 승연이 본 게 이것이다.
 *
 * ── 엔진 경로별 주의 (usung-r16-i18n.js 를 읽고 확인함) ──────────────
 *  ① applyHtml  : <br>·<b> 를 가진 요소만. innerHTML **완전일치**이고
 *                 compose 폴백이 **없다** → 숫자가 박힌 문장은 그 숫자까지 적어야 한다.
 *                 r19 안내문 3종이 여기 해당(8종·15종은 COLORS 길이에서 확정된 상수다:
 *                 plate 7 · paint 8 · all 15).
 *  ② applyText  : 텍스트 노드. key 는 `\s+→' '` + trim 이라 앞뒤 공백은 무시된다.
 *                 그래서 `<span class="en">COLOR &amp; FINISH</span> 파이프 색상표` 의
 *                 뒤쪽 텍스트 노드는 공백 없이 `파이프 색상표` 한 행이면 맞는다.
 *  ③ applyAttrs : alt·title·placeholder. 기술력 사진 캡션이 여기로도 들어간다.
 *
 * ★ `<span class="en">…</span> 한국어` 헤딩의 한국어부를 번역하면 영어 모드에서
 *   영문이 두 번 보인다. 그런데 이건 **기존 합의**다 — `기본 규격`→Standard
 *   Specifications, `제품 라인업`→Product Lineup 이 이미 그렇게 들어가 있다.
 *   여기서만 다르게 하면 오히려 어긋나므로 관행을 따른다.
 *
 * ★ 용어는 새로 만들지 않고 a~i 에 이미 있는 것을 그대로 가져왔다:
 *   양옆태엽 Side Spring · 기름받이 Grease Collector · 함마 Hammertone
 *   자바라 Bellows · 반후지 Duct Reducer · 롱망 Long Mesh Filter
 *   스텐도금 Stainless Plated · 스텐도장 Stainless Painted · 갓등 Shade Light
 */
window.__R16D=(window.__R16D||[]).concat([

/* ══════ ① 제품 상세 모달 — 파이프 색상표 (usung-r19-parts.js) ══════ */
["파이프 색상표","Pipe Color Chart","パイプカラーチャート","管道色卡","Bảng màu ống"],
["도금","Plated","メッキ","镀层","Mạ"],
["도장","Painted","塗装","喷涂","Sơn"],
/* `<b>8종</b>` 처럼 숫자만 바뀌는 칸 — {n} 템플릿 한 행으로 7/8/15종을 다 덮는다 */
["{n}종","{n} types","{n}種","{n}种","{n} loại"],
/* ↓ <b> 가 들어 있어 applyHtml 경로. innerHTML 을 통째로 적는다 (숫자 포함) */
["이 제품은 <b>도장 마감만</b> 가능합니다. 파이프는 아래 8종 중에서 선택하실 수 있습니다.","This product is available in a <b>painted finish only</b>. The pipe can be chosen from the 8 colors below.","この製品は<b>塗装仕上げのみ</b>可能です。パイプは下記8種からお選びいただけます。","本产品仅提供<b>喷涂饰面</b>。管道可从以下8种中选择。","Sản phẩm này chỉ có <b>hoàn thiện sơn</b>. Ống có thể chọn từ 8 loại dưới đây."],
["이 제품은 <b>파이프 색상만</b> 변경할 수 있습니다. 파이프는 아래 15종 중에서 선택하실 수 있습니다.","Only the <b>pipe color</b> can be changed on this product. The pipe can be chosen from the 15 colors below.","この製品は<b>パイプの色のみ</b>変更できます。パイプは下記15種からお選びいただけます。","本产品仅可更换<b>管道颜色</b>。管道可从以下15种中选择。","Sản phẩm này chỉ có thể thay đổi <b>màu ống</b>. Ống có thể chọn từ 15 loại dưới đây."],
["이 제품은 <b>색상 선택이 가능</b>합니다. 파이프는 아래 15종 마감 중에서 선택하실 수 있습니다.","<b>Color selection is available</b> for this product. The pipe can be chosen from the 15 finishes below.","この製品は<b>色の選択が可能</b>です。パイプは下記15種の仕上げからお選びいただけます。","本产品<b>可选择颜色</b>。管道可从以下15种饰面中选择。","Sản phẩm này <b>có thể chọn màu</b>. Ống có thể chọn từ 15 loại hoàn thiện dưới đây."],
["※ 아크릴(우주선 · 원형) 부분은 색상 변경이 불가합니다.","※ The acrylic sections (Spaceship · Round) cannot be changed in color.","※ アクリル部分（宇宙船・円形）は色の変更ができません。","※ 亚克力部分（飞碟·圆形）无法更换颜色。","※ Phần acrylic (Phi thuyền · Tròn) không thể đổi màu."],
["※ 화면 및 조명 환경에 따라 실제 제품 색상과 차이가 있을 수 있습니다.","※ The actual product color may differ depending on your display and lighting conditions.","※ 画面や照明環境により、実際の製品の色と異なる場合があります。","※ 因显示器及照明环境不同，可能与实际产品颜色存在差异。","※ Màu sắc thực tế có thể khác tùy theo màn hình và điều kiện ánh sáng."],

/* ══════ ② 제품 상세 모달 — 부품 구성 (usung-r19-parts.js) ══════ */
["부품 구성","Parts & Components","部品構成","配件构成","Cấu tạo linh kiện"],
["※ 해당 제품에 사용되는 부품 구성입니다. 설치 환경에 따라 일부 옵션이 달라질 수 있습니다.","※ These are the parts used in this product. Some options may vary depending on the installation environment.","※ 本製品に使用される部品構成です。設置環境により一部オプションが異なる場合があります。","※ 此为本产品所用配件构成。部分选项可能因安装环境而异。","※ Đây là các linh kiện dùng cho sản phẩm này. Một số tùy chọn có thể thay đổi tùy môi trường lắp đặt."],

/* ══════ ③ 제품 상세 모달 — 규격표 (usung-r24.js) ══════
 * ★ r24 는 롤백 판정선이다(CLAUDE.md §4). 이 두 행이 화면에서 사라지면 안 되는데,
 *   번역은 텍스트 노드 **값만** 바꾸므로 행 자체는 그대로 남는다. 판정선 무해. */
["규격(접속경)","Specification (Connection Dia.)","規格（接続径）","规格（接口径）","Quy cách (đường kính nối)"],
["기장","Length","丈","长度","Chiều dài"],
["※ 기장 변경은 별도 문의","※ Contact us separately for length changes","※ 丈の変更は別途お問い合わせください","※ 长度变更请另行咨询","※ Vui lòng liên hệ riêng để thay đổi chiều dài"],
["기본기장 L1800 / 접었을 때 L1200","Standard length L1800 / L1200 when folded","基本丈 L1800 / 折りたたみ時 L1200","基本长度 L1800 / 折叠时 L1200","Chiều dài cơ bản L1800 / L1200 khi gập"],

/* ══════ ④ 기술력 — 인증 배지 (usung-r8-tech.js CBADGES[].s) ══════ */
["전기용품 안전인증","Electrical Appliance Safety Certification","電気用品安全認証","电器产品安全认证","Chứng nhận an toàn thiết bị điện"],
["품질경영시스템 인증","Quality Management System Certification","品質マネジメントシステム認証","质量管理体系认证","Chứng nhận hệ thống quản lý chất lượng"],
["환경경영시스템 인증","Environmental Management System Certification","環境マネジメントシステム認証","环境管理体系认证","Chứng nhận hệ thống quản lý môi trường"],
["식품위생법 준수","Food Sanitation Act Compliance","食品衛生法遵守","符合食品卫生法","Tuân thủ Luật vệ sinh thực phẩm"],
["내구성 / 내열성 / 내식성","Durability / Heat Resistance / Corrosion Resistance","耐久性 / 耐熱性 / 耐食性","耐久性 / 耐热性 / 耐腐蚀性","Độ bền / Chịu nhiệt / Chống ăn mòn"],

/* ══════ ⑤ 기술력 — 특허 칩 (usung-r8-tech.js CERTS[].c) ══════
 * 번호가 두 군데(10-, 뒷자리)라 {n} 템플릿이 안 된다 → 4건 개별 등재. */
["특허 제10-2743423호","Patent No. 10-2743423","特許 第10-2743423号","专利 第10-2743423号","Bằng sáng chế số 10-2743423"],
["특허 제10-2755661호","Patent No. 10-2755661","特許 第10-2755661号","专利 第10-2755661号","Bằng sáng chế số 10-2755661"],
["특허 제10-2889700호","Patent No. 10-2889700","特許 第10-2889700号","专利 第10-2889700号","Bằng sáng chế số 10-2889700"],
["특허 제10-2916160호","Patent No. 10-2916160","特許 第10-2916160号","专利 第10-2916160号","Bằng sáng chế số 10-2916160"],

/* ══════ ⑥ 기술력 — 사진 캡션 (usung-r8-tech.js FIRSTS[].ph) ══════ */
["360° 스윙 적용 현장","360° Swing installation site","360°スイング適用現場","360° 摆动应用现场","Hiện trường ứng dụng xoay 360°"],
["360° 스윙 후드 상세","360° Swing hood detail","360°スイングフード詳細","360° 摆动油烟罩细节","Chi tiết chụp hút xoay 360°"],
["텐션 방식 후드","Tension-type hood","テンション方式フード","张力式油烟罩","Chụp hút kiểu lực căng"],
["외장형 양옆태엽 후드","External Side Spring hood","外装型両側ゼンマイフード","外置式两侧发条油烟罩","Chụp hút lò xo hai bên kiểu ngoài"],

/* ══════ ⑦ BEST4 밴드 (usung-r20.js B4[].cap/.pt) ══════ */
["양옆태엽 FVD · 304 스테인리스","Side Spring FVD · 304 Stainless Steel","両側ゼンマイFVD・304ステンレス","两侧发条FVD · 304不锈钢","Lò xo hai bên FVD · Thép không gỉ 304"],
["새로 추가된 갤럭시B 양옆태엽 신형","Newly added Galaxy B Side Spring model","新たに追加されたギャラクシーB両側ゼンマイ新型","新增的Galaxy B两侧发条新型","Mẫu mới lò xo hai bên Galaxy B vừa bổ sung"],
["양옆태엽(신형) · 125Ø 파이프","Side Spring (new) · 125Ø pipe","両側ゼンマイ（新型）・125Øパイプ","两侧发条（新型）· 125Ø管道","Lò xo hai bên (mới) · Ống 125Ø"],
["공간을 깔끔하게 정리하는 사각 라인","A square line that keeps the space tidy","空間をすっきり整える角形ライン","令空间整洁利落的方形线条","Đường vuông giúp không gian gọn gàng"],
["디자인등 · 사각","Design Light · Square","デザイン灯・角形","造型灯 · 方形","Đèn trang trí · Vuông"],

/* ══════ ⑧ 카테고리 사이드바 (usung-r21.js) ══════
 * 사전엔 화살표가 붙은 `제품 전체 보기 →` 만 있었다. r21 은 화살표 없이 쓴다. */
["제품 전체 보기","View All Products","製品をすべて見る","查看全部产品","Xem tất cả sản phẩm"],

/* ══════ ⑨ 부품명 구멍 (R8_PARTS.nm 36개 중 미등재분 + r32 교정분) ══════
 * ★ `150Ø기름받이` 는 r32 가 런타임에 R8_PARTS.p28 을 교정하며 **새로 생긴** 이름이다
 *   (덱 s2「부품명이 '150Ø기름받이' 단일로 표기」). 정적 파일엔 없어 사전에도 없었다. */
["150Ø기름받이","150Ø Grease Collector","150Øオイル受け","150Ø集油盒","Khay hứng dầu 150Ø"],
["태엽용 반후지","Duct Reducer for Spring","ゼンマイ用レデューサー（異径継手）","发条用变径接头","Côn thu ống gió cho lò xo"],
["코브라 롱망","Cobra Long Mesh Filter","コブラ ロングメッシュフィルター","眼镜蛇长型滤网","Lưới lọc dạng dài Cobra"],
["갓 자바라","Shade Bellows","傘蛇腹","灯罩软管","Ống mềm chụp đèn"],
["장축","Long-Shaft","長軸","长轴","Trục dài"],

/* ══════ ⑩ 색상 스와치 (usung-r29-color.js) ══════
 * 괄호가 붙어 `동함마` 조각 매칭이 안 된다 → 전체 문자열로 등재. */
["하양함마","White Hammertone","ホワイトハンマートーン","白色锤纹","Vân búa trắng"],
["동함마(주물)","Copper Hammertone (Cast)","銅ハンマートーン（鋳物）","铜色锤纹（铸造）","Vân búa đồng (đúc)"],
["동함마(철-스텐으로도 제작 가능-)","Copper Hammertone (steel — stainless also available)","銅ハンマートーン（鉄／ステンでも製作可）","铜色锤纹（铁—亦可用不锈钢制作）","Vân búa đồng (thép — có thể làm bằng inox)"]

]);
