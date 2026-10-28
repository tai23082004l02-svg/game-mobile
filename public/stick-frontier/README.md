# Vệ Binh Biên Giới

Bản chơi thử game chiến thuật người que, giao diện tiếng Việt, tối ưu cảm ứng. Đồ họa vector được vẽ bằng Canvas, không sử dụng tài nguyên của Stick War hoặc game trong ảnh tham khảo.

## Chơi

Mở `https://tai23082004l02-svg.github.io/game-mobile/stick-frontier/` sau khi workflow Pages triển khai thành công. Xoay ngang điện thoại để có góc nhìn rộng. Chọn màn, tuyển thợ mỏ và quân, rồi chọn Tấn công. Kéo bản đồ để xem căn cứ địch. Có 5 màn, 4 loại đơn vị, 3 mệnh lệnh, hàng chờ huấn luyện, tạm dừng và lưu màn đã mở bằng localStorage.

## Phát triển

Phục vụ thư mục `public` bằng một HTTP server tĩnh, ví dụ `python3 -m http.server 8080 --directory public`, rồi mở `/stick-frontier/`. Không có bước cài thư viện hoặc build. Chạy `node --test stick-frontier.test.mjs` để kiểm tra mô phỏng. Workflow Pages hiện có chạy toàn bộ `npm test` và triển khai thư mục `public`.

`engine.mjs` chứa logic chiến đấu độc lập giao diện; `game.mjs` chứa vẽ Canvas, điều khiển và âm thanh tổng hợp tùy chọn. `style.css` hỗ trợ cả dọc/ngang và vùng an toàn màn hình.

Tiến trình chỉ lưu màn đã mở, không khôi phục trận đang chơi. Chưa tích hợp quảng cáo, tài khoản, multiplayer, service worker hoặc đóng gói APK/AAB. Sau khi tải trang, trận đấu không cần gọi mạng; mở lại hoàn toàn offline chưa được đảm bảo. Bản thử cần tiếp tục cân bằng và kiểm tra trực tiếp trên thiết bị trước phát hành Android.
