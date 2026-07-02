/* ============================================================
   유성에이스 — 테스트 제품 주입 (미리보기용) v1
   - 동 갓등        -> 2. LED 조명 / 우주선·갓등
   - 스텐 스윙텐션    -> 3. 스텐파이프 / 도금 / 스윙텐션
   overlay v10 의 remap(_remapped_v10) 이후 최종 스키마로 push
   ============================================================ */
(function(){
  'use strict';
  var TEST = [
    { no:2001, img:'products/ptest_led.jpg',  name:'우주선 갓등 [테스트]',   cat:'2. LED 조명타입', sub:'우주선/갓등',    color:'동',  finish:'동',  pipe:'' },
    { no:2002, img:'products/ptest_sten.jpg', name:'스텐 스윙텐션 [테스트]', cat:'3. 스텐파이프',   sub:'도금/스윙 텐션', color:'크롬', finish:'크롬', pipe:'' }
  ];
  function getACE(){ try { return window.ACE_DATA || (typeof ACE_DATA!=='undefined'?ACE_DATA:null); } catch(e){ return null; } }
  function inject(){
    var ACE = getACE();
    if(!ACE || !ACE.product_lineup) return false;   // ACE 준비 대기
    if(ACE._testInjected) return true;               // 완료
    if(ACE._remapped_v10 !== true) return false;     // 제품페이지 remap 이후 대기
    TEST.forEach(function(t){
      ACE.product_lineup.push({ no:t.no, img:t.img, name:t.name, cat:t.cat, sub:t.sub, color:t.color, finish:t.finish, pipe:t.pipe });
    });
    ACE._testInjected = true;
    try { console.log('[usung-test v1] injected', TEST.length, 'products'); } catch(e){}
    var grid = document.getElementById('products-grid');
    if(grid && typeof window.filterByNode === 'function'){ window.filterByNode(''); }
    return true;
  }
  var iv = setInterval(function(){ if(inject()) clearInterval(iv); }, 250);
  if(document.readyState === 'loading'){ document.addEventListener('DOMContentLoaded', inject); } else { inject(); }
})();
