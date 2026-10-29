# Bộ đồ họa Vệ Binh Biên Giới — phiên bản 2

## Nội dung

- 12 sheet nhân vật: 6 lớp × 2 phe (jade/ngọc bích, ember/hỏa thạch).
- Mỗi sheet 1024 × 768, gồm 8 cột × 6 hàng, ô 128 × 128, 48 khung. Tổng 576 khung nhân vật.
- Thứ tự hàng: `idle`, `run`, `attack`, `skill`, `hit`, `death`.
- Sheet hiệu ứng `effects.svg`: 1024 × 1536, 8 cột × 12 hàng; thứ tự hàng nằm trong `manifest.json`.
- 16 biểu tượng riêng và một sheet 512 × 128; 6 chân dung.
- 4 nền 1800 × 480: meadow, pass, valley, citadel.
- Sheet đạo cụ 768 × 256: căn cứ phe ngọc, căn cứ phe hỏa, mỏ vàng.
- Ảnh bìa PNG gốc. 25 ảnh PNG được xuất từ vector trong thư mục `png/` của gói ZIP.

Các sheet nhân vật, hiệu ứng và đạo cụ có nền trong suốt. Không có hình ảnh lấy từ game tham khảo.

## Tọa độ và hoạt ảnh

`sourceX = frame * 128`, `sourceY = row * 128`.
Điểm neo mặc định: `(64, 112)` trong ô. Mã nguồn vector có khoảng trống để vũ khí không tràn sang ô khác.
`artScale` trong manifest là tỷ lệ dựng hình trong ô; game hiển thị ô 148 pixel thế giới để nhân vật dễ nhìn.
Với `death`, cộng offset hạ thân `size * deathDrop * min(1, animationTime / 0.7)` như trong `art.mjs`.

- Đứng: 6 fps, lặp.
- Chạy: 12 fps, lặp.
- Đánh/kỹ năng: 14 fps trong game, không lặp; khai thác của thợ mỏ lặp.
- Trúng đòn: 18 fps, không lặp.
- Bị hạ: 10 fps, không lặp, sau đó xóa xác.

Hai phe cùng hướng trên sheet; game lật ngang phe địch. Không lật sheet ở bước xuất file.

## Kỹ năng đã tích hợp

| Quân | Kỹ năng riêng |
|---|---|
| Thợ mỏ | Mạch vàng: thưởng 35 vàng sau chu kỳ 24 giây |
| Kiếm sĩ | Trảm nguyệt: sát thương cận chiến lên tối đa ba mục tiêu |
| Cung thủ | Xuyên phong: hai mũi tên bỏ qua giáp |
| Hộ vệ | Thiết bích: giảm 70% sát thương trong ba giây |
| Thương binh | Phá giáp: đòn đâm bỏ qua giáp |
| Pháp sư | Băng hoàn: sát thương vùng và làm chậm |

Chỉ huy có Mưa tên, Hồi phục, Chiến kỳ và Thiên thạch. Chỉ số cụ thể nằm trong `engine.mjs` và màn Quân đoàn & kỹ năng. Các hiệu ứng gắn với sát thương/hồi máu thật trong mô phỏng, không chỉ là hình ảnh trình diễn.

## Dựng lại

Từ thư mục gốc dự án:

1. `node tools/build-frontier-assets.mjs` để dựng SVG và manifest.
2. Cài Playwright vào môi trường phát triển nếu chưa có, rồi chạy `node tools/export-frontier-png.mjs` để xuất PNG. Có thể dùng Playwright Core với `FRONTIER_PLAYWRIGHT_MODULE` và `FRONTIER_CHROMIUM` trỏ tới bản cài sẵn.
3. `python3 tools/pack-frontier-assets.py` để đóng gói ZIP.

Bước dựng SVG không cần thư viện ngoài. Bước xuất PNG dùng Chromium để vẽ SVG, không chỉnh sửa ảnh bìa AI. Gói ZIP chứa nguồn dựng vector và nguồn xuất PNG. Xem `ART-LICENSE.txt`.

## Cập nhật đào vàng — v2.3

Thêm `gold-mine.png` và hai sheet `miner-dig-jade` / `miner-dig-ember` ở cả SVG và PNG. Mỗi sheet 1536 × 128, 12 khung 128 × 128, điểm neo (64,112). Chu kỳ 1,25 giây; cuốc chạm đá tại khung 8, bốn nhịp đào đủ 22 vàng trong túi; phải mang về trụ và giao xong mới cộng ngân khố. Chỉ thợ mỏ đã tới vị trí làm việc mới đào và tạo thu nhập. Xem `mining` trong manifest. Bộ ZIP hiện có 27 bản PNG xuất từ vector, ngoài các ảnh minh họa gốc.
