# Vệ Binh Biên Giới — v3

Game chiến thuật người que chơi đơn, tiếng Việt, điều khiển cảm ứng. Mở https://tai23082004l02-svg.github.io/game-mobile/stick-frontier/ và xoay ngang điện thoại.

## Nhân vật và hình ảnh

Sáu lớp quân, hai phe; 12 sheet chính (12 cột × 6 hàng) và 2 sheet thợ mỏ (12 cột × 3 hàng), tổng 936 frame minh họa duy nhất. Ô 192 × 192, điểm neo chân (96,168), khoảng đệm alpha tối thiểu 16 px. Không trim hoặc đổi tỷ lệ theo từng frame. Hai sheet đào độc lập được giữ làm bản tải tiện dụng.

Động tác: đứng/thở, chạy, tấn công, kỹ năng, trúng đòn, bị hạ. Thợ mỏ có đào, mang túi vàng và giao vàng tại trụ. Mỗi lớp có giáp, mũ, trang phục và vũ khí riêng. Các động tác dùng khớp tay/chân, có lấy đà và thu vũ khí.

Xưởng đồ họa có xem trước, chọn phe/động tác, tải PNG/SVG/ZIP, bảng minh họa từ frame thật, tọa độ cắt và báo cáo biên. Xem ASSET-GUIDE.md để dựng lại và kiểm tra.

## Cách chơi

20 màn theo 4 vùng đất. Tuyển thợ mỏ và quân; điều lệnh phòng thủ/tấn công/rút lui; dùng Mưa tên, Hồi phục, Chiến kỳ và Thiên thạch. Thương binh mở màn 3, pháp sư mở màn 5.

Thợ mỏ đào đủ một chuyến rồi mang túi về trụ. Giao xong mới cộng vàng, kể cả vàng thưởng. Bị hạ giữa đường sẽ mất số vàng đang mang. Ngân khố không tự tăng theo thời gian.

Lưu màn mở, sao, thời gian tốt nhất và cài đặt bằng localStorage. Có tạm dừng, âm báo tùy chọn, kéo bản đồ và service worker lưu tài nguyên để mở lại offline khi cache đã cài xong.

## Phát triển

- `npm start`: mở /stick-frontier/ trên localhost:3000.
- `npm test`: kiểm tra toàn kho, gồm logic game, tọa độ và báo cáo ảnh.
- `node tools/frontier-browser-check.mjs`: kiểm tra cảm ứng, tải PNG và offline, cần Playwright.
- `node tools/build-frontier-assets.mjs`: dựng SVG, bảng minh họa và metadata.
- `node tools/export-frontier-png.mjs`: xuất PNG bằng Chromium.
- `python3 tools/verify-frontier-frames.py`: kiểm tra alpha từng frame bằng Pillow.
- `node tools/verify-frontier-source.mjs`: kiểm tra hình học vector chưa cắt.
- `python3 tools/pack-frontier-assets.py`: tạo bộ đồ họa ZIP.

`character-layout.mjs` là nguồn chung cho kích thước, pivot và thời lượng; `tools/frontier-character-art.mjs` dựng nhân vật; `art.mjs` cắt atlas; `engine.mjs` mô phỏng; `game.mjs` giao diện; `library.mjs` thư viện.

Đây là bản web, chưa đóng gói APK/AAB hoặc tích hợp quảng cáo. Chưa lưu giữa trận, đồng bộ cloud hay PvP. Kiểm thử trình duyệt giả lập không thay thế kiểm tra trực tiếp trên điện thoại thật.
