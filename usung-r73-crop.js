/* usung-r73-crop.js — 사진을 올리기 전에 잘라내는 편집기 (r73 · 관리자 전용)
 *
 * 승연: 「b로 갑시다. **관리자에서 직접 크기까지 조정가능하도록 마치 포토샵같이** 말이야.」
 *   (r72 보고의 ⓑ = 「업로드 때 자동 크롭」을 고른 뒤 나온 말이다)
 *
 * ── ★ 왜 「자동」이 아니라 「제안 + 사람 확인」인가 ─────────────────────────
 *   r72 실측: 「국내 최초」 네 PNG 의 불투명 가로 비율이 79.3% · **34.4%** · 100% · **36.8%** 다.
 *   2·4 는 투명 여백이 **파일 안에 구워져** 있고 `object-fit:contain` 이 그걸 「그림」으로 세기 때문에
 *   `right:0` 으로 붙여도 카드 우단에서 65px 떨어진다. **CSS 로는 끝이 없다** — 그래서 여기 왔다.
 *   ★ 그런데 **몰래 잘라 버리면 안 된다.** 서버에 올라가는 건 잘린 것이고 원본은 사라진다.
 *     알파 경계는 그림자가 옅게 깔린 PNG(사진 4)에서 판정이 흔들린다 — 기계가 혼자 정하면
 *     승연이 「왜 다리가 잘렸지」를 나중에 발견하게 된다. **자동은 제안까지만 한다.**
 *
 * ── ★★ 서버를 한 줄도 안 고친다 ────────────────────────────────────────
 *   크롭은 `drawImage(img, sx,sy,sw,sh, 0,0,w,h)` 한 줄이다. 전부 브라우저 안에서 끝난다.
 *   ★ 그리고 **결과를 dataURL 로 만들지 않고 File 로 돌려준다.** 부르는 쪽이
 *     `toPngDataUrl(file)` 을 **그대로** 태우게 하려는 것이다 —
 *     크기 상한(IMG_MAX_EDGE 1600)·PNG 변환·「투명 배경에 흰색을 깔지 않는다」 규칙이
 *     **admin.html 한 곳에만** 남는다. 여기 사본을 두면 반드시 한쪽만 썩는다(KNOWLEDGE 41).
 *
 * ── ★★ `toPngDataUrl()` 을 직접 고치지 않은 이유 ──────────────────────────
 *   그 함수는 **로고 · 제품 사진 215장 · 기술력**이 다 같이 쓰는 단일 관문이다.
 *   거기 크롭을 끼우면 승연이 부탁하지 않은 두 흐름이 같이 바뀐다(제품 사진은 여러 장을
 *   연달아 올리는 일이 있어 매번 편집기가 뜨면 오히려 방해다).
 *   → **`uploadTechPhoto` 에서만 부른다.** 나중에 제품·로고에도 원하면 그때 한 줄 더 붙인다.
 *
 * ── ★ 부르는 쪽이 이 파일 없이도 살아야 한다 ──────────────────────────────
 *   admin.html 은 `typeof window.r73CropPhoto === 'function'` 으로 감싸서 부른다.
 *   그래서 이 파일이 404 여도 **예전처럼 바로 업로드**된다(기능만 없어진다). 되돌리기가 싸다.
 *
 * ── ★ 순수 계산은 `usung-r73-scan.js` 에 있다 ────────────────────────
 *   알파 경계 스캔·초기 상태 계산은 화면을 안 그리므로 **혼자 실측할 수 있게** 떼어 놨다.
 *   ★ 로드 순서: **scan 이 먼저**다. 없으면 편집기를 열지 않고 그냥 통과시킨다(아래 참조).
 *
 * ── 되돌리기 ─────────────────────────────────────────────────────────
 *   이 파일 + `usung-r73-scan.js` + `admin.html` 의 `<script src>` 두 줄 +
 *   `uploadTechPhoto` 안 한 덩어리가 **한 짝**이다.
 *   ★ **신규 파일이라 `git checkout` 으로 안 사라진다** — 커밋 단위로 되돌리거나 손으로 지운다.
 */
(function () {
  'use strict';

  /* 사이트에서 사진이 들어가는 실제 박스. 출처는 usung-r66.css 의 ≥1200px 블록이고
     카드 높이 252 는 usung-r32.css 다. ★ 여기 값이 낡으면 미리보기만 거짓말한다
     (사이트는 자기 CSS 를 본다) — 그래도 거짓 미리보기는 잘못 자르게 만드니 같이 고친다. */
  var BOX_W = 200, BOX_H = 250, CARD_H = 252, PHOTO_RIGHT = 8, CARD_RADIUS = 28;
  var EDIT_MAX_W = 430, EDIT_MAX_H = 380;

  function el(tag, css, html) {
    var n = document.createElement(tag);
    if (css) n.style.cssText = css;
    if (html != null) n.innerHTML = html;
    return n;
  }

  /* ── 본체 ──
     file 하나를 받아 **File 또는 null(취소)** 로 resolve 한다. reject 는 읽기 실패뿐이다. */
  window.r73CropPhoto = function (file) {
    // ★ scan 이 안 실렸으면 편집기를 열지 않고 원본을 그대로 통과시킨다.
    //   두 파일이 짝인데 하나만 배포되는 사고에서 「사진을 못 올린다」가 되면 안 된다.
    if (!window.r73Scan) return Promise.resolve(file);

    return window.r73Scan.load(file).then(function (img) {
      return new Promise(function (resolve) {
        var p = window.r73Scan.plan(img);
        var full = p.full, auto = p.auto, hasMargin = p.hasMargin, crop = p.crop;

        var light = document.body.classList.contains('light');
        var fg = light ? '#1d1d1f' : '#e8ecf4';
        var sub = light ? '#5b6472' : '#98a2b3';
        var panelBg = light ? '#ffffff' : '#151922';
        var line = light ? 'rgba(0,0,0,.12)' : 'rgba(255,255,255,.14)';

        /* ── 껍데기 ── */
        var ov = el('div', 'position:fixed;inset:0;z-index:99999;background:rgba(3,6,12,.74);' +
          'display:flex;align-items:center;justify-content:center;padding:16px;overflow:auto;' +
          '-webkit-backdrop-filter:blur(3px);backdrop-filter:blur(3px)');
        var pan = el('div', 'background:' + panelBg + ';color:' + fg + ';border:1px solid ' + line + ';' +
          'border-radius:16px;padding:18px 20px 16px;max-width:820px;width:100%;' +
          'box-shadow:0 24px 60px rgba(0,0,0,.5);font:14px/1.5 -apple-system,BlinkMacSystemFont,"Apple SD Gothic Neo",sans-serif');

        pan.appendChild(el('div', 'font-size:17px;font-weight:700;margin-bottom:2px', '사진 편집'));
        pan.appendChild(el('div', 'font-size:12.5px;color:' + sub + ';margin-bottom:14px',
          '남길 부분만 네모로 감싸 주세요. 오른쪽이 <b>사이트에 실제로 보이는 모습</b>입니다.'));

        var row = el('div', 'display:flex;gap:20px;flex-wrap:wrap;align-items:flex-start');
        pan.appendChild(row);

        /* ── 왼쪽: 편집 캔버스 ── */
        var vs = Math.min(EDIT_MAX_W / img.width, EDIT_MAX_H / img.height, 1);
        var dw = Math.max(80, Math.round(img.width * vs));
        var dh = Math.max(80, Math.round(img.height * vs));
        vs = dw / img.width;   // 반올림 뒤 실제 배율로 다시 잡는다(좌표 환산이 어긋나면 틀이 튄다)

        var left = el('div', 'flex:0 0 auto');
        var ed = document.createElement('canvas');
        ed.width = dw; ed.height = dh;
        ed.style.cssText = 'display:block;border-radius:10px;border:1px solid ' + line + ';' +
          'touch-action:none;cursor:move;background:' +
          // 투명한 곳이 보이도록 체크무늬를 깐다. 이게 없으면 「여백」이 눈에 안 보인다.
          (light ? '#f2f4f8' : '#0e1116') +
          ' repeating-conic-gradient(' + (light ? '#e6e9ef' : '#1b2029') + ' 0 25%,transparent 0 50%) 0 0/16px 16px';
        left.appendChild(ed);
        left.appendChild(el('div', 'font-size:11.5px;color:' + sub + ';margin-top:7px;text-align:center',
          '네모 안을 끌어 옮기고 · 모서리를 끌어 크기를 바꿉니다'));
        row.appendChild(left);
        var ecx = ed.getContext('2d');

        /* ── 오른쪽: 사이트 미리보기 + 조작부 ── */
        var right = el('div', 'flex:1 1 300px;min-width:290px');
        right.appendChild(el('div', 'font-size:12px;font-weight:600;margin-bottom:6px',
          '사이트에서 보이는 모습 <span style="font-weight:400;color:' + sub + '">(넓은 화면 기준 · 실제 크기)</span>'));
        var pv = document.createElement('canvas');
        pv.width = 300; pv.height = CARD_H;
        pv.style.cssText = 'display:block;border-radius:10px;max-width:100%';
        right.appendChild(pv);
        var pcx = pv.getContext('2d');

        var note = el('div', 'font-size:11.5px;color:' + sub + ';margin:7px 0 12px;min-height:32px');
        right.appendChild(note);

        // 여백 자동 제거
        var wrapAuto = el('label', 'display:flex;gap:8px;align-items:flex-start;font-size:13px;' +
          'margin-bottom:10px;cursor:' + (hasMargin ? 'pointer' : 'default') + ';opacity:' + (hasMargin ? '1' : '.5'));
        var cb = document.createElement('input');
        cb.type = 'checkbox'; cb.checked = hasMargin; cb.disabled = !hasMargin;
        cb.style.cssText = 'margin-top:2px;flex:0 0 auto';
        wrapAuto.appendChild(cb);
        wrapAuto.appendChild(el('span', '', hasMargin
          ? '투명 여백 자동 제거 <span style="color:' + sub + ';font-size:11.5px">— 사진 둘레의 빈 공간을 찾아 잘라냅니다</span>'
          : '<span style="color:' + sub + '">이 사진에는 잘라낼 투명 여백이 없습니다</span>'));
        right.appendChild(wrapAuto);

        // 크기 슬라이더
        var sizeRow = el('div', 'display:flex;gap:10px;align-items:center;font-size:13px;margin-bottom:14px');
        sizeRow.appendChild(el('span', 'flex:0 0 auto;color:' + sub, '크기'));
        var sl = document.createElement('input');
        sl.type = 'range'; sl.min = '15'; sl.max = '100'; sl.step = '1';
        sl.style.cssText = 'flex:1 1 auto;min-width:100px';
        sizeRow.appendChild(sl);
        var slv = el('span', 'flex:0 0 44px;text-align:right;color:' + sub + ';font-variant-numeric:tabular-nums');
        sizeRow.appendChild(slv);
        right.appendChild(sizeRow);

        // 버튼
        var btns = el('div', 'display:flex;gap:8px;flex-wrap:wrap');
        function mkBtn(label, pri) {
          var b = el('button', 'padding:9px 15px;border-radius:9px;font-size:13.5px;cursor:pointer;' +
            'border:1px solid ' + (pri ? 'transparent' : line) + ';' +
            'background:' + (pri ? '#2563EB' : 'transparent') + ';' +
            'color:' + (pri ? '#fff' : fg) + ';font-weight:' + (pri ? '600' : '400'), label);
          b.type = 'button';
          return b;
        }
        var bReset = mkBtn('처음으로');
        var bFull = mkBtn('사진 전체');
        var bCancel = mkBtn('취소');
        var bOk = mkBtn('이 모양으로 올리기', true);
        bOk.style.marginLeft = 'auto';
        btns.appendChild(bReset); btns.appendChild(bFull); btns.appendChild(bCancel); btns.appendChild(bOk);
        right.appendChild(btns);
        row.appendChild(right);

        ov.appendChild(pan);
        document.body.appendChild(ov);

        /* ── 그리기 ── */
        function clamp() {
          // 최소 크기: 원본의 5% 또는 12px 중 큰 쪽. 0 이 되면 drawImage 가 던진다.
          var minW = Math.max(12, Math.round(img.width * 0.05));
          var minH = Math.max(12, Math.round(img.height * 0.05));
          crop.w = Math.max(minW, Math.min(img.width, Math.round(crop.w)));
          crop.h = Math.max(minH, Math.min(img.height, Math.round(crop.h)));
          crop.x = Math.max(0, Math.min(img.width - crop.w, Math.round(crop.x)));
          crop.y = Math.max(0, Math.min(img.height - crop.h, Math.round(crop.y)));
        }

        function drawEditor() {
          ecx.clearRect(0, 0, dw, dh);
          ecx.drawImage(img, 0, 0, dw, dh);
          var rx = crop.x * vs, ry = crop.y * vs, rw = crop.w * vs, rh = crop.h * vs;
          // 바깥을 어둡게 — 남길 곳이 어디인지 한눈에 보이게
          ecx.save();
          ecx.fillStyle = 'rgba(4,8,16,.55)';
          ecx.beginPath();
          ecx.rect(0, 0, dw, dh);
          ecx.rect(rx, ry, rw, rh);
          ecx.fill('evenodd');
          ecx.restore();
          ecx.strokeStyle = '#3B82F6'; ecx.lineWidth = 2;
          ecx.strokeRect(rx + 1, ry + 1, Math.max(1, rw - 2), Math.max(1, rh - 2));
          ecx.fillStyle = '#3B82F6';
          [[rx, ry], [rx + rw, ry], [rx, ry + rh], [rx + rw, ry + rh]].forEach(function (p) {
            ecx.beginPath(); ecx.arc(p[0], p[1], 6, 0, 6.2832); ecx.fill();
            ecx.strokeStyle = '#fff'; ecx.lineWidth = 2; ecx.stroke();
            ecx.strokeStyle = '#3B82F6';
          });
        }

        function drawPreview() {
          var W = pv.width, H = pv.height;
          pcx.clearRect(0, 0, W, H);
          // 카드 — 오른쪽만 진짜 모서리를 그린다(왼쪽은 화면 밖으로 이어진다는 뜻으로 직각).
          pcx.save();
          pcx.beginPath();
          pcx.moveTo(0, 0);
          pcx.lineTo(W - CARD_RADIUS, 0);
          pcx.quadraticCurveTo(W, 0, W, CARD_RADIUS);
          pcx.lineTo(W, H - CARD_RADIUS);
          pcx.quadraticCurveTo(W, H, W - CARD_RADIUS, H);
          pcx.lineTo(0, H);
          pcx.closePath();
          pcx.clip();
          var g = pcx.createLinearGradient(0, 0, W, H);   // usung-r32.css 의 카드 배경 근사
          g.addColorStop(0, '#f7fbff'); g.addColorStop(.38, '#e8f1ff');
          g.addColorStop(.72, '#daeaff'); g.addColorStop(1, '#cfe3ff');
          pcx.fillStyle = g; pcx.fillRect(0, 0, W, H);

          // 사진 박스 — right:8px · bottom:0 (기준선은 padding-box 라 테두리 1px 안쪽이다)
          var bx = W - 1 - PHOTO_RIGHT - BOX_W, by = 1;
          // object-fit:contain + object-position:bottom right
          var k = Math.min(BOX_W / crop.w, BOX_H / crop.h);
          var iw = crop.w * k, ih = crop.h * k;
          var ix = bx + (BOX_W - iw), iy = by + (BOX_H - ih);
          pcx.drawImage(img, crop.x, crop.y, crop.w, crop.h, ix, iy, iw, ih);
          pcx.restore();
          pcx.strokeStyle = 'rgba(59,130,246,.5)'; pcx.lineWidth = 1;
          pcx.strokeRect(.5, .5, W - 1, H - 1);

          // 「오른쪽 끝에 닿았나」 — 승연이 확인하고 싶은 바로 그 숫자를 글로 적는다.
          var gapR = Math.round((W - 1) - (ix + iw));
          var gapB = Math.round((H - 1) - (iy + ih));
          note.innerHTML = gapR <= PHOTO_RIGHT + 1
            ? '<b style="color:#16a34a">오른쪽 끝에 닿았습니다</b> · 아래 여백 ' + gapB + 'px'
            : '오른쪽이 <b style="color:' + (gapR > 30 ? '#dc2626' : fg) + '">' + gapR + 'px</b> 떠 있습니다' +
              (gapR > 30 ? ' — 네모를 사진에 더 바짝 붙이면 줄어듭니다' : '') +
              ' · 아래 여백 ' + gapB + 'px';
        }

        function syncSlider() {
          var v = Math.round(crop.w / img.width * 100);
          sl.value = String(Math.max(15, Math.min(100, v)));
          slv.textContent = sl.value + '%';
        }

        function redraw() { clamp(); drawEditor(); drawPreview(); syncSlider(); }

        /* ── 조작 ── */
        var drag = null;
        function pos(e) {
          var r = ed.getBoundingClientRect();
          // 캔버스가 CSS 로 줄어들 수 있으므로 실제 배율로 환산한다
          return {
            x: (e.clientX - r.left) * (dw / r.width) / vs,
            y: (e.clientY - r.top) * (dh / r.height) / vs
          };
        }
        ed.addEventListener('pointerdown', function (e) {
          var p = pos(e), hit = 15 / vs, i;
          var cs = [[crop.x, crop.y], [crop.x + crop.w, crop.y],
                    [crop.x, crop.y + crop.h], [crop.x + crop.w, crop.y + crop.h]];
          for (i = 0; i < 4; i++) {
            if (Math.abs(p.x - cs[i][0]) < hit && Math.abs(p.y - cs[i][1]) < hit) {
              drag = { mode: 'size', c: i, ax: cs[3 - i][0], ay: cs[3 - i][1] };
              break;
            }
          }
          if (!drag) drag = { mode: 'move', ox: p.x - crop.x, oy: p.y - crop.y };
          ed.setPointerCapture(e.pointerId);
          e.preventDefault();
        });
        ed.addEventListener('pointermove', function (e) {
          if (!drag) {
            return;
          }
          var p = pos(e);
          if (drag.mode === 'move') {
            crop.x = p.x - drag.ox; crop.y = p.y - drag.oy;
          } else {
            // 반대편 모서리를 고정점으로 잡고 자유롭게 늘린다(비율 고정 안 함 —
            // 사진마다 남길 모양이 달라서 묶으면 오히려 못 자른다)
            crop.x = Math.min(drag.ax, p.x); crop.y = Math.min(drag.ay, p.y);
            crop.w = Math.abs(p.x - drag.ax); crop.h = Math.abs(p.y - drag.ay);
          }
          redraw();
        });
        function endDrag(e) {
          if (!drag) return;
          drag = null;
          try { ed.releasePointerCapture(e.pointerId); } catch (x) { }
        }
        ed.addEventListener('pointerup', endDrag);
        ed.addEventListener('pointercancel', endDrag);

        sl.addEventListener('input', function () {
          // 중심을 고정하고 키우거나 줄인다 — 슬라이더로 위치까지 움직이면 방향을 잃는다
          var cxp = crop.x + crop.w / 2, cyp = crop.y + crop.h / 2;
          var target = img.width * (+sl.value / 100);
          var ratio = crop.h / crop.w;
          crop.w = target; crop.h = target * ratio;
          crop.x = cxp - crop.w / 2; crop.y = cyp - crop.h / 2;
          redraw();
        });

        cb.addEventListener('change', function () {
          if (cb.checked && auto) { crop = { x: auto.x, y: auto.y, w: auto.w, h: auto.h }; }
          else { crop = { x: 0, y: 0, w: img.width, h: img.height }; }
          redraw();
        });

        bReset.addEventListener('click', function () {
          crop = hasMargin ? { x: auto.x, y: auto.y, w: auto.w, h: auto.h } : { x: 0, y: 0, w: img.width, h: img.height };
          cb.checked = hasMargin;
          redraw();
        });
        bFull.addEventListener('click', function () {
          crop = { x: full.x, y: full.y, w: full.w, h: full.h };
          cb.checked = false;
          redraw();
        });

        function close(v) {
          document.removeEventListener('keydown', onKey, true);
          if (ov.parentNode) ov.parentNode.removeChild(ov);
          resolve(v);
        }
        function onKey(e) {
          if (e.key === 'Escape') { e.stopPropagation(); close(null); }
        }
        document.addEventListener('keydown', onKey, true);
        bCancel.addEventListener('click', function () { close(null); });
        // 바깥을 눌러도 취소. 패널 안 클릭이 새어 나오지 않게 대상을 확인한다.
        ov.addEventListener('mousedown', function (e) { if (e.target === ov) close(null); });

        bOk.addEventListener('click', function () {
          clamp();
          var out = document.createElement('canvas');
          out.width = crop.w; out.height = crop.h;
          // ★ 흰 배경을 깔지 않는다 — admin.html:2024 와 같은 이유(투명 PNG 가 흰 네모가 된다)
          out.getContext('2d').drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, crop.w, crop.h);
          bOk.disabled = true; bOk.textContent = '준비 중…';
          /* ★ File 로 돌려준다 — 부르는 쪽이 toPngDataUrl() 을 그대로 태우게 하려는 것.
               크기 상한·PNG 변환 규칙이 admin.html 한 곳에만 남는다. */
          if (out.toBlob) {
            out.toBlob(function (b) {
              if (!b) { close(null); return; }
              var f;
              try { f = new File([b], 'crop.png', { type: 'image/png' }); }
              catch (x) { b.name = 'crop.png'; f = b; }   // 구형 사파리: File 생성자가 없다
              close(f);
            }, 'image/png');
          } else {
            // toBlob 이 없는 환경 — dataURL 로 만들어 Blob 으로 바꾼다
            var du = out.toDataURL('image/png');
            var bin = atob(du.slice(du.indexOf('base64,') + 7));
            var arr = new Uint8Array(bin.length);
            for (var i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
            close(new Blob([arr], { type: 'image/png' }));
          }
        });

        redraw();
      });
    });
  };
})();
