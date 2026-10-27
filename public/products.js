import { columns, normalizeProduct, importProducts, matches, sortProducts, grossCommission, toCSV, shopeeLink } from './products-core.js';
const $=id=>document.getElementById(id), form=$('product-form'), filters=$('filters'), storage='videodesk.products.v1';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const num=v=>v==null?'Chưa có':new Intl.NumberFormat('vi-VN',{maximumFractionDigits:2}).format(v);
let products=[], editing=null, captureMetadata={};
try {
  const raw=JSON.parse(localStorage.getItem(storage)||'[]');
  if(!Array.isArray(raw)||raw.length>2000)throw Error();
  products=raw.map(p=>({...normalizeProduct(p),id:crypto.randomUUID(),picked:p.picked===true}));
}catch{$('message').textContent='Không đọc được danh sách lưu. Dữ liệu cũ chưa bị ghi đè; hãy nhập bản sao lưu nếu có.';}
function persist(){try{localStorage.setItem(storage,JSON.stringify(products));}catch{$('message').textContent='Không lưu được trên thiết bị. Hãy xuất JSON để giữ dữ liệu trước khi đóng trang.';}}
function options(){
  for(const [id,field] of [['platform-filter','platform'],['category-filter','category']]){
    const select=$(id),old=select.value;
    select.innerHTML='<option value="">Tất cả</option>'+[...new Set(products.map(p=>p[field]).filter(Boolean))].sort().map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
    if([...select.options].some(o=>o.value===old))select.value=old;
  }
}
function render(){
  const f=Object.fromEntries(new FormData(filters));f.rights=filters.elements.rights.checked;
  const list=sortProducts(products.filter(p=>matches(p,f)&&(!filters.elements.picked.checked||p.picked)),f.sort);
  $('summary').textContent=`${list.length} / ${products.length} sản phẩm phù hợp`;
  $('picked-count').textContent=`${products.filter(p=>p.picked).length} đã chọn`;
  $('empty').hidden=!!list.length;
  $('empty').querySelector('h3').textContent=products.length?'Không có sản phẩm khớp bộ lọc':'Bắt đầu từ danh sách sản phẩm của bạn';
  $('empty').querySelector('p').textContent=products.length?'Thử giảm điều kiện hoặc xóa bộ lọc. Sản phẩm thiếu dữ liệu bị loại nếu bộ lọc tương ứng đang bật.':'Thêm từng món hoặc tải mẫu CSV để nhập nhiều sản phẩm. Không cần API key hay đăng nhập.';
  $('products').innerHTML=list.map(p=>{
    const missing=[['price','giá'],['commission','hoa hồng'],['rating','đánh giá'],['sold','đã bán'],['shopRating','điểm shop'],['demo','khả năng quay']].filter(([key])=>p[key]==null).map(([,label])=>label);
    return `<article class="product-card ${p.picked?'picked':''}"><div class="product-top"><div><small>${esc(p.platform||'Chưa có nền tảng')} · ${esc(p.category||'Chưa phân nhóm')}</small><h3>${esc(p.name)}</h3></div><label class="pick"><input type="checkbox" data-pick="${p.id}" ${p.picked?'checked':''}>Chọn</label></div><dl class="product-stats">${[['Giá',num(p.price)+(p.price==null?'':' đ')],['Hoa hồng',num(p.commission)+(p.commission==null?'':'%')],['Điểm sản phẩm',num(p.rating)+(p.rating==null?'':' / 5')],['Đã bán',num(p.sold)],['Điểm shop',num(p.shopRating)+(p.shopRating==null?'':' / 5')],['Dễ làm video · tự chấm',num(p.demo)+(p.demo==null?'':' / 5')]].map(([k,v])=>`<div><dt>${k}</dt><dd>${v}</dd></div>`).join('')}</dl><div class="gross">Hoa hồng ước tính / đơn: <strong>${num(grossCommission(p))}${grossCommission(p)==null?'':' đ'}</strong><br>Trước hoàn đơn, thuế và điều kiện chiến dịch.</div>${p.capturedAt?`<p class="hint">Lấy thông tin: ${esc(new Date(p.capturedAt).toLocaleString('vi-VN'))}</p>`:''}${p.captureNote?`<p class="hint">Ghi chú nguồn: ${esc(p.captureNote)}</p>`:''}<p class="rights">Quyền tư liệu: ${p.rights==='yes'?'bạn đã xác nhận':p.rights==='no'?'không được phép dùng':'chưa xác nhận'}</p>${missing.length?`<p class="missing">Còn thiếu: ${missing.join(', ')}.</p>`:''}<div class="product-actions">${p.url?`<a class="subtle" href="${esc(p.url)}" target="_blank" rel="noopener noreferrer">Xem sản phẩm ↗</a>`:''}<button class="subtle" data-edit="${p.id}">Sửa</button><button class="subtle" data-delete="${p.id}">Xóa</button></div></article>`;
  }).join('');
}
function openEditor(p){editing=p?.id||null;captureMetadata={captureNote:p?.captureNote||'',capturedAt:p?.capturedAt||''};form.reset();$('edit-error').textContent='';$('capture-note').textContent=p?.captureNote||'';$('editor-title').textContent=editing?'Sửa sản phẩm':p?'Kiểm tra thông tin trước khi lưu':'Thêm sản phẩm';for(const c of columns)form.elements[c].value=p?.[c]??(c==='rights'?'unknown':'');$('editor').showModal();}
$('add').onclick=()=>openEditor();$('close').onclick=()=>$('editor').close();
form.onsubmit=e=>{e.preventDefault();try{
  const value=normalizeProduct({...Object.fromEntries(new FormData(form)),...captureMetadata});
  if(!editing&&products.length>=2000)throw Error('Tối đa 2.000 sản phẩm.');
  if(value.url&&products.some(p=>p.id!==editing&&p.url===value.url))throw Error('Liên kết này đã có trong danh sách.');
  if(editing)products=products.map(p=>p.id===editing?{...p,...value}:p);else products.unshift({...value,id:crypto.randomUUID(),picked:false});
  $('message').textContent='Đã cập nhật danh sách trên thiết bị này.';persist();options();render();$('editor').close();
}catch(error){$('edit-error').textContent=error.message;}};
$('products').onclick=e=>{const b=e.target.closest('button');if(!b)return;const p=products.find(p=>p.id===(b.dataset.edit||b.dataset.delete));if(!p)return;if(b.dataset.edit)openEditor(p);else if(confirm(`Xóa “${p.name}” khỏi danh sách?`)){products=products.filter(x=>x.id!==p.id);persist();options();render();}};
$('products').onchange=e=>{const p=products.find(p=>p.id===e.target.dataset.pick);if(p){p.picked=e.target.checked;persist();render();}};
filters.onsubmit=e=>e.preventDefault();filters.oninput=()=>render();filters.onchange=()=>render();filters.onreset=()=>setTimeout(render,0);
$('preset').onclick=()=>{filters.reset();for(const [key,value] of Object.entries({maxPrice:'300000',minCommission:'5',minRating:'4.5',minSold:'100',minDemo:'3'}))filters.elements[key].value=value;render();$('message').textContent='Đã áp dụng ngưỡng tham khảo cho người mới. Đây không phải dự báo doanh số; bạn có thể sửa từng điều kiện.';};
function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('template').onclick=()=>download('mau-san-pham.csv','\uFEFF'+columns.join(',')+'\r\n','text/csv;charset=utf-8');
function exportList(selected){const list=selected?products.filter(p=>p.picked):products;if(!list.length){$('message').textContent='Chưa có sản phẩm để xuất.';return;}if(selected)download('san-pham-da-chon.csv',toCSV(list),'text/csv;charset=utf-8');else download('videodesk-san-pham.json',JSON.stringify(list.map(({id,...p})=>p),null,2),'application/json');}
$('export-all').onclick=()=>exportList(false);$('export-picked').onclick=()=>exportList(true);
$('file').onchange=async e=>{try{
  const file=e.target.files[0];if(!file)return;if(file.size>5_000_000)throw Error('Tệp tối đa 5 MB.');
  const json=file.name.toLowerCase().endsWith('.json'),text=await file.text();
  const values=importProducts(text,json?'json':'csv');
  const raw=json?JSON.parse(text):[];
  const seen=new Set(products.map(p=>p.url).filter(Boolean));let duplicates=0;
  const additions=[];for(const [i,p]of values.entries()){if(p.url&&seen.has(p.url)){duplicates++;continue;}if(p.url)seen.add(p.url);additions.push({...p,id:crypto.randomUUID(),picked:json&&raw[i]?.picked===true});}
  if(products.length+additions.length>2000)throw Error('Sau khi nhập sẽ vượt quá 2.000 sản phẩm. Chưa thay đổi danh sách.');
  products.push(...additions);$('message').textContent=`Đã nhập ${additions.length} sản phẩm; bỏ qua ${duplicates} liên kết trùng.`;persist();options();render();
}catch(error){$('message').textContent=`Không nhập được: ${error.message} Danh sách hiện có được giữ nguyên.`;}finally{e.target.value='';}};
options();render();
function receiveDraft(){
  if(!location.hash.startsWith('#import-product='))return;
  const payload=location.hash.slice('#import-product='.length);
  history.replaceState(null,'',location.pathname+location.search);
  try{
    if(payload.length>24000)throw Error('Dữ liệu sản phẩm quá lớn.');
    const draft=normalizeProduct(JSON.parse(decodeURIComponent(payload)));
    if(!shopeeLink(draft.url))throw Error('Bản nháp phải có liên kết sản phẩm Shopee hợp lệ.');
    const old=products.find(p=>p.url===draft.url);
    openEditor(old?{...old,...draft,commission:old.commission,shopRating:old.shopRating,demo:old.demo,rights:old.rights,category:old.category}:draft);
    $('message').textContent=old?'Đã có sản phẩm này: kiểm tra bản cập nhật trước khi lưu.':'Đã nhận bản nháp. Kiểm tra tên, giá, biến thể và các số liệu còn thiếu trước khi lưu.';
  }catch(e){$('message').textContent='Không nhận được sản phẩm: '+e.message;}
}
$('open-product').onclick=()=>{
  const url=shopeeLink($('product-link').value.trim());
  if(!url){$('link-status').textContent='Nhập link đầy đủ dạng shopee.vn/product/shopId/itemId hoặc tên-sản-phẩm-i.shopId.itemId. Với link rút gọn, mở link rồi sao chép địa chỉ đầy đủ.';return;}
  window.open(url,'_blank','noopener,noreferrer');
  $('link-status').textContent='Đã yêu cầu mở trang Shopee. Khi trang tải xong, bấm tiện ích VideoDesk → Lấy thông tin trang đang mở. Nếu trình duyệt chặn tab mới, hãy cho phép popup.';
};
let researchDraft=[];
function receiveResearch(){
 if(!location.hash.startsWith('#import-research='))return;
 const payload=location.hash.slice('#import-research='.length);
 history.replaceState(null,'',location.pathname+location.search);
 try{
  if(payload.length>180000)throw Error('Kết quả quá lớn. Hãy nhập tệp JSON thay thế.');
  const values=JSON.parse(decodeURIComponent(payload));
  if(!Array.isArray(values)||!values.length||values.length>40)throw Error('Cần từ 1–40 sản phẩm.');
  researchDraft=values.map(p=>normalizeProduct(p));
  if(researchDraft.some(p=>!shopeeLink(p.url)))throw Error('Kết quả phải có liên kết sản phẩm Shopee hợp lệ.');
  const dedup=new Map(researchDraft.map(p=>[p.url,p]));researchDraft=[...dedup.values()];
  $('research-summary').textContent=`${researchDraft.length} sản phẩm trong lượt nghiên cứu này.`;
  $('research-items').innerHTML=researchDraft.map(p=>`<p><b>${esc(p.name)}</b><br>${num(p.price)}${p.price==null?'':' đ'} · ${num(p.rating)}/5 · Đã bán ${num(p.sold)}</p>`).join('');
  $('research-review').showModal();
 }catch(e){researchDraft=[];$('message').textContent='Không nhận được kết quả nghiên cứu: '+e.message;}
}
$('cancel-research').onclick=()=>{researchDraft=[];$('research-review').close();};
$('save-research').onclick=()=>{
 const existing=new Map(products.map(p=>[p.url,p]));
 const newCount=researchDraft.filter(p=>!existing.has(p.url)).length;
 if(products.length+newCount>2000){$('research-summary').textContent='Danh sách vượt giới hạn 2.000 sản phẩm. Xuất dữ liệu và dọn danh sách trước khi nhập.';return;}
 for(const draft of researchDraft){
  const old=existing.get(draft.url);
  if(old)Object.assign(old,{...draft,commission:old.commission,shopRating:old.shopRating,demo:old.demo,rights:old.rights,category:old.category||draft.category});
  else {const p={...draft,id:crypto.randomUUID(),picked:false};products.unshift(p);existing.set(p.url,p);}
 }
 $('message').textContent=`Đã lưu/cập nhật ${researchDraft.length} sản phẩm từ lượt nghiên cứu. Hoa hồng còn thiếu cần kiểm tra trong tài khoản affiliate.`;
 persist();options();render();researchDraft=[];$('research-review').close();
};
function receive(){receiveDraft();receiveResearch();}
window.addEventListener('hashchange',receive);receive();
