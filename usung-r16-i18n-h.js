/* usung-r16-i18n-h.js — 시공갤러리 **현장명·라이트박스** 원자 사전 (ko/en/ja/zh/vi)
 * ★ 한 줄 = 한 항목. [한국어, en, ja, zh, vi]
 * ★ 라이트박스 캡션은 `📍 {GALLERY 원문}` 을 그대로 찍는다(usung-r8-gal.js).
 *   그런데 타일 킥(usung-r10.js `siteName()`)은 꼬리표(`설치사진`·`사진`)와 끝자리 숫자를
 *   떼어낸 **정제형**을 쓴다 → 같은 현장이 두 가지 문자열로 화면에 나온다.
 *   그래서 **정제형 원자**와 **원문 변형**을 둘 다 넣는다. 번역문은 동일하다.
 * ★ 현장명 번역은 이미 배포된 `{스타일} · {현장}` 합성 행에서 **그대로 가져왔다**.
 *   새로 짓지 않았으므로 화면 두 곳의 표기가 어긋나지 않는다.
 * ★ GALLERY 의 site 열 절반은 현장이 아니라 **제품 메모**다(`레트로감성`·`450Ø갓등`).
 *   타일 킥은 `NOT_A_PLACE` 로 버리지만 라이트박스는 그대로 찍으므로 번역이 필요하다.
 *   순수 규격형(`450Ø갓등`·`5단유지망` 등)은 usung-r16-i18n-g.js 의 `{n}` 템플릿이 덮는다.
 */
window.__R16D=(window.__R16D||[]).concat([
/* ── 현장명 정제형 (타일 킥 · 합성 분해용 원자) ───────────────────────── */
["도포식당","Dopo Restaurant","トポ食堂","Dopo 餐厅","Nhà hàng Dopo"],
["운정삼겹매장","Unjeong Samgyeop Store","ウンジョン サムギョプ店","云井三层肉店","Cửa hàng thịt ba chỉ Unjeong"],
["온양닥트","Onyang Duct","オニャンダクト","温阳风管","Onyang Duct"],
["육일관구의직영점","Yukilgwan Guui Branch","ユギルグァン クイ直営店","Yukilgwan 九宜直营店","Yukilgwan chi nhánh Guui"],
["도쿄화로인천연수점","Tokyo Hwaro Incheon Yeonsu Branch","東京火炉 インチョン・ヨンス店","东京火炉 仁川延寿店","Tokyo Hwaro chi nhánh Incheon Yeonsu"],
["진원소우대전관평점","Jinwonsou Daejeon Gwanpyeong Branch","チンウォンソウ テジョン・クァンピョン店","Jinwonsou 大田官坪店","Jinwonsou chi nhánh Daejeon Gwanpyeong"],
["연화담","Yeonhwadam","ヨンファダム","Yeonhwadam","Yeonhwadam"],
["직화명가본점","Jikhwa Myeongga Main Store","直火名家 本店","直火名家 总店","Jikhwa Myeongga cơ sở chính"],
["규돈향","Gyudonhyang","ギュドンヒャン","Gyudonhyang","Gyudonhyang"],
["그릴마스터킴","Grill Master Kim","グリルマスターキム","Grill Master Kim","Grill Master Kim"],
["위드휴먼","With Human","ウィズヒューマン","With Human","With Human"],
["홍고박","Honggobak","ホンゴバク","Honggobak","Honggobak"],
["동래정신풍역점","Dongnaejeong Sinpung Station Branch","トンネジョン シンプン駅店","Dongnaejeong 新丰站店","Dongnaejeong chi nhánh ga Sinpung"],
/* ── 현장명 원문 변형 (라이트박스 `📍` 캡션) — 번역은 정제형과 동일 ───── */
["연화담 설치사진","Yeonhwadam","ヨンファダム","Yeonhwadam","Yeonhwadam"],
["운정삼겹매장사진","Unjeong Samgyeop Store","ウンジョン サムギョプ店","云井三层肉店","Cửa hàng thịt ba chỉ Unjeong"],
["규돈향1","Gyudonhyang","ギュドンヒャン","Gyudonhyang","Gyudonhyang"],
["위드휴먼1","With Human","ウィズヒューマン","With Human","With Human"],
["위드휴먼2","With Human","ウィズヒューマン","With Human","With Human"],
["직화명가본점1","Jikhwa Myeongga Main Store","直火名家 本店","直火名家 总店","Jikhwa Myeongga cơ sở chính"],
["직화명가본점3","Jikhwa Myeongga Main Store","直火名家 本店","直火名家 总店","Jikhwa Myeongga cơ sở chính"],
["도쿄화로인천연수점2","Tokyo Hwaro Incheon Yeonsu Branch","東京火炉 インチョン・ヨンス店","东京火炉 仁川延寿店","Tokyo Hwaro chi nhánh Incheon Yeonsu"],
["도쿄화로인천연수점3","Tokyo Hwaro Incheon Yeonsu Branch","東京火炉 インチョン・ヨンス店","东京火炉 仁川延寿店","Tokyo Hwaro chi nhánh Incheon Yeonsu"],
/* ── 현장이 아닌 제품 메모 (라이트박스에만 노출) ─────────────────────── */
["레트로감성","Retro Mood","レトロ感性","复古风格","Phong cách retro"],
["빨간우주선","Red UFO","レッドスペースシップ","红色飞碟","UFO đỏ"],
["아크릴원통등(구형)","Acrylic Cylinder Light (Older Model)","アクリル円筒灯（旧型）","亚克力圆筒灯（旧款）","Đèn trụ acrylic (kiểu cũ)"],
["아크릴원통등(빨강, 노랑)","Acrylic Cylinder Light (Red, Yellow)","アクリル円筒灯（レッド・イエロー）","亚克力圆筒灯（红、黄）","Đèn trụ acrylic (đỏ, vàng)"],
["아크릴원통등(빨강-구형)","Acrylic Cylinder Light (Red, Older Model)","アクリル円筒灯（レッド・旧型）","亚克力圆筒灯（红色 旧款）","Đèn trụ acrylic (đỏ, kiểu cũ)"],
["(90-110)닥트몬스터","(90-110) Duct Monster","(90-110) ダクトモンスター","(90-110) 风管怪兽","(90-110) Duct Monster"],
["(90-110)닥트몬스터1","(90-110) Duct Monster","(90-110) ダクトモンスター","(90-110) 风管怪兽","(90-110) Duct Monster"],
["450Ø갓1","450Ø Shade","450Ø 傘","450Ø 灯罩","Chụp đèn 450Ø"],
/* ★ 중분류가 없는 모델(코브라후드)은 상세모달 이동경로가 `코브라후드 > - >` 로 찍힌다.
 *   조각 `-` 가 사전에 없으면 **경로 전체가 한국어로 남는다** → 한 줄로 뚫어 준다.
 *   번역문이 원문과 같아 엔진의 `nodeValue !== next` 가드가 재기록도 막는다. */
["-","-","-","-","-"],
/* ── 라이트박스 제품줄 `{규격}Ø {구조}` — 실측 11종 중 크기가 붙는 4종만 ────
 * ★ 굳이 `{n}Ø ` 를 **일반 규칙으로 엔진에 넣지 않는다.** 넣으면 `90Ø 각코브라`
 *   같은 **모델 SKU 까지 반쪽 번역**되어 발주 식별자가 깨진다(잔여업무 A-9).
 *   실제로 쓰이는 4종만 템플릿으로 두면 SKU 는 그대로 한국어로 남는다. */
["{n}Ø 양옆태엽 스윙 후드","{n}Ø Dual-Side Spring Swing Hood","{n}Ø 両側ゼンマイ スイングフード","{n}Ø 双侧发条摆动油烟罩","Chụp hút xoay lò xo hai bên {n}Ø"],
["{n}Ø 와이어리스 스윙텐션 후드","{n}Ø Wireless Swing-Tension Hood","{n}Ø ワイヤレススイングテンションフード","{n}Ø 无线摆动张力油烟罩","Chụp hút xoay lực căng không dây {n}Ø"],
["{n}Ø 유성에이스 후드","{n}Ø USUNG ACE Hood","{n}Ø ユソンエースフード","{n}Ø 友盛ACE油烟罩","Chụp hút USUNG ACE {n}Ø"],
["{n}Ø 자바라 신축형 후드","{n}Ø Telescoping Bellows Hood","{n}Ø 蛇腹伸縮式フード","{n}Ø 软管伸缩式油烟罩","Chụp hút ống mềm co giãn {n}Ø"],
]);
