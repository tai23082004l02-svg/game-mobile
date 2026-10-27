import test from 'node:test';
import assert from 'node:assert/strict';
import { normalizeProduct, importProducts, parseCSV, matches, grossCommission, sortProducts, toCSV } from './public/products-core.js';
const sample={name:'Kệ bàn',price:100000,commission:10,rating:4.7,sold:200,shopRating:4.8,demo:4,rights:'yes'};
test('normalizes product metrics without treating missing data as zero',()=>{
  const p=normalizeProduct(sample);assert.equal(grossCommission(p),10000);
  const missing=normalizeProduct({name:'Chưa biết'});assert.equal(missing.price,null);assert.equal(grossCommission(missing),null);
  assert.equal(normalizeProduct({...sample,commission:0}).commission,0);
  for(const invalid of [{rating:5.1},{price:-1},{commission:101},{sold:1.5},{demo:0},{url:'javascript:alert(1)'},{price:'100,000'},{rating:true},{rights:'maybe'}])assert.throws(()=>normalizeProduct({...sample,...invalid}));
});
test('filters by thresholds, platform, category, permissions and excludes missing metrics only when active',()=>{
  const p=normalizeProduct({...sample,platform:'Shopee',category:'Phòng trọ'});
  assert.equal(matches(p,{maxPrice:'100000',minCommission:'10',minRating:'4.7',minSold:'200',minShopRating:'4.8',minDemo:'4',rights:true,platform:'Shopee',query:'kệ'}),true);
  for(const f of [{maxPrice:'99999'},{minCommission:'11'},{minRating:'4.8'},{minSold:'201'},{minShopRating:'4.9'},{minDemo:'5'},{platform:'TikTok Shop'},{category:'Bếp'},{query:'mic'}])assert.equal(matches(p,f),false);
  const missing=normalizeProduct({name:'Thiếu dữ liệu'});assert.equal(matches(missing,{}),true);assert.equal(matches(missing,{minSold:'0'}),false);assert.equal(matches(missing,{rights:true}),false);
  assert.equal(sortProducts([missing,p],'gross')[0],p);assert.equal(sortProducts([missing,p],'sold')[1],missing);
});
test('imports quoted CSV and JSON atomically and exports safe spreadsheet cells',()=>{
  const csv='\uFEFFname,price,commission,rights\r\n"Kệ, loại \"\"A\"\"",100000,10,yes\r\n"Hai\ndòng",,,unknown';
  const list=importProducts(csv,'csv');assert.equal(list[0].name,'Kệ, loại "A"');assert.equal(list[1].price,null);
  assert.deepEqual(importProducts(JSON.stringify(list),'json'),list);
  assert.deepEqual(importProducts(toCSV(list),'csv'),list);
  assert.throws(()=>importProducts('name,rating\na,4\nb,6','csv'),/Sản phẩm 2/);
  for(const text of ['name,name\na,b','name,wrong\na,b','name,price\na','name\n"abc','name\n"a"oops'])assert.throws(()=>parseCSV(text));
  assert.match(toCSV([normalizeProduct({name:'=IMPORTXML("bad")'})]), /'=IMPORTXML/);
});
