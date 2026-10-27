export const columns = ['name','platform','category','url','price','commission','rating','sold','shopRating','demo','rights'];
const ranges = {price:[0,1e12],commission:[0,100],rating:[0,5],sold:[0,1e12],shopRating:[0,5],demo:[1,5]};
export function normalizeProduct(raw) {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) throw Error('Mỗi sản phẩm phải là một đối tượng.');
  const p = {};
  for (const field of ['name','platform','category','url']) p[field] = String(raw[field] ?? '').trim().slice(0, field === 'url' ? 2000 : 200);
  if (!p.name) throw Error('Thiếu tên sản phẩm.');
  if (p.url) { let u; try {u=new URL(p.url);} catch {throw Error('Liên kết sản phẩm không hợp lệ.');} if (!['https:','http:'].includes(u.protocol)) throw Error('Liên kết chỉ hỗ trợ HTTP/HTTPS.'); }
  for (const [field,[min,max]] of Object.entries(ranges)) {
    const input = raw[field];
    if (input == null || String(input).trim() === '') { p[field] = null; continue; }
    if (typeof input !== 'number' && (typeof input !== 'string' || !/^\d+(\.\d+)?$/.test(input.trim()))) throw Error(`${field}: dùng số không có dấu phân cách hàng nghìn, dấu chấm cho phần thập phân.`);
    const n = Number(input);
    if (!Number.isFinite(n) || n < min || n > max || (field === 'sold' && !Number.isInteger(n))) throw Error(`${field}: giá trị ngoài khoảng ${min}–${max}.`);
    p[field] = n;
  }
  p.rights = String(raw.rights || 'unknown').trim().toLowerCase();
  if (!['yes','no','unknown'].includes(p.rights)) throw Error('rights chỉ nhận yes, no hoặc unknown.');
  return p;
}
export function parseCSV(text) {
  text = text.replace(/^\uFEFF/, '');
  const rows = []; let row = [], field = '', quoted = false, closed = false;
  const endField = () => {row.push(field); field=''; closed=false;};
  const endRow = () => {endField(); if(row.some(v=>v.trim())) rows.push(row); row=[];};
  for(let i=0;i<text.length;i++) {
    const c=text[i];
    if(quoted) { if(c==='"') {if(text[i+1]==='"'){field+='"';i++;}else{quoted=false;closed=true;}}else field+=c; continue; }
    if(c===','){endField();continue;}
    if(c==='\r'||c==='\n'){if(c==='\r'&&text[i+1]==='\n')i++;endRow();continue;}
    if(closed) throw Error('CSV không hợp lệ: có ký tự sau dấu ngoặc kép.');
    if(c==='"'){if(field)throw Error('CSV không hợp lệ: dấu ngoặc kép trong ô chưa được bao.');quoted=true;}else field+=c;
  }
  if(quoted) throw Error('CSV chưa đóng dấu ngoặc kép.');
  if(field||row.length||closed)endRow();
  if(!rows.length)throw Error('Tệp CSV trống.');
  const headers=rows.shift().map(s=>s.trim());
  if(!headers.includes('name')||new Set(headers).size!==headers.length||headers.some(h=>!columns.includes(h))) throw Error('Tên cột không hợp lệ. Hãy dùng mẫu CSV của ứng dụng.');
  return rows.map((values,i)=>{if(values.length!==headers.length)throw Error(`Dòng ${i+2}: số ô không khớp tiêu đề.`);return Object.fromEntries(headers.map((h,j)=>[h,values[j]]));});
}
export function importProducts(text, type) {
  const raw = type === 'json' ? JSON.parse(text) : parseCSV(text);
  if(!Array.isArray(raw)||raw.length>2000)throw Error('Danh sách phải là mảng, tối đa 2.000 sản phẩm.');
  return raw.map((p,i)=>{try{return normalizeProduct(p);}catch(e){throw Error(`Sản phẩm ${i+1}: ${e.message}`);}});
}
export function grossCommission(p) { return p.price == null || p.commission == null ? null : p.price*p.commission/100; }
export function matches(p, f) {
  if(f.query && !`${p.name} ${p.category}`.toLocaleLowerCase('vi').includes(f.query.toLocaleLowerCase('vi')))return false;
  if(f.platform && p.platform !== f.platform)return false;
  if(f.category && p.category !== f.category)return false;
  const checks = [['price',f.maxPrice,(a,b)=>a<=b],['commission',f.minCommission,(a,b)=>a>=b],['rating',f.minRating,(a,b)=>a>=b],['sold',f.minSold,(a,b)=>a>=b],['shopRating',f.minShopRating,(a,b)=>a>=b],['demo',f.minDemo,(a,b)=>a>=b]];
  for(const [field,limit,compare] of checks) if(limit!==''&&limit!=null&&(p[field]==null||!compare(p[field],Number(limit))))return false;
  if(f.rights && p.rights!=='yes')return false;
  return true;
}
export function sortProducts(list, by) {
  return [...list].sort((a,b)=>{
    const x=by==='gross'?grossCommission(a):a[by], y=by==='gross'?grossCommission(b):b[by];
    if(x==null)return y==null?0:1;if(y==null)return -1;
    return y-x;
  });
}
export function toCSV(products) {
  const cell = value => {let s=String(value??'');if(/^[\s]*[=+@-]/.test(s))s="'"+s;return '"'+s.replace(/"/g,'""')+'"';};
  return '\uFEFF'+[columns.join(','),...products.map(p=>columns.map(c=>cell(p[c])).join(','))].join('\r\n');
}
