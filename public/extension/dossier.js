import {makeBrief} from './brief-core.js';
const $=id=>document.getElementById(id),key='videodesk.dossier.latest';
let dossier=null;
function safeMedia(value){try{const u=new URL(value);return u.protocol==='https:'&&/(^|\.)(susercontent\.com|shopee\.vn|shopee\.com|shopeemobile\.com)$/.test(u.hostname)?u.href:null;}catch{return null;}}
function refresh(){if(dossier)$('brief').value=makeBrief(dossier,{platform:$('platform').value,duration:$('duration').value,audience:$('audience').value,notes:$('notes').value});}
try{
 dossier=JSON.parse(localStorage.getItem(key)||'null');
 if(!dossier?.product?.name||!dossier.details||!dossier.media||!Array.isArray(dossier.missing))throw Error('Chưa có hồ sơ. Mở sản phẩm Shopee và bấm tiện ích → Quét hồ sơ cho AI.');
 const p=dossier.product;
 const source=new URL(p.url);if(source.protocol!=='https:'||source.hostname!=='shopee.vn')throw Error('Liên kết nguồn không hợp lệ.');
 $('name').textContent=p.name;$('source').href=source.href;
 $('metrics').textContent=`Giá: ${p.price==null?'chưa xác định':new Intl.NumberFormat('vi-VN').format(p.price)+' đ'} · Điểm: ${p.rating??'?'}/5 · Đã bán: ${p.sold??'?'} (kỳ chưa rõ)`;
 $('captured').textContent=`Quét lúc ${new Date(p.capturedAt).toLocaleString('vi-VN')} · ${p.captureNote}`;
 $('description').textContent=dossier.details.description||'Chưa đọc được mô tả. Mở rộng mục mô tả trên Shopee và quét lại, hoặc bổ sung ở ghi chú.';
 for(const spec of dossier.details.specifications||[]){const dt=document.createElement('dt'),dd=document.createElement('dd');dt.textContent=spec.name;dd.textContent=spec.value;$('specifications').append(dt,dd);}
 $('options').textContent=(dossier.details.options||[]).map(o=>`${o.name}: ${o.values.join(', ')} · đang chọn: ${o.selected.join(', ')||'chưa đọc được'}`).join('\n')||'Chưa đọc được phân loại đang chọn.';
 $('missing').textContent=dossier.missing.join(' · ');$('warnings').textContent=(dossier.warnings||[]).join(' ');
 for(const media of dossier.media.images||[]){const url=safeMedia(media.url);if(!url)continue;const div=document.createElement('div');div.className='image';const img=document.createElement('img');img.src=url;img.alt='Ảnh tham khảo từ trang sản phẩm';img.loading='lazy';img.referrerPolicy='no-referrer';const a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Mở ảnh nguồn ↗';const label=document.createElement('p');label.textContent=media.source;div.append(img,a,label);$('images').append(div);}
 if(!$('images').children.length)$('images').textContent='Chưa tìm thấy ảnh sản phẩm phù hợp. Có thể bổ sung ảnh thủ công khi gửi cho AI.';
 for(const media of dossier.media.videos||[]){const url=safeMedia(media.url);if(!url)continue;const p=document.createElement('p'),a=document.createElement('a');a.href=url;a.target='_blank';a.rel='noopener noreferrer';a.textContent='Mở nguồn video ↗';p.append(a);$('videos').append(p);}
 $('report').hidden=false;refresh();
}catch(e){dossier=null;$('status').textContent=e.message;}
for(const id of ['platform','duration','audience','notes'])$(id).addEventListener('input',refresh);
$('copy').onclick=async()=>{refresh();try{await navigator.clipboard.writeText($('brief').value);$('status').textContent='Đã sao chép. Dán vào AI bạn dùng; đính kèm ảnh được phép sử dụng nếu cần.';}catch{$('brief').closest('details').open=true;$('brief').focus();$('brief').select();$('status').textContent='Trình duyệt chưa cho sao chép. Nội dung đã được chọn: nhấn Ctrl+C.';}};
function download(name,text,type){const url=URL.createObjectURL(new Blob([text],{type}));const a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);}
$('markdown').onclick=()=>{refresh();download('ho-so-san-pham-ai.md',$('brief').value,'text/markdown;charset=utf-8');};
$('json').onclick=()=>download('ho-so-san-pham-ai.json',JSON.stringify(dossier,null,2),'application/json');
$('to-app').onclick=()=>chrome.tabs.create({url:'https://tai23082004l02-svg.github.io/game-mobile/products.html#import-product='+encodeURIComponent(JSON.stringify(dossier.product))});
$('clear').onclick=()=>{if(confirm('Xóa hồ sơ gần nhất trên trình duyệt này? Tệp đã tải không bị xóa.')){localStorage.removeItem(key);dossier=null;$('report').hidden=true;$('status').textContent='Đã xóa hồ sơ trên máy. Mở sản phẩm khác để quét tiếp.';}};
