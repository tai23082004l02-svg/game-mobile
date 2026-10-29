# Vệ Binh Biên Giới — v2

Game chiến thuật người que chơi đơn, giao diện tiếng Việt, điều khiển cảm ứng. Mở `https://tai23082004l02-svg.github.io/game-mobile/stick-frontier/` và xoay ngang điện thoại.

## Đã triển khai

- 20 màn theo 4 vùng đất, đội trưởng tinh nhuệ ở các màn cuối vùng; mở màn tuần tự, lưu sao và thời gian tốt nhất.
- 6 loại quân với kỹ năng tự động: thợ mỏ, kiếm sĩ, cung thủ, hộ vệ, thương binh và pháp sư. Thương binh mở màn 3, pháp sư mở màn 5.
- 4 kỹ năng chỉ huy: Mưa tên, Hồi phục, Chiến kỳ và Thiên thạch; kiểm tra linh lực, hồi chiêu, vùng tác dụng và thời gian rơi.
- Bộ đồ họa gốc: 12 sheet × 48 khung nhân vật, 12 hiệu ứng × 8 khung, 4 địa hình, 6 chân dung, 16 biểu tượng, đạo cụ và ảnh bìa.
- Hoạt ảnh gắn với chiến đấu; đạn bay, sát thương, giáp, giảm sát thương, làm chậm và xác bị hạ.
- Thư viện Quân đoàn & kỹ năng, Xưởng đồ họa có xem trước và tải SVG/PNG/ZIP.
- Tạm dừng, thu phóng theo kích thước màn hình, kéo bản đồ, âm báo tùy chọn, hủy lính cuối hàng chờ hoàn vàng.
- Service worker lưu tài nguyên sau khi cài cache thành công, để mở lại và chơi offline. Không cần máy chủ game. Nếu trình duyệt xóa bộ nhớ/cache hoặc lần tải đầu chưa hoàn tất, phải tải lại bằng mạng.

## Chạy và kiểm tra

`npm start`, mở `http://localhost:3000/stick-frontier/`; hoặc phục vụ thư mục `public` bằng một HTTP server tĩnh. Không cần cài thư viện để chạy game.

`npm test` chạy kiểm tra toàn kho, `node stick-frontier.test.mjs` chỉ kiểm tra game. Chi tiết bộ đồ họa và cách dựng lại trong `ASSET-GUIDE.md`. Công cụ QA và xuất PNG dùng Playwright, chỉ cần ở môi trường phát triển. Sau khi mở server, chạy `node tools/frontier-browser-check.mjs` để kiểm tra trình duyệt, cảm ứng, tải PNG và offline. Ảnh QA lưu trong `work/frontier-qa/`.

## Cấu trúc

- `engine.mjs`: mô phỏng độc lập giao diện và dữ liệu quân, kỹ năng, chiến dịch.
- `art.mjs`: tải atlas, cắt khung và vẽ.
- `game.mjs`: vòng chơi, giao diện, nhập cảm ứng, lưu tiến trình.
- `library.mjs`: thư viện quân và xưởng đồ họa.
- `assets/manifest.json`: kích thước, điểm neo, hàng hoạt ảnh, tọa độ hiệu ứng.
- `tools/build-frontier-assets.mjs`: nguồn vector có thể dựng lại.

## Giới hạn hiện tại

Đây là bản web nâng cấp, chưa phải APK/AAB. Chưa tích hợp quảng cáo, mua hàng, đồng bộ cloud hoặc PvP. Tiến trình lưu màn/sao/thời gian/cài đặt trên trình duyệt, chưa lưu giữa trận. Cân bằng 20 màn là bước đầu và vẫn cần phản hồi chơi thật. Kiểm thử trình duyệt giả lập cảm ứng không thay thế việc thử trên S23 Ultra thật.

### v2.3 — Mỏ vàng
Ảnh mỏ vàng lớn, sáu vị trí làm việc không trùng nhau, sheet đào 12 khung riêng cho hai phe, đá/vàng văng theo nhịp cuốc. Bốn nhịp đào nhận 22 vàng; thợ mỏ không nhận thu nhập khi đang đi tới mỏ. Xưởng đồ họa có xem trước và tải sheet đào.

### v2.4 — Giao vàng tại trụ
Thợ mỏ đào đủ một chuyến rồi mang túi vàng về trụ, giao trong 0,45 giây mới cộng ngân khố. Vàng Mạch vàng cũng phải vận chuyển. Nếu bị hạ trước khi giao, số vàng đang mang bị mất. Không còn thu nhập vàng tự động theo thời gian. Thanh dưới hiển thị vàng đang vận chuyển.
