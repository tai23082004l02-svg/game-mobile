import test from 'node:test';
import assert from 'node:assert/strict';
import './public/extension/capture.js';
import { shopeeLink, normalizeProduct } from './public/products-core.js';
function page({title='Kệ bàn',text='',schema=[]}={}) {
  return {title,body:{innerText:text},querySelector:s=>s==='h1'?{innerText:title}:null,querySelectorAll:()=>schema.map(data=>({textContent:JSON.stringify(data)}))};
}
const link='https://shopee.vn/product/1143019507/22888361639';
test('canonicalizes Shopee links and rejects foreign hosts, credentials and short links',()=>{
  assert.equal(shopeeLink(link+'?tracking=abc'),link);
  assert.equal(shopeeLink('https://shopee.vn/Ke-ban-i.1143019507.22888361639'),link);
  for(const bad of ['https://shopee.vn.evil.com/product/1/2','https://evil.com/product/1/2','https://user:pass@shopee.vn/product/1/2','https://shopee.vn:444/product/1/2','https://s.shopee.vn/abc','javascript:alert(1)'])assert.equal(shopeeLink(bad),null);
});
test('captures public structured metadata without fabricating affiliate data',()=>{
  const result=globalThis.videoDeskCapture(page({text:'Đã bán 1,2k',schema:[{'@context':'https://schema.org','@type':'Product',name:'Kệ A',offers:{price:'99000',priceCurrency:'VND'},aggregateRating:{ratingValue:'4.8',bestRating:'5'}}]}),{href:link});
  assert.equal(result.name,'Kệ A');assert.equal(result.price,99000);assert.equal(result.rating,4.8);assert.equal(result.sold,1200);
  assert.equal(result.commission,null);assert.equal(result.shopRating,null);assert.equal(result.rights,'unknown');assert.match(result.captureNote,/xấp xỉ/);
  assert.equal(normalizeProduct(result).capturedAt,result.capturedAt);
});
test('does not guess ambiguous prices, confuse rating count with sold count, or capture a login screen',()=>{
  const result=globalThis.videoDeskCapture(page({text:'₫99.000 ₫120.000 4.7 trên 5 500 đánh giá'}),{href:link});
  assert.equal(result.price,null);assert.equal(result.rating,4.7);assert.equal(result.sold,null);
  assert.equal(globalThis.videoDeskCapture(page({text:'99.000₫ Đã bán 2.345'}),{href:link}).sold,2345);
  assert.equal(globalThis.videoDeskCapture(page({text:'₫99.000\n4.8 trên 5\nĐã bán 1,2k'}),{href:link}).sold,1200);
  assert.equal(globalThis.videoDeskCapture(page({text:'4.8 trên 5\nĐã bán'}),{href:link}).sold,null);
  assert.throws(()=>globalThis.videoDeskCapture(page({title:'Đăng nhập'}),{href:link}),/đăng nhập/);
  assert.throws(()=>globalThis.videoDeskCapture(page(),{href:'https://example.com/product/1/2'}),/shopee.vn/);
});
