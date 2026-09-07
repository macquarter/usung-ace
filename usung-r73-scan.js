/* usung-r73-scan.js — 사진의 「진짜 그림이 있는 자리」를 찾는다 (r73 · 관리자 전용)
 *
 * ── 왜 UI 와 파일을 나눴나 ────────────────────────────────────────────
 *   여기 있는 건 **순수 계산**이다 — 이미지를 받아 숫자를 돌려줄 뿐 화면을 안 그린다.
 *   그래서 **혼자 실측할 수 있다**: 콘솔에서 네 장에 돌려 r72 때 잰 값
 *   (불투명 가로 79.3% · 34.4% · 100% · 36.8%)과 대조하면 스캐너가 맞는지 바로 판정된다.
 *   편집기(usung-r73-crop.js)에 섞여 있으면 그 검증을 하려고 모달을 띄워야 한다.
 *   ★ 로드 순서: **이 파일이 먼저**다(crop.js 가 window.r73Scan 을 참조).
 *
 * ── ★ 이 스캐너가 답하는 질문 ───────────────────────────────────────
 *   「PNG 캔버스 안에서 **불투명한 픽셀**이 차지하는 최소 사각형은 어디인가」
 *   r72 에서 드러난 문제가 정확히 이것이었다 — 사진 2·4 는 투명 여백이 **파일 안에 구워져**
 *   있어서 `object-fit:contain` 이 그 여백까지 「그림」으로 센다. 그래서 CSS 로 아무리
 *   오른쪽에 붙여도 보이는 후드는 카드 우단에서 65px 떨어졌다.
 */
(function () {
  'use strict';

  var SCAN_MAX = 360;   // 축소해서 훑는다. 1080x1350 을 그대로 보면 145만 픽셀이라 눈에 띄게 멈춘다.
  var ALPHA_MIN = 12;   // r72 실측에 쓴 것과 같은 문턱. 안티에일리어싱 가장자리를 여백으로 세지 않는다.
  var SAME = 0.99;      // 경계가 이미지의 99% 이상이면 「자를 여백이 없다」로 본다.

  /* 불투명 경계 상자 → 원본 픽셀 좌표. 못 재면 null.
     ★ null 이 나오는 경우는 둘뿐이다: ① 캔버스가 교차출처로 오염됨 ② 전부 투명.
       둘 다 「자동 제거」를 잠그는 게 맞다 — 기계가 모르면 사람에게 넘긴다. */
  function bounds(img) {
    var s = Math.min(1, SCAN_MAX / Math.max(img.width, img.height));
    var w = Math.max(1, Math.round(img.width * s));
    var h = Math.max(1, Math.round(img.height * s));
    var cv = document.createElement('canvas');
    cv.width = w; cv.height = h;
    var cx = cv.getContext('2d', { willReadFrequently: true });
    cx.drawImage(img, 0, 0, w, h);
    var d;
    try { d = cx.getImageData(0, 0, w, h).data; } catch (e) { return null; }

    var x0 = w, y0 = h, x1 = -1, y1 = -1, x, y;
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        if (d[(y * w + x) * 4 + 3] > ALPHA_MIN) {
          if (x < x0) x0 = x;
          if (x > x1) x1 = x;
          if (y < y0) y0 = y;
          if (y > y1) y1 = y;
        }
      }
    }
    if (x1 < 0) return null;

    // 축소 격자 한 칸만큼 넉넉히 되돌린다 — 모자라게 잡으면 그림 가장자리가 깎인다.
    var k = 1 / s;
    var ax = Math.max(0, Math.floor(x0 * k));
    var ay = Math.max(0, Math.floor(y0 * k));
    return {
      x: ax, y: ay,
      w: Math.min(img.width, Math.ceil((x1 + 1) * k)) - ax,
      h: Math.min(img.height, Math.ceil((y1 + 1) * k)) - ay
    };
  }

  /* 캔버스에 **실제로 칠해진** 불투명 픽셀의 오른쪽·아래 끝.
     ★ 왜 필요한가 — 미리보기의 「오른쪽 끝에 닿았나」를 **크롭 네모**로 재면 항상 「닿았다」가 나온다.
       `object-position:bottom right` 라 네모의 오른쪽은 정의상 박스 우단이기 때문이다.
       편집자가 알고 싶은 건 네모가 아니라 **눈에 보이는 후드**의 위치다. r73 음성대조에서 이걸 잡았다. */
  function edges(cx, w, h) {
    var d;
    try { d = cx.getImageData(0, 0, w, h).data; } catch (e) { return null; }
    var x1 = -1, y1 = -1, x, y;
    for (y = 0; y < h; y++) {
      for (x = 0; x < w; x++) {
        if (d[(y * w + x) * 4 + 3] > ALPHA_MIN) {
          if (x > x1) x1 = x;
          if (y > y1) y1 = y;
        }
      }
    }
    return x1 < 0 ? null : { right: x1, bottom: y1 };
  }

  function load(file) {
    return new Promise(function (res, rej) {
      var fr = new FileReader();
      fr.onerror = function () { rej(new Error('파일을 읽지 못했습니다')); };
      fr.onload = function () {
        var im = new Image();
        im.onerror = function () { rej(new Error('이미지를 열지 못했습니다')); };
        im.onload = function () {
          if (!im.width || !im.height) rej(new Error('이미지 크기를 알 수 없습니다'));
          else res(im);
        };
        im.src = fr.result;
      };
      fr.readAsDataURL(file);
    });
  }

  /* 편집기가 열릴 때의 초기 상태. 「여백이 있으면 잘라낸 상태로 시작하고,
     없으면 사진 전체로 시작한다」 — 열자마자 사람이 결과를 보고 판단하게 하려는 것이다. */
  function plan(img) {
    var full = { x: 0, y: 0, w: img.width, h: img.height };
    var auto = bounds(img);
    var hasMargin = !!auto && (auto.w < img.width * SAME || auto.h < img.height * SAME);
    var start = hasMargin ? { x: auto.x, y: auto.y, w: auto.w, h: auto.h }
                          : { x: 0, y: 0, w: img.width, h: img.height };
    return { full: full, auto: auto, hasMargin: hasMargin, crop: start };
  }

  /* URL 로도 잴 수 있게 열어 둔다 — 검증 전용이다(편집기는 File 만 쓴다).
     같은 오리진 이미지여야 getImageData 가 열린다. */
  function measure(url) {
    return new Promise(function (res, rej) {
      var im = new Image();
      im.onerror = function () { rej(new Error('load fail ' + url)); };
      im.onload = function () {
        var b = bounds(im);
        res(b ? {
          url: url, nat: im.width + 'x' + im.height,
          box: b,
          wPct: +(b.w / im.width * 100).toFixed(1),
          hPct: +(b.h / im.height * 100).toFixed(1)
        } : { url: url, nat: im.width + 'x' + im.height, box: null });
      };
      im.src = url;
    });
  }

  window.r73Scan = { bounds: bounds, edges: edges, load: load, plan: plan, measure: measure };
})();
