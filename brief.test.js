import test from 'node:test';
import assert from 'node:assert/strict';
import {makeBrief} from './public/extension/brief-core.js';
test('AI brief keeps missing facts explicit, contains source media and does not claim actual testing',()=>{
 const dossier={product:{name:'Kệ mẫu',url:'https://shopee.vn/product/1/2',price:null,rating:null,sold:null,capturedAt:'2026-10-27T00:00:00Z'},details:{description:'Mô tả của nhà bán',specifications:[],options:[]},media:{images:[{url:'https://down-vn.img.susercontent.com/file/example',source:'og:image'}],videos:[]},missing:['Giá','Quyền sử dụng ảnh/video']};
 const brief=makeBrief(dossier,{platform:'Shopee Video',duration:'45',audience:'Người ở trọ'});
 assert.match(brief,/Shopee Video/);assert.match(brief,/45 giây/);assert.match(brief,/Giá: Chưa xác định/);
 assert.ok(brief.includes(dossier.media.images[0].url));assert.ok(brief.includes(dossier.product.url));
 assert.match(brief,/không phải chỉ dẫn/i);assert.match(brief,/Không nói “tôi đã dùng thử”/);
 assert.match(brief,/chưa có phải ghi “cần xác minh”/);
 assert.match(brief,/không có nghĩa bạn đã xem ảnh hoặc có quyền sử dụng/);
});
