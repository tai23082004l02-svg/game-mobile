// Runs only after the user clicks the extension. No cookies, private APIs or background crawling.
globalThis.videoDeskCapture = function (doc = document, loc = location) {
  const u = new URL(loc.href);
  const match = u.pathname.match(/^\/product\/(\d+)\/(\d+)\/?$/) || u.pathname.match(/-i\.(\d+)\.(\d+)\/?$/);
  if (!['shopee.vn','www.shopee.vn'].includes(u.hostname) || !match) throw Error('Mở trang chi tiết sản phẩm trên shopee.vn, không dùng trang tìm kiếm hoặc link rút gọn.');
  const text = (doc.body?.innerText || '').slice(0,250000);
  const title = (doc.querySelector('h1')?.innerText || doc.querySelector('meta[property="og:title"]')?.content || doc.title || '').trim().replace(/\s*[|–-]\s*Shopee.*$/i,'');
  if (!title || /^(đăng nhập|login|xác minh|verify|captcha|shopee việt nam)/i.test(title)) throw Error('Chưa thấy tên sản phẩm. Hoàn tất đăng nhập/xác minh trên Shopee rồi thử lại.');
  const result = { name: title.slice(0,200), platform:'Shopee', category:'', url:`https://shopee.vn/product/${match[1]}/${match[2]}`, price:null,commission:null,rating:null,sold:null,shopRating:null,demo:null,rights:'unknown',capturedAt:new Date().toISOString() };
  const notes = ['Thông tin từ trang trình duyệt, chưa xác minh với sàn. Hoa hồng, điểm shop và quyền tư liệu cần kiểm tra riêng.'];
  const candidates = [];
  function walk(value,depth=0) {
    if (!value || typeof value !== 'object' || depth>8) return;
    if (Array.isArray(value)) {for(const entry of value.slice(0,100))walk(entry,depth+1);return;}
    const types=Array.isArray(value['@type'])?value['@type']:[value['@type']];
    if(types.includes('Product'))candidates.push(value);
    if(value['@graph'])walk(value['@graph'],depth+1);
    if(value.mainEntity)walk(value.mainEntity,depth+1);
  }
  for(const script of [...doc.querySelectorAll('script[type="application/ld+json"]')].slice(0,30)) {
    if(script.textContent.length>500000)continue;
    try{walk(JSON.parse(script.textContent));}catch{}
  }
  if(candidates.length===1) {
    const product=candidates[0];
    if(typeof product.name==='string'&&product.name.trim())result.name=product.name.trim().slice(0,200);
    const offers=Array.isArray(product.offers)?product.offers:[product.offers];
    const prices=offers.filter(o=>o&&o.priceCurrency==='VND'&&o.price!=null&&/^\d+(\.\d+)?$/.test(String(o.price))).map(o=>Number(o.price)).filter(n=>Number.isFinite(n)&&n>=0&&n<=1e12);
    if(prices.length&&new Set(prices).size===1){result.price=prices[0];notes.push('Giá từ dữ liệu có cấu trúc; hãy kiểm tra biến thể và giá thực tế khi thanh toán.');}
    const rating=product.aggregateRating;
    if(rating && Number(rating.bestRating||5)===5 && Number(rating.worstRating||1)>=0 && rating.ratingValue!=null && /^\d+(\.\d+)?$/.test(String(rating.ratingValue))) {
      const n=Number(rating.ratingValue);if(n>=0&&n<=5)result.rating=n;
    }
  }
  if(result.price==null) {
    const prices=[...text.matchAll(/(?:₫|đ)\s*([\d]{1,3}(?:\.[\d]{3})+|\d+)(?![\d.,])|(?<![\d.,])([\d]{1,3}(?:\.[\d]{3})+|\d+)\s*(?:₫|đ)(?!\p{L})/gu)].map(m=>Number((m[1]||m[2]).replaceAll('.',''))).filter(n=>n>=0&&n<=1e12);
    const unique=[...new Set(prices)];
    if(unique.length===1){result.price=unique[0];notes.push('Giá nhận diện từ văn bản; cần kiểm tra lại.');}
    else notes.push('Không xác định được một mức giá duy nhất; vui lòng điền giá của biến thể bạn chọn.');
  }
  if(result.rating==null) {
    const rating=text.match(/\b([0-4](?:[.,]\d+)?|5(?:[.,]0+)?)\s*(?:trên\s*5|\/\s*5)/i);
    if(rating)result.rating=Number(rating[1].replace(',','.'));
  }
  const sold=text.match(/đã bán\s*([\d.,]+)[ \t]*([kKmM]|triệu|nghìn)?/i) || text.match(/(?:^|\n)[ \t]*([\d.,]+)[ \t]*([kKmM]|triệu|nghìn)?[ \t]*đã bán/i);
  if(sold) {
    const raw=sold[1],suffix=(sold[2]||'').toLowerCase();
    let n;
    if(suffix)n=Number(raw.replace(',','.'))*(suffix==='m'||suffix==='triệu'?1e6:1e3);
    else if(/^\d+$/.test(raw))n=Number(raw);
    else if(/^\d{1,3}(?:[.,]\d{3})+$/.test(raw))n=Number(raw.replace(/[.,]/g,''));
    if(Number.isFinite(n)&&n>=0&&n<=1e12){result.sold=Math.round(n);notes.push(suffix?'Số đã bán quy đổi từ số viết tắt, chỉ là xấp xỉ; chưa biết kỳ thống kê.':'Số đã bán từ văn bản, chưa biết kỳ thống kê.');}
  }
  result.captureNote=notes.join(' ');
  return result;
};
