export const topics = {
  room: {name:'Phòng trọ / góc làm việc',queries:['kệ để bàn','kẹp giữ dây điện','bàn chải vệ sinh khe']},
  kitchen: {name:'Đồ bếp nhỏ gọn',queries:['kệ nắp nồi','lọc rác bồn rửa','hộp chia ngăn tủ bếp']},
  cleaning: {name:'Đồ vệ sinh nhà cửa',queries:['cây lăn bụi','bàn chải khe cửa','dụng cụ gom tóc']}
};
export function assess(p,maxPrice=300000) {
  let score=0;const reasons=[],missing=[],warnings=[];
  if(p.price==null)missing.push('giá');
  else if(p.price>0&&p.price<=maxPrice){score+=30;reasons.push('Giá nằm trong ngân sách');}
  else warnings.push(p.price===0?'Giá 0 cần xác minh':'Giá vượt ngân sách');
  if(p.rating==null)missing.push('đánh giá');
  else if(p.rating>=4.5){score+=30;reasons.push('Điểm sản phẩm từ 4,5/5');}
  else warnings.push('Điểm sản phẩm dưới 4,5/5');
  if(p.sold==null)missing.push('số đã bán');
  else if(p.sold>=100){score+=20;reasons.push('Có ít nhất 100 lượt bán hiển thị');}
  else warnings.push('Lượt bán hiển thị còn ít');
  missing.push('hoa hồng affiliate','chất lượng shop','quyền dùng tư liệu');
  return {score,reasons,missing,warnings,label:score===80?'Ưu tiên kiểm tra mẫu':score>=30?'Cần xem thêm':'Chưa đủ cơ sở'};
}
