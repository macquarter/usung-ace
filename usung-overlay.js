/* ============================================================
   유성에이스 PPTX 디렉션 오버레이 스크립트
   - 슬라이드 2: 5가지 핵심특징 2번카드 삭제 + 5번 360°스윙 비주얼 2번 자리로
   - 슬라이드 3: 유지망필터 공기 흐름 방향 반전 (위로 상승)
   - 슬라이드 5: 제품 카테고리 7개로 재정렬
   - 슬라이드 6: 제품 상세 레이아웃 (대표사진 + 색상 옵션)
   - 슬라이드 7: 사용방법 유튜브 링크 활성화/비활성화
   ============================================================ */
(function() {
  'use strict';

  const CAT_COLORS = {
    '1. 갤럭시':         { hex:'#3b82f6', text:'text-blue-700',    bg:'bg-blue-50',    border:'border-blue-200',    hover:'hover:bg-blue-50' },
    '2. LED 조명타입':   { hex:'#f59e0b', text:'text-amber-700',   bg:'bg-amber-50',   border:'border-amber-200',   hover:'hover:bg-amber-50' },
    '3. 스텐파이프':     { hex:'#06b6d4', text:'text-cyan-700',    bg:'bg-cyan-50',    border:'border-cyan-200',    hover:'hover:bg-cyan-50' },
    '4. 스파이얼 도장':  { hex:'#10b981', text:'text-emerald-700', bg:'bg-emerald-50', border:'border-emerald-200', hover:'hover:bg-emerald-50' },
    '5. 파이프 기타옵션':{ hex:'#8b5cf6', text:'text-violet-700',  bg:'bg-violet-50',  border:'border-violet-200',  hover:'hover:bg-violet-50' },
    '6. 후레쉬볼':       { hex:'#f97316', text:'text-orange-700',  bg:'bg-orange-50',  border:'border-orange-200',  hover:'hover:bg-orange-50' },
    '7. 하향식 후드':    { hex:'#ef4444', text:'text-red-700',     bg:'bg-red-50',     border:'border-red-200',     hover:'hover:bg-red-50' }
  };
  const CAT_ORDER = Object.keys(CAT_COLORS);

  const COLOR_HEX = {
    '검정':'#0f172a','검정함마':'#1f2937','동':'#a16207','동함마':'#92400e','동도금':'#b45309',
    '실버':'#94a3b8','실버함마':'#64748b','크롬':'#cbd5e1','크롬(은)':'#cbd5e1',
    '신주':'#facc15','신주(금)':'#facc15','신주브론즈':'#a16207','브론즈':'#a16207','동브론즈':'#92400e',
    '하양':'#ffffff','빨강':'#ef4444','주황':'#f97316','노랑':'#fde047','노랑함마':'#eab308','황색함마':'#eab308',
    '초록':'#22c55e','갈색':'#78350f','갈색함마':'#92400e','헤어라인':'#9ca3af','흑도금':'#0f172a',
    '은':'#94a3b8','금':'#facc15'
  };

  function remapCategory(p) {
    const cat = p.cat || '';
    const name = p.name || '';
    const finish = p.finish || '';
    const pipe = p.pipe || '';
    let newCat = '1. 갤럭시', newSub = '';

    if (cat === '갤럭시 A타입') { newCat = '1. 갤럭시'; newSub = '갤럭시A'; }
    else if (cat === '갤럭시 B타입') { newCat = '1. 갤럭시'; newSub = '갤럭시B'; }
    else if (cat === '갤럭시 C타입' || cat === '갤럭시 C타입 원통필터') { newCat = '1. 갤럭시'; newSub = '갤럭시C'; }
    else if (cat === '갤럭시 D타입') { newCat = '1. 갤럭시'; newSub = '갤럭시D'; }
    else if (cat === 'LED조명') { newCat = '2. LED 조명타입'; newSub = 'LED 조명'; }
    else if (cat === 'LED우주선') { newCat = '2. LED 조명타입'; newSub = '우주선/갓등'; }
    else if (cat === '양옆태엽[BEST]') {
      const isSpyul = name.includes('스파이얼') || pipe.includes('스파이얼');
      if (isSpyul) { newCat = '4. 스파이얼 도장'; newSub = '스윙 양옆태엽'; }
      else {
        newCat = '3. 스텐파이프';
        const isDogeum = name.includes('도금') || finish.includes('도금') || name.includes('스텐_');
        newSub = isDogeum ? '도금/스윙 양옆태엽' : '도장/스윙 양옆태엽';
      }
    }
    else if (cat === '파이프') {
      const isMotor = name.includes('모터') || name.includes('측향');
      const isFix = name.includes('고정텐션');
      const isSpyul = name.includes('스파이얼') || finish.includes('스파이얼');
      const isTension = name.includes('텐션');
      const isNaebu = name.includes('내부');
      const isYangyup = name.includes('양옆');
      const isDogeum = name.includes('도금') || finish.includes('도금');
      const isDojang = name.includes('도장') || finish.includes('도장');
      if (isMotor || isFix) { newCat = '5. 파이프 기타옵션'; newSub = isMotor ? '모터' : '고정텐션'; }
      else if (isSpyul) {
        newCat = '4. 스파이얼 도장';
        newSub = isNaebu ? '스윙 내부태엽' : (isYangyup ? '스윙 양옆태엽' : '스윙 텐션');
      } else {
        newCat = '3. 스텐파이프';
        const prefix = isDogeum ? '도금' : (isDojang ? '도장' : '도금');
        newSub = isNaebu ? prefix + '/스윙 내부태엽' : (isYangyup ? prefix + '/스윙 양옆태엽' : prefix + '/스윙 텐션');
      }
    }
    else if (cat === '스파이얼') {
      newCat = '4. 스파이얼 도장';
      const isNaebu = name.includes('내부');
      const isYangyup = name.includes('양옆');
      newSub = isNaebu ? '스윙 내부태엽' : (isYangyup ? '스윙 양옆태엽' : '스윙 텐션');
    }
    else if (cat === '후레쉬볼/주름관' || cat === '후레쉬볼') {
      const isCobra = name.includes('코브라') || name.includes('하향식') || name.includes('망대');
      if (isCobra) { newCat = '7. 하향식 후드'; newSub = '코브라'; }
      else {
        newCat = '6. 후레쉬볼';
        if (name.includes('신형')) newSub = '신형 자바라';
        else if (name.includes('장축')) newSub = '장축 자바라';
        else if (name.includes('자바라')) newSub = '자바라';
        else newSub = '';
      }
    }
    return { cat: newCat, sub: newSub, color: finish.split(',')[0].trim() || '' };
  }

  function getBaseName(name) {
    let n = (name || '').replace(/\s*\(.*?\)\s*/g, '').trim();
    const colorKw = ['검정함마','동함마','실버함마','노랑함마','갈색함마','황색함마','동도금','신주브론즈','신주(금)','신주','크롬(은)','크롬','동브론즈','동','실버','하양','빨강','주황','노랑','초록','갈색','헤어라인','흑도금','검정','은','금','브론즈'];
    for (const c of colorKw) {
      const safe = c.replace(/[()]/g, '\\$&');
      n = n.replace(new RegExp('[\\s_]*' + safe + '[\\s_]*', 'g'), ' ');
    }
    return n.replace(/\s+/g, ' ').trim();
  }

  function applyOverlay() {
    if (!window.ACE_DATA || !window.ACE_DATA.product_lineup) {
      return false;
    }

    window.ACE_DATA.product_lineup.forEach(p => {
      const r = remapCategory(p);
      p.cat = r.cat;
      p.sub = r.sub;
      p.color = r.color;
    });

    if (typeof window.catColor2 === 'object') {
      Object.keys(window.catColor2).forEach(k => delete window.catColor2[k]);
      Object.assign(window.catColor2, {
        '1. 갤럭시':         { text:'text-blue-700',    bg:'bg-blue-50',    border:'border-blue-200',    hex:'#3b82f6' },
        '2. LED 조명타입':   { text:'text-amber-700',   bg:'bg-amber-50',   border:'border-amber-200',   hex:'#f59e0b' },
        '3. 스텐파이프':     { text:'text-cyan-700',    bg:'bg-cyan-50',    border:'border-cyan-200',    hex:'#06b6d4' },
        '4. 스파이얼 도장':  { text:'text-emerald-700', bg:'bg-emerald-50', border:'border-emerald-200', hex:'#10b981' },
        '5. 파이프 기타옵션':{ text:'text-violet-700',  bg:'bg-violet-50',  border:'border-violet-200',  hex:'#8b5cf6' },
        '6. 후레쉬볼':       { text:'text-orange-700',  bg:'bg-orange-50',  border:'border-orange-200',  hex:'#f97316' },
        '7. 하향식 후드':    { text:'text-red-700',     bg:'bg-red-50',     border:'border-red-200',     hex:'#ef4444' }
      });
    }

    const megaList = document.getElementById('mega-cat-list');
    if (megaList) {
      const subDesc = {
        '1. 갤럭시': 'A · B · C · D 타입 (스윙태엽/FVD)',
        '2. LED 조명타입': '갓등 · 우주선 · 아크릴 · 사각',
        '3. 스텐파이프': '도금 · 도장 (양옆/내부/텐션)',
        '4. 스파이얼 도장': '양옆/내부/텐션 시리즈',
        '5. 파이프 기타옵션': '고정텐션 · 사각측향 · 모터류',
        '6. 후레쉬볼': '자바라 · 신형 · 장축',
        '7. 하향식 후드': '코브라 · 망대 · 주물 · 나팔'
      };
      megaList.innerHTML = CAT_ORDER.map(c => {
        const col = CAT_COLORS[c];
        return `<button onclick="navigate('products');setTimeout(()=>filterProducts('${c}'),100)" class="block text-left group w-full p-2 rounded-lg ${col.hover} transition">
          <div class="text-[14px] font-black text-black tracking-tight transition">${c}</div>
          <div class="text-[11px] text-black/45 mt-0.5">${subDesc[c]}</div>
        </button>`;
      }).join('');
    }

    overrideProductGrid();

    const prodTagEls = document.querySelectorAll('[data-i18n="prod_hero_tag"]');
    prodTagEls.forEach(el => el.textContent = 'PRODUCT LINEUP · 7 CATEGORIES');

    const megaTitle = document.getElementById('mega-list-title');
    if (megaTitle) megaTitle.textContent = 'FULL PRODUCT LIST (' + window.ACE_DATA.product_lineup.length + ')';

    const card2Canvas = document.querySelector('#usage-canvas-silent');
    if (card2Canvas) {
      const cardEl = card2Canvas.closest('.group');
      if (cardEl) {
        const h3 = cardEl.querySelector('h3');
        const desc = cardEl.querySelector('p');
        const badge = cardEl.querySelector('.text-emerald-400');
        if (h3) h3.textContent = '360° 자유 스윙';
        if (desc) desc.textContent = '파이프가 고정되어 있지 않고 자유롭게 스윙되어 편리합니다. 시계추 원리로 부드럽게 회전, 파이프 파손 ZERO를 실현합니다.';
        if (badge) {
          const svg = badge.querySelector('svg');
          badge.innerHTML = '';
          if (svg) badge.appendChild(svg);
          badge.appendChild(document.createTextNode(' 파이프 파손 ZERO · 360° 회전'));
        }
        card2Canvas.id = 'usage-canvas-swing-top';
      }
    }

    document.querySelectorAll('[id^="manual-3d-"]').forEach(el => {
      const container = el.parentElement;
      if (!container || container.querySelector('.yt-link-slot')) return;
      const ytSlot = document.createElement('div');
      ytSlot.className = 'yt-link-slot mb-5';
      ytSlot.innerHTML = '<button type="button" disabled aria-disabled="true" title="유튜브 영상 준비 중입니다" class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-200 text-slate-400 text-sm font-bold cursor-not-allowed"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path opacity="0.4" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.5a3 3 0 0 0-2.1 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8z"/><polygon points="9.5,15.6 15.8,12 9.5,8.4" fill="#fff" opacity="0.6"/></svg>영상 준비 중</button>';
      container.insertBefore(ytSlot, el);
    });

    console.log('[usung-overlay] PPTX directions applied');
    return true;
  }

  function overrideProductGrid() {
    const grid = document.getElementById('products-grid');
    const filter = document.getElementById('product-filter');
    if (!grid || !window.ACE_DATA) return;

    let activeCat = '전체';

    function categories() {
      const cats = ['전체'];
      CAT_ORDER.forEach(c => {
        if (window.ACE_DATA.product_lineup.some(p => p.cat === c)) cats.push(c);
      });
      return cats;
    }

    function renderFilter() {
      filter.innerHTML = categories().map(c => {
        const count = c === '전체' ? window.ACE_DATA.product_lineup.length
                                    : window.ACE_DATA.product_lineup.filter(p => p.cat === c).length;
        const active = c === activeCat;
        const col = CAT_COLORS[c] || { text:'text-slate-700', bg:'bg-slate-50', border:'border-slate-200' };
        return '<button data-cat="' + c + '" class="product-cat-btn px-4 py-2 rounded-full text-[13px] font-bold tracking-wide transition border ' +
          (active ? 'bg-slate-900 text-white border-slate-900 shadow-md'
                  : 'bg-white ' + (col.text || 'text-slate-700') + ' ' + (col.border || 'border-slate-200') + ' hover:border-slate-400') +
          '">' + c + ' <span class="opacity-60 ml-1">' + count + '</span></button>';
      }).join('');
      filter.querySelectorAll('.product-cat-btn').forEach(btn => {
        btn.addEventListener('click', () => { activeCat = btn.dataset.cat; renderFilter(); renderGrid(); });
      });
    }

    function renderGrid() {
      const filtered = activeCat === '전체' ? window.ACE_DATA.product_lineup
                                              : window.ACE_DATA.product_lineup.filter(p => p.cat === activeCat);
      const emptyEl = document.getElementById('products-empty');
      if (emptyEl) emptyEl.classList.toggle('hidden', filtered.length > 0);

      const groups = {};
      filtered.forEach(p => {
        const baseName = getBaseName(p.name) || p.cat;
        const key = p.cat + '__' + (p.sub || '') + '__' + baseName;
        if (!groups[key]) groups[key] = { cat: p.cat, sub: p.sub, baseName: baseName, items: [] };
        groups[key].items.push(p);
      });

      grid.innerHTML = Object.values(groups).map(g => {
        const col = CAT_COLORS[g.cat] || { hex:'#94a3b8' };
        const main = g.items[0];
        const variants = g.items;
        const colorOptionsHtml = variants.length > 1 ? (
          '<div class="mb-3"><div class="text-[10px] font-bold text-slate-500 mb-1.5">색상 옵션 (' + variants.length + ')</div><div class="flex flex-wrap gap-1.5">' +
          variants.map(v => {
            const label = v.color || v.finish || '기본';
            const dot = COLOR_HEX[label] || COLOR_HEX[label.split(',')[0]] || '#94a3b8';
            const ring = dot === '#ffffff' ? 'border:1px solid #cbd5e1;' : '';
            return '<div title="' + label + '" class="flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-100 border border-slate-200"><span class="w-2.5 h-2.5 rounded-full inline-block" style="background:' + dot + ';' + ring + '"></span><span class="text-[9px] font-semibold text-slate-700">' + label + '</span></div>';
          }).join('') + '</div></div>'
        ) : (main.finish ? '<div class="flex flex-wrap gap-1 mb-2">' + main.finish.split(',').map(t => '<span class="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">' + t.trim() + '</span>').join('') + '</div>' : '');

        return '<article class="group relative rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-slate-400 hover:shadow-xl transition-all duration-300 flex flex-col">' +
          '<div class="relative aspect-square overflow-hidden bg-slate-50">' +
            '<img src="' + main.img + '" alt="' + g.baseName + '" loading="lazy" class="absolute inset-0 w-full h-full object-contain p-4 transition-transform duration-700 group-hover:scale-110" onerror="this.style.display=\'none\'" />' +
            '<div class="absolute top-3 left-3"><span class="text-[10px] font-bold px-2.5 py-1 rounded-full text-white shadow" style="background:' + col.hex + ';">' + g.cat + '</span></div>' +
            (g.sub ? '<div class="absolute top-3 right-3"><span class="text-[10px] font-bold px-2.5 py-1 rounded-full bg-white/90 backdrop-blur border border-slate-200 text-slate-700">' + g.sub + '</span></div>' : '') +
            (variants.length > 1 ? '<div class="absolute bottom-3 right-3 text-[10px] font-bold px-2 py-1 rounded-full bg-slate-900 text-white shadow">' + variants.length + '색상</div>' : '') +
          '</div>' +
          '<div class="p-4 flex-1 flex flex-col">' +
            '<h3 class="text-[14px] font-black tracking-tight text-slate-900 leading-snug mb-3 line-clamp-2">' + g.baseName + '</h3>' +
            colorOptionsHtml +
            '<div class="mt-auto pt-3 border-t border-slate-100 flex items-center justify-between text-[11px]">' +
              '<span class="text-slate-400 font-semibold">USUNG ACE</span>' +
              '<a href="tel:1588-9123" class="font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1">상담 문의 <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></a>' +
            '</div>' +
          '</div>' +
        '</article>';
      }).join('');

      grid.classList.remove('in');
      void grid.offsetWidth;
      grid.classList.add('in');
    }

    window.filterProducts = function(cat) { activeCat = cat; renderFilter(); renderGrid(); };
    renderFilter();
    renderGrid();
  }

  function init() {
    let attempts = 0;
    const maxAttempts = 50;
    const iv = setInterval(() => {
      attempts++;
      if (applyOverlay() || attempts >= maxAttempts) clearInterval(iv);
    }, 200);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
