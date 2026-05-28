/* ============================================================
   유성에이스 PPTX 디렉션 오버레이 v5 (최종)
   - 메가메뉴 hover 롤백 방지 (MutationObserver + megaHoverCat 오버라이드)
   - 제품 카드 클릭 시 상세 모달 (대표 이미지 + 색상별 썸네일 그리드)
   - 화이트 테마 전면 보완
   ============================================================ */
(function() {
  'use strict';
  console.log('[usung-overlay v5] loaded');

  const CAT_COLORS = {
    '1. 갤럭시':         { hex:'#3b82f6', subs:['갤럭시A','갤럭시B','갤럭시C','갤럭시D'], desc:'A · B · C · D 타입 (스윙태엽/FVD/유지망)' },
    '2. LED 조명타입':   { hex:'#f59e0b', subs:['LED 조명','우주선/갓등'], desc:'갓등 · 우주선 · 아크릴 · 사각등' },
    '3. 스텐파이프':     { hex:'#06b6d4', subs:['도금/스윙 양옆태엽','도금/스윙 내부태엽','도금/스윙 텐션','도장/스윙 양옆태엽','도장/스윙 내부태엽','도장/스윙 텐션'], desc:'도금 · 도장 (양옆/내부/텐션)' },
    '4. 스파이얼 도장':  { hex:'#10b981', subs:['스윙 양옆태엽','스윙 내부태엽','스윙 텐션'], desc:'양옆/내부/텐션 시리즈' },
    '5. 파이프 기타옵션':{ hex:'#8b5cf6', subs:['고정텐션','모터'], desc:'고정텐션 · 사각측향 · 모터류' },
    '6. 후레쉬볼':       { hex:'#f97316', subs:['자바라','신형 자바라','장축 자바라'], desc:'자바라 · 신형 · 장축' },
    '7. 하향식 후드':    { hex:'#ef4444', subs:['코브라'], desc:'코브라 · 망대 · 주물 · 나팔' }
  };
  const CAT_ORDER = Object.keys(CAT_COLORS);

  const COLOR_HEX = {
    '검정':'#0f172a','검정함마':'#1f2937','동':'#a16207','동함마':'#92400e','동도금':'#b45309',
    '실버':'#94a3b8','실버함마':'#64748b','크롬':'#cbd5e1','크롬(은)':'#cbd5e1',
    '신주':'#facc15','신주(금)':'#facc15','신주브론즈':'#a16207','브론즈':'#a16207','동브론즈':'#92400e',
    '하양':'#ffffff','빨강':'#ef4444','주황':'#f97316','노랑':'#fde047','노랑함마':'#eab308','황색함마':'#eab308',
    '초록':'#22c55e','갈색':'#78350f','갈색함마':'#92400e','헤어라인':'#9ca3af','흑도금':'#0f172a',
    '은':'#94a3b8','금':'#facc15','304스텐':'#cbd5e1'
  };

  function getAceData() {
    try { return typeof ACE_DATA !== 'undefined' ? ACE_DATA : (window.ACE_DATA || null); } catch(e) { return null; }
  }

  function remap(p) {
    const cat = p.cat || '', name = p.name || '', finish = p.finish || '', pipe = p.pipe || '';
    let newCat='1. 갤럭시', newSub='';
    if (cat==='갤럭시 A타입'){newCat='1. 갤럭시';newSub='갤럭시A';}
    else if (cat==='갤럭시 B타입'){newCat='1. 갤럭시';newSub='갤럭시B';}
    else if (cat==='갤럭시 C타입'||cat==='갤럭시 C타입 원통필터'){newCat='1. 갤럭시';newSub='갤럭시C';}
    else if (cat==='갤럭시 D타입'){newCat='1. 갤럭시';newSub='갤럭시D';}
    else if (cat==='LED조명'){newCat='2. LED 조명타입';newSub='LED 조명';}
    else if (cat==='LED우주선'){newCat='2. LED 조명타입';newSub='우주선/갓등';}
    else if (cat==='양옆태엽[BEST]'){
      const isSpyul = name.includes('스파이얼')||pipe.includes('스파이얼');
      if (isSpyul){newCat='4. 스파이얼 도장';newSub='스윙 양옆태엽';}
      else {newCat='3. 스텐파이프'; const isDog=name.includes('도금')||finish.includes('도금')||name.includes('스텐_'); newSub=isDog?'도금/스윙 양옆태엽':'도장/스윙 양옆태엽';}
    }
    else if (cat==='파이프'){
      const isMotor=name.includes('모터')||name.includes('측향'), isFix=name.includes('고정텐션');
      const isSpyul=name.includes('스파이얼')||finish.includes('스파이얼');
      const isN=name.includes('내부'), isY=name.includes('양옆');
      const isDog=name.includes('도금')||finish.includes('도금'), isJang=name.includes('도장')||finish.includes('도장');
      if (isMotor||isFix){newCat='5. 파이프 기타옵션';newSub=isMotor?'모터':'고정텐션';}
      else if (isSpyul){newCat='4. 스파이얼 도장'; newSub=isN?'스윙 내부태엽':(isY?'스윙 양옆태엽':'스윙 텐션');}
      else {newCat='3. 스텐파이프'; const px=isDog?'도금':(isJang?'도장':'도금'); newSub=isN?(px+'/스윙 내부태엽'):(isY?(px+'/스윙 양옆태엽'):(px+'/스윙 텐션'));}
    }
    else if (cat==='스파이얼'){newCat='4. 스파이얼 도장'; const isN=name.includes('내부'),isY=name.includes('양옆'); newSub=isN?'스윙 내부태엽':(isY?'스윙 양옆태엽':'스윙 텐션');}
    else if (cat==='후레쉬볼/주름관'||cat==='후레쉬볼'){
      const isCobra=name.includes('코브라')||name.includes('하향식')||name.includes('망대');
      if (isCobra){newCat='7. 하향식 후드';newSub='코브라';}
      else {newCat='6. 후레쉬볼'; if(name.includes('신형'))newSub='신형 자바라';else if(name.includes('장축'))newSub='장축 자바라';else if(name.includes('자바라'))newSub='자바라';}
    }
    return {cat:newCat, sub:newSub, color:(finish.split(',')[0]||'').trim()};
  }

  function baseName(name) {
    let n = (name||'').replace(/\s*\(.*?\)\s*/g,' ').trim();
    ['검정함마','동함마','실버함마','노랑함마','갈색함마','황색함마','동도금','신주브론즈','신주(금)','신주','크롬(은)','크롬','동브론즈','동','실버','하양','빨강','주황','노랑','초록','갈색','헤어라인','흑도금','검정','은','금','브론즈'].forEach(c=>{
      const safe = c.replace(/[()]/g,'\\$&');
      n = n.replace(new RegExp('[\\s_]*'+safe+'[\\s_]*','g'),' ');
    });
    return n.replace(/\s+/g,' ').trim();
  }

  function killMegaHoverCat() {
    if (typeof window.megaHoverCat === 'function' && !window._megaHoverKilled) {
      window._origMegaHoverCat = window.megaHoverCat;
      window.megaHoverCat = function() { /* no-op — v5 keeps 7-category view */ };
      window._megaHoverKilled = true;
    }
  }

  let _megaObserver = null;
  function patchMegaMenu() {
    const list = document.getElementById('mega-cat-list');
    if (!list) return false;

    if (list.dataset.patched !== 'v5') {
      list.innerHTML = CAT_ORDER.map(c => {
        const meta = CAT_COLORS[c];
        return '<button onclick="navigate(\'products\');setTimeout(()=>window.filterProducts&&window.filterProducts(\''+c+'\'),120);" class="block text-left group w-full p-2.5 rounded-lg hover:bg-slate-50 transition">'+
          '<div class="text-[14px] font-black tracking-tight" style="color:'+meta.hex+';">'+c+'</div>'+
          '<div class="text-[11px] text-slate-500 mt-0.5">'+meta.desc+'</div>'+
        '</button>';
      }).join('');
      list.dataset.patched = 'v5';
    }

    const megaList = document.getElementById('mega-menu-list');
    if (megaList) {
      if (megaList.dataset.patched !== 'v5') {
        megaList.innerHTML = CAT_ORDER.map(c => {
          const meta = CAT_COLORS[c];
          return '<div class="py-1.5"><div class="text-[12px] font-black mb-1" style="color:'+meta.hex+';">'+c+'</div>'+
            '<div class="space-y-0.5">' + (meta.subs.length ? meta.subs.map(s =>
              '<button onclick="navigate(\'products\');setTimeout(()=>window.filterProducts&&window.filterProducts(\''+c+'\'),120);" class="block text-left w-full text-[12px] text-slate-700 hover:text-blue-600 py-0.5 px-1.5 rounded hover:bg-slate-50">'+s+'</button>'
            ).join('') : '<div class="text-[11px] text-slate-400 px-1.5">전체 보기 →</div>') + '</div></div>';
        }).join('');
        megaList.dataset.patched = 'v5';
        const t = document.getElementById('mega-list-title');
        if (t) t.textContent = '7 CATEGORIES · ALL PRODUCTS';

        if (!_megaObserver) {
          _megaObserver = new MutationObserver(function() {
            if (megaList.dataset.patched !== 'v5' || megaList.children.length < CAT_ORDER.length) {
              megaList.dataset.patched = '';
              patchMegaMenu();
            }
          });
          _megaObserver.observe(megaList, { childList: true });
        }
      }
    }
    return true;
  }

  function patchFeaturesSection() {
    document.querySelectorAll('h2').forEach(h => {
      if (h.textContent.includes('5가지 핵심 특징')) {
        h.querySelectorAll('span').forEach(s => {
          if (s.textContent.includes('5가지')) s.textContent = s.textContent.replace('5가지','4가지');
        });
      }
    });
    const card2 = document.querySelector('#usage-canvas-silent');
    if (card2) {
      const wrapper = card2.closest('.group');
      if (wrapper && !wrapper.dataset.removed) {
        wrapper.style.display = 'none';
        wrapper.dataset.removed = '1';
      }
    }
    const swingCanvas = document.querySelector('#usage-canvas-swing');
    if (swingCanvas) {
      const swingCard = swingCanvas.closest('.group');
      if (swingCard && !swingCard.dataset.repositioned) {
        swingCard.classList.remove('md:col-span-2');
        const innerGrid = swingCard.querySelector('.grid.grid-cols-1.md\\:grid-cols-2');
        if (innerGrid) { innerGrid.classList.remove('md:grid-cols-2'); innerGrid.classList.add('block'); }
        const badge = swingCard.querySelector('.bg-blue-500\\/20');
        if (badge) badge.textContent = '02';
        const oilCard = document.querySelector('#usage-canvas-oil')?.closest('.group');
        if (oilCard && oilCard.parentElement) oilCard.parentElement.insertBefore(swingCard, oilCard.nextSibling);
        swingCard.dataset.repositioned = '1';
      }
    }
  }

  function patchNavbar() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    if (nav.dataset.patched === 'v5') return;

    function applyNavColors() {
      const isHome = document.getElementById('page-home') && document.getElementById('page-home').classList.contains('active');
      const scrolled = window.scrollY > 60;
      const dark = isHome && !scrolled;
      if (dark) { nav.style.background = 'transparent'; nav.style.borderBottom = ''; }
      else {
        nav.style.background = 'rgba(255,255,255,0.96)';
        nav.style.backdropFilter = 'blur(20px)';
        nav.style.borderBottom = '1px solid rgba(15,23,42,0.06)';
      }
      nav.querySelectorAll('.nav-link, .nav-link span, .nav-link svg').forEach(el => { el.style.color = dark ? '#ffffff' : '#0f172a'; });
      nav.querySelectorAll('button').forEach(btn => {
        if (btn.closest('#mobile-menu')) return;
        if (btn.classList.contains('bg-black')) {
          btn.style.background = dark ? '#ffffff' : '#0f172a';
          btn.style.color = dark ? '#0f172a' : '#ffffff';
        } else if (!btn.classList.contains('nav-link')) {
          btn.style.color = dark ? '#ffffff' : '#0f172a';
        }
      });
      const navLogo = document.getElementById('nav-logo');
      if (navLogo) navLogo.style.opacity = '1';
    }
    applyNavColors();
    window.addEventListener('scroll', applyNavColors, { passive: true });
    new MutationObserver(applyNavColors).observe(document.body, { subtree: false, attributes: true, attributeFilter: ['class'] });
    nav.dataset.patched = 'v5';
  }

  function ensureProductModal() {
    let modal = document.getElementById('ace-product-modal');
    if (modal) return modal;
    modal = document.createElement('div');
    modal.id = 'ace-product-modal';
    modal.className = 'fixed inset-0 z-[9999] hidden';
    modal.innerHTML =
      '<div class="absolute inset-0 bg-black/60 backdrop-blur-sm" onclick="window.closeProductModal()"></div>' +
      '<div class="absolute inset-0 flex items-center justify-center p-4 overflow-y-auto">' +
        '<div class="relative bg-white rounded-3xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">' +
          '<button onclick="window.closeProductModal()" class="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center transition">' +
            '<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0f172a" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
          '</button>' +
          '<div id="ace-product-modal-body" class="p-8 md:p-10"></div>' +
        '</div>' +
      '</div>';
    document.body.appendChild(modal);
    window.closeProductModal = function() { modal.classList.add('hidden'); document.body.style.overflow = ''; };
    return modal;
  }

  function openProductModal(group, opts) {
    const modal = ensureProductModal();
    const body = document.getElementById('ace-product-modal-body');
    const meta = CAT_COLORS[group.cat] || { hex:'#94a3b8' };
    const variants = group.items;
    let selectedIdx = (opts && opts.selectedIdx) || 0;

    function render() {
      const sel = variants[selectedIdx];
      const colorOptionsHtml = variants.map((v, i) => {
        const label = v.color || v.finish || '기본';
        const isSel = i === selectedIdx;
        return '<button data-idx="'+i+'" class="ace-variant-btn group relative aspect-square rounded-lg overflow-hidden border-2 transition '+(isSel?'border-blue-600 shadow-lg':'border-slate-200 hover:border-slate-400')+'" style="background:#fafafa;">' +
          '<img src="'+v.img+'" alt="'+label+'" loading="lazy" class="absolute inset-0 w-full h-full object-contain p-1.5" onerror="this.style.display=\'none\'" />' +
          '<div class="absolute bottom-0 inset-x-0 text-[8px] font-bold text-center py-0.5 px-0.5 bg-white/95 text-slate-700 truncate">'+label+'</div>' +
        '</button>';
      }).join('');

      body.innerHTML =
        '<div class="flex items-center gap-2 text-[13px] text-slate-500 mb-6">' +
          '<span class="hover:text-slate-700 cursor-pointer">Home</span>' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>' +
          '<span class="hover:text-slate-700 cursor-pointer">제품소개</span>' +
          '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg>' +
          '<span class="hover:text-slate-700 cursor-pointer" style="color:'+meta.hex+'">'+group.cat+'</span>' +
          (group.sub ? '<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="m9 18 6-6-6-6"/></svg><span class="font-bold text-slate-900">'+group.sub+'</span>' : '') +
        '</div>' +
        '<div class="grid grid-cols-1 md:grid-cols-2 gap-8 mb-6">' +
          '<div class="relative aspect-square bg-slate-50 rounded-2xl overflow-hidden flex items-center justify-center">' +
            '<img id="ace-modal-main-img" src="'+sel.img+'" alt="'+group.name+'" class="max-w-full max-h-full object-contain p-6" />' +
          '</div>' +
          '<div class="flex flex-col">' +
            '<div class="mb-2"><span class="text-[10px] font-bold tracking-[0.2em] text-white px-2 py-0.5 rounded" style="background:'+meta.hex+';">'+group.cat+'</span>' +
            (group.sub ? ' <span class="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 ml-1">'+group.sub+'</span>' : '') + '</div>' +
            '<h2 class="text-2xl md:text-3xl font-black tracking-tight text-slate-900 mb-3">'+group.name+'</h2>' +
            '<div class="text-xl font-bold text-slate-700 mb-4">가격문의 <span class="text-sm font-normal text-slate-500">(상세정보 참조)</span></div>' +
            '<div class="text-sm text-slate-600 leading-relaxed mb-6 space-y-1">' +
              '<p>뛰어난 품질과 다양한 색상으로 구성된 유성에이스 제품입니다.</p>' +
              '<p>기장 추가 제작은 문의해 주시면 안내해 드리며, 모든 제품은 분리형으로 주문하실 수 있습니다.</p>' +
              '<p>이동식 설치 시 이동식 바퀴를 부착해 사용하실 것을 권장드립니다.</p>' +
            '</div>' +
            '<div class="bg-slate-50 rounded-xl p-4 mb-6">' +
              '<div class="grid grid-cols-[80px_1fr] gap-y-2 text-sm">' +
                '<span class="text-slate-500 font-semibold">상품</span><span class="text-slate-900">유성에이스 정품</span>' +
                '<span class="text-slate-500 font-semibold">원산지</span><span class="text-slate-900 font-bold">대한민국</span>' +
                (sel.color ? '<span class="text-slate-500 font-semibold">선택 색상</span><span class="text-slate-900 font-bold">'+sel.color+'</span>' : '') +
              '</div>' +
            '</div>' +
            '<div class="flex gap-2 mt-auto">' +
              '<a href="tel:1588-9123" class="flex-1 px-5 py-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white text-sm font-bold transition text-center">📞 상담 문의 (1588-9123)</a>' +
              '<button onclick="window.closeProductModal()" class="px-5 py-3 rounded-full border border-slate-300 text-slate-700 text-sm font-bold hover:bg-slate-50 transition">닫기</button>' +
            '</div>' +
          '</div>' +
        '</div>' +
        (variants.length > 1 ?
          '<div class="border-t border-slate-200 pt-6">' +
            '<div class="flex items-center justify-between mb-3">' +
              '<div class="text-sm font-bold text-slate-700">색상 옵션 <span class="text-blue-600">'+variants.length+'</span>종</div>' +
              '<div class="text-xs text-slate-500">클릭하여 다른 색상 보기</div>' +
            '</div>' +
            '<div class="grid grid-cols-5 sm:grid-cols-7 md:grid-cols-9 gap-2">' + colorOptionsHtml + '</div>' +
          '</div>' : '');

      body.querySelectorAll('.ace-variant-btn').forEach(btn => {
        btn.onclick = function() { selectedIdx = parseInt(btn.dataset.idx); render(); };
      });
    }

    render();
    modal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }
  window.openProductModal = openProductModal;

  function renderProductPage() {
    const ACE = getAceData();
    if (!ACE || !ACE.product_lineup) return false;
    const grid = document.getElementById('products-grid');
    const filter = document.getElementById('product-filter');
    if (!grid || !filter) return false;
    if (grid.dataset.patched === 'v5') return true;

    if (!ACE._remapped_v5) {
      ACE.product_lineup.forEach(p => { const r = remap(p); p.cat = r.cat; p.sub = r.sub; p.color = r.color; });
      ACE._remapped_v5 = true;
    }
    let activeCat = '전체', activeSub = '', activeColor = '';

    function categories() {
      const cats = ['전체'];
      CAT_ORDER.forEach(c => { if (ACE.product_lineup.some(p => p.cat === c)) cats.push(c); });
      return cats;
    }
    function subsFor(cat) {
      if (cat === '전체') return [];
      const meta = CAT_COLORS[cat]; if (!meta) return [];
      const inCat = ACE.product_lineup.filter(p => p.cat === cat);
      return meta.subs.filter(s => inCat.some(p => p.sub === s));
    }
    function colorsFor(cat, sub) {
      let items = ACE.product_lineup;
      if (cat !== '전체') items = items.filter(p => p.cat === cat);
      if (sub) items = items.filter(p => p.sub === sub);
      return [...new Set(items.map(p => p.color).filter(Boolean))];
    }

    function renderFilters() {
      const cats = categories();
      let html = '<div class="text-[10px] font-bold tracking-[0.2em] text-slate-400 mb-2">대분류 · MAIN</div>';
      html += '<div class="flex flex-wrap gap-2 mb-5">' + cats.map(c => {
        const active = c === activeCat;
        const meta = CAT_COLORS[c];
        const bg = active ? (meta ? meta.hex : '#0f172a') : '#ffffff';
        const fg = active ? '#ffffff' : '#475569';
        return '<button data-cat="'+c+'" class="ace-cat-btn px-4 py-2 rounded-full text-[12px] font-bold border transition" style="background:'+bg+';color:'+fg+';border-color:'+(active?bg:'#e2e8f0')+';">'+c+' <span style="opacity:.7">'+(c==='전체'?ACE.product_lineup.length:ACE.product_lineup.filter(p=>p.cat===c).length)+'</span></button>';
      }).join('') + '</div>';

      const subs = subsFor(activeCat);
      if (subs.length) {
        html += '<div class="text-[10px] font-bold tracking-[0.2em] text-slate-400 mb-2">중분류 · 제품별</div>';
        html += '<div class="flex flex-wrap gap-2 mb-5">' +
          '<button data-sub="" class="ace-sub-btn px-3 py-1.5 rounded-full text-[11px] font-bold border transition" style="background:'+(activeSub===''?'#0f172a':'#fff')+';color:'+(activeSub===''?'#fff':'#475569')+';border-color:'+(activeSub===''?'#0f172a':'#e2e8f0')+';">전체</button>' +
          subs.map(s => {
            const active = s === activeSub;
            return '<button data-sub="'+s+'" class="ace-sub-btn px-3 py-1.5 rounded-full text-[11px] font-bold border transition" style="background:'+(active?'#0f172a':'#fff')+';color:'+(active?'#fff':'#475569')+';border-color:'+(active?'#0f172a':'#e2e8f0')+';">'+s+'</button>';
          }).join('') + '</div>';
      }

      const colors = colorsFor(activeCat, activeSub);
      if (colors.length) {
        html += '<div class="text-[10px] font-bold tracking-[0.2em] text-slate-400 mb-2">소분류 · 칼라별</div>';
        html += '<div class="flex flex-wrap gap-2 mb-5">' +
          '<button data-color="" class="ace-color-btn px-3 py-1.5 rounded-full text-[11px] font-bold border transition flex items-center gap-1.5" style="background:'+(activeColor===''?'#0f172a':'#fff')+';color:'+(activeColor===''?'#fff':'#475569')+';border-color:'+(activeColor===''?'#0f172a':'#e2e8f0')+';"><span class="w-2.5 h-2.5 rounded-full inline-block" style="background:linear-gradient(45deg,#3b82f6,#ef4444,#22c55e);"></span>전체</button>' +
          colors.map(c => {
            const active = c === activeColor;
            const dot = COLOR_HEX[c] || '#94a3b8';
            const ring = dot === '#ffffff' ? 'border:1px solid #cbd5e1;' : '';
            return '<button data-color="'+c+'" class="ace-color-btn px-3 py-1.5 rounded-full text-[11px] font-bold border transition flex items-center gap-1.5" style="background:'+(active?'#0f172a':'#fff')+';color:'+(active?'#fff':'#475569')+';border-color:'+(active?'#0f172a':'#e2e8f0')+';"><span class="w-2.5 h-2.5 rounded-full inline-block" style="background:'+dot+';'+ring+'"></span>'+c+'</button>';
          }).join('') + '</div>';
      }

      filter.innerHTML = html;
      filter.querySelectorAll('.ace-cat-btn').forEach(b => b.onclick = () => { activeCat = b.dataset.cat; activeSub=''; activeColor=''; render(); });
      filter.querySelectorAll('.ace-sub-btn').forEach(b => b.onclick = () => { activeSub = b.dataset.sub; activeColor=''; render(); });
      filter.querySelectorAll('.ace-color-btn').forEach(b => b.onclick = () => { activeColor = b.dataset.color; render(); });
    }

    const groupsCache = {};

    function renderGrid() {
      let items = ACE.product_lineup;
      if (activeCat !== '전체') items = items.filter(p => p.cat === activeCat);
      if (activeSub) items = items.filter(p => p.sub === activeSub);
      if (activeColor) items = items.filter(p => p.color === activeColor);

      const groups = {};
      items.forEach(p => {
        const bn = baseName(p.name) || (p.cat + ' ' + (p.sub||''));
        const key = p.cat + '||' + (p.sub||'') + '||' + bn;
        if (!groups[key]) groups[key] = { cat:p.cat, sub:p.sub, name:bn, items:[], key:key };
        groups[key].items.push(p);
      });
      Object.assign(groupsCache, groups);
      const gList = Object.values(groups);

      const empty = document.getElementById('products-empty');
      if (empty) empty.classList.toggle('hidden', gList.length > 0);

      grid.innerHTML = gList.map(g => {
        const meta = CAT_COLORS[g.cat] || {hex:'#94a3b8'};
        const main = g.items[0];
        const variants = g.items;
        const variantPreview = variants.length > 1 ? (
          '<div class="mb-2"><div class="text-[10px] font-bold text-slate-500 mb-1">색상 옵션 ('+variants.length+')</div>' +
          '<div class="flex flex-wrap gap-1">' + variants.slice(0, 8).map(v => {
            const label = v.color || v.finish || '기본';
            const dot = COLOR_HEX[label.split(',')[0]] || '#94a3b8';
            const ring = dot==='#ffffff'?'border:1px solid #cbd5e1;':'';
            return '<span title="'+label+'" class="w-3 h-3 rounded-full inline-block" style="background:'+dot+';'+ring+'"></span>';
          }).join('') + (variants.length>8 ? '<span class="text-[10px] text-slate-500 ml-1">+'+(variants.length-8)+'</span>' : '') + '</div></div>'
        ) : (main.finish ? '<div class="flex flex-wrap gap-1 mb-2">'+main.finish.split(',').slice(0,3).map(t=>'<span class="text-[9px] font-semibold px-1.5 py-0.5 rounded bg-slate-100 border border-slate-200 text-slate-600">'+t.trim()+'</span>').join('')+'</div>' : '');

        return '<article data-group-key="'+g.key+'" class="ace-product-card group relative rounded-2xl border border-slate-200 bg-white overflow-hidden hover:border-blue-400 hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer">'+
          '<div class="relative aspect-square overflow-hidden bg-slate-50">'+
            '<img src="'+main.img+'" alt="'+g.name+'" loading="lazy" class="absolute inset-0 w-full h-full object-contain p-3 transition-transform duration-700 group-hover:scale-105" onerror="this.style.display=\'none\';this.parentElement.style.background=\'linear-gradient(135deg,#f8fafc,#e2e8f0)\';" />'+
            '<div class="absolute top-2.5 left-2.5"><span class="text-[10px] font-bold px-2 py-0.5 rounded-full text-white shadow" style="background:'+meta.hex+';">'+g.cat+'</span></div>'+
            (g.sub ? '<div class="absolute top-2.5 right-2.5"><span class="text-[10px] font-bold px-2 py-0.5 rounded-full bg-white/90 border border-slate-200 text-slate-700">'+g.sub+'</span></div>' : '')+
            (variants.length>1 ? '<div class="absolute bottom-2.5 right-2.5 text-[10px] font-bold px-2 py-0.5 rounded-full bg-slate-900 text-white shadow">'+variants.length+'색상</div>' : '')+
            '<div class="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><span class="px-3 py-1.5 rounded-full bg-white text-slate-900 text-xs font-bold shadow-lg">상세보기 →</span></div>'+
          '</div>'+
          '<div class="p-3 flex-1 flex flex-col">'+
            '<h3 class="text-[13px] font-black tracking-tight text-slate-900 leading-snug mb-2 line-clamp-2">'+g.name+'</h3>'+
            variantPreview +
            '<div class="mt-auto pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">'+
              '<span class="text-slate-400 font-semibold">USUNG ACE</span>'+
              '<span class="font-bold text-blue-600 flex items-center gap-1">상세 보기 <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round"><path d="M5 12h14"/><path d="m12 5 7 7-7 7"/></svg></span>'+
            '</div>'+
          '</div>'+
        '</article>';
      }).join('');

      grid.querySelectorAll('.ace-product-card').forEach(card => {
        card.onclick = function() {
          const key = card.dataset.groupKey;
          const g = groupsCache[key];
          if (g) openProductModal(g);
        };
      });
    }

    function render() { renderFilters(); renderGrid(); }
    window.filterProducts = function(c){ activeCat = (c && CAT_COLORS[c]) ? c : '전체'; activeSub=''; activeColor=''; render(); };
    render();
    grid.dataset.patched = 'v5';
    return true;
  }

  function patchYouTubeSlots() {
    document.querySelectorAll('[id^="manual-3d-"]').forEach(el => {
      const container = el.parentElement;
      if (!container || container.querySelector('.yt-link-slot')) return;
      const slot = document.createElement('div');
      slot.className = 'yt-link-slot mb-5';
      slot.innerHTML = '<button type="button" disabled class="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-slate-200 text-slate-400 text-sm font-bold cursor-not-allowed"><svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor"><path opacity="0.4" d="M23.5 6.2a3 3 0 0 0-2.1-2.1C19.5 3.5 12 3.5 12 3.5s-7.5 0-9.4.5a3 3 0 0 0-2.1 2.1C0 8.1 0 12 0 12s0 3.9.5 5.8a3 3 0 0 0 2.1 2.1c1.9.5 9.4.5 9.4.5s7.5 0 9.4-.5a3 3 0 0 0 2.1-2.1C24 15.9 24 12 24 12s0-3.9-.5-5.8z"/><polygon points="9.5,15.6 15.8,12 9.5,8.4" fill="#fff" opacity="0.6"/></svg>영상 준비 중</button>';
      container.insertBefore(slot, el);
    });
  }

  function patchExtraText() {
    document.querySelectorAll('h1, h2, h3, span, div, p').forEach(el => {
      if (el.children.length > 0) return;
      const t = el.textContent;
      if (t && /11개 카테고리/.test(t)) {
        el.textContent = t.replace('11개 카테고리', '7개 카테고리');
      }
    });
  }

  function applyAll() {
    killMegaHoverCat();
    patchMegaMenu();
    patchNavbar();
    patchFeaturesSection();
    patchYouTubeSlots();
    patchExtraText();
    renderProductPage();
  }

  function init() {
    applyAll();
    let n = 0;
    const iv = setInterval(() => {
      applyAll();
      if (++n > 40) clearInterval(iv);
    }, 250);
    new MutationObserver(applyAll).observe(document.body, {
      childList: true, subtree: true, attributes: true, attributeFilter: ['class', 'id']
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else { init(); }
})();
