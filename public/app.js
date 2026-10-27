import { findVideos } from './youtube.js';
import { setupAuth } from './auth.js';
const $ = id => document.getElementById(id);
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const valid = v => v && /^[\w-]{11}$/.test(v.id) && typeof v.snippet?.title === 'string';
let saved = [], results = [], mode = 'discover', key = '', busy = false;
try { $('client-id').value = localStorage.getItem('videodesk.clientId') || ''; } catch {}
const auth = setupAuth({loginButton: $('login'), logoutButton: $('logout'), status: $('account-status'), clientInput: $('client-id'), onChange: () => {}});
try { saved = JSON.parse(localStorage.getItem('videodesk.saved') || '[]').filter(valid); } catch {}
const number = n => n == null ? 'Không có' : new Intl.NumberFormat('vi-VN').format(n);
function persist() { try { localStorage.setItem('videodesk.saved', JSON.stringify(saved)); } catch { $('status').textContent = 'Không thể lưu vào trình duyệt. Hãy xuất JSON để giữ danh sách.'; } $('count').textContent = saved.length; }
function render() {
  $('count').textContent = saved.length;
  const list = mode === 'library' ? saved : results;
  $('empty').hidden = list.length > 0;
  $('grid').innerHTML = list.map(v => {
    const thumb = v.snippet.thumbnails?.medium?.url;
    let safeThumb = '';
    try { const u = new URL(thumb); if (u.protocol === 'https:' && ['i.ytimg.com','img.youtube.com'].includes(u.hostname)) safeThumb = u.href; } catch {}
    return `<article class="card"><div class="thumbnail">${safeThumb ? `<img src="${escape(safeThumb)}" alt="" loading="lazy">` : '▶'}<span class="video-badge">YOUTUBE</span></div><div class="card-body"><p class="channel">${escape(v.snippet.channelTitle)}</p><h3>${escape(v.snippet.title)}</h3><p class="metrics">${v.statistics ? `${number(v.statistics.viewCount)} lượt xem` : 'Thêm API key để xem thống kê'}</p><div class="card-actions"><button data-analyze="${v.id}">Phân tích ↗</button><button data-save="${v.id}" aria-label="${saved.some(x=>x.id===v.id)?'Bỏ lưu':'Lưu video'}">${saved.some(x=>x.id===v.id)?'✓ Đã lưu':'+ Lưu'}</button></div><a class="watch" href="https://www.youtube.com/watch?v=${v.id}" target="_blank" rel="noopener noreferrer">Mở trên YouTube ↗</a></div></article>`;
  }).join('');
}
function switchMode(next) { mode = next; $('discover').classList.toggle('active', next==='discover'); $('library').classList.toggle('active',next==='library'); $('heading').innerHTML=next==='library'?'Những video<br><span>bạn muốn giữ lại.</span>':'Ý tưởng hay bắt đầu từ<br><span>một video.</span>'; $('search-form').hidden=next==='library'; $('library-actions').hidden=next!=='library'; $('results-title').textContent=next==='library'?'Danh sách đã lưu':'Kết quả khám phá'; $('status').textContent=''; render(); }
$('discover').onclick=()=>switchMode('discover'); $('library').onclick=()=>switchMode('library');
for (const id of ['settings','settings-top']) $(id).onclick=()=>$('settings-dialog').showModal();
$('save-key').onclick=()=>{key=$('api-key').value.trim(); try { localStorage.setItem('videodesk.clientId', $('client-id').value.trim()); } catch {} $('settings-dialog').close(); $('api-key').value=''; $('status').textContent='Đã áp dụng cài đặt. Bạn có thể nhấn Đăng nhập Google để kết nối YouTube.';};
$('search-form').onsubmit=async event=>{
  event.preventDefault(); if(busy) return;
  const q=$('query').value.trim(); if(!q) return;
  busy=true; $('search-button').disabled=true; $('status').textContent='Đang lấy dữ liệu từ YouTube…';
  try {
    const data=await findVideos(q,key,$('order').value,fetch,auth.currentToken());
    results=data.videos.filter(valid); render(); $('results-title').textContent=`Kết quả khám phá · ${results.length}`; $('status').textContent=data.notice || (results.length?'Dữ liệu được lấy theo yêu cầu; số liệu có thể thay đổi.':'Không tìm thấy video. Hãy thử từ khóa khác.');
  } catch(error){$('status').textContent=error.message || 'Không thể kết nối máy chủ.';}
  finally {busy=false; $('search-button').disabled=false;}
};
document.querySelectorAll('[data-query]').forEach(b=>b.onclick=()=>{$('query').value=b.dataset.query; $('search-form').requestSubmit();});
$('grid').onclick=event=>{
  const button=event.target.closest('button'); if(!button) return;
  const id=button.dataset.save || button.dataset.analyze;
  const v=[...results,...saved].find(x=>x.id===id); if(!v) return;
  if(button.dataset.save){saved=saved.some(x=>x.id===id)?saved.filter(x=>x.id!==id):[v,...saved];persist();render();return;}
  const s=v.statistics, views=Number(s?.viewCount), likes=Number(s?.likeCount), comments=Number(s?.commentCount);
  const rate=views>0 && s?.likeCount!=null && s?.commentCount!=null ? `${((likes+comments)/views*100).toFixed(2)}%` : 'Không đủ dữ liệu';
  $('analysis').innerHTML=`<div class="eyebrow">PHÂN TÍCH VIDEO</div><h2>${escape(v.snippet.title)}</h2><p>${escape(v.snippet.channelTitle)}</p><div class="stats">${[['Lượt xem',s?.viewCount],['Lượt thích',s?.likeCount],['Bình luận',s?.commentCount]].map(([label,value])=>`<div><small>${label}</small><strong>${number(value)}</strong></div>`).join('')}</div><p><b>Tỷ lệ tương tác công khai:</b> ${rate}</p><p class="hint">Công thức: (lượt thích + bình luận) / lượt xem × 100. Đây là chỉ số tham khảo, không đo thời gian xem hoặc chất lượng nội dung.</p><p>Ngày đăng: ${v.snippet.publishedAt?escape(new Date(v.snippet.publishedAt).toLocaleDateString('vi-VN')):'Không có dữ liệu'}</p><h3>Mô tả từ tác giả</h3><p class="description">${escape(v.snippet.description || 'Chưa có mô tả. Thêm API key và lấy lại video để đọc thông tin đầy đủ.')}</p><p class="hint">Ứng dụng phân tích metadata công khai, chưa phân tích hình ảnh, âm thanh hoặc bản chép lời. Video đã lưu là ảnh chụp dữ liệu tại thời điểm lấy.</p><a class="watch" target="_blank" rel="noopener noreferrer" href="https://www.youtube.com/watch?v=${v.id}">Mở video để tương tác ↗</a>`;
  $('analysis-dialog').showModal();
};
$('export').onclick=()=>{const url=URL.createObjectURL(new Blob([JSON.stringify(saved,null,2)],{type:'application/json'})); const a=document.createElement('a');a.href=url;a.download='videodesk-list.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);};
$('import').onchange=async event=>{try{const file=event.target.files[0];if(!file)return;if(file.size>5_000_000)throw Error('Tệp tối đa 5 MB.');const items=JSON.parse(await file.text());if(!Array.isArray(items)||!items.every(valid))throw Error('Danh sách video không hợp lệ.');saved=[...new Map([...saved,...items].map(v=>[v.id,v])).values()];persist();render();$('status').textContent='Đã nhập danh sách.';}catch(error){$('status').textContent=error.message;}finally{event.target.value='';}};
render();
