// Supplier data only. Never collect cookies, account details, cart contents or review author identities.
globalThis.videoDeskDossier = function(doc=document,loc=location){
 const product=globalThis.videoDeskCapture(doc,loc);
 const clean=s=>String(s??'').replace(/<[^>]*>/g,' ').replace(/[ \t]+/g,' ').trim();
 const visible=el=>el&&el.getBoundingClientRect().width>0&&el.getBoundingClientRect().height>0;
 const schemas=[];
 function walk(v,depth=0){if(!v||typeof v!=='object'||depth>8)return;if(Array.isArray(v)){v.slice(0,100).forEach(x=>walk(x,depth+1));return;}if([v['@type']].flat().includes('Product'))schemas.push(v);if(v['@graph'])walk(v['@graph'],depth+1);if(v.mainEntity)walk(v.mainEntity,depth+1);}
 for(const s of [...doc.querySelectorAll('script[type="application/ld+json"]')].slice(0,30)){if(s.textContent.length>500000)continue;try{walk(JSON.parse(s.textContent));}catch{}}
 const schema=schemas.length===1?schemas[0]:null;
 let description=typeof schema?.description==='string'?clean(schema.description).slice(0,12000):'';
 let descriptionSource=description?'Dữ liệu có cấu trúc do trang cung cấp':'';
 const specifications=[],options=[],images=[],videos=[];
 const headings=[...doc.querySelectorAll('h2,h3,[role="heading"],div,span')].slice(0,10000).filter(el=>{const t=(el.textContent||'').trim();return t.length<50&&/^(mô tả sản phẩm|chi tiết sản phẩm|đánh giá sản phẩm)$/i.test(t)&&visible(el);});
 function section(re){
  const heading=headings.find(h=>re.test(h.innerText.trim()));if(!heading)return null;
  let parent=heading.parentElement;
  for(let n=0;n<3&&parent&&parent!==doc.body&&parent!==doc.documentElement;n++,parent=parent.parentElement){
   const t=parent.innerText.trim();
   if(t.length>heading.innerText.trim().length+8&&t.length<20000&&!/đánh giá sản phẩm|có thể bạn cũng thích/i.test(t))return parent;
  }
  return null;
 }
 const descSection=section(/^mô tả sản phẩm$/i);
 if(descSection){description=descSection.innerText.replace(/^\s*mô tả sản phẩm\s*/i,'').trim().slice(0,12000);descriptionSource='Mục Mô tả sản phẩm đang hiển thị';}
 const detailSection=section(/^chi tiết sản phẩm$/i);
 if(detailSection){
  const rows=[...detailSection.querySelectorAll('tr,[role="row"]')];
  for(const row of rows.slice(0,30)){const cells=[...row.querySelectorAll('td,th,[role="cell"]')];if(cells.length>=2)specifications.push({name:clean(cells[0].innerText).slice(0,100),value:clean(cells.slice(1).map(c=>c.innerText).join(' ')).slice(0,500)});}
  if(!specifications.length){const lines=detailSection.innerText.split('\n').map(clean).filter(Boolean).filter(s=>!/^chi tiết sản phẩm$/i.test(s));for(let i=0;i+1<lines.length&&specifications.length<20;i+=2)specifications.push({name:lines[i].slice(0,100),value:lines[i+1].slice(0,500)});}
 }
 if(!specifications.length&&Array.isArray(schema?.additionalProperty))for(const p of schema.additionalProperty.slice(0,30))if(p.name!=null&&p.value!=null)specifications.push({name:clean(p.name).slice(0,100),value:clean(p.value).slice(0,500)});
 for(const group of [...doc.querySelectorAll('[role="group"],[role="radiogroup"]')].filter(visible).slice(0,30)){
  const label=clean(group.getAttribute('aria-label')||'');
  if(!/màu|size|kích|loại|phân loại|mẫu|color|variant/i.test(label))continue;
  const buttons=[...group.querySelectorAll('button,[role="radio"]')].filter(visible);
  const values=buttons.map(b=>clean(b.innerText||b.getAttribute('aria-label'))).filter(Boolean).slice(0,30);
  if(values.length)options.push({name:label.slice(0,100),values,selected:buttons.filter(b=>b.getAttribute('aria-checked')==='true'||b.getAttribute('aria-pressed')==='true').map(b=>clean(b.innerText||b.getAttribute('aria-label'))).filter(Boolean)});
 }
 function mediaUrl(value){try{const u=new URL(value,loc.href);if(u.protocol!=='https:')return null;if(!/(^|\.)(susercontent\.com|shopee\.vn|shopee\.com|shopeemobile\.com)$/.test(u.hostname))return null;return u.href;}catch{return null;}}
 function add(list,value,source){if(typeof value!=='string')return;const url=mediaUrl(value);if(url&&!list.some(x=>x.url===url)&&list.length<24)list.push({url,source});}
 for(const image of [schema?.image].flat()){if(image)add(images,typeof image==='string'?image:image.url,'Product JSON-LD');}
 const og=doc.querySelector('meta[property="og:image"]');if(og)add(images,og.content,'Ảnh đại diện og:image');
 const ogVideo=doc.querySelector('meta[property="og:video"]');if(ogVideo)add(videos,ogVideo.content,'Video og:video');
 for(const video of doc.querySelectorAll('video')){if(!visible(video))continue;add(videos,video.currentSrc||video.src,'Video trên trang');for(const source of video.querySelectorAll('source'))add(videos,source.src,'Nguồn video trên trang');}
 // Only large images near the product title, never scrape recommendation or review galleries.
 const title=doc.querySelector('h1');
 const boundary=headings.find(h=>/chi tiết sản phẩm|mô tả sản phẩm|đánh giá sản phẩm/i.test(h.innerText))?.getBoundingClientRect().top;
 if(title)for(const img of doc.querySelectorAll('img')){
  if(!visible(img)||img.naturalWidth<200||img.naturalHeight<200)continue;
  const top=img.getBoundingClientRect().top;
  if(boundary!=null&&top>=boundary)continue;
  if(Math.abs(top-title.getBoundingClientRect().top)>1200)continue;
  const link=img.closest('a[href]');if(link&&/-i\.\d+\.\d+|\/product\/\d+\/\d+/.test(link.getAttribute('href')||'')){try{const u=new URL(link.href,loc.href);const ids=u.pathname.match(/(?:-i\.|\/product\/)(\d+)[./](\d+)/);if(ids&&!product.url.endsWith('/'+ids[1]+'/'+ids[2]))continue;}catch{continue;}}
  add(images,img.currentSrc||img.src,'Ảnh lớn gần tiêu đề; cần kiểm tra đúng sản phẩm');
 }
 const missing=[];
 for(const [field,label]of [['price','Giá biến thể'],['rating','Đánh giá'],['sold','Số đã bán']])if(product[field]==null)missing.push(label);
 if(!description)missing.push('Mô tả sản phẩm');if(!specifications.length)missing.push('Thông số');if(!options.length)missing.push('Phân loại đang chọn');if(!images.length)missing.push('Ảnh sản phẩm');if(!videos.length)missing.push('Liên kết video nguồn');
 missing.push('Hoa hồng affiliate','Quyền sử dụng ảnh/video','Kết quả tự dùng thử');
 return {schemaVersion:1,product,details:{description,descriptionSource,specifications,options},media:{images,videos},missing,warnings:['Dữ liệu và công dụng do nhà bán cung cấp, chưa được kiểm chứng.','Ảnh gần tiêu đề có thể không đúng sản phẩm: kiểm tra trước khi dùng.','Không mặc nhiên có quyền dùng ảnh hoặc video. Liên kết media có thể hết hạn.','Chỉ đọc nội dung đã tải; không tự mở các phần đang thu gọn hoặc vượt đăng nhập/xác minh.']};
};
