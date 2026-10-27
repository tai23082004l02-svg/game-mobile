import {topics,assess} from './research-core.js';
const $=id=>document.getElementById(id),esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
let running=false,stopped=false,tabId=null,results=[],skipped=0;
try{const saved=JSON.parse(localStorage.getItem('videodesk.research.last')||'null');if(saved&&Array.isArray(saved.results)&&saved.results.length<=9){results=saved.results;if(saved.budget)$('budget').value=saved.budget;}}catch{}
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
const log=s=>$('progress').textContent=s;
function render(){
 const budget=Number($('budget').value);const ranked=results.map(p=>({p,a:assess(p,budget)})).sort((x,y)=>y.a.score-x.a.score);
 $('summary').textContent=`Đã đọc ${results.length} sản phẩm · ${skipped} trang chưa đọc được. Chưa kiểm tra được hoa hồng affiliate.`;
 $('results').innerHTML=ranked.map(({p,a})=>`<article><h3>${esc(p.name)}</h3><b>${a.score}/80 · ${a.label}</b><p>${p.price==null?'Giá chưa rõ':new Intl.NumberFormat('vi-VN').format(p.price)+' đ'} · ${p.rating??'?'} / 5 · Đã bán: ${p.sold??'?'}</p><p>${a.reasons.join(' · ')||'Chưa đủ số liệu đạt tiêu chí.'}</p><p>${a.warnings.join(' · ')}</p><p class="missing">Cần kiểm tra: ${a.missing.join(', ')}.</p><a href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Xem sản phẩm ↗</a><p><small>${esc(p.captureNote)}</small></p></article>`).join('');
 $('transfer').disabled=$('export').disabled=!results.length||running;
}
async function navigate(url){
 if(stopped)throw Error('Đã dừng theo yêu cầu.');
 await chrome.tabs.update(tabId,{url});
 const until=Date.now()+25000;
 while(Date.now()<until){
  if(stopped)throw Error('Đã dừng theo yêu cầu.');
  const tab=await chrome.tabs.get(tabId);
  if(tab.status==='complete'&&tab.url===url){await delay(2500);return;}
  if(tab.status==='complete'&&tab.url&&/login|captcha|verify/i.test(tab.url))throw Error('Shopee yêu cầu đăng nhập hoặc xác minh. Hoàn tất trên tab Shopee, sau đó chạy lại.');
  await delay(500);
 }
 throw Error('Trang Shopee tải quá lâu hoặc đã chuyển hướng. Kiểm tra tab Shopee rồi chạy lại.');
}
async function read(file,fn){
 if(stopped)throw Error('Đã dừng theo yêu cầu.');
 await chrome.scripting.executeScript({target:{tabId},files:[file]});
 const [out]=await chrome.scripting.executeScript({target:{tabId},func:fn});
 if(out?.result?.error)throw Error(out.result.error);
 return out?.result?.data;
}
$('login').onclick=()=>chrome.tabs.create({url:'https://shopee.vn/'});
$('stop').onclick=()=>{stopped=true;log('Đang dừng… Kết quả đã đọc sẽ được giữ.');};
$('start').onclick=async()=>{
 if(running)return;
 const budget=Number($('budget').value),topic=topics[$('topic').value];
 if(!Number.isFinite(budget)||budget<1||budget>1e9){log('Nhập ngân sách từ 1 đến 1.000.000.000 VND.');return;}
 // Permission request stays in this direct user gesture.
 $('start').disabled=true;
 let allowed;try{allowed=await chrome.permissions.request({origins:['https://shopee.vn/*']});}catch{$('start').disabled=false;log('Không xin được quyền đọc Shopee. Hãy tải lại tiện ích và thử lại.');return;}
 if(!allowed){$('start').disabled=false;log('Chưa có quyền đọc shopee.vn. Công cụ không chạy; bấm bắt đầu để thử lại.');return;}
 running=true;stopped=false;skipped=0;results=[];$('start').disabled=true;$('stop').disabled=false;$('topic').disabled=$('budget').disabled=true;render();
 try{
  const tab=await chrome.tabs.create({url:'https://shopee.vn/',active:false});tabId=tab.id;
  const candidates=new Map();
  for(const [i,q]of topic.queries.entries()){
   log(`Đang tìm ${i+1}/3: ${q}. Nếu Shopee yêu cầu xác minh, hãy kiểm tra tab Shopee.`);
   await navigate('https://shopee.vn/search?keyword='+encodeURIComponent(q));
   let found=[];
   for(let attempt=0;attempt<3;attempt++){
    found=await read('search-capture.js',()=>{try{return{data:globalThis.videoDeskSearch()};}catch(e){return{error:e.message};}});
    if(found?.length)break;await delay(2000);
   }
   if(!found?.length)throw Error('Không đọc được sản phẩm trên trang kết quả. Shopee có thể yêu cầu đăng nhập/xác minh hoặc đã đổi giao diện. Chưa tạo đề xuất giả.');
   for(const p of found.slice(0,3))candidates.set(p.url,{...p,category:topic.name});
  }
  let count=0;
  for(const c of candidates.values()){
   log(`Đang đọc sản phẩm ${++count}/${candidates.size}: ${c.name}`);
   await navigate(c.url);
   try{
    const p=await read('capture.js',()=>{try{return{data:globalThis.videoDeskCapture()};}catch(e){return{error:e.message};}});
    if(!p)throw Error('Không đọc được nội dung sản phẩm.');
    results.push({...p,category:c.category});render();
   }catch(e){if(stopped||/đăng nhập|xác minh|login|verify/i.test(e.message))throw e;skipped++;render();}
  }
  log(`Hoàn tất: đã đọc ${results.length} sản phẩm. Các mục ưu tiên hiển thị ở trên; chưa xác minh chất lượng hoặc lợi nhuận.`);
 }catch(e){log(e.message||'Không hoàn tất được lượt nghiên cứu.');}
 finally{running=false;$('start').disabled=false;$('stop').disabled=true;$('topic').disabled=$('budget').disabled=false;try{localStorage.setItem('videodesk.research.last',JSON.stringify({results,budget}));}catch{log($('progress').textContent+' Không lưu được phiên trên máy; hãy tải JSON để giữ kết quả.');}render();}
};
$('transfer').onclick=async()=>{
 const base=$('destination').value==='local'?'http://localhost:3000/products.html':'https://tai23082004l02-svg.github.io/game-mobile/products.html';
 await chrome.tabs.create({url:base+'#import-research='+encodeURIComponent(JSON.stringify(results))});
};
$('export').onclick=()=>{
 const url=URL.createObjectURL(new Blob([JSON.stringify(results,null,2)],{type:'application/json'}));const a=document.createElement('a');a.href=url;a.download='videodesk-nghien-cuu.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);
};
render();
