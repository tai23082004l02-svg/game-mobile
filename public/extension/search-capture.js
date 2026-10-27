globalThis.videoDeskSearch = function(doc=document,loc=location){
  if(new URL(loc.href).hostname!=='shopee.vn')throw Error('Chỉ nghiên cứu trên shopee.vn.');
  if(/\/buyer\/login|captcha|verify/i.test(new URL(loc.href).pathname)||/^(đăng nhập|login|xác minh|verify)/i.test(doc.title.trim()))throw Error('Shopee đang yêu cầu đăng nhập hoặc xác minh. Hoàn tất trên Shopee rồi chạy lại.');
  const found=new Map();
  for(const a of doc.querySelectorAll('a[href]')){
    let url;try{url=new URL(a.getAttribute('href'),loc.href);}catch{continue;}
    if(url.hostname!=='shopee.vn')continue;
    const ids=url.pathname.match(/-i\.(\d+)\.(\d+)\/?$/)||url.pathname.match(/^\/product\/(\d+)\/(\d+)\/?$/);
    if(!ids)continue;
    const canonical=`https://shopee.vn/product/${ids[1]}/${ids[2]}`;
    const card=a.closest('[data-sqe="item"],.shopee-search-item-result')||a;
    const text=card.innerText.trim();
    if(!text||card.getBoundingClientRect().width===0||found.has(canonical))continue;
    const title=a.querySelector('img')?.alt||a.getAttribute('title')||text.split('\n').find(s=>s.trim().length>8)||'';
    if(title.trim())found.set(canonical,{name:title.trim().slice(0,200),url:canonical});
    if(found.size>=12)break;
  }
  return [...found.values()];
};
