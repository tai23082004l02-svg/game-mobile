# VideoDesk — YouTube trên điện thoại

Ứng dụng web tĩnh tiếng Việt chạy trên GitHub Pages, không cần máy chủ hoặc cài Node.js trên điện thoại. Giao diện tự điều chỉnh cho màn hình nhỏ.

## Xuất bản trên GitHub Pages

1. Đưa mã nguồn lên nhánh `main` của kho này.
2. Trong GitHub, mở **Settings → Pages → Build and deployment → Source**, chọn **GitHub Actions**.
3. Workflow **Deploy VideoDesk to GitHub Pages** chạy khi có commit trên `main`. Nếu cần, mở **Actions** và chạy workflow thủ công bằng **Run workflow**.
4. Khi deployment thành công, mở https://tai23082004l02-svg.github.io/game-mobile/ trên Chrome hoặc Safari của điện thoại. Có thể dùng **Thêm vào màn hình chính** trong menu trình duyệt. Ứng dụng cần Internet.

Workflow chỉ xuất bản thư mục `public`. Các đường dẫn tương đối hỗ trợ đường dẫn con `/game-mobile/`.

## Tìm kiếm và phân tích

- Không có API key: dán liên kết YouTube để tạo mục video, lưu danh sách và mở trên YouTube. Chưa lấy tiêu đề thật, thống kê hoặc xác minh video còn truy cập được.
- Có API key: tìm theo từ khóa, lấy tiêu đề, kênh, ngày đăng, mô tả, lượt xem, thích, bình luận và tỷ lệ tương tác `(thích + bình luận) / lượt xem`. Không phân tích âm thanh, hình ảnh, transcript, retention hoặc doanh thu.
- Tạo API key trong Google Cloud Console, bật **YouTube Data API v3**. Trong **Application restrictions → Websites (HTTP referrers)** cho phép `https://tai23082004l02-svg.github.io/*`; trong **API restrictions** chỉ cho phép **YouTube Data API v3**. Sau đó nhập key ở **Cài đặt API** của ứng dụng. Với website dùng tên miền riêng, thêm đúng tên miền đó.
- API key chỉ giữ trong bộ nhớ tab, mất khi tải lại trang; không ghi vào mã nguồn, localStorage hoặc tệp xuất. Bản Pages gọi API trực tiếp từ trình duyệt nên key có thể thấy trong công cụ mạng của chính người dùng. Dùng key dành cho web với các giới hạn nói trên. Không nhập OAuth token. Google áp dụng quota cho tìm kiếm và đọc dữ liệu.
- Danh sách lưu trong localStorage của trình duyệt và website hiện tại, không đồng bộ tự động giữa máy tính và điện thoại. Dùng **Xuất JSON / Nhập JSON** để chuyển hoặc sao lưu. Dữ liệu đã lưu là ảnh chụp tại lúc lấy; tìm lại video để cập nhật.
- **Mở trên YouTube** mở video để bạn tự đăng nhập, xem, thích hoặc bình luận; ứng dụng không tự động tương tác.

## Phát triển cục bộ

Node.js 22+: chạy `npm start`, mở http://localhost:3000. Windows có thể mở `start-windows.bat`. Hoặc phục vụ thư mục `public` bằng bất kỳ máy chủ tĩnh nào. Không cần cài thư viện ngoài. Giao diện gọi Google trực tiếp và dùng key nhập trong tab.

`npm test` kiểm tra luồng tìm kiếm tĩnh bằng API giả lập, lỗi quota, thêm liên kết không key, xử lý URL và HTTP cục bộ. Kiểm tra tìm kiếm thật cần key hợp lệ và quota. Các miền cần dùng: `www.googleapis.com`, `i.ytimg.com`, `www.youtube.com`.
