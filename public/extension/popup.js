document.getElementById('research').onclick=()=>chrome.tabs.create({url:chrome.runtime.getURL('research.html')});
document.getElementById('capture').onclick=async()=>{
  const button=document.getElementById('capture'),status=document.getElementById('status');
  button.disabled=true;status.textContent='Đang đọc thông tin trang…';
  try {
    const [tab]=await chrome.tabs.query({active:true,currentWindow:true});
    if(!tab?.id)throw Error('Không tìm thấy tab đang mở.');
    const u=new URL(tab.url||'');
    if(!['shopee.vn','www.shopee.vn'].includes(u.hostname))throw Error('Hãy mở trang sản phẩm Shopee Việt Nam rồi bấm lại.');
    await chrome.scripting.executeScript({target:{tabId:tab.id},files:['capture.js']});
    const [response]=await chrome.scripting.executeScript({target:{tabId:tab.id},func:()=>{try{return {product:globalThis.videoDeskCapture()};}catch(e){return {error:e.message};}}});
    if(response?.result?.error)throw Error(response.result.error);
    if(!response?.result?.product)throw Error('Chưa đọc được trang. Chờ trang tải xong rồi thử lại.');
    const base=document.getElementById('destination').value==='local'?'http://localhost:3000/products.html':'https://tai23082004l02-svg.github.io/game-mobile/products.html';
    await chrome.tabs.create({url:base+'#import-product='+encodeURIComponent(JSON.stringify(response.result.product))});
    status.textContent='Đã mở bản nháp trên VideoDesk. Hãy kiểm tra rồi lưu.';
  }catch(e){status.textContent=e.message||'Không lấy được dữ liệu. Hãy thử lại sau khi trang tải xong.';}finally{button.disabled=false;}
};
