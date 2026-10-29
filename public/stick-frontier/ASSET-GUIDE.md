# Bộ nhân vật minh họa v3

Sáu lớp nhân vật, hai phe, tổng 936 frame duy nhất. Đây là chính bộ ảnh đã tích hợp vào game.

## Sheet và cách cắt

- 12 sheet chính, mỗi sheet 2304 × 1152: 12 cột × 6 hàng.
- Hàng: idle, run, attack, skill, hit, death.
- 2 sheet thợ mỏ 2304 × 576: 12 cột × 3 hàng dig, carry, unload.
- 2 sheet đào độc lập 2304 × 192 được giữ làm bản tải tiện dụng; frame đào đã tính trong 936 frame, không tính lặp.
- Mỗi ô 192 × 192, điểm neo chân **(96,168)**, khoảng đệm tối thiểu **16 pixel** quanh nội dung.
- Không trim, không xoay từng ô, không thay tỷ lệ theo từng frame. Hai phe dùng cùng hình học và thời gian.
- Cắt: x = cột × 192; y = hàng × 192; width = height = 192.
- `character-frames.json` có đủ 936 bản ghi atlas, tọa độ cắt, pivot và thời lượng.
- `character-layout.mjs` là nguồn chung cho công cụ dựng và bộ vẽ trong game.

## Động tác

Đứng có nhịp thở; chạy có chân trụ/chân vung; tấn công có lấy đà, tiếp xúc và thu vũ khí. Bị hạ dùng các khớp hạ thân xuống, không xoay cả ảnh khiến vũ khí tràn ra ngoài. Các lớp có mũ, giáp, áo choàng và vũ khí riêng.

Thợ mỏ có chu kỳ đào 1,25 giây, tiếp xúc ở frame 8. Đào đủ một chuyến rồi mang túi vàng về trụ; động tác giao kéo dài 0,45 giây, giao xong mới cộng tiền. Vàng thưởng cũng phải vận chuyển. Không thay đổi cơ chế kinh tế này khi nâng cấp hình ảnh.

## Kiểm tra không cắt góc

1. `node tools/build-frontier-assets.mjs`: dựng SVG, bảng minh họa và tọa độ.
2. `node tools/export-frontier-png.mjs`: xuất PNG bằng Chromium/Playwright.
3. `python3 tools/verify-frontier-frames.py`: đọc kênh alpha từng ô PNG, kiểm tra biên 16 pixel, ghi SHA-256 của từng SVG vào `character-bounds.json`. Cần Pillow ở môi trường phát triển.
4. `node tools/verify-frontier-source.mjs`: đo cả tư thế vector chưa cắt để phát hiện phần nằm ngoài ô, ghi `character-source-check.json`.
5. `npm test`: kiểm tra renderer, tọa độ, điểm neo và báo cáo tương ứng với SVG đang lưu.
6. `python3 tools/pack-frontier-assets.py`: đóng gói.

Bước 2 và 4 cần Playwright hoặc Playwright Core cùng Chromium. Có thể chọn bản cài sẵn qua FRONTIER_PLAYWRIGHT_MODULE và FRONTIER_CHROMIUM.

`characters-overview.png` là bảng minh họa có nhãn, dựng từ chính các frame thật; không dùng làm atlas trong runtime. Các atlas có nền trong suốt. Gói ZIP có SVG, PNG, manifest và nguồn dựng. Xem ART-LICENSE.txt.
