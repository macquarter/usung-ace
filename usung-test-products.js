(function(){
  'use strict';
  // 실제 고해상도 제품 이미지 (repo products/ 폴더 내 파일 직접 참조)
  var IMG_LED  = 'products/p102_LED450우주선동스텐파이프.jpg';        // 우주선 갓등 (동)
  var IMG_STEN = 'products/p021_09_150Ø_스텐도금_반후지_텐션_크롬.jpg'; // 스텐 스윙텐션 (크롬)
  var TEST = [
    { no:2001, img:IMG_LED,  name:'우주선 갓등 [테스트]',   cat:'2. LED 조명타입', sub:'우주선/갓등',    color:'동',  finish:'동',  pipe:'' },
    { no:2002, img:IMG_STEN, name:'스텐 스윙텐션 [테스트]', cat:'3. 스텐파이프',   sub:'도금/스윙 텐션', color:'크롬', finish:'크롬', pipe:'' }
  ];

  // 모달 제품 이미지를 크게 표시 (index_v6.html 수정 없이 CSS 오버라이드)
  function injectModalCss(){
    if(document.getElementById('usung-test-modal-css')) return;
    var css = ''
      + '#ace-product-modal-body .aspect-square.rounded-2xl{aspect-ratio:auto !important;min-height:400px !important;}'
      + '@media(min-width:768px){#ace-product-modal-body .aspect-square.rounded-2xl{min-height:560px !important;}}'
      + '#ace-product-modal-body .aspect-square.rounded-2xl img{max-width:100% !important;max-height:540px !important;width:auto !important;height:auto !important;padding:0.4rem !important;object-fit:contain !important;}';
    var st = document.createElement('style');
    st.id = 'usung-test-modal-css';
    st.textContent = css;
    document.head.appendChild(st);
  }

  function getACE(){ try { return window.ACE_DATA || (typeof ACE_DATA!=='undefined'?ACE_DATA:null); } catch(e){ return null; } }
  function inject(){
    var ACE = getACE();
    if(!ACE || !ACE.product_lineup) return false;
    if(ACE._testInjected) return true;
    if(ACE._remapped_v10 !== true) return false;
    TEST.forEach(function(t){
      ACE.product_lineup.push({ no:t.no, img:t.img, name:t.name, cat:t.cat, sub:t.sub, color:t.color, finish:t.finish, pipe:t.pipe });
    });
    ACE._testInjected = true;
    try { console.log('[usung-test v4] injected', TEST.length, 'products (real images)'); } catch(e){}
    var grid = document.getElementById('products-grid');
    if(grid && typeof window.filterByNode === 'function'){ window.filterByNode(''); }
    return true;
  }
  injectModalCss();
  var iv = setInterval(function(){ if(inject()) clearInterval(iv); }, 250);
  if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', function(){ injectModalCss(); inject(); }); } else { inject(); }
})();
